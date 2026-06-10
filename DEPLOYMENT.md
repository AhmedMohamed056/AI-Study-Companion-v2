# StudyAI - Deployment Guide

## Prerequisites

- AWS Account with IAM credentials configured
- Terraform >= 1.6.0 installed
- Ansible >= 2.14 installed
- Docker and Docker Compose installed (local testing)
- SSH key pair created in AWS

---

## Infrastructure Provisioning (Terraform)

### Initial Setup

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values
```

### Initialize Terraform

```bash
terraform init
```

### Preview Changes

```bash
terraform plan
```

### Apply Infrastructure

```bash
terraform apply
```

After applying, note the outputs:

```bash
terraform output public_ip
terraform output public_dns
terraform output instance_id
```

### Destroy Infrastructure

```bash
terraform destroy
```

### Remote State (Optional)

To enable remote state with S3:

1. Create an S3 bucket: `studyai-terraform-state`
2. Create a DynamoDB table: `studyai-terraform-locks` (partition key: `LockID`)
3. Uncomment the `backend "s3"` block in `terraform/versions.tf`
4. Run `terraform init -migrate-state`

---

## Configuration Management (Ansible)

### Configure Inventory

Edit `ansible/inventory.ini` with the EC2 public IP from Terraform output:

```ini
[webservers]
studyai-prod ansible_host=<PUBLIC_IP_FROM_TERRAFORM>
```

### Configure Variables

Edit `ansible/group_vars/all.yml`:

- Set `repo_url` to your GitHub repository URL
- Set `domain_name` to your domain

### Run Playbook

```bash
cd ansible
ansible-playbook -i inventory.ini playbook.yml
```

### Run Specific Roles

```bash
# Only configure Docker
ansible-playbook -i inventory.ini playbook.yml --tags docker

# Only deploy the application
ansible-playbook -i inventory.ini playbook.yml --tags app
```

### Verify Connection

```bash
ansible -i inventory.ini webservers -m ping
```

---

## Application Deployment (Docker)

### Local Build and Test

```bash
# Build containers
docker compose -f docker-compose.prod.yml build

# Start services
docker compose -f docker-compose.prod.yml up -d

# Check status
docker compose -f docker-compose.prod.yml ps

# View logs
docker compose -f docker-compose.prod.yml logs -f
```

### Environment Variables

Create `backend/.env` with production values:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (Supabase) |
| `DIRECT_URL` | Direct database connection URL |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `GROQ_API_KEY` | Groq AI API key |
| `NODE_ENV` | Set to `production` |
| `PORT` | Backend port (3000) |
| `CORS_ORIGIN` | Frontend URL |
| `JWT_SECRET` | JWT signing secret |
| `DOCKERHUB_USERNAME` | Docker Hub username for pulling images |
| `DOCKERHUB_TOKEN` | Docker Hub access token for authentication |

### Production Deployment on EC2

> **Note:** The EC2 instance never builds images. All images are pre-built in CI and pushed to Docker Hub.

```bash
ssh ubuntu@<EC2_IP>
cd /home/studyai/app

# Pull latest images from Docker Hub
docker pull <DOCKERHUB_USERNAME>/studyai-frontend:latest
docker pull <DOCKERHUB_USERNAME>/studyai-backend:latest

# Restart containers with pulled images
docker compose -f docker-compose.prod.yml up -d

# Run migrations
docker compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
```

---

## CI/CD Pipeline

### CI Process (On Pull Request)

1. Install dependencies for frontend and backend
2. Run linting (`npm run lint`)
3. Build frontend (`npm run build`)
4. Build backend (`npm run build`)
5. Build Docker images tagged with commit SHA and `latest`
6. Login to Docker Hub and push both images

### CD Process (On Merge to Main)

1. SSH into EC2 instance
2. Pull latest images from Docker Hub
3. Restart containers with `docker compose up -d`
4. Run database migrations
5. Verify application health

---

## Rollback Strategy

### Quick Rollback (Image-based)

```bash
ssh ubuntu@<EC2_IP>
cd /home/studyai/app

# Pull the image for a specific known-good commit SHA
docker pull <DOCKERHUB_USERNAME>/studyai-frontend:<COMMIT_SHA>
docker pull <DOCKERHUB_USERNAME>/studyai-backend:<COMMIT_SHA>

# Tag as latest and restart
docker tag <DOCKERHUB_USERNAME>/studyai-frontend:<COMMIT_SHA> <DOCKERHUB_USERNAME>/studyai-frontend:latest
docker tag <DOCKERHUB_USERNAME>/studyai-backend:<COMMIT_SHA> <DOCKERHUB_USERNAME>/studyai-backend:latest
docker compose -f docker-compose.prod.yml up -d
```

### Docker Image Rollback

```bash
# List previous images
docker images <DOCKERHUB_USERNAME>/studyai-backend --format "{{.Tag}} {{.CreatedAt}}"

# Pull a specific version by commit SHA
docker pull <DOCKERHUB_USERNAME>/studyai-backend:<COMMIT_SHA>
docker pull <DOCKERHUB_USERNAME>/studyai-frontend:<COMMIT_SHA>

# Tag and restart
docker tag <DOCKERHUB_USERNAME>/studyai-backend:<COMMIT_SHA> <DOCKERHUB_USERNAME>/studyai-backend:latest
docker tag <DOCKERHUB_USERNAME>/studyai-frontend:<COMMIT_SHA> <DOCKERHUB_USERNAME>/studyai-frontend:latest
docker compose -f docker-compose.prod.yml up -d
```

### Database Rollback

```bash
# Revert last migration (use with caution)
docker compose -f docker-compose.prod.yml exec backend npx prisma migrate resolve --rolled-back <MIGRATION_NAME>
```

---

## Troubleshooting

### Container Won't Start

```bash
# Check container logs
docker compose -f docker-compose.prod.yml logs backend
docker compose -f docker-compose.prod.yml logs frontend

# Check if ports are in use
sudo lsof -i :3000
sudo lsof -i :3001
```

### Nginx Errors

```bash
# Test configuration
sudo nginx -t

# Check Nginx error log
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

### Cannot Connect to Database

```bash
# Test connection from backend container
docker compose -f docker-compose.prod.yml exec backend npx prisma db pull

# Verify DATABASE_URL in .env
docker compose -f docker-compose.prod.yml exec backend printenv DATABASE_URL
```

### SSH Connection Issues

```bash
# Verify security group allows your IP
aws ec2 describe-security-groups --group-ids <SG_ID>

# Check instance status
aws ec2 describe-instance-status --instance-ids <INSTANCE_ID>
```

### High Memory Usage

```bash
# Check container resource usage
docker stats

# Restart containers
docker compose -f docker-compose.prod.yml restart

# Check system memory
free -h
```

### Docker Hub Authentication Failure

```bash
# Re-login to Docker Hub
echo "$DOCKERHUB_TOKEN" | docker login -u "$DOCKERHUB_USERNAME" --password-stdin

# Verify authentication
docker pull <DOCKERHUB_USERNAME>/studyai-backend:latest

# Check stored credentials
cat ~/.docker/config.json

# If token expired, generate a new one at https://hub.docker.com/settings/security
# Then update the DOCKERHUB_TOKEN GitHub Secret
```

### SSL Certificate

To enable HTTPS with Let's Encrypt:

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is configured automatically
sudo certbot renew --dry-run
```

---

## Architecture

```
Internet → Nginx (80/443) → Frontend Container (3001)
                           → Backend Container (3000) → Supabase PostgreSQL
```

## Useful Commands

| Command | Description |
|---------|-------------|
| `docker compose -f docker-compose.prod.yml ps` | Check service status |
| `docker compose -f docker-compose.prod.yml logs -f` | Stream all logs |
| `docker compose -f docker-compose.prod.yml restart` | Restart all services |
| `docker compose -f docker-compose.prod.yml down` | Stop all services |
| `docker pull <DOCKERHUB_USERNAME>/studyai-frontend:latest` | Pull latest frontend image |
| `docker pull <DOCKERHUB_USERNAME>/studyai-backend:latest` | Pull latest backend image |
| `docker images <DOCKERHUB_USERNAME>/studyai-*` | List local Docker Hub images |
| `docker system prune -af` | Clean unused Docker resources |
| `terraform output` | Show infrastructure outputs |

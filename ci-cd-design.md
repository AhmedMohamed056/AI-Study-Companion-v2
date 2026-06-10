# StudyAI - CI/CD Pipeline Design

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        GitHub Repository                             │
├─────────────────────────────────┬───────────────────────────────────┤
│         Pull Request            │         Merge to Main             │
│                                 │                                   │
│    ┌───────────────────┐        │    ┌───────────────────────┐      │
│    │   CI Workflow      │        │    │   CD Workflow          │      │
│    │                   │        │    │                       │      │
│    │  1. Install deps  │        │    │  1. SSH to EC2        │      │
│    │  2. Lint code     │        │    │  2. Pull images from  │      │
│    │  3. Build frontend│        │    │     Docker Hub        │      │
│    │  4. Build backend │        │    │  3. Restart services  │      │
│    │  5. Build Docker  │        │    │  4. Health check      │      │
│    │     images        │        │    │                       │      │
│    │  6. Push images   │        │    └──────────┬────────────┘      │
│    │     to Docker Hub │        │               │                   │
│    └───────────────────┘        │               │                   │
│                                 │               │                   │
└─────────────────────────────────┴───────────────┼───────────────────┘
                                                  │
                                                  ▼
                                    ┌─────────────────────────┐
                                    │       Docker Hub         │
                                    │                         │
                                    │  studyai-frontend:latest│
                                    │  studyai-frontend:<sha> │
                                    │  studyai-backend:latest │
                                    │  studyai-backend:<sha>  │
                                    └────────────┬────────────┘
                                                 │
                                                 ▼
                                    ┌─────────────────────────┐
                                    │     AWS EC2 Instance     │
                                    │                         │
                                    │  ┌───────────────────┐  │
                                    │  │      Nginx        │  │
                                    │  │   (Port 80/443)   │  │
                                    │  └────────┬──────────┘  │
                                    │           │             │
                                    │     ┌─────┴─────┐       │
                                    │     ▼           ▼       │
                                    │  ┌──────┐  ┌────────┐   │
                                    │  │Front │  │Backend │   │
                                    │  │:3001 │  │:3000   │   │
                                    │  └──────┘  └────┬───┘   │
                                    │                 │       │
                                    └─────────────────┼───────┘
                                                      │
                                                      ▼
                                          ┌──────────────────┐
                                          │    Supabase       │
                                          │   PostgreSQL      │
                                          └──────────────────┘
```

---

## CI Workflow (Continuous Integration)

**Trigger:** On every Pull Request to `main` branch

### Steps

#### 1. Install Dependencies

- Checkout repository code
- Set up Node.js 22
- Install frontend dependencies (`cd frontend && npm ci`)
- Install backend dependencies (`cd backend && npm ci`)

#### 2. Lint Code

- Run frontend linter (`cd frontend && npm run lint`)
- Run backend linter (`cd backend && npm run lint`)
- Fail the pipeline if linting errors are found

#### 3. Build Frontend

- Build the React application (`cd frontend && npm run build`)
- Verify the build produces output in `frontend/dist/`
- Fail if TypeScript compilation errors occur

#### 4. Build Backend

- Compile TypeScript to JavaScript (`cd backend && npm run build`)
- Generate Prisma client (`cd backend && npx prisma generate`)
- Verify the build produces output in `backend/dist/`

#### 5. Build Docker Images

- Build the frontend Docker image tagged with the commit SHA and `latest`:
  ```
  docker build -t <DOCKERHUB_USERNAME>/studyai-frontend:${{ github.sha }} -t <DOCKERHUB_USERNAME>/studyai-frontend:latest ./frontend
  ```
- Build the backend Docker image tagged with the commit SHA and `latest`:
  ```
  docker build -t <DOCKERHUB_USERNAME>/studyai-backend:${{ github.sha }} -t <DOCKERHUB_USERNAME>/studyai-backend:latest ./backend
  ```

#### 6. Push Images to Docker Hub

- Login to Docker Hub using `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` from GitHub Secrets:
  ```
  echo "${{ secrets.DOCKERHUB_TOKEN }}" | docker login -u "${{ secrets.DOCKERHUB_USERNAME }}" --password-stdin
  ```
- Push both tags for both images:
  ```
  docker push <DOCKERHUB_USERNAME>/studyai-frontend:${{ github.sha }}
  docker push <DOCKERHUB_USERNAME>/studyai-frontend:latest
  docker push <DOCKERHUB_USERNAME>/studyai-backend:${{ github.sha }}
  docker push <DOCKERHUB_USERNAME>/studyai-backend:latest
  ```

### CI Success Criteria

All six steps must pass for the PR to be mergeable. Branch protection rules should require CI to pass before merging.

---

## CD Workflow (Continuous Deployment)

**Trigger:** On merge/push to `main` branch (after CI passes)

### Steps

#### 1. Connect to EC2 via SSH

- Use stored SSH private key (GitHub Secret)
- Connect to the EC2 instance IP (GitHub Secret)
- Connect as the `studyai` deployment user

#### 2. Pull Images from Docker Hub

```
docker pull <DOCKERHUB_USERNAME>/studyai-frontend:latest
docker pull <DOCKERHUB_USERNAME>/studyai-backend:latest
```

Pull the pre-built images from Docker Hub. The EC2 instance never builds images — it only runs them.

#### 3. Restart Docker Containers

```
docker compose -f docker-compose.prod.yml up -d
```

Docker Compose handles stopping old containers and starting new ones. The `depends_on` configuration ensures proper startup order.

#### 4. Verify Application Health

```
# Wait for backend to respond
curl --retry 5 --retry-delay 5 http://localhost:3000/api

# Verify frontend serves content
curl --retry 5 --retry-delay 5 http://localhost:3001
```

If health checks fail, the workflow should alert the team (but not automatically rollback, to allow manual investigation).

---

## Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `EC2_HOST` | Public IP of the EC2 instance |
| `EC2_SSH_KEY` | Private SSH key for the `studyai` user |
| `EC2_USERNAME` | Deployment user (`studyai`) |
| `DOCKERHUB_USERNAME` | Docker Hub username for pushing/pulling images |
| `DOCKERHUB_TOKEN` | Docker Hub access token for authentication |

---

## Rollback Strategy

### Automated Rollback (Recommended Approach)

If the health check in Step 4 fails:

1. Identify the previous working commit SHA from deployment history
2. Pull the image tagged with that commit SHA:
   ```
   docker pull <DOCKERHUB_USERNAME>/studyai-frontend:<previous-sha>
   docker pull <DOCKERHUB_USERNAME>/studyai-backend:<previous-sha>
   ```
3. Tag the pulled images as `latest` and restart:
   ```
   docker tag <DOCKERHUB_USERNAME>/studyai-frontend:<previous-sha> <DOCKERHUB_USERNAME>/studyai-frontend:latest
   docker tag <DOCKERHUB_USERNAME>/studyai-backend:<previous-sha> <DOCKERHUB_USERNAME>/studyai-backend:latest
   docker compose -f docker-compose.prod.yml up -d
   ```
4. Verify health again

### Manual Rollback Process

1. SSH into the server
2. Find the last working commit SHA from deployment logs or Docker Hub tags
3. Pull images for that specific SHA:
   ```
   docker pull <DOCKERHUB_USERNAME>/studyai-frontend:<commit-sha>
   docker pull <DOCKERHUB_USERNAME>/studyai-backend:<commit-sha>
   ```
4. Tag as `latest` and restart:
   ```
   docker tag <DOCKERHUB_USERNAME>/studyai-frontend:<commit-sha> <DOCKERHUB_USERNAME>/studyai-frontend:latest
   docker tag <DOCKERHUB_USERNAME>/studyai-backend:<commit-sha> <DOCKERHUB_USERNAME>/studyai-backend:latest
   docker compose -f docker-compose.prod.yml up -d
   ```
5. Verify the application is working

### Database Migration Rollback

Prisma migrations are forward-only by default. If a migration causes issues:

1. Fix the issue in code and push a new migration
2. Or mark the migration as rolled back: `npx prisma migrate resolve --rolled-back <migration-name>`
3. Apply corrective migration

---

## Deployment Flow Summary

```
Developer pushes code
        │
        ▼
   Pull Request Created
        │
        ▼
   CI Runs (lint + build + push images to Docker Hub)
        │
        ├── FAIL → Developer fixes issues
        │
        ▼ PASS
   Code Review
        │
        ▼
   Merge to Main
        │
        ▼
   CD Runs (pull images + deploy to EC2)
        │
        ├── Health Check FAIL → Alert team, manual rollback
        │
        ▼ PASS
   Deployment Complete
```

---

## Security Considerations

- SSH keys are stored as encrypted GitHub Secrets
- Docker Hub credentials are stored as encrypted GitHub Secrets
- The deployment user has limited permissions (only docker and app directory access)
- No secrets are logged or exposed in workflow outputs
- Database credentials stay on the server (never pass through CI/CD)
- UFW firewall restricts access to ports 22, 80, and 443 only

---

## Future Improvements

1. **Blue-Green Deployment**: Run two container sets, switch traffic after health check
2. **Automated Database Backups**: Scheduled Supabase backups before each deployment
3. **Monitoring Integration**: Notify Slack/Discord on deploy success/failure
4. **Multi-Environment**: Add staging environment with separate EC2 instance

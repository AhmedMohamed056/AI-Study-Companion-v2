# StudyAI Deployment Automation Prompt

## Role

You are a Senior DevOps Engineer responsible for designing and implementing the deployment infrastructure for a software engineering project called **StudyAI**.

---

# Project Overview

StudyAI is a web-based academic support platform.

### Technology Stack

Frontend:

* React 18
* TypeScript
* Tailwind CSS

Backend:

* Node.js
* Express
* TypeScript

Database:

* PostgreSQL
* Prisma ORM

Storage:

* Supabase Storage

Authentication:

* Supabase Auth

AI Provider:

* Groq API

---

# Deployment Goal

Replace the existing deployment approach with a modern Infrastructure as Code (IaC) solution consisting of:

* Terraform for infrastructure provisioning
* Ansible for server configuration
* Docker for application packaging
* GitHub Actions for CI/CD
* AWS EC2 as the hosting platform

Generate all required files and documentation.

Use production-ready best practices.

---

# Task 1: Terraform Infrastructure

Create a complete Terraform project that provisions AWS infrastructure.

## Requirements

Create:

* Ubuntu 24.04 EC2 Instance
* Security Group
* SSH Access (22)
* HTTP Access (80)
* HTTPS Access (443)

The configuration must:

* Use variables.tf
* Use outputs.tf
* Use terraform.tfvars.example
* Use provider.tf
* Use versions.tf
* Be modular
* Follow Terraform best practices
* Be ready for future remote state configuration

## Expected Structure

```text
terraform/
├── provider.tf
├── versions.tf
├── main.tf
├── variables.tf
├── outputs.tf
├── terraform.tfvars.example
└── modules/
    └── ec2/
        ├── main.tf
        ├── variables.tf
        └── outputs.tf
```

Outputs should include:

* Public IP
* Public DNS
* Instance ID

---

# Task 2: Ansible Configuration

Create a complete Ansible setup for configuring the EC2 server.

## Requirements

Install:

* Git
* Docker
* Docker Compose Plugin
* Nginx
* Node.js 22 LTS

Create deployment user:

```text
studyai
```

Configure:

* UFW Firewall
* Docker service
* Automatic service startup
* Nginx reverse proxy

Use roles.

## Expected Structure

```text
ansible/
├── inventory.ini
├── playbook.yml
├── group_vars/
├── roles/
│   ├── common/
│   ├── docker/
│   ├── nginx/
│   └── app/
└── templates/
```

Provide complete file contents.

---

# Task 3: Docker Deployment

Generate:

```text
backend/Dockerfile
frontend/Dockerfile
docker-compose.prod.yml
```

## Backend Container

Requirements:

* Multi-stage build
* Node.js 22
* Prisma support
* Production optimized image

## Frontend Container

Requirements:

* Build React application
* Serve static files using Nginx

## Docker Compose

Services:

* frontend
* backend

Database remains external PostgreSQL.

Environment variables should be loaded through .env files.

---

# Task 4: Nginx Reverse Proxy

Generate:

```text
nginx.conf
```

Requirements:

* Reverse proxy
* HTTPS-ready
* Frontend accessible through "/"
* Backend accessible through "/api"
* Security headers
* Gzip compression
* Production-ready configuration

---

# Task 5: CI/CD Design

Do NOT generate GitHub Actions workflow code.

Instead generate:

```text
ci-cd-design.md
```

Describe the CI/CD process.

## CI Workflow

On Pull Request:

1. Install dependencies
2. Run linting
3. Build frontend
4. Build backend

## CD Workflow

On merge to main:

1. Connect to EC2 through SSH
2. Pull latest source code
3. Rebuild Docker images
4. Restart Docker containers
5. Verify application health

Include:

* Deployment architecture diagram
* Workflow explanation
* Rollback strategy

Important:

Do NOT include automated tests in the CI workflow.

---

# Task 6: Documentation

Generate:

```text
DEPLOYMENT.md
```

The document must include:

## Infrastructure Provisioning

* Terraform initialization
* Terraform planning
* Terraform apply
* Terraform destroy

## Configuration Management

* Ansible inventory configuration
* Ansible execution process

## Application Deployment

* Docker build
* Docker Compose deployment
* Environment variables

## CI/CD Pipeline

* CI process
* CD process

## Rollback Strategy

Explain how to recover from failed deployments.

## Troubleshooting

Common issues and solutions.

---

# Quality Requirements

* Production-ready code only
* Include comments for all major blocks
* Follow AWS best practices
* Follow Terraform best practices
* Follow Ansible best practices
* Follow Docker best practices
* Follow Nginx best practices

Before generating files:

1. Show complete final folder structure.
2. Then generate all files with full contents.
3. Explain any assumptions made.

Generate every file completely. Do not provide placeholders unless absolutely necessary.

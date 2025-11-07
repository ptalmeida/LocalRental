# Cloud Deployment Guide

This guide covers deploying the Rental API to various cloud platforms using Docker/Kubernetes.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Docker/Kubernetes Deployment](#dockerkubernetes-deployment)
3. [AWS Deployment](#aws-deployment)
4. [Google Cloud Platform](#google-cloud-platform)
5. [Azure Deployment](#azure-deployment)
6. [Platform-as-a-Service](#platform-as-a-service)

## Prerequisites

Before deploying, ensure you have:

1. **Built and tested locally**
   ```bash
   cd localRentalApi
   go test ./...
   go build
   ```

2. **Docker image ready**
   ```bash
   docker build -t rental-api:latest .
   ```

3. **Environment variables configured**
   - Copy `.env.example` to `.env`
   - Update with production values
   - **Never use default passwords in production!**

## Docker/Kubernetes Deployment

### Local Testing with Docker Compose

```bash
# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f api

# Import data
cd localRentalApi
DATABASE_URL="postgres://postgres:postgres@localhost:5432/alojamentos?sslmode=disable" \
  go run cmd/importer/main.go -file example.geojson

# Stop services
docker-compose down
```

### Kubernetes Deployment

See [k8s/README.md](k8s/README.md) for detailed instructions.

**Quick steps:**

1. Create secrets
   ```bash
   cd k8s
   cp secrets.yaml.example secrets.yaml
   # Edit secrets.yaml
   kubectl apply -f secrets.yaml
   ```

2. Deploy
   ```bash
   kubectl apply -f api-configmap.yaml
   kubectl apply -f postgres-statefulset.yaml
   kubectl apply -f postgres-service.yaml
   kubectl apply -f api-deployment.yaml
   kubectl apply -f api-service.yaml
   ```

3. Verify
   ```bash
   kubectl get pods
   kubectl logs -f -l app=rental-api
   ```

---

## AWS Deployment

### Option 1: Amazon ECS + RDS

#### 1. Create RDS PostgreSQL Database

```bash
# Using AWS CLI
aws rds create-db-instance \
  --db-instance-identifier rental-api-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 16.1 \
  --master-username postgres \
  --master-user-password YOUR_SECURE_PASSWORD \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-xxxxx \
  --db-subnet-group-name your-subnet-group \
  --backup-retention-period 7 \
  --publicly-accessible false

# Get endpoint
aws rds describe-db-instances \
  --db-instance-identifier rental-api-db \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text
```

#### 2. Push Docker Image to ECR

```bash
# Create ECR repository
aws ecr create-repository --repository-name rental-api

# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Tag and push
docker tag rental-api:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/rental-api:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/rental-api:latest
```

#### 3. Create ECS Task Definition

Create `ecs-task-definition.json`:

```json
{
  "family": "rental-api",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::YOUR_ACCOUNT_ID:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "rental-api",
      "image": "YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/rental-api:latest",
      "portMappings": [
        {
          "containerPort": 8087,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "PORT",
          "value": "8087"
        },
        {
          "name": "HOST",
          "value": "0.0.0.0"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:YOUR_ACCOUNT_ID:secret:rental-api/database-url"
        },
        {
          "name": "AUTH_USERNAME",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:YOUR_ACCOUNT_ID:secret:rental-api/auth-username"
        },
        {
          "name": "AUTH_PASSWORD",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:YOUR_ACCOUNT_ID:secret:rental-api/auth-password"
        }
      ],
      "healthCheck": {
        "command": ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:8087/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 10
      },
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/rental-api",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

#### 4. Deploy to ECS

```bash
# Create log group
aws logs create-log-group --log-group-name /ecs/rental-api

# Register task definition
aws ecs register-task-definition --cli-input-json file://ecs-task-definition.json

# Create ECS cluster
aws ecs create-cluster --cluster-name rental-api-cluster

# Create service
aws ecs create-service \
  --cluster rental-api-cluster \
  --service-name rental-api-service \
  --task-definition rental-api \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxxxx],securityGroups=[sg-xxxxx],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:...,containerName=rental-api,containerPort=8087"
```

### Option 2: Amazon EKS

```bash
# Create EKS cluster
eksctl create cluster \
  --name rental-api-cluster \
  --region us-east-1 \
  --nodegroup-name standard-workers \
  --node-type t3.medium \
  --nodes 3 \
  --nodes-min 1 \
  --nodes-max 4

# Deploy using k8s manifests
kubectl apply -f k8s/
```

---

## Google Cloud Platform

### Option 1: Cloud Run + Cloud SQL

#### 1. Create Cloud SQL Instance

```bash
# Create Cloud SQL instance
gcloud sql instances create rental-api-db \
  --database-version=POSTGRES_16 \
  --tier=db-f1-micro \
  --region=us-central1

# Create database
gcloud sql databases create alojamentos --instance=rental-api-db

# Set password
gcloud sql users set-password postgres \
  --instance=rental-api-db \
  --password=YOUR_SECURE_PASSWORD
```

#### 2. Build and Push to Container Registry

```bash
# Configure Docker for GCR
gcloud auth configure-docker

# Build and push
docker build -t gcr.io/YOUR_PROJECT_ID/rental-api:latest ./localRentalApi
docker push gcr.io/YOUR_PROJECT_ID/rental-api:latest
```

#### 3. Deploy to Cloud Run

```bash
# Deploy
gcloud run deploy rental-api \
  --image gcr.io/YOUR_PROJECT_ID/rental-api:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --add-cloudsql-instances YOUR_PROJECT_ID:us-central1:rental-api-db \
  --set-env-vars "PORT=8087" \
  --set-secrets "DATABASE_URL=rental-api-database-url:latest,AUTH_USERNAME=rental-api-auth-username:latest,AUTH_PASSWORD=rental-api-auth-password:latest"

# Get URL
gcloud run services describe rental-api --region us-central1 --format 'value(status.url)'
```

### Option 2: GKE (Google Kubernetes Engine)

```bash
# Create GKE cluster
gcloud container clusters create rental-api-cluster \
  --num-nodes=3 \
  --machine-type=e2-medium \
  --region=us-central1

# Get credentials
gcloud container clusters get-credentials rental-api-cluster --region us-central1

# Deploy
kubectl apply -f k8s/
```

---

## Azure Deployment

### Azure Container Apps + Azure Database for PostgreSQL

#### 1. Create PostgreSQL Database

```bash
# Create resource group
az group create --name rental-api-rg --location eastus

# Create PostgreSQL server
az postgres flexible-server create \
  --resource-group rental-api-rg \
  --name rental-api-db \
  --location eastus \
  --admin-user postgres \
  --admin-password YOUR_SECURE_PASSWORD \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --storage-size 32

# Create database
az postgres flexible-server db create \
  --resource-group rental-api-rg \
  --server-name rental-api-db \
  --database-name alojamentos
```

#### 2. Push to Azure Container Registry

```bash
# Create ACR
az acr create --resource-group rental-api-rg --name rentalapiacr --sku Basic

# Login
az acr login --name rentalapiacr

# Build and push
docker tag rental-api:latest rentalapiacr.azurecr.io/rental-api:latest
docker push rentalapiacr.azurecr.io/rental-api:latest
```

#### 3. Deploy to Container Apps

```bash
# Create Container Apps environment
az containerapp env create \
  --name rental-api-env \
  --resource-group rental-api-rg \
  --location eastus

# Deploy app
az containerapp create \
  --name rental-api \
  --resource-group rental-api-rg \
  --environment rental-api-env \
  --image rentalapiacr.azurecr.io/rental-api:latest \
  --target-port 8087 \
  --ingress external \
  --registry-server rentalapiacr.azurecr.io \
  --env-vars "PORT=8087" "HOST=0.0.0.0" \
  --secrets "database-url=YOUR_DATABASE_URL" "auth-username=admin" "auth-password=YOUR_PASSWORD" \
  --cpu 0.5 --memory 1.0Gi \
  --min-replicas 1 --max-replicas 5
```

---

## Platform-as-a-Service

### Heroku

```bash
# Install Heroku CLI and login
heroku login

# Create app
heroku create rental-api-production

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:mini

# Set environment variables
heroku config:set AUTH_USERNAME=admin
heroku config:set AUTH_PASSWORD=your-secure-password
heroku config:set RATE_LIMIT_REQUESTS_PER_SECOND=10

# Deploy
git push heroku main

# Import data
heroku run "cd localRentalApi && go run cmd/importer/main.go -file example.geojson"

# Open app
heroku open
```

### Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add PostgreSQL
railway add postgresql

# Deploy
railway up

# Set environment variables in Railway dashboard
```

### Render

1. Connect your GitHub repository
2. Create a new Web Service
3. Select "Docker" as the environment
4. Add PostgreSQL database
5. Configure environment variables
6. Deploy

---

## Post-Deployment Checklist

### Security
- [ ] Change all default passwords
- [ ] Enable SSL/TLS for database connections
- [ ] Configure CORS if needed
- [ ] Set up firewall rules
- [ ] Enable DDoS protection
- [ ] Configure rate limiting appropriately

### Monitoring
- [ ] Set up health check monitoring
- [ ] Configure log aggregation
- [ ] Set up alerts (CPU, memory, errors)
- [ ] Monitor database connections
- [ ] Track API response times

### Database
- [ ] Import initial data
- [ ] Configure automated backups
- [ ] Set up read replicas (if needed)
- [ ] Enable connection pooling
- [ ] Monitor query performance

### Scaling
- [ ] Configure horizontal pod autoscaling (Kubernetes)
- [ ] Set up load balancing
- [ ] Configure CDN (if serving static files)
- [ ] Enable caching where appropriate

### Maintenance
- [ ] Document deployment process
- [ ] Set up CI/CD pipeline
- [ ] Plan database migration strategy
- [ ] Schedule regular updates
- [ ] Create disaster recovery plan

---

## Troubleshooting

### Common Issues

**Database Connection Failed**
```bash
# Check DATABASE_URL format
postgres://username:password@host:port/database?sslmode=require

# Verify network connectivity
# Check security groups/firewall rules
# Ensure database is running
```

**Health Check Failing**
```bash
# Check logs
kubectl logs -f deployment/rental-api

# Test health endpoint locally
curl http://localhost:8087/health

# Verify PORT environment variable
```

**Pod/Container Crashing**
```bash
# Check resource limits
# Review application logs
# Verify environment variables
# Check database connectivity
```

## Support

For deployment issues:
1. Check application logs
2. Review cloud platform documentation
3. Verify environment variables
4. Test database connectivity
5. Open an issue on GitHub

## Additional Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [Google Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Azure Container Apps Documentation](https://docs.microsoft.com/azure/container-apps/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

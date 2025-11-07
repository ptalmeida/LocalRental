# Kubernetes Deployment

This directory contains Kubernetes manifests for deploying the Rental API and PostgreSQL database.

## Files

- `postgres-statefulset.yaml` - PostgreSQL StatefulSet with persistent storage
- `postgres-service.yaml` - PostgreSQL ClusterIP Service
- `api-deployment.yaml` - API Deployment with 3 replicas
- `api-service.yaml` - API LoadBalancer Service
- `api-configmap.yaml` - ConfigMap for non-sensitive configuration
- `secrets.yaml.example` - Template for Kubernetes Secrets

## Prerequisites

- Kubernetes cluster (1.24+)
- kubectl configured to connect to your cluster
- Docker image for the API built and available

## Deployment Steps

### 1. Create Secrets

Copy the secrets template and fill in your actual values:

```bash
cp secrets.yaml.example secrets.yaml
# Edit secrets.yaml with your actual passwords
kubectl apply -f secrets.yaml
```

**IMPORTANT**: Never commit `secrets.yaml` to version control!

### 2. Apply ConfigMap

```bash
kubectl apply -f api-configmap.yaml
```

### 3. Deploy PostgreSQL

```bash
kubectl apply -f postgres-statefulset.yaml
kubectl apply -f postgres-service.yaml
```

Wait for PostgreSQL to be ready:

```bash
kubectl wait --for=condition=ready pod -l app=postgres --timeout=120s
```

### 4. Import Database Schema

You'll need to run the importer to set up the database schema and import data:

```bash
# Get the postgres pod name
POSTGRES_POD=$(kubectl get pod -l app=postgres -o jsonpath='{.items[0].metadata.name}')

# Port-forward to access PostgreSQL
kubectl port-forward $POSTGRES_POD 5432:5432 &

# Run the importer (from localRentalApi directory)
cd ../localRentalApi
DATABASE_URL="postgres://postgres:YOUR_PASSWORD@localhost:5432/alojamentos?sslmode=disable" \
  go run cmd/importer/main.go -file ../example.geojson

# Stop port-forward
kill %1
```

### 5. Build and Push Docker Image

```bash
# Build the image (from localRentalApi directory)
cd ../localRentalApi
docker build -t your-registry/rental-api:latest .

# Push to your container registry
docker push your-registry/rental-api:latest
```

Update `api-deployment.yaml` with your actual image name.

### 6. Deploy API

```bash
kubectl apply -f api-deployment.yaml
kubectl apply -f api-service.yaml
```

Wait for API pods to be ready:

```bash
kubectl wait --for=condition=ready pod -l app=rental-api --timeout=120s
```

### 7. Verify Deployment

Check pod status:

```bash
kubectl get pods
kubectl get services
```

Test health endpoints:

```bash
# Get the external IP (if using LoadBalancer)
EXTERNAL_IP=$(kubectl get svc rental-api -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

# Test health endpoint
curl http://$EXTERNAL_IP/health
curl http://$EXTERNAL_IP/ready
```

## Scaling

Scale the API deployment:

```bash
kubectl scale deployment rental-api --replicas=5
```

## Monitoring

View logs:

```bash
# API logs
kubectl logs -f -l app=rental-api

# PostgreSQL logs
kubectl logs -f -l app=postgres
```

## Updating

Update the API:

```bash
# Build and push new image
docker build -t your-registry/rental-api:v2 .
docker push your-registry/rental-api:v2

# Update deployment
kubectl set image deployment/rental-api api=your-registry/rental-api:v2

# Or apply updated manifest
kubectl apply -f api-deployment.yaml
```

## Cleanup

Remove all resources:

```bash
kubectl delete -f api-service.yaml
kubectl delete -f api-deployment.yaml
kubectl delete -f postgres-service.yaml
kubectl delete -f postgres-statefulset.yaml
kubectl delete -f api-configmap.yaml
kubectl delete secret postgres-secret api-secret

# Delete persistent volume claims (WARNING: This will delete your data!)
kubectl delete pvc -l app=postgres
```

## Production Considerations

1. **Ingress**: Consider using an Ingress controller instead of LoadBalancer
2. **TLS**: Set up TLS certificates (cert-manager recommended)
3. **Monitoring**: Deploy Prometheus and Grafana for monitoring
4. **Logging**: Use a centralized logging solution (ELK, Loki, etc.)
5. **Backup**: Set up automated PostgreSQL backups
6. **Resource Limits**: Adjust resource requests/limits based on your workload
7. **High Availability**: Use managed PostgreSQL (AWS RDS, GCP Cloud SQL) for production
8. **Network Policies**: Implement network policies for security
9. **Pod Disruption Budgets**: Add PDBs for high availability
10. **Horizontal Pod Autoscaler**: Configure HPA for automatic scaling

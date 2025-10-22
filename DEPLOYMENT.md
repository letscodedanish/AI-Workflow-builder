# Deployment Guide

This guide covers deployment options for the GenAI Stack application.

## Table of Contents
1. [Docker Deployment](#docker-deployment)
2. [Kubernetes Deployment](#kubernetes-deployment)
3. [Monitoring Setup (Optional)](#monitoring-setup)
4. [Environment Configuration](#environment-configuration)

## Docker Deployment

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+

### Quick Start

1. Build and run all services:

```bash
docker-compose up --build
```

2. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- ChromaDB: http://localhost:8001

### Individual Service Build

Build frontend only:
```bash
docker build -t genai-stack-frontend .
docker run -p 3000:80 genai-stack-frontend
```

Build backend only:
```bash
cd backend-reference
docker build -t genai-stack-backend .
docker run -p 8000:8000 genai-stack-backend
```

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
DATABASE_URL=postgresql://user:pass@host:5432/db
OPENAI_API_KEY=sk-your-key
SERPAPI_KEY=your-serpapi-key
```

## Kubernetes Deployment

### Prerequisites
- Kubernetes cluster (minikube, EKS, GKE, or AKS)
- kubectl CLI configured
- Docker images pushed to a registry

### Setup Steps

1. **Update Configuration**

Edit `k8s/configmap.yaml` with your settings:
```yaml
data:
  supabase_url: "https://your-project.supabase.co"
```

Edit `k8s/secrets.yaml` with your credentials:
```yaml
stringData:
  supabase_anon_key: "your-key"
  openai_api_key: "sk-your-key"
```

2. **Build and Push Images**

```bash
# Build images
docker build -t your-registry/genai-stack-frontend:latest .
docker build -t your-registry/genai-stack-backend:latest ./backend-reference

# Push to registry
docker push your-registry/genai-stack-frontend:latest
docker push your-registry/genai-stack-backend:latest
```

3. **Update Deployment**

Edit `k8s/deployment.yaml` to use your registry:
```yaml
image: your-registry/genai-stack-frontend:latest
```

4. **Deploy to Kubernetes**

```bash
# Create namespace
kubectl create namespace genai-stack

# Apply configurations
kubectl apply -f k8s/configmap.yaml -n genai-stack
kubectl apply -f k8s/secrets.yaml -n genai-stack
kubectl apply -f k8s/pvc.yaml -n genai-stack
kubectl apply -f k8s/deployment.yaml -n genai-stack
kubectl apply -f k8s/service.yaml -n genai-stack
kubectl apply -f k8s/ingress.yaml -n genai-stack
```

5. **Verify Deployment**

```bash
# Check pods
kubectl get pods -n genai-stack

# Check services
kubectl get svc -n genai-stack

# Check logs
kubectl logs -f deployment/genai-stack-frontend -n genai-stack
```

### Local Kubernetes with Minikube

```bash
# Start minikube
minikube start --cpus 4 --memory 8192

# Enable ingress
minikube addons enable ingress

# Deploy application
kubectl apply -f k8s/ -n genai-stack

# Get service URL
minikube service genai-stack-frontend -n genai-stack
```

### Scaling

```bash
# Scale frontend
kubectl scale deployment genai-stack-frontend --replicas=3 -n genai-stack

# Scale backend
kubectl scale deployment genai-stack-backend --replicas=3 -n genai-stack
```

## Monitoring Setup (Optional)

### Prometheus and Grafana

1. **Install Prometheus Operator**

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install prometheus prometheus-community/kube-prometheus-stack -n monitoring --create-namespace
```

2. **Configure Service Monitors**

Create `monitoring/servicemonitor.yaml`:

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: genai-stack-backend
  namespace: genai-stack
spec:
  selector:
    matchLabels:
      app: genai-stack
      component: backend
  endpoints:
  - port: http
    path: /metrics
```

Apply:
```bash
kubectl apply -f monitoring/servicemonitor.yaml
```

3. **Access Grafana**

```bash
kubectl port-forward svc/prometheus-grafana 3000:80 -n monitoring
```

Login: admin / prom-operator

### ELK Stack for Logging

1. **Install Elasticsearch**

```bash
helm repo add elastic https://helm.elastic.co
helm install elasticsearch elastic/elasticsearch -n logging --create-namespace
```

2. **Install Kibana**

```bash
helm install kibana elastic/kibana -n logging
```

3. **Install Filebeat**

```bash
helm install filebeat elastic/filebeat -n logging
```

4. **Access Kibana**

```bash
kubectl port-forward svc/kibana-kibana 5601:5601 -n logging
```

### Custom Metrics

Add Prometheus metrics to backend:

```python
from prometheus_client import Counter, Histogram
import time

REQUEST_COUNT = Counter('app_requests_total', 'Total requests')
REQUEST_LATENCY = Histogram('app_request_latency_seconds', 'Request latency')

@app.middleware("http")
async def monitor_requests(request, call_next):
    REQUEST_COUNT.inc()
    start = time.time()
    response = await call_next(request)
    REQUEST_LATENCY.observe(time.time() - start)
    return response
```

## Environment Configuration

### Production Checklist

- [ ] Update all secrets in `k8s/secrets.yaml`
- [ ] Configure proper domain in `k8s/ingress.yaml`
- [ ] Set up SSL/TLS certificates
- [ ] Configure resource limits
- [ ] Set up backup strategy for ChromaDB
- [ ] Configure monitoring and alerting
- [ ] Set up logging aggregation
- [ ] Implement rate limiting
- [ ] Configure CORS properly
- [ ] Set up CI/CD pipeline

### Security Best Practices

1. **Secrets Management**
   - Use external secret managers (AWS Secrets Manager, Vault)
   - Rotate secrets regularly
   - Never commit secrets to git

2. **Network Policies**
   - Implement network policies to restrict pod communication
   - Use service mesh for advanced traffic management

3. **RBAC**
   - Set up proper role-based access control
   - Use service accounts with minimal permissions

4. **Image Security**
   - Scan images for vulnerabilities
   - Use minimal base images
   - Keep dependencies up to date

## Troubleshooting

### Common Issues

1. **Pods not starting**
```bash
kubectl describe pod <pod-name> -n genai-stack
kubectl logs <pod-name> -n genai-stack
```

2. **Database connection issues**
- Verify DATABASE_URL in secrets
- Check network policies
- Ensure Supabase is accessible

3. **Image pull errors**
- Verify image names and tags
- Check registry credentials
- Ensure images are pushed to registry

### Health Checks

Add health check endpoints:

```python
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/ready")
async def readiness_check():
    # Check database connection
    # Check ChromaDB connection
    return {"status": "ready"}
```

Update deployment:
```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 8000
  initialDelaySeconds: 30
  periodSeconds: 10
readinessProbe:
  httpGet:
    path: /ready
    port: 8000
  initialDelaySeconds: 5
  periodSeconds: 5
```

## Support

For issues and questions:
- GitHub Issues: [link to repo]
- Documentation: [link to docs]
- Community: [link to community]

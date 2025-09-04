# SmartSight Deployment Guide

## Overview

This guide covers deployment options for the SmartSight MMM Platform, from local development to production environments.

## Quick Start (Docker)

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+
- 4GB+ RAM
- 2GB+ disk space

### Local Development
```bash
# Clone repository
git clone https://github.com/mahmoudkoura95/Devin-Smartsight-platform.git
cd Devin-Smartsight-platform

# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop services
docker-compose down
```

### Environment Variables
Copy `.env.example` to `.env` and configure:

```bash
# Database
POSTGRES_USER=smartsight
POSTGRES_PASSWORD=your-secure-password
POSTGRES_DB=smartsight_db

# Backend
SECRET_KEY=your-super-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Redis
REDIS_URL=redis://redis:6379/0

# Frontend
REACT_APP_API_URL=http://localhost:8000
```

## Production Deployment

### Option 1: Docker Swarm

#### Prerequisites
- Docker Swarm cluster
- Load balancer (nginx/traefik)
- SSL certificates

#### Deploy Stack
```bash
# Initialize swarm (if not already)
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.prod.yml smartsight

# Check services
docker service ls
docker service logs smartsight_backend
```

#### Production Compose File
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  backend:
    image: smartsight/backend:latest
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/smartsight
      - REDIS_URL=redis://redis:6379/0
    deploy:
      replicas: 3
      resources:
        limits:
          memory: 2G
        reservations:
          memory: 1G
    networks:
      - smartsight-network

  frontend:
    image: smartsight/frontend:latest
    environment:
      - REACT_APP_API_URL=https://api.smartsight.com
    deploy:
      replicas: 2
    networks:
      - smartsight-network

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=smartsight
      - POSTGRES_USER=smartsight
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    deploy:
      placement:
        constraints:
          - node.role == manager

  redis:
    image: redis:7-alpine
    deploy:
      placement:
        constraints:
          - node.role == manager

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl
    deploy:
      placement:
        constraints:
          - node.role == manager

volumes:
  postgres_data:

networks:
  smartsight-network:
    driver: overlay
```

### Option 2: Kubernetes

#### Prerequisites
- Kubernetes cluster (1.20+)
- kubectl configured
- Helm 3.0+

#### Deploy with Helm
```bash
# Add SmartSight Helm repository
helm repo add smartsight https://charts.smartsight.com
helm repo update

# Install SmartSight
helm install smartsight smartsight/smartsight \
  --set backend.image.tag=latest \
  --set frontend.image.tag=latest \
  --set postgresql.auth.password=your-password \
  --set ingress.enabled=true \
  --set ingress.hosts[0].host=smartsight.yourdomain.com

# Check deployment
kubectl get pods -l app.kubernetes.io/name=smartsight
kubectl logs -l app.kubernetes.io/component=backend
```

#### Manual Kubernetes Deployment
```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: smartsight

---
# k8s/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: smartsight-backend
  namespace: smartsight
spec:
  replicas: 3
  selector:
    matchLabels:
      app: smartsight-backend
  template:
    metadata:
      labels:
        app: smartsight-backend
    spec:
      containers:
      - name: backend
        image: smartsight/backend:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: smartsight-secrets
              key: database-url
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1000m"

---
# k8s/frontend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: smartsight-frontend
  namespace: smartsight
spec:
  replicas: 2
  selector:
    matchLabels:
      app: smartsight-frontend
  template:
    metadata:
      labels:
        app: smartsight-frontend
    spec:
      containers:
      - name: frontend
        image: smartsight/frontend:latest
        ports:
        - containerPort: 3000
        env:
        - name: REACT_APP_API_URL
          value: "https://api.smartsight.yourdomain.com"
```

### Option 3: Cloud Platforms

#### AWS ECS
```bash
# Create ECS cluster
aws ecs create-cluster --cluster-name smartsight-cluster

# Register task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json

# Create service
aws ecs create-service \
  --cluster smartsight-cluster \
  --service-name smartsight-backend \
  --task-definition smartsight-backend:1 \
  --desired-count 2
```

#### Google Cloud Run
```bash
# Build and push images
gcloud builds submit --tag gcr.io/PROJECT-ID/smartsight-backend backend/
gcloud builds submit --tag gcr.io/PROJECT-ID/smartsight-frontend frontend/

# Deploy backend
gcloud run deploy smartsight-backend \
  --image gcr.io/PROJECT-ID/smartsight-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

# Deploy frontend
gcloud run deploy smartsight-frontend \
  --image gcr.io/PROJECT-ID/smartsight-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

#### Azure Container Instances
```bash
# Create resource group
az group create --name smartsight-rg --location eastus

# Deploy backend
az container create \
  --resource-group smartsight-rg \
  --name smartsight-backend \
  --image smartsight/backend:latest \
  --dns-name-label smartsight-api \
  --ports 8000

# Deploy frontend
az container create \
  --resource-group smartsight-rg \
  --name smartsight-frontend \
  --image smartsight/frontend:latest \
  --dns-name-label smartsight-app \
  --ports 3000
```

## Database Setup

### PostgreSQL Configuration

#### Production Settings
```sql
-- postgresql.conf
max_connections = 200
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
```

#### Backup Strategy
```bash
# Daily backup
pg_dump -h localhost -U smartsight smartsight_db | gzip > backup_$(date +%Y%m%d).sql.gz

# Restore from backup
gunzip -c backup_20241204.sql.gz | psql -h localhost -U smartsight smartsight_db
```

### Redis Configuration

#### Production Settings
```conf
# redis.conf
maxmemory 512mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

## Monitoring & Logging

### Prometheus + Grafana
```yaml
# monitoring/docker-compose.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana

volumes:
  grafana_data:
```

### Application Metrics
```python
# backend/app/monitoring.py
from prometheus_client import Counter, Histogram, generate_latest

model_training_counter = Counter('mmm_model_training_total', 'Total model trainings', ['model_type'])
training_duration = Histogram('mmm_training_duration_seconds', 'Training duration')

@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    
    if request.url.path.startswith("/api/v1/models/train"):
        training_duration.observe(duration)
    
    return response
```

### Log Aggregation
```yaml
# logging/docker-compose.yml
version: '3.8'

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.5.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false

  logstash:
    image: docker.elastic.co/logstash/logstash:8.5.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf

  kibana:
    image: docker.elastic.co/kibana/kibana:8.5.0
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
```

## Security

### SSL/TLS Configuration
```nginx
# nginx/ssl.conf
server {
    listen 443 ssl http2;
    server_name smartsight.yourdomain.com;

    ssl_certificate /etc/ssl/certs/smartsight.crt;
    ssl_certificate_key /etc/ssl/private/smartsight.key;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    location / {
        proxy_pass http://frontend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Environment Security
```bash
# Use secrets management
export SECRET_KEY=$(openssl rand -hex 32)
export POSTGRES_PASSWORD=$(openssl rand -base64 32)

# Restrict file permissions
chmod 600 .env
chmod 600 ssl/private.key
```

## Performance Optimization

### Backend Optimization
```python
# backend/app/core/config.py
class Settings(BaseSettings):
    # Database connection pooling
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 30
    
    # Celery optimization
    CELERY_WORKER_CONCURRENCY: int = 4
    CELERY_WORKER_PREFETCH_MULTIPLIER: int = 1
    
    # Caching
    CACHE_TTL: int = 3600
    REDIS_MAX_CONNECTIONS: int = 50
```

### Frontend Optimization
```javascript
// frontend/vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['recharts'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
});
```

## Scaling Strategies

### Horizontal Scaling
- **Backend**: Scale API servers behind load balancer
- **Workers**: Scale Celery workers for model training
- **Database**: Read replicas for analytics queries
- **Cache**: Redis cluster for high availability

### Vertical Scaling
- **Memory**: 8GB+ for large model training
- **CPU**: Multi-core for parallel processing
- **Storage**: SSD for database performance

## Troubleshooting

### Common Issues

#### Backend Won't Start
```bash
# Check logs
docker-compose logs backend

# Common fixes
docker-compose down
docker-compose up -d --build
```

#### Database Connection Issues
```bash
# Check database status
docker-compose exec db psql -U smartsight -d smartsight_db -c "SELECT 1;"

# Reset database
docker-compose down -v
docker-compose up -d
```

#### Model Training Failures
```bash
# Check Celery worker logs
docker-compose logs worker

# Check Redis connection
docker-compose exec redis redis-cli ping
```

### Health Checks
```bash
# Backend health
curl http://localhost:8000/health

# Database health
curl http://localhost:8000/health/db

# Redis health
curl http://localhost:8000/health/redis
```

## Backup & Recovery

### Automated Backups
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"

# Database backup
docker-compose exec -T db pg_dump -U smartsight smartsight_db | gzip > "$BACKUP_DIR/db_$DATE.sql.gz"

# Upload to S3
aws s3 cp "$BACKUP_DIR/db_$DATE.sql.gz" s3://smartsight-backups/

# Cleanup old backups (keep 30 days)
find "$BACKUP_DIR" -name "db_*.sql.gz" -mtime +30 -delete
```

### Disaster Recovery
```bash
# Restore from backup
gunzip -c backup.sql.gz | docker-compose exec -T db psql -U smartsight smartsight_db

# Verify data integrity
docker-compose exec backend python -c "
from app.db.session import SessionLocal
from app import crud
db = SessionLocal()
print(f'Users: {len(crud.user.get_multi(db))}')
print(f'Models: {len(crud.mmm_model.get_multi(db))}')
"
```

---

For additional deployment support, see the [GitHub Issues](https://github.com/mahmoudkoura95/Devin-Smartsight-platform/issues) or contact support.

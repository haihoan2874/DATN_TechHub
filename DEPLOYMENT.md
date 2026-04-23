# 📦 DEPLOYMENT.md - Hướng Dẫn Triển Khai S-Life

**Phiên bản**: 1.0  
**Ngày cập nhật**: 15 tháng 4 năm 2026  
**Tác giả**: Hoan (S-Life Team)

---

## 📋 Mục Lục

1. [Yêu Cầu Hệ Thống](#yêu-cầu-hệ-thống)
2. [Chuẩn Bị Môi Trường](#chuẩn-bị-môi-trường)
3. [Triển Khai Local (Development)](#triển-khai-local-development)
4. [Triển Khai Staging](#triển-khai-staging)
5. [Triển Khai Production](#triển-khai-production)
6. [Docker & Kubernetes](#docker--kubernetes)
7. [Giám Sát & Logging](#giám-sát--logging)
8. [Backup & Recovery](#backup--recovery)
9. [Troubleshooting](#troubleshooting-phổ-biến)

---

## 🔧 Yêu Cầu Hệ Thống

### Backend:

- **Java**: 21 LTS hoặc cao hơn
- **Gradle**: 8.0+ (được bao gồm với gradlew)
- **PostgreSQL**: 14+ (khuyến nghị 16)
- **Redis**: 6.0+ (tùy chọn cho dev, bắt buộc cho prod)
- **Docker**: 20.10+ (cho containerization)
- **Docker Compose**: 2.0+

### Frontend:

- **Node.js**: 18+ (khuyến nghị 20 LTS)
- **npm**: 9+ hoặc yarn 3+
- **Disk space**: 1 GB (node_modules)

### Hệ Thống:

- **RAM**: Tối thiểu 2GB cho dev, 4GB cho staging, 8GB+ cho prod
- **CPU**: 2+ cores
- **OS**: Linux, macOS, hoặc Windows (WSL2)

---

## 🏗️ Chuẩn Bị Môi Trường

### 1. Clone Repository

```bash
git clone https://github.com/your-org/DATN_TechHub.git
cd DATN_TechHub
```

### 2. Tạo File Cấu Hình Môi Trường

#### Backend (.env.local):

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=datn_slife
DB_USER=pguser
DB_PASSWORD=your_secure_password_here
DB_SCHEMA=public

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_ISSUER=S-Life
JWT_EXPIRATION_MINUTE=1440

# Redis (tùy chọn)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# External APIs
GEMINI_API_KEY=your_gemini_api_key_here
VNPAY_MERCHANT_CODE=your_vnpay_merchant_code
VNPAY_HASH_SECRET=your_vnpay_hash_secret

# Email (SMTP)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_FROM=noreply@slife.com

# Application
SPRING_PROFILE=local
SERVER_PORT=8089
```

#### Frontend (.env.local):

```env
VITE_API_BASE_URL=http://localhost:8089/api/v1
VITE_APP_NAME=S-Life Development
```

### 3. Khởi Tạo Cơ Sở Dữ Liệu

```bash
# Sử dụng Docker Compose
cd backend/java-mastery
docker-compose up -d postgres redis

# Hoặc khởi tạo thủ công
createdb -U pguser -h localhost -p 5439 datn_slife
```

---

## 🚀 Triển Khai Local (Development)

### Backend

#### Bước 1: Xây Dựng Dự Án

```bash
cd backend/java-mastery

# Cấp quyền thực thi
chmod +x gradlew

# Xây dựng mà không chạy test (nhanh hơn)
./gradlew clean build -x test

# Hoặc xây dựng với test
./gradlew clean build
```

#### Bước 2: Chạy Ứng Dụng

```bash
# Chế độ phát triển với Hot-Reload
./gradlew bootRun -t

# Hoặc chạy trực tiếp
java -jar build/libs/springboot-boilerplate-1.0.0.jar
```

#### Bước 3: Xác Thực

```bash
# Kiểm tra health endpoint
curl http://localhost:8089/api/v1/health

# Truy cập Swagger UI
open http://localhost:8089/swagger-ui.html
```

### Frontend

#### Bước 1: Cài Đặt Dependencies

```bash
cd frontend
npm install
# hoặc
yarn install
```

#### Bước 2: Chạy Dev Server

```bash
npm run dev
# Mở trình duyệt tại http://localhost:5173
```

#### Bước 3: Linting & Format Code

```bash
npm run lint          # Kiểm tra lỗi
npm run build         # Build cho production
npm run preview       # Xem bản build
```

---

## 🎯 Triển Khai Staging

### Chuẩn Bị Máy Chủ

#### 1. Cài Đặt Dependencices

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y \
  openjdk-21-jdk \
  postgresql-16 \
  redis-server \
  nginx \
  curl

# macOS
brew install openjdk@21 postgresql redis nginx
```

#### 2. Cấu Hình PostgreSQL

```bash
# Khởi động dịch vụ
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Tạo user và database
sudo -u postgres psql << EOF
CREATE USER slife_user WITH PASSWORD 'staging_password_123';
CREATE DATABASE datn_slife_staging OWNER slife_user;
ALTER USER slife_user CREATEDB;
\q
EOF
```

#### 3. Cấu Hình Redis

```bash
# Khởi động Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Kiểm tra status
redis-cli ping  # Trả về PONG
```

### Build & Deploy

#### 1. Backend

```bash
# Clone repo
git clone https://github.com/your-org/DATN_TechHub.git /opt/slife
cd /opt/slife/backend/java-mastery

# Cấu hình biến môi trường
cp .env.example .env.staging
# Sửa .env.staging

# Build JAR
./gradlew clean build -x test

# Chạy dưới dạng Service
sudo cp build/libs/springboot-boilerplate-1.0.0.jar /opt/slife-app.jar

# Tạo systemd service
sudo tee /etc/systemd/system/slife-backend.service > /dev/null << EOF
[Unit]
Description=S-Life Backend Service
After=network.target

[Service]
Type=simple
User=slife
WorkingDirectory=/opt/slife
Environment="SPRING_PROFILE=staging"
ExecStart=/usr/lib/jvm/java-21-openjdk-amd64/bin/java -jar /opt/slife-app.jar
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Khởi động service
sudo systemctl daemon-reload
sudo systemctl start slife-backend
sudo systemctl enable slife-backend
```

#### 2. Frontend

```bash
cd /opt/slife/frontend

# Cài dependencies
npm ci  # Dùng CI để consistent versions

# Build
npm run build

# Sao chép build sang web root
sudo cp -r dist/* /var/www/slife-frontend/
sudo chown -R www-data:www-data /var/www/slife-frontend/
```

### Cấu Hình Nginx

```nginx
# /etc/nginx/sites-available/slife
upstream slife_backend {
    server localhost:8089;
}

server {
    listen 80;
    server_name staging.slife.com;

    # Frontend
    location / {
        root /var/www/slife-frontend;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://slife_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Swagger UI
    location /swagger-ui {
        proxy_pass http://slife_backend/swagger-ui;
    }
}
```

```bash
# Kích hoạt site
sudo ln -s /etc/nginx/sites-available/slife /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🏢 Triển Khai Production

### Yêu Cầu Bảo Mật

#### 1. SSL/TLS Certificate

```bash
# Sử dụng Let's Encrypt
sudo apt-get install -y certbot python3-certbot-nginx

sudo certbot certonly --nginx -d slife.com -d api.slife.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

#### 2. Tường Lửa

```bash
sudo ufw enable
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
```

### Database Production

#### 1. Cấu Hình Bảo Mật

```sql
-- Giới hạn quyền user
ALTER USER slife_user WITH PASSWORD 'strong_password_here_123!@#';
REVOKE ALL PRIVILEGES ON DATABASE datn_slife FROM PUBLIC;
GRANT CONNECT ON DATABASE datn_slife TO slife_user;
GRANT USAGE ON SCHEMA public TO slife_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO slife_user;
```

#### 2. Backup Tự Động

```bash
# Script: /home/slife/backup-db.sh
#!/bin/bash
BACKUP_DIR="/backups/postgresql"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

pg_dump -U slife_user -h localhost datn_slife | \
  gzip > $BACKUP_DIR/slife_backup_$TIMESTAMP.sql.gz

# Giữ chỉ 30 ngày backup
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

# Cron job: Chạy hàng ngày lúc 02:00 AM
# 0 2 * * * /home/slife/backup-db.sh
```

### Monitoring & Alerting

#### 1. Prometheus

```yaml
# /etc/prometheus/prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: "slife-backend"
    static_configs:
      - targets: ["localhost:8089"]
```

#### 2. Grafana Dashboards

```bash
# Cài đặt Grafana
sudo apt-get install -y grafana-server
sudo systemctl start grafana-server
sudo systemctl enable grafana-server

# Truy cập: http://your-server:3000
# Default: admin/admin
```

---

## 🐳 Docker & Kubernetes

### Docker Compose (All-in-One)

```yaml
# docker-compose.prod.yml
version: "3.8"

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: slife_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: datn_slife
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U slife_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend/java-mastery
      dockerfile: Dockerfile
    environment:
      SPRING_PROFILE: production
      DB_HOST: postgres
      REDIS_HOST: redis
    ports:
      - "8089:8089"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### Kubernetes Deployment

```yaml
# k8s/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: slife-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: slife-backend
  template:
    metadata:
      labels:
        app: slife-backend
    spec:
      containers:
        - name: backend
          image: slife/backend:latest
          ports:
            - containerPort: 8089
          env:
            - name: SPRING_PROFILE
              value: "production"
            - name: DB_HOST
              value: "postgres-service"
          livenessProbe:
            httpGet:
              path: /api/v1/health
              port: 8089
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /api/v1/health
              port: 8089
            initialDelaySeconds: 10
            periodSeconds: 5
```

---

## 📊 Giám Sát & Logging

### Centralized Logging (ELK Stack)

```bash
# Docker Compose cho ELK
docker-compose -f docker-compose.elk.yml up -d

# Logstash config để parse Spring Boot logs
filter {
  if [type] == "java" {
    grok {
      match => { "message" => "%{TIMESTAMP_ISO8601:timestamp} %{LOGLEVEL:level} %{DATA:class}" }
    }
  }
}

# Kibana: http://localhost:5601
```

### Application Logs Configuration

```properties
# application.properties
logging.level.root=INFO
logging.level.com.haihoan2874.techhub=DEBUG
logging.pattern.console=%d{yyyy-MM-dd HH:mm:ss} - %logger{36} - %msg%n
logging.file.name=/var/log/slife/application.log
logging.file.max-size=10MB
logging.file.max-history=10
```

---

## 🔄 Backup & Recovery

### Database Backup

```bash
# Full backup
pg_dump -U slife_user -h localhost -d datn_slife > backup_full.sql

# Compressed backup
pg_dump -U slife_user -h localhost -d datn_slife | gzip > backup_full.sql.gz

# Restore
gunzip < backup_full.sql.gz | psql -U slife_user -h localhost -d datn_slife
```

### Application Files Backup

```bash
# Backup storage & uploads
tar -czf app_files_$(date +%Y%m%d).tar.gz /opt/slife/uploads/

# Backup configurations
tar -czf app_config_$(date +%Y%m%d).tar.gz /opt/slife/config/
```

---

## 🆘 Troubleshooting Phổ Biến

### Port 8089 đã được sử dụng

```bash
# Tìm process đang sử dụng port
lsof -i :8089

# Giết process
kill -9 <PID>
```

### Database Connection Error

```bash
# Kiểm tra kết nối PostgreSQL
psql -U slife_user -h localhost -d datn_slife

# Kiểm tra credentials
grep -E "DB_HOST|DB_USER|DB_PASSWORD" .env.local
```

### Redis Connection Error

```bash
# Kiểm tra Redis đang chạy
redis-cli ping

# Restart Redis
sudo systemctl restart redis-server
```

### Memory Issues

```bash
# Kiểm tra memory usage
free -h
df -h

# Tăng JVM heap size
export JAVA_OPTS="-Xms1g -Xmx2g"
./gradlew bootRun
```

---

**Liên hệ hỗ trợ**: dev@slife.com  
**Tài liệu khác**: [API.md](API.md) | [ARCHITECTURE.md](ARCHITECTURE.md)

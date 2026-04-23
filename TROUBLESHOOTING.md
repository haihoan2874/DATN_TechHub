# 🆘 TROUBLESHOOTING.md - Xử Lý Sự Cố S-Life

**Phiên bản**: 1.0  
**Ngày cập nhật**: 15 tháng 4 năm 2026

---

## 📋 Mục Lục

1. [Vấn Đề Chung](#vấn-đề-chung)
2. [Vấn Đề Backend](#vấn-đề-backend)
3. [Vấn Đề Frontend](#vấn-đề-frontend)
4. [Vấn Đề Database](#vấn-đề-database)
5. [Vấn Đề Docker](#vấn-đề-docker)
6. [Vấn Đề Triển Khai](#vấn-đề-triển-khai)
7. [Vấn Đề Hiệu Suất](#vấn-đề-hiệu-suất)

---

## 🔧 Vấn Đề Chung

### ❓ Ứng Dụng Không Khởi Động

#### Triệu chứng:

```
ERROR - Failed to configure a DataSource
ERROR - Unable to connect to database
```

#### Giải pháp:

**Bước 1**: Kiểm tra cấu hình database

```bash
# application.properties
grep -i "datasource" src/main/resources/application.properties

# Kiểm tra credential
echo "DB_HOST: $DB_HOST"
echo "DB_USER: $DB_USER"
```

**Bước 2**: Kiểm tra PostgreSQL đang chạy

```bash
# Linux/Mac
sudo systemctl status postgresql

# Hoặc dùng Docker
docker ps | grep postgres

# Test kết nối
psql -h localhost -U pguser -d datn_slife
```

**Bước 3**: Xóa cache và rebuild

```bash
cd backend/java-mastery
./gradlew clean
./gradlew build -x test
```

---

### ❓ Port Đã Được Sử Dụng

#### Triệu chứng:

```
Address already in use: bind
```

#### Giải pháp:

**Tìm process sử dụng port**:

```bash
# Linux/Mac
lsof -i :8089

# Windows (PowerShell)
netstat -ano | findstr :8089
```

**Giải quyết**:

```bash
# Giết process
kill -9 <PID>

# Hoặc dùng port khác
java -Dserver.port=8090 -jar app.jar
```

---

### ❓ Không Thể Kết Nối Backend Từ Frontend

#### Triệu chứng:

```
CORS error
Net::ERR_FAILED
Failed to fetch from http://localhost:8089/api/v1/...
```

#### Giải pháp:

**Kiểm tra CORS configuration**:

```bash
# Check if backend is running
curl http://localhost:8089/api/v1/health

# Check CORS headers
curl -H "Origin: http://localhost:5173" \
  -v http://localhost:8089/api/v1/products
```

**Cấu hình CORS trong backend**:

```java
// CorsConfiguration.java
@Configuration
public class CorsConfiguration implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("http://localhost:5173")
            .allowedMethods("GET", "POST", "PUT", "DELETE")
            .allowCredentials(true);
    }
}
```

---

## 🔴 Vấn Đề Backend

### ❌ JWT Token Hết Hạn / Không Hợp Lệ

#### Triệu chứng:

```
401 Unauthorized
Invalid JWT Token
```

#### Giải pháp:

**Kiểm tra JWT secret**:

```bash
# application.properties
grep "jwt.secretKey" src/main/resources/application.properties

# Đảm bảo secret giống ở backend
echo $JWT_SECRET
```

**Xóa token cũ và login lại**:

```javascript
// Frontend console
localStorage.removeItem("token");
// Hoặc
sessionStorage.removeItem("token");

// Đăng nhập lại
```

**Tăng expiration time (nếu cần)**:

```properties
# application.properties
jwt.expirationMinute=1440  # 24 hours
```

---

### ❌ Database Migration Failure

#### Triệu chứng:

```
Flyway migration failed
SQL error in version V1.X__...
```

#### Giải pháp:

**Kiểm tra migration files**:

```bash
ls -la backend/java-mastery/src/main/resources/db/migration/

# Check syntax của file SQL
cat src/main/resources/db/migration/V1.0__Create_users_table.sql
```

**Reset migrations (DANGER - chỉ dùng cho dev)**:

```bash
# Xóa toàn bộ schema
psql -U pguser -d datn_slife -c "DROP SCHEMA public CASCADE;"
psql -U pguser -d datn_slife -c "CREATE SCHEMA public;"

# Chạy lại migrations
./gradlew bootRun
```

**Hoặc skip migration**:

```properties
# application.properties
spring.flyway.enabled=false
```

---

### ❌ API Timeout / Chậm

#### Triệu chứng:

```
Response time > 5000ms
Request timeout
```

#### Giải pháp:

**1. Kiểm tra N+1 Query Problem**:

```bash
# Enable query logging
grep "show-sql" application.properties

# Thêm vào application.properties
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
```

**2. Sử dụng @EntityGraph**:

```java
@Query("SELECT p FROM Product p")
@EntityGraph(attributePaths = {"category", "brand"})
List<Product> findAllWithRelations();
```

**3. Tăng connection pool**:

```properties
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=5
```

**4. Caching**:

```java
@Cacheable("products")
public List<Product> getAllProducts() {
    return productRepository.findAll();
}
```

---

### ❌ Lỗi File Upload

#### Triệu chứng:

```
Failed to upload file
File size exceeds limit
```

#### Giải pháp:

**Tăng file size limit**:

```properties
# application.properties
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
```

**Kiểm tra disk space**:

```bash
df -h /var/www/slife/uploads/
du -sh /var/www/slife/uploads/
```

---

### ❌ Lỗi Email Notification

#### Triệu chứng:

```
Failed to send email
SMTPAuthenticationException
```

#### Giải pháp:

**Kiểm tra SMTP configuration**:

```properties
# application.properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password

# Note: Dùng App Password cho Gmail, không phải password thường
```

**Enable "Less secure app access" (Gmail)**:

- Truy cập: https://myaccount.google.com/apppasswords
- Tạo app password mới

**Test email**:

```bash
telnet smtp.gmail.com 587
```

---

## 💙 Vấn Đề Frontend

### ❌ Blank Page / White Screen

#### Triệu chứng:

```
Trang trắng, không có nội dung
Console error: Cannot read property of undefined
```

#### Giải pháp:

**Kiểm tra browser console**:

```javascript
// F12 → Console tab
// Xem error message chi tiết
```

**Kiểm tra build**:

```bash
npm run build
npm run preview

# Test local preview
open http://localhost:4173
```

**Reset node_modules**:

```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

### ❌ CORS Error Khi Call API

#### Triệu chứng:

```
Access to XMLHttpRequest at 'http://localhost:8089/...'
from origin 'http://localhost:5173' has been blocked by CORS policy
```

#### Giải pháp:

**1. Kiểm tra API URL**:

```typescript
// axios.ts
const API_BASE_URL =
  process.env.VITE_API_BASE_URL || "http://localhost:8089/api/v1";

console.log("API URL:", API_BASE_URL);
```

**2. Kiểm tra CORS headers**:

```bash
curl -H "Origin: http://localhost:5173" \
  -v http://localhost:8089/api/v1/products
```

**3. Thêm CORS config backend**:

```java
registry.addMapping("/api/**")
    .allowedOrigins("http://localhost:5173", "http://localhost:3000")
    .allowedMethods("*")
    .allowCredentials(true);
```

---

### ❌ Thành Phần Không Render / Lỗi React

#### Triệu chứng:

```
Error: Component returned undefined
React Hook error
```

#### Giải pháp:

**Sử dụng Error Boundary**:

```typescript
// components/ErrorBoundary.tsx
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.error) {
      return <div>Something went wrong</div>;
    }
    return this.props.children;
  }
}

// Sử dụng trong App.tsx
<ErrorBoundary>
  <Router>...</Router>
</ErrorBoundary>
```

**Debug component**:

```bash
# Cài React DevTools
# Chrome/Firefox extension
```

---

### ❌ Build Fails với TypeScript Error

#### Triệu chứng:

```
error TS2307: Cannot find module
Type 'any' is not assignable to type 'never'
```

#### Giải pháp:

**Kiểm tra tsconfig.json**:

```bash
cat tsconfig.json
cat tsconfig.app.json
```

**Fix TypeScript errors**:

```bash
# Check all errors
npx tsc --noEmit

# Fix formatting
npx prettier --write src/**/*.tsx
```

---

## 💾 Vấn Đề Database

### ❌ Database Connection Refused

#### Triệu chứng:

```
psql: could not connect to server: Connection refused
FATAL: no pg_hba.conf entry for host "::1", user "pguser"
```

#### Giải pháp:

**Kiểm tra PostgreSQL status**:

```bash
# systemd
sudo systemctl status postgresql

# Manual start
sudo -u postgres /usr/lib/postgresql/16/bin/postgres -D /var/lib/postgresql/16/main

# Docker
docker logs <postgres_container_id>
```

**Fix pg_hba.conf**:

```bash
# Tìm file
sudo find / -name "pg_hba.conf"

# Edit
sudo nano /etc/postgresql/16/main/pg_hba.conf

# Thêm dòng
local   all             all                                     trust
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5

# Restart PostgreSQL
sudo systemctl restart postgresql
```

---

### ❌ Database Disk Full

#### Triệu chứng:

```
FATAL: could not create temporary file
No space left on device
```

#### Giải pháp:

**Kiểm tra disk**:

```bash
df -h
du -sh /var/lib/postgresql/*
```

**Clear old backups**:

```bash
find /backups -name "*.sql.gz" -mtime +30 -delete
```

**Resize volume**:

```bash
# AWS RDS: Modify DB instance
# GCP Cloud SQL: Edit instance
# DigitalOcean: Resize volume
```

---

### ❌ Deadlock Trong Database

#### Triệu chứng:

```
ERROR: deadlock detected
```

#### Giải pháp:

**Kiểm tra active connections**:

```sql
SELECT * FROM pg_stat_activity;
```

**Kill hanging connections**:

```sql
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state != 'idle';
```

**Optimize queries** (thêm indexes):

```sql
CREATE INDEX idx_product_category ON products(category_id);
CREATE INDEX idx_order_user ON orders(user_id);
```

---

## 🐳 Vấn Đề Docker

### ❌ Docker Compose Services Not Starting

#### Triệu chứng:

```
ERROR: Service 'postgres' failed to build
```

#### Giải pháp:

**Kiểm tra logs**:

```bash
docker-compose logs postgres
docker-compose logs backend
docker-compose logs frontend
```

**Rebuild containers**:

```bash
docker-compose down
docker-compose up --build

# Hoặc rebuild specific service
docker-compose up --build postgres
```

**Reset volumes** (xóa data):

```bash
docker-compose down -v
docker-compose up -d
```

---

### ❌ Port Conflict Trong Docker

#### Triệu chứng:

```
Error response from daemon: Ports are not available
```

#### Giải pháp:

**Kiểm tra ports đang chạy**:

```bash
docker ps
netstat -tuln | grep LISTEN
```

**Thay đổi port mapping**:

```yaml
# docker-compose.yml
services:
  backend:
    ports:
      - "8090:8089" # Changed from 8089
```

---

## 🚀 Vấn Đề Triển Khai

### ❌ Nginx Không Proxy Chính Xác

#### Triệu chứng:

```
502 Bad Gateway
```

#### Giải pháp:

**Kiểm tra config**:

```bash
sudo nginx -t  # Test config

# Xem logs
sudo tail -f /var/log/nginx/error.log
```

**Sửa proxy**:

```nginx
# /etc/nginx/sites-available/slife
upstream backend {
    server localhost:8089;
}

server {
    location /api {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Restart Nginx**:

```bash
sudo systemctl restart nginx
```

---

### ❌ SSL Certificate Issue

#### Triệu chứng:

```
ERR_SSL_PROTOCOL_ERROR
NET::ERR_CERT_DATE_INVALID
```

#### Giải pháp:

**Kiểm tra certificate**:

```bash
sudo certbot certificates

# Renew cert
sudo certbot renew --dry-run
```

**Auto-renewal**:

```bash
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

---

## ⚡ Vấn Đề Hiệu Suất

### ❌ Application Memory Leak

#### Triệu chứng:

```
Heap memory constantly increasing
Out of Memory Error
```

#### Giải pháp:

**Giám sát memory**:

```bash
# Linux
free -h
watch -n 1 free -h

# Java process
ps aux | grep java
jconsole  # JVM monitoring
```

**Tăng heap size**:

```bash
# Startup
export JAVA_OPTS="-Xms1g -Xmx2g"
./gradlew bootRun

# Docker
docker run -e JAVA_OPTS="-Xms512m -Xmx1g" slife-backend
```

**Kiểm tra memory leaks**:

```bash
jmap -histo <PID>
jstat -gc <PID>
```

---

### ❌ Database Slow Queries

#### Triệu chứng:

```
Query takes > 1 second
```

#### Giải pháp:

**Enable query logging**:

```properties
# application.properties
spring.jpa.properties.hibernate.generate_statistics=true
logging.level.org.hibernate.stat=DEBUG
```

**Kiểm tra slow query log**:

```sql
-- PostgreSQL
SET log_min_duration_statement = 1000;  -- Log queries > 1s
```

**Thêm indexes**:

```sql
CREATE INDEX idx_products_category
ON products(category_id);

CREATE INDEX idx_orders_user
ON orders(user_id);
```

**VACUUM & ANALYZE**:

```bash
# PostgreSQL maintenance
psql -U pguser -d datn_slife -c "VACUUM ANALYZE;"
```

---

### ❌ High CPU Usage

#### Triệu chứng:

```
CPU usage 90-100%
```

#### Giải pháp:

**Kiểm tra top processes**:

```bash
top
htop
```

**Kiểm tra hot spots**:

```bash
# JVM profiling
jcmd <PID> JFR.start
jcmd <PID> JFR.dump filename=recording.jfr
# Mở với JMC (Java Mission Control)
```

**Optimize code**:

```java
// Bad: Full table scan
List<Product> products = productRepository.findAll();

// Good: Use pagination & filtering
Page<Product> products = productRepository.findByCategory(
    categoryId,
    PageRequest.of(0, 20)
);
```

---

## 📋 Debugging Checklist

```
Khi gặp vấn đề, kiểm tra theo thứ tự:

Frontend:
- [ ] Check browser console (F12)
- [ ] Network tab - see API responses
- [ ] Check localStorage/sessionStorage
- [ ] React DevTools extension
- [ ] Verify VITE_API_BASE_URL

Backend:
- [ ] Check application logs
- [ ] Verify database connection
- [ ] Check Redis connection
- [ ] Verify JWT configuration
- [ ] Check Java heap memory
- [ ] Verify external API keys

Database:
- [ ] Connection string correct
- [ ] User permissions
- [ ] Disk space available
- [ ] Query performance
- [ ] Connection pool size

Deployment:
- [ ] Port conflicts
- [ ] CORS configuration
- [ ] SSL certificates
- [ ] Environment variables
- [ ] File permissions
```

---

## 📞 Getting Help

1. **Check logs first**

   ```bash
   # Backend
   tail -f backend/java-mastery/build/logs/spring.log

   # Frontend
   npm run dev  # Check console

   # Docker
   docker-compose logs -f
   ```

2. **Search documentation**
   - [API.md](API.md)
   - [ARCHITECTURE.md](ARCHITECTURE.md)
   - [DEPLOYMENT.md](DEPLOYMENT.md)

3. **Contact team**
   - Email: support@slife.com
   - Slack: #slife-dev
   - GitHub Issues: [Report Bug]

---

**Cập nhật lần cuối**: 15 tháng 4 năm 2026  
**Version**: 1.0

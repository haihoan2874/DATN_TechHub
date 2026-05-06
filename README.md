# S-Life TechHub - Smart Health & High-Tech Store

Dự án tốt nghiệp xây dựng nền tảng Thương mại điện tử cao cấp cho các thiết bị công nghệ sức khỏe thông minh.

## 📁 Cấu trúc dự án

Dự án được chia thành hai phần chính:

### 1. [Backend (Spring Boot)](./backend/java-mastery)
- **Công nghệ**: Java 21, Spring Boot 3.x, PostgreSQL, Spring Security JWT.
- **Tính năng**: Quản lý sản phẩm (136+ items), Xử lý đơn hàng, Authentication, Data Seeding tự động.
- **Cổng chạy**: `8089`

### 2. [Frontend (React)](./frontend)
- **Công nghệ**: ReactJS, Vite, Framer Motion, TailwindCSS.
- **Phong cách**: Hardcore Techwear / Cyberpunk Minimalist.
- **Tính năng**: Mega Menu, Bộ lọc sản phẩm đa năng, Search thời gian thực, Giỏ hàng.
- **Cổng chạy**: `5173`

## 🚀 Khởi chạy nhanh

### Bước 1: Khởi động Cơ sở dữ liệu
Yêu cầu Docker Desktop đã được cài đặt:
```bash
cd backend/java-mastery
docker-compose up -d
```

### Bước 2: Chạy Backend Service
```bash
./gradlew bootRun
```

### Bước 3: Chạy Frontend UI
```bash
cd ../../frontend
npm install
npm run dev
```

## 🛠️ Luồng dữ liệu (Data Flow)
Hệ thống sử dụng cơ chế **Data Synthesis** để tự động tạo ra bộ sưu tập sản phẩm phong phú từ các thương hiệu hàng đầu như Garmin, Apple, Samsung... Đảm bảo dữ liệu demo luôn sạch sẽ, chuyên nghiệp và không trùng lặp.

---
**S-Life** - Nâng tầm sức khỏe, làm chủ công nghệ.
*Dự án tốt nghiệp - 2024*

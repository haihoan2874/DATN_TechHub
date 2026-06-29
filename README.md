# S-LIFE (DATN_TechHub) - Smart Health Commerce ⌚️🎧

![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-6DB33F?style=flat-square&logo=spring-boot&logoColor=white)
![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat-square&logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)

**S-LIFE** (Đồ án tốt nghiệp) là nền tảng thương mại điện tử chuyên cung cấp các thiết bị công nghệ phục vụ sức khỏe thông minh như: Smartwatch, Smartband, tai nghe cao cấp và phụ kiện chính hãng. Dự án được thiết kế với kiến trúc Micro-services (Backend riêng biệt) và giao diện người dùng tối ưu hóa UI/UX chuẩn Modern E-Commerce.

---

## 🌟 Tính năng nổi bật (Core Features)

### Dành cho Khách hàng (User Web)
- **Trải nghiệm mua sắm mượt mà:** UI/UX được trau chuốt với `Framer Motion` và `TailwindCSS`, thiết kế theo ngôn ngữ phẳng, sạch và tập trung (Focus-driven).
- **Thanh toán trực tuyến VNPay:** Tích hợp cổng thanh toán Sandbox của VNPay với đầy đủ quy trình tạo mã bảo mật (Checksum/Hash).
- **S-Life AI Chatbot:** Trợ lý ảo thông minh tư vấn cấu hình sản phẩm và sức khỏe người dùng ngay trên giao diện cửa hàng.
- **Quản lý tài khoản toàn diện:** Đăng ký/Đăng nhập (JWT Security), theo dõi trạng thái đơn hàng (Tracking), lịch sử giao dịch.

### Dành cho Quản trị viên (Admin Dashboard)
- **Quản trị Catalog:** Quản lý kho sản phẩm đa dạng (SKU), danh mục, thương hiệu với hình ảnh cấu hình cao.
- **Dashboard Thống kê (Real-time Insights):** Giao diện quản trị số liệu trực quan, theo dõi Doanh thu, số lượng đơn hàng, tồn kho và Phiếu nhập (Stock Imports).
- **Xử lý đơn hàng:** Trình quản lý luồng trạng thái đơn hàng (Chờ duyệt -> Đang giao -> Hoàn thành) chuyên nghiệp.

---

## 🛠 Cấu trúc Công nghệ (Tech Stack)

### 1. Backend: [Spring Boot (Java)](./backend/java-mastery)
- **Framework:** Java 21, Spring Boot 3.x, Spring Data JPA, Spring Security (JWT Auth).
- **Cơ sở dữ liệu:** PostgreSQL (Lưu trữ chính), Flyway (Quản lý Schema Migration).
- **Build Tool:** Gradle.
- **Port mặc định:** `8089`.

### 2. Frontend: [ReactJS (Vite)](./frontend)
- **Framework:** React 18, Vite (Fast build & HMR).
- **Styling & Animation:** TailwindCSS, Framer Motion, Lucide Icons.
- **State Management & Routing:** React Router DOM.
- **Port mặc định:** `5173`.

---

## 🚀 Hướng dẫn cài đặt (Local Development)

### Bước 1: Khởi động Cơ sở dữ liệu (Database)
Yêu cầu đã cài đặt **Docker** & **Docker Compose**:
```bash
cd backend/java-mastery
docker-compose up -d
```
*(Lệnh này sẽ khởi tạo Postgres Container và thiết lập sẵn Database/User cho ứng dụng).*

### Bước 2: Chạy Backend Service (API Server)
```bash
# Đang đứng ở thư mục backend/java-mastery
./gradlew bootRun
```
*(Lưu ý: Flyway sẽ tự động chạy các file migration `V1, V2...` để tạo bảng và seed dữ liệu gốc).*

### Bước 3: Chạy Frontend (Web UI)
Mở một Terminal mới:
```bash
cd frontend
npm install
npm run dev
```
Truy cập ứng dụng tại: `http://localhost:5173/`

---

## 📜 Thông tin Đồ án & Tác giả
- **Tên dự án:** S-Life (DATN) - Hệ thống kinh doanh thiết bị sức khỏe thông minh.
- **Tài khoản Test Admin:** `admin` / `admin123`
- **Tài khoản Test VNPay Sandbox:** `9704198526191432198` - NGUYEN VAN A - `07/15` - `123456`
- **Mục tiêu:** Xây dựng hệ thống vận hành Full-stack với độ trễ thấp, giao diện bắt mắt, logic nghiệp vụ chuẩn E-commerce thực tế phục vụ kỳ bảo vệ Đồ án Tốt nghiệp.

> **S-Life** - Nâng tầm sức khỏe, làm chủ công nghệ.

# 🏗️ KIẾN TRÚC HỆ THỐNG - S-Life Elite Health Ecosystem

**Phiên bản**: 2.0  
**Ngày cập nhật**: 15 tháng 4 năm 2026  
**Tác giả**: Hoan (S-Life Architecture Team)

---

## 📋 Mục Lục

1. [Tổng Quan Kiến Trúc](#tổng-quan-kiến-trúc)
2. [Các Thành Phần Chính](#các-thành-phần-chính)
3. [Kiến Trúc Backend](#kiến-trúc-backend)
4. [Kiến Trúc Frontend](#kiến-trúc-frontend)
5. [Cơ Sở Dữ Liệu](#cơ-sở-dữ-liệu)
6. [Luồng Dữ Liệu](#luồng-dữ-liệu)
7. [Bảo Mật](#bảo-mật)
8. [Khả Năng Mở Rộng](#khả-năng-mở-rộng)

---

## 🎯 Tổng Quan Kiến Trúc

### Mô Hình Kiến Trúc Tổng Thể

```
┌─────────────────────────────────────────────────────────────┐
│                     Tầng Khách Hàng (Client)                │
│  ┌──────────────────┐                ┌──────────────────┐   │
│  │  Web Frontend    │                │  Mobile (Tương lai)│   │
│  │  React 19 + TS   │                │  React Native    │   │
│  └────────┬─────────┘                └─────────┬────────┘   │
└───────────┼────────────────────────────────────┼─────────────┘
            │                                    │
            │  HTTPS/WebSocket                   │
            │                                    │
┌───────────┴────────────────────────────────────┴─────────────┐
│                   Tầng API (Spring Boot)                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Điều khiển (Controllers - REST API, WebSocket)      │   │
│  │  ├─ ProductController (Sản phẩm)                     │   │
│  │  ├─ OrderController (Đơn hàng)                       │   │
│  │  ├─ AuthController (Xác thực)                        │   │
│  │  └─ ...                                            │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Tầng Nghiệp Vụ (Business Logic - Services)          │   │
│  │  ├─ ProductService     ├─ OrderService             │   │
│  │  ├─ CartService        ├─ PaymentService           │   │
│  │  ├─ AIService          ├─ UserService              │   │
│  │  └─ ...                └─ ...                      │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Tầng Truy Xuất Dữ Liệu (Repositories)               │   │
│  │  └─ JPA Repositories + Custom Queries              │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────┬────────────────────────────┬────────────────────┘
            │                            │
            │                            │
┌───────────▼──────────┐    ┌────────────▼──────────┐
│   PostgreSQL         │    │      Redis            │
│   (CSDL Chính)       │    │   (Cache/Session)     │
│   ├─ Users           │    │   ├─ Cart             │
│   ├─ Products        │    │   ├─ Sessions         │
│   ├─ Orders          │    │   └─ Cache            │
│   └─ ...             │    │                       │
└──────────────────────┘    └───────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│               Dịch Vụ Bên Ngoài                             │
│  ├─ Google Gemini API (Tư vấn AI)                          │
│  ├─ VNPay Gateway (Thanh Toán)                             │
│  └─ Email Service (Thông báo SMTP)                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧩 Các Thành Phần Chính

### 1. Tầng Khách Hàng (Frontend)

**Công nghệ**: React 19 + TypeScript + Vite + Tailwind CSS 4.0

**Thành phần chính**:
- `App.tsx`: Thành phần gốc
- `pages/`: Các trang chức năng (Cửa hàng, Admin, Profile)
- `components/`: UI components (Navbar, Footer, SlifeAdvisor)
- `layouts/`: Bố cục giao diện (MainLayout, AdminLayout)

### 2. Tầng Điều Khiển (Controllers)

**Công nghệ**: Spring Boot REST API

**Cấu trúc Endpoint**:
- Công khai: `/api/v1/products`, `/api/v1/categories`
- Bảo mật: `/api/v1/orders`, `/api/v1/cart`
- Quản trị: `/api/v1/admin/**`

---

## 🔌 Kiến Trúc Backend Chi Tiết

### Cấu Trúc Thư Mục (Project Structure)

```
backend/java-mastery/
├── src/main/java/com/haihoan2874/techhub/
│   ├── configuration/       // Cấu hình (Security, CORS, Cache)
│   ├── controller/          // REST Endpoints
│   ├── service/             // Business Logic
│   ├── repository/          // Data Access (JPA)
│   ├── model/               // Thực thể CSDL (Entities)
│   ├── dto/                 // Data Transfer Objects
│   ├── mapper/              // MapStruct mappers
│   ├── security/            // JWT & Auth logic
│   ├── exceptions/          // Xử lý lỗi tập trung
│   └── SlifeApplication.java // Hàm main
│
├── src/main/resources/
│   ├── application.properties // Cấu hình môi trường
│   ├── seed/                  // Dữ liệu mẫu (JSON)
│   └── db/migration/          // Flyway scripts (V1.0 -> V1.14)
```

---

## 💾 Cơ Sở Dữ Liệu

Hệ thống S-Life sử dụng mô hình quan hệ chặt chẽ trên PostgreSQL để quản lý hàng nghìn sản phẩm và đánh giá:

- **Sản phẩm (Products)**: Lưu thông số kỹ thuật (specs) dạng JSONB để tối ưu cho thiết bị đeo.
- **Đánh giá (Reviews)**: Lưu vết trải nghiệm người dùng, tích hợp dummy users cho dữ liệu crawler.
- **Đơn hàng (Orders)**: Quy trình giao dịch và trạng thái thanh toán.

---

## 🛠️ Công Nghệ Sử Dụng

- **Backend**: Java 21 LTS, Spring Boot 3.3.6, Hibernate, PostgreSQL 16, Redis 7.
- **Frontend**: React 19, TypeScript 5.8, Tailwind CSS 4.0, Framer Motion 12.
- **AI**: Google Gemini 1.5 Flash API.
- **DevOps**: Docker, Docker Compose, Flyway.

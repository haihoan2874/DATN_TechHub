# S-Life - Smart Health & Tech Ecosystem

Dự án tốt nghiệp hệ thống Thương mại điện tử chuyên biệt cho thiết bị đeo thông minh (Smartwatch), Tai nghe và Phụ kiện công nghệ cao cấp.

## 🌟 Tổng quan dự án (S-LIFE)

S-Life không chỉ là một website bán hàng, mà là một trải nghiệm mua sắm công nghệ hiện đại (Hardcore Techwear). Hệ thống được tối ưu hóa cho việc quản lý hàng trăm danh mục sản phẩm với độ chính xác cao và trải nghiệm người dùng mượt mà.

- **Frontend**: ReactJS (Vite), Framer Motion, TailwindCSS, Lucide Icons. Giao diện thiết kế theo phong cách tối giản, mạnh mẽ.
- **Backend**: Spring Boot 3.x (Java 21 LTS), Spring Security (JWT), Hibernate ORM.
- **Dữ liệu**: Hỗ trợ Seeding tự động hơn 136+ sản phẩm mẫu chất lượng cao từ các thương hiệu lớn (Garmin, Apple, Samsung, Amazfit...).
- **Cơ sở dữ liệu**: PostgreSQL 16 (lưu trữ specs dưới dạng JSONB linh hoạt).

## 🚀 Tính năng nổi bật

### ✅ Trải nghiệm người dùng (Storefront)
- **Mega Menu thông minh**: Phân loại sản phẩm theo nhu cầu (Thể thao, Thời trang, Sức khỏe).
- **Hệ thống lọc "Hardcore"**: Lọc đa tầng theo Khoảng giá, Thương hiệu, Danh mục và Thông số kỹ thuật.
- **Tìm kiếm Real-time**: Search sản phẩm với tốc độ cực cao, hiển thị kết quả ngay lập tức.
- **Giỏ hàng & Thanh toán**: Quy trình Checkout tối ưu, tích hợp lưu trữ giỏ hàng lâu dài.

### ✅ Quản trị hệ thống (Admin Dashboard)
- **Quản lý Inventory**: Theo dõi tồn kho, cảnh báo hàng sắp hết.
- **Data Seeding**: Cơ chế nạp dữ liệu tự động, tự động dọn dẹp và chống trùng lặp dữ liệu.
- **Phân quyền**: Hệ thống bảo mật dựa trên vai trò (Admin/User).

## 📂 Cấu trúc mã nguồn (Backend)

```
backend/java-mastery/
├── src/main/java/com/haihoan2874/techhub/
│   ├── configuration/      # Cấu hình Security, CORS, Swagger
│   ├── controller/         # Hệ thống REST APIs
│   ├── dto/                # Request/Response models (Data Transfer Objects)
│   ├── exception/          # Xử lý lỗi tập trung (Global Exception Handling)
│   ├── model/              # JPA Entities (Lớp thực thể Database)
│   ├── repository/         # Tầng giao tiếp Database (Spring Data JPA)
│   ├── service/            # Tầng xử lý Logic nghiệp vụ (Business Logic)
│   └── security/           # JWT & Authentication Filter
│
├── src/main/resources/
│   ├── application.properties  # Cấu hình hệ thống & Kết nối DB
│   └── db/migration/           # Scripts quản lý phiên bản database (Flyway)
│
└── build.gradle                # Quản lý dependencies & Build tool
```

## 🛠️ Hướng dẫn cài đặt

### 1. Môi trường yêu cầu
- Java 21 (LTS)
- Docker (để chạy PostgreSQL & Redis)
- Node.js (để chạy Frontend)

### 2. Chạy Backend
```bash
# Tại thư mục backend/java-mastery
./gradlew bootRun
```
Ứng dụng sẽ chạy tại: `http://localhost:8089`

### 3. Nạp dữ liệu mẫu (Seeding)
Sau khi ứng dụng chạy, truy cập endpoint sau để nạp 136 sản phẩm mẫu:
`POST http://localhost:8089/api/v1/system/seed`

### 4. Tài liệu API (Swagger UI)
Xem chi tiết các Endpoint và thử nghiệm API tại:
`http://localhost:8089/swagger-ui.html`

---

**Phiên bản**: 1.0.0-PRO (Giai đoạn hoàn thiện Đồ án tốt nghiệp)
**Tác giả**: Hoan (S-Life Development Team)
**Workspace**: `/home/hoan/Projects/DATN_TechHub`

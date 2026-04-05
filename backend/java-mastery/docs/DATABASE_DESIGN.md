# TechHub Tích hợp Database Design (Data Dictionary)

Tài liệu này đặc tả chi tiết về cách thức tổ chức các bảng trong PostgreSQL của hệ thống TechHub. Các bảng được migrate và kiểm soát version bởi **Flyway**.

## 1. Schema Tổng Quan

### Quy tắc đặt tên
- Tên bảng: Số nhiều (`users`, `products`, `brands`).
- Khoá chính: `id` (ưu tiên dạng `UUID` để tránh enum scraping và dễ dàng dùng trong microservices).
- Foreign Keys: `table_id` (`user_id`, `category_id`).
- Timestamps: Bảo đảm tính audit với `created_at`, `updated_at`, `created_by`, `updated_by`.

---

## 2. Chi Tiết Các Bảng

### Bảng `users`
Lưu trữ thông tin người dùng cuối cũng như quản trị viên.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | Định danh. |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Tài khoản định danh lúc đăng nhập. |
| `password_hash` | VARCHAR(255) | | Mã hoá BCrypt (null nếu dùng Google Login). |
| `first_name` | VARCHAR(50) | | |
| `last_name` | VARCHAR(50) | | |
| `phone` | VARCHAR(20) | | Số điện thoại dùng liên lạc. |
| `role_id` | UUID | FOREIGN KEY | Trỏ đến bảng `roles`. |

> **Index:** `idx_users_email` (B-Tree).

### Bảng `categories` & `brands`
Phân loài sản phẩm theo chiều dọc và chiều ngang. Thường ít thay đổi.

**brands:**
- `id` (UUID, PK)
- `name` (VARCHAR 255) - Tên hãng (VD: Apple, Belkin)
- `slug` (VARCHAR 255, UK) - URL thân thiện, VD: `apple`
- `logo_url` (VARCHAR 500)
- `is_active` (BOOLEAN)

### Bảng `products`
Bảng cốt lõi của hệ thống E-commerce. Áp dụng kỹ thuật JSONB cho thuộc tính phi định cấu hình.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | |
| `category_id` | UUID | FOREIGN KEY | Loại sản phẩm: Điện thoại, Ốp lưng. |
| `brand_id` | UUID | FOREIGN KEY | Thương hiệu tạo ra sản phẩm. |
| `name` | VARCHAR(255)| NOT NULL | Tên sản phẩm hiển thị. |
| `slug` | VARCHAR(255)| UNIQUE, NOT NULL| Đường dẫn (VD: `iphone-15-pro-256gb`). |
| `price` | DECIMAL(10,2)| NOT NULL | Giá bán cơ sở lúc checkout. |
| `specs` | **JSONB** | | Dữ liệu linh hoạt lưu cấu hình. Xem phần Chiến lược JSONB bên dưới. |
| `video_urls` | JSONB | | Mảng list các String url trỏ tới review YouTube. |

> **Index:**
> - `idx_products_slug`
> - `idx_products_brand`
> - `idx_products_category`
> - GIN Index trên `specs` để tối ưu truy vấn các specs cụ thể.

### Bảng `inventory`
Tách biệt khỏi Entity Product để tránh Deadlock khi thanh toán và dễ audit lịch sử nhập kho.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | |
| `product_id` | UUID | FOREIGN KEY, UK| Trỏ 1-1 tới bảng Products. |
| `quantity_available` | INTEGER | DEFAULT 0 | Tổng lượng có thể bán hiện tại. |
| `quantity_reserved` | INTEGER | DEFAULT 0 | Hàng đang bị giữ do chờ thanh toán VNPay nhưng chưa thành công. |
| `min_stock_level` | INTEGER | DEFAULT 10 | Dùng cho trigger cảnh báo tồn. |
| `last_restock_date`| TIMESTAMP | | |

### Bảng `orders` & `order_items`
Lưu trữ thông tin hoá đơn bán ra.

**orders**
- `id` (UUID, PK)
- `user_id` (UUID, FK)
- `code` (VARCHAR) - Mã đơn thân thiện để người dùng tra cứu `ORD-2026xxxx`.
- `total_amount` (DECIMAL)
- `status` (VARCHAR) - Enum: PENDING, CONFIRMED, IN_TRANSIT, DELIVERED, CANCELLED.
- `payment_method` (VARCHAR) - VNPAY, COD.
- `payment_status` (VARCHAR) - PENDING, PAID, FAILED, REFUNDED.

**order_items**
Danh sách chi tiết có trong cart lúc checkout.
- `id` (UUID, PK)
- `order_id` (UUID, FK)
- `product_id` (UUID, FK)
- `quantity` (INTEGER)
- `price_at_buy` (DECIMAL) - Lưu giá chốt lúc mua, tách biệt giá đang đổi trên bảng Product.

---

## 3. Chiến Lược JSONB cho Sản Phẩm Công Nghệ

Sản phẩm công nghệ có sự biến thiên lớn về đặc tả (Specs).
- Một cái Cáp Sạc: Có `length` (chiều dài), `output_power` (công suất), `port_type` (Type-C to Lightning).
- Một cái Smartphone: Có `ram`, `rom`, `chipset`, `camera_resolution`, `battery`.

Phương pháp cũ (EAV - Entity Attribute Value) sẽ vô cùng chậm, JOIN nhiều bảng.
Chúng ta dùng `JSONB` của PostgreSQL và ánh xạ vào `Map<String, Object>` hoặc `JsonNode` của Hibernate 6+.

**Cấu trúc ví dụ trong DB row của Product "Macbook Pro M3":**
```json
{
  "cpu": "Apple M3 Max",
  "ram": "36GB Unified Memory",
  "storage": "1TB SSD",
  "display": "16.2 inch Liquid Retina XDR",
  "ports": ["MagSafe 3", "Thunderbolt 4", "SDXC"]
}
```

Kiểu dữ liệu này cho phép chúng ta có thể Query lọc (Filter) nhanh bằng SQL PostgreSQL:
`SELECT * FROM products WHERE specs ->> 'ram' = '36GB Unified Memory';`
Và hoàn toàn linh hoạt khi Frontend xây dựng bộ lọc Filter động theo ngành hàng.

# TechHub API Requirements Document

Tài liệu này đặc tả chi tiết toàn bộ các RESTful API endpoints sử dụng trong hệ thống TechHub. Dự án áp dụng chuẩn REST API, payload và response kiểu JSON. Các endpoint yêu cầu phân quyền được bảo mật bởi Bearer JWT Token.

## Phân Quyền (Roles)
- **PUBLIC**: Mọi người đều có thể truy cập (Không cần Token).
- **CUSTOMER (ROLE_USER)**: Khách hàng đã đăng nhập.
- **ADMIN (ROLE_ADMIN)**: Quản trị viên hệ thống.

---

## 1. Module Authentication & User Profile 

**1.1. User Registration**
- **Endpoint:** `POST /api/v1/auth/register`
- **Role:** PUBLIC
- **Request Body:**
  ```json
  {
    "email": "customer@example.com",
    "password": "SecurePassword123!",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "0987654321"
  }
  ```
- **Response (201 Created):**
  Trả về Token và chuỗi User cơ bản. Cấu trúc Response chuẩn:
  ```json
  {
    "status": "success",
    "message": "User registered successfully",
    "data": {
      "user": { "id": "uuid", "email": "customer@example.com" },
      "accessToken": "eyJh..."
    }
  }
  ```

**1.2. User Login**
- **Endpoint:** `POST /api/v1/auth/login`
- **Role:** PUBLIC
- **Request Body:**
  ```json
  {
    "email": "customer@example.com",
    "password": "SecurePassword123!"
  }
  ```

**1.3. Get My Profile**
- **Endpoint:** `GET /api/v1/users/me`
- **Role:** CUSTOMER / ADMIN
- **Response:** Thông tin User, địa chỉ giao hàng và lịch sử ví điểm (nếu có).

**1.4. Update Profile**
- **Endpoint:** `PUT /api/v1/users/me`
- **Role:** CUSTOMER
- **Request Body:** First Name, Last Name, Phone, Avatar URL.

---

## 2. Module Products & Catalog

**2.1. Lấy danh sách sản phẩm (có Pagination & Filters)**
- **Endpoint:** `GET /api/v1/products`
- **Role:** PUBLIC
- **QueryParams:**
  - `page=0&size=20`
  - `categoryId=uuid`
  - `brandId=uuid`
  - `minPrice=1000000` & `maxPrice=20000000`
  - `sortBy=price,asc`
- **Response (200 OK):**
  ```json
  {
    "content": [
      {
        "id": "uuid",
        "name": "iPhone 15 Pro Max",
        "slug": "iphone-15-pro-max",
        "price": 32000000,
        "brand": { "id": "uuid", "name": "Apple" },
        "imageUrl": "http...",
        "specs": {
           "ram": "8GB", "storage": "256GB"
        }
      }
    ],
    "pageable": { ... }
  }
  ```

**2.2. Lấy chi tiết sản phẩm theo Slug**
- **Endpoint:** `GET /api/v1/products/{slug}`
- **Role:** PUBLIC

**2.3. Lấy danh sách danh mục (Categories)**
- **Endpoint:** `GET /api/v1/categories`
- **Role:** PUBLIC

**2.4. Lấy danh sách thương hiệu (Brands)**
- **Endpoint:** `GET /api/v1/brands`
- **Role:** PUBLIC

---

## 3. Module Admin (Quản trị)

**3.1. CRUD Brands**
- **Endpoints:**
  - `POST /api/v1/admin/brands`
  - `PUT /api/v1/admin/brands/{id}`
  - `DELETE /api/v1/admin/brands/{id}`
- **Role:** ADMIN

**3.2. CRUD Products**
- **Endpoint:** `POST /api/v1/admin/products`
- **Role:** ADMIN
- **Request Body:**
  ```json
  {
    "name": "Iphone 15 Pro",
    "categoryId": "uuid",
    "brandId": "uuid",
    "price": 28000000,
    "description": "Text HTML",
    "specs": {         // Kiểu dữ liệu linh hoạt lưu bằng JSONB
       "camera": "48MP",
       "battery": "3200mAh",
       "screen": "6.1 Super Retina XDR"
    },
    "videoUrls": ["https://youtube..."]
  }
  ```

**3.3. Nhập Kho (Inventory Management)**
- **Endpoint:** `POST /api/v1/admin/inventory/restock`
- **Role:** ADMIN
- **Request Body:**
  ```json
  {
    "productId": "uuid",
    "quantityAdded": 50,
    "restockNotes": "Nhập từ nhà phân phối ABC"
  }
  ```

**3.4. Quản lý trạng thái đơn hàng**
- **Endpoint:** `PUT /api/v1/admin/orders/{id}/status`
- **Role:** ADMIN
- **Payload:** `{"status": "IN_TRANSIT"}` // Từ PENDING -> CONFIRMED -> SHIPPED

---

## 4. Module Cart & Orders (Giao dịch)

**4.1. Lấy giỏ hàng session (Redis)**
- **Endpoint:** `GET /api/v1/cart`
- **Role:** CUSTOMER
- **Note:** Redis track giỏ hàng theo UserID. 

**4.2. Thêm vào giỏ hàng**
- **Endpoint:** `POST /api/v1/cart/items`
- **Role:** CUSTOMER
- **Payload:** `{"productId": "uuid", "quantity": 1}`

**4.3. Tạo đơn hàng (Checkout)**
- **Endpoint:** `POST /api/v1/orders`
- **Role:** CUSTOMER
- **Request Body:**
  ```json
  {
    "addressId": "uuid",
    "paymentMethod": "VNPAY",
    "notes": "Giao giờ hành chính"
  }
  ```
- **Response:** Trả về mã Order và đường link PaymentGatewayUrl để Frontend chuyến hướng.

## 5. Module Payment

**5.1. Generate VNPay Payment URL**
- **Endpoint:** `POST /api/v1/payments/vnpay/create-url`
- **Role:** CUSTOMER

**5.2. Callback / Webhook xử lý sau thanh toán**
- **Endpoint:** `GET /api/v1/payments/vnpay/callback`
- **Role:** PUBLIC
- **Note:** Endpoint để backend nhận verify checksum từ mạng lưới VNPay và update Status đơn hàng thành `PAID`.

---

## 6. AI Assistant Module

**6.1. Gửi lệnh tư vấn sản phẩm**
- **Endpoint:** `POST /api/v1/ai/chat`
- **Role:** CUSTOMER / PUBLIC
- **Request Body:** 
  ```json
  {
    "message": "Tôi đang cần tìm một chiếc điện thoại chơi game tốt, ngân sách dưới 15 triệu, RAM từ 8GB."
  }
  ```
- **Response:** Trả về Text markdown được Gemini AI tổng hợp dựa trên data nội bộ sản phẩm TechHub.

## Tiêu chuẩn Trả về Lỗi (Error Handling)
Hệ thống bắn Global Exception và bọc lại theo cấu trúc:
```json
{
  "status": "error",
  "errorCode": "PRODUCT_NOT_FOUND",
  "message": "Không tìm thấy sản phẩm có id: 123",
  "timestamp": "2026-04-05T00:00:00.000Z"
}
```
Lỗi Authentication: 401 Unauthorized, Lỗi Forbidden: 403 Forbidden, Lỗi validation: 400 Bad Request.

# Tài liệu Đặc tả Yêu cầu API (S-Life API Requirements)

Tài liệu này đặc tả chi tiết toàn bộ các RESTful API endpoints sử dụng trong hệ thống S-Life. Dự án áp dụng chuẩn REST API, payload và response kiểu JSON. Các endpoint yêu cầu phân quyền được bảo mật bởi Bearer JWT Token.

## Phân Quyền (Roles)
- **PUBLIC**: Mọi người đều có thể truy cập (Không cần Token).
- **CUSTOMER (ROLE_USER)**: Khách hàng đã đăng nhập.
- **ADMIN (ROLE_ADMIN)**: Quản trị viên hệ thống.

---

## 1. Module Xác thực & Tài khoản (Authentication & User Profile)

**1.1. Đăng ký (User Registration)**
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

**1.2. Đăng nhập (User Login)**
- **Endpoint:** `POST /api/v1/auth/login`
- **Role:** PUBLIC
- **Request Body:**
  ```json
  {
    "email": "customer@example.com",
    "password": "SecurePassword123!"
  }
  ```

**1.3. Lấy thông tin cá nhân (Get My Profile)**
- **Endpoint:** `GET /api/v1/users/me`
- **Role:** CUSTOMER / ADMIN
- **Response:** Thông tin User, avatar, danh sách địa chỉ giao hàng.

---

## 2. Module Sản phẩm & Phân loại (Products & Catalog)

**2.1. Lấy danh sách sản phẩm (Pagination & Filters)**
- **Endpoint:** `GET /api/v1/products`
- **Role:** PUBLIC
- **QueryParams:** `page`, `size`, `categoryId`, `brandId`, `minPrice`, `maxPrice`, `sortBy`.

**2.2. Lấy chi tiết sản phẩm theo URL tĩnh (Slug)**
- **Endpoint:** `GET /api/v1/products/{slug}`
- **Role:** PUBLIC

**2.3. Lấy danh mục & Thương hiệu**
- **Endpoint:** `GET /api/v1/categories` | `GET /api/v1/brands`
- **Role:** PUBLIC

---

## 3. Module Quản trị viên (Admin)

**3.1. Quản lý Sản phẩm, Danh mục, Thương hiệu**
- **Endpoints:** `POST`, `PUT`, `DELETE` tại `/api/v1/admin/products`, `/categories`, `/brands`
- **Role:** ADMIN

**3.2. Cập nhật trạng thái đơn hàng (Order Status Management)**
- **Endpoint:** `PUT /api/v1/admin/orders/{id}/status`
- **Role:** ADMIN
- **Payload:** `{"status": "PROCESSING"}` (Tuân thủ transition hợp lệ từ Backend).

---

## 4. Module Giỏ hàng & Giao dịch (Cart & Orders)

**4.1. Lấy giỏ hàng (Redis Session)**
- **Endpoint:** `GET /api/v1/cart`
- **Role:** CUSTOMER

**4.2. Thêm vào giỏ hàng**
- **Endpoint:** `POST /api/v1/cart/items`
- **Role:** CUSTOMER
- **Payload:** `{"productId": "uuid", "quantity": 1}`

**4.3. Đặt hàng (Checkout)**
- **Endpoint:** `POST /api/v1/orders/checkout`
- **Role:** CUSTOMER
- **Request Body:**
  ```json
  {
    "addressId": "uuid",
    "paymentMethod": "VNPAY",
    "voucherCode": "GIAM50K",
    "notes": "Giao giờ hành chính",
    "selectedItemIds": ["uuid1", "uuid2"]
  }
  ```

---

## 5. Module Thanh toán Điện tử (Payment - VNPay)

**5.1. Tạo URL Thanh toán VNPay Sandbox**
- **Endpoint:** `GET /api/v1/payments/vnpay-create`
- **Role:** CUSTOMER
- **QueryParams:** `amount=32000000`, `orderId=uuid`
- **Response:** Trả về chuỗi URL thanh toán bảo mật HMAC-SHA512 để Frontend thực hiện Redirect.

**5.2. Callback xử lý sau thanh toán (IPN / Return URL)**
- **Endpoint:** `GET /api/v1/payments/vnpay-callback`
- **Role:** PUBLIC
- **Nghiệp vụ:** VNPay sẽ gọi (redirect) về API này kèm các tham số. Backend xác minh chữ ký (Checksum), nếu hợp lệ sẽ cập nhật đơn hàng thành `PROCESSING` và trả về `HTTP 302 Redirect` chuyển người dùng về thẳng Frontend (`/orders?payment=success`).

---

## 6. Module Trợ lý Trí tuệ Nhân tạo (AI Chatbot)

**6.1. Nhắn tin tư vấn sản phẩm**
- **Endpoint:** `POST /api/v1/ai/chat`
- **Role:** CUSTOMER (Bắt buộc đăng nhập để chặn lạm dụng).
- **Request Body:** `{"message": "Tư vấn giúp tôi đồng hồ thể thao dưới 5 triệu"}`
- **Response:** Trả về câu trả lời được tích hợp từ Gemini 2.5 Flash kết hợp dữ liệu sản phẩm S-Life.

---

## Tiêu chuẩn Trả về Lỗi (Error Handling)
Hệ thống sử dụng `@RestControllerAdvice` để bọc lỗi theo cấu trúc đồng nhất:
```json
{
  "status": "error",
  "errorCode": "PRODUCT_NOT_FOUND",
  "message": "Không tìm thấy sản phẩm có id: 123",
  "timestamp": "2026-06-15T00:00:00.000Z"
}
```

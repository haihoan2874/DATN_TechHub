# 📚 TÀI LIỆU API - S-Life Health Ecosystem

**Phiên bản**: 1.0  
**Ngày cập nhật**: 15 tháng 4 năm 2026  
**Base URL**: `http://localhost:8089/api/v1`

---

## 📋 Mục Lục

1. [Xác Thực (Authentication)](#xác-thực)
2. [Sản Phẩm & Danh Mục](#sản-phẩm--danh-mục)
3. [Giỏ Hàng & Đơn Hàng](#giỏ-hàng--đơn-hàng)
4. [Trợ Lý AI S-Life](#trợ-lý-ai)
5. [Quản Trị (Admin)](#quản-trị)

---

## 🔐 Xác Thực

### 1. Đăng Ký
`POST /auth/register` (Công khai)

### 2. Đăng Nhập
`POST /auth/login` (Công khai) -> Trả về JWT Token.

---

## 🛍️ Sản Phẩm & Danh Mục

### 1. Danh Sách Sản Phẩm
`GET /products` (Công khai)
- Hỗ trợ phân trang: `page`, `size`
- Hỗ trợ lọc: `category`, `brand`, `search` (Tìm kiếm thiết bị)

### 2. Danh Sách Danh Mục
`GET /categories` (Công khai)
- Trả về: Smartwatch, Fitness Band, Health Monitor, Accessories.

---

## 🤖 Trợ Lý AI S-Life

### 1. Tư Vấn Sức Khỏe & Thiết Bị
`POST /ai/consult` (Yêu cầu Token)
- Payload: `{ "question": "..." }`
- Logic: Tích hợp Google Gemini 1.5 Flash để đưa ra lời khuyên thiết bị dựa trên nhu cầu vận động.

---

## ⚙️ Hệ Thống (System)

### 1. Nạp Dữ Liệu Crawler (Seeding)
`POST /api/v1/system/seed` (Công khai trong quá trình phát triển)
- Chức năng: Đọc file JSON từ classpath, tạo dummy users và đổ dữ liệu sản phẩm/đánh giá thực tế.



🟢 Nhóm 1: Xác thực và Tài khoản (Dành cho Guest/User)
Hình 2.5: Biểu đồ phân rã Use Case Đăng ký
Hình 2.6: Biểu đồ phân rã Use Case Đăng nhập
Hình 2.7: Biểu đồ phân rã Use Case Quên mật khẩu và xác thực OTP
🔵 Nhóm 2: Nghiệp vụ Khách hàng (Dành cho Customer)
Hình 2.8: Biểu đồ phân rã Use Case Tìm kiếm và xem sản phẩm (Gồm lọc, xem list, xem chi tiết)
Hình 2.9: Biểu đồ phân rã Use Case Tư vấn sức khỏe AI (Kết nối với Gemini API)
Hình 2.10: Biểu đồ phân rã Use Case Quản lý giỏ hàng (Thêm, sửa số lượng, xóa)
Hình 2.11: Biểu đồ phân rã Use Case Đặt hàng và Thanh toán (Luồng quan trọng nhất: Check stock, Address, VNPay/COD)
Hình 2.12: Biểu đồ phân rã Use Case Viết đánh giá sản phẩm
Hình 2.13: Biểu đồ phân rã Use Case Quản lý sổ địa chỉ cá nhân
🔴 Nhóm 3: Nghiệp vụ Quản trị (Dành cho Admin)
Hình 2.14: Biểu đồ phân rã Use Case Quản lý sản phẩm và Tồn kho (CRUD sản phẩm + update stock)
Hình 2.15: Biểu đồ phân rã Use Case Xử lý đơn hàng (Xem, duyệt, cập nhật trạng thái vận chuyển)
Hình 2.16: Biểu đồ phân rã Use Case Quản lý người dùng
Hình 2.17: Biểu đồ phân rã Use Case Thống kê và Báo cáo doanh thu

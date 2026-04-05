# Kế hoạch Thực hiện Dự án Đồ án Tốt nghiệp: TechHub

Báo cáo phân tích và đánh giá tính khả dụng của source code hiện tại (SecureShop) cho dự án TechHub, cùng kế hoạch phát triển hoàn thiện đồ án.

## 1. Đánh Giá Khả Năng Tận Dụng (Hiện Trạng)
Dựa trên source code Spring Boot backend hiện tại, bạn **HOÀN TOÀN CÓ THỂ** tận dụng làm nền tảng (Base) cho ứng dụng TechHub. Các components sau đã sẵn sàng:
- **Architecture**: Cấu trúc MVC Spring Boot thiết kế chuẩn.
- **Authentication**: Đăng ký, đăng nhập (`LoginController`, `RegistrationController`), mô hình User & Roles.
- **Product & Category**: Các entity và REST API để duyệt danh mục, sản phẩm cơ bản.
- **Order & Address**: Tạo đơn hàng, lưu địa chỉ giao hàng.
- **Rating/Review**: Chức năng đánh giá của người dùng.

## 2. Các Tính Năng Cần Phát Triển Thêm (Gap Analysis)
- **Backend**: Thêm `Brand`, `Inventory`, cập nhật `Product` specs bằng JSONB, giỏ hàng Redis, thanh toán VNPay, OAuth2, và Google Gemini API Chatbot.
- **Frontend**: Thư mục `frontend/` hiện đang trống, cần build toàn bộ bằng React/Vite cho cả trang Admin và trang Khách hàng.

## 3. Kế Hoạch 5 Giai Đoạn (Chi tiết vui lòng xem trong Implementation Plan Artifact)
- **Phase 1**: Chuẩn bị & Mở rộng Core Database (Thêm Brand, Inventory, Specs).
- **Phase 2**: Xử lý Business E-commerce (Redis Cart, Discount, VNPay).
- **Phase 3**: AI Agent & Services (Tích hợp Gemini 1.5 Flash).
- **Phase 4**: Xây dựng Frontend - Admin Dashboard.
- **Phase 5**: Xây dựng Frontend - Storefront.

## ✅ Kiểm thử (Phase X)
- Lint: `npm run lint` & `mvn clean test`
- Security: Chạy scanner.
- Build & Deploy: Thành công.

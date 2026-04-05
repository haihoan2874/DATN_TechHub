# 📋 ĐẶC TẢ CHI TIẾT DỰ ÁN - TechHub (Smartphone & Phụ kiện)

## Website Bán Smartphone & Phụ Kiện Trực Tuyến
---

## 📚 MỤC LỤC

1. [Tổng Quan Dự Án](#1-tổng-quan-dự-án)
2. [Yêu Cầu Chức Năng](#2-yêu-cầu-chức-năng)
3. [Kiến Trúc Hệ Thống](#3-kiến-trúc-hệ-thống)
4. [Cấu Trúc Dữ Liệu (Database)](#4-cấu-trúc-dữ-liệu-database)
5. [API Endpoints](#5-api-endpoints)
6. [Cấu Trúc Frontend](#6-cấu-trúc-frontend)
7. [Hệ Thống Xác Thực & Bảo Mật](#7-hệ-thống-xác-thực--bảo-mật)
8. [Công Nghệ Sử Dụng](#8-công-nghệ-sử-dụng)
9. [Quy Trình Triển Khai](#9-quy-trình-triển-khai)

---

## 1. TỔNG QUAN DỰ ÁN

### 1.1 Mô Tả Dự Án

**TechHub** là nền tảng thương mại điện tử chuyên bán các sản phẩm công nghệ di động, gồm:

- 📱 **Điện thoại thông minh** (Smartphones: Apple, Samsung, Oppo, Xiaomi, Realme...)
- 💻 **Máy tính bảng** (Tablets: iPad, Galaxy Tab, Lenovo Tab...)
- ⌚ **Đồng hồ thông minh** (Smartwatches: Apple Watch, Galaxy Watch, Garmin...)
- 🎧 **Phụ kiện đi kèm** (Accessories: Tai nghe, Cáp sạc, Ốp lưng, Pin dự phòng, Cáp USB...)

Hệ thống cho phép:

- ✅ Duyệt và tìm kiếm sản phẩm công nghệ
- ✅ So sánh thông số kỹ thuật giữa các sản phẩm
- ✅ Thêm vào giỏ hàng, quản lý đơn hàng
- ✅ Thanh toán online (VNPay, Credit Card, Banking)
- ✅ Đăng ký tài khoản hoặc OAuth2 (Google/Facebook)
- ✅ Xem lịch sử mua hàng, đánh giá sản phẩm, review video
- ✅ Hỗ trợ khách hàng qua chat AI (tư vấn sản phẩm)
- ✅ Admin quản trị sản phẩm, đơn hàng, kho hàng, người dùng

### 1.2 Mục Tiêu Dự Án

- Cung cấp nền tảng bán hàng công nghệ an toàn, dễ sử dụng
- Tư vấn sản phẩm thông minh qua AI (so sánh specs, gợi ý)
- Hỗ trợ mua sắm smartphone & phụ kiện cho cá nhân và doanh nghiệp
- Tích hợp thanh toán đa kênh (VNPay, eWallet, Banking)
- Cung cấp trạng thái đơn hàng real-time
- Hỗ trợ khách hàng 24/7 qua AI Chat

### 1.3 Phạm Vi Dự Án

| Thành Phần   | Phạm Vi                                        |
| ------------ | ---------------------------------------------- |
| **Frontend** | Web responsive (desktop, tablet, mobile)       |
| **Backend**  | REST API, xử lý business logic                 |
| **Database** | PostgreSQL (Supabase)                          |
| **Session**  | Redis (giỏ hàng, cache, sessions)              |
| **AI**       | Google Gemini (tư vấn sản phẩm, so sánh specs) |
| **Deploy**   | Docker (backend, frontend, database)           |
| **Mobile**   | (Tương lai) React Native app                   |

---

## 2. YÊU CẦU CHỨC NĂNG

### 2.1 Chức Năng Khách Hàng (Customer)

#### 2.1.1 Quản Lý Tài Khoản

- **Đăng ký tài khoản**: Email + mật khẩu hoặc OAuth2 (Google/Facebook)
- **Xác minh email**: Gửi link xác minh, tự động expire sau 24h
- **Đăng nhập**: Email/mật khẩu, OAuth2
- **Quên mật khẩu**: Reset via email link (hết hạn sau 1h)
- **Cập nhật hồ sơ**: Tên, số điện thoại, avatar
- **Xem thông tin cá nhân**: Email, điện thoại, địa chỉ, lịch sử mua
- **Đăng xuất**: Xóa token, session

#### 2.1.2 Duyệt & Tìm Kiếm Sản Phẩm

- **Xem danh sách sản phẩm** với phân trang
- **Lọc theo**: Danh mục (Smartphone, Tablet, Watch, Accessories), thương hiệu, giá tiền, đánh giá
- **Sắp xếp theo**: Mới nhất, giá cao/thấp, bán chạy, đánh giá cao
- **Tìm kiếm**: Từ khóa sản phẩm (tên, mô tả)
- **So sánh sản phẩm**: So sánh specs 2-3 sản phẩm cùng lúc
- **Xem chi tiết sản phẩm**: Specs, hình ảnh, giá, đánh giá, review video
- **Lưu sản phẩm yêu thích**: Wishlist

#### 2.1.3 Quản Lý Giỏ Hàng

- **Thêm/xóa sản phẩm**: Từ chi tiết hoặc danh sách
- **Cập nhật số lượng**: Tăng/giảm trong giỏ
- **Lưu giỏ hàng**: Trên Redis (session-based)
- **Xem tổng tiền**: Sub-total, discount, shipping, grand total
- **Áp dụng mã giảm giá**: Kiểm tra và cập nhật giá
- **Xóa giỏ hàng**: Sau khi thanh toán hoặc hủy

#### 2.1.4 Đặt Hàng & Thanh Toán

- **Tạo đơn hàng**: Từ giỏ hàng
- **Chọn địa chỉ giao hàng**: Từ danh sách hoặc tạo mới
- **Chọn phương thức thanh toán**: VNPay, Credit Card, Banking, COD
- **Xác nhận đơn hàng**: Review trước khi thanh toán
- **Nhận xác nhận**: Email + SMS + In hóa đơn
- **Tra cứu đơn hàng**: Số order, ngày, trạng thái, tổng tiền

#### 2.1.5 Xem Lịch Sử Mua Hàng

- **Danh sách đơn hàng**: Tất cả, chưa giao, đã giao, bị hủy
- **Chi tiết đơn hàng**: Sản phẩm, giá, discount, shipping, warranty info
- **Xem trạng thái vận chuyển**: Real-time tracking từ nhà vận chuyển
- **In hóa đơn**: PDF format
- **Hủy đơn hàng**: Nếu chưa xác nhận
- **Yêu cầu trả hàng**: Trong 30 ngày (nếu bảo hành)

#### 2.1.6 Đánh Giá & Nhận Xét

- **Viết đánh giá**: Sau khi nhận hàng (1-5 sao)
- **Thêm ảnh/video**: Ghi chép review sản phẩm
- **Chỉnh sửa đánh giá**: Nếu chưa bị xóa
- **Xóa đánh giá**: Của chính mình
- **Xem đánh giá khác**: Danh sách chi tiết

#### 2.1.7 Quản Lý Địa Chỉ

- **Thêm địa chỉ**: Tên, địa chỉ đầy đủ, SĐT
- **Chỉnh sửa địa chỉ**: Cập nhật thông tin
- **Xóa địa chỉ**: Loại bỏ khỏi danh sách
- **Đặt địa chỉ mặc định**: Cho giao hàng
- **Danh sách địa chỉ**: Tất cả địa chỉ đã lưu

#### 2.1.8 AI Tư Vấn & Hỗ Trợ

- **Chat với AI**: Hỏi về sản phẩm, so sánh specs, gợi ý
- **AI giúp chọn sản phẩm**: "Tôi cần smartphone < 10 triệu, dùng chơi game"
- **Xem lịch sử chat**: Lưu trữ cuộc trò chuyện
- **Tạo ticket hỗ trợ**: Cho vấn đề phức tạp
- **Upload file**: Ảnh, video chứng minh vấn đề

### 2.2 Chức Năng Admin

#### 2.2.1 Quản Lý Sản Phẩm

- **Thêm sản phẩm**: Tên, specs, giá, danh mục, thương hiệu, hình ảnh, video
- **Chỉnh sửa sản phẩm**: Cập nhật mọi thông tin
- **Xóa sản phẩm**: Soft delete
- **Danh sách sản phẩm**: Phân trang, lọc, tìm kiếm
- **Import sản phẩm**: CSV/Excel
- **Export sản phẩm**: CSV/Excel
- **Kích hoạt/vô hiệu hóa**: Sản phẩm

#### 2.2.2 Quản Lý Danh Mục & Thương Hiệu

- **Danh mục chính**: Smartphones, Tablets, Smartwatches, Accessories
- **Danh mục phụ**: iPhone, Samsung, iPad, Apple Watch, Earbuds, Chargers...
- **Thương hiệu**: Apple, Samsung, Oppo, Xiaomi, Realme, Garmin, JBL...

#### 2.2.3 Quản Lý Kho Hàng (Inventory)

- **Xem tồn kho**: Số lượng sẵn có, đặt trước, mức tối thiểu
- **Cập nhật tồn kho**: Thêm hàng, điều chỉnh
- **Cảnh báo tồn kho thấp**: Tự động thông báo
- **Lịch sử nhập hàng**: Ngày, số lượng, giá

#### 2.2.4 Quản Lý Đơn Hàng

- **Danh sách đơn hàng**: Tất cả trạng thái
- **Xem chi tiết đơn hàng**: Khách hàng, sản phẩm, tổng tiền
- **Cập nhật trạng thái**: PENDING → CONFIRMED → IN_PACKING → WAITING_SHIPPING → IN_TRANSIT → DELIVERED
- **Hủy đơn hàng**: Nếu chưa giao
- **In hóa đơn/label**: PDF
- **Export danh sách**: CSV/Excel

#### 2.2.5 Quản Lý Vận Chuyển

- **Chọn nhà vận chuyển**: GHN, GHTK, Viettel Post, J&T...
- **Tạo đơn vận chuyển**: Tự động lấy tracking number
- **Cập nhật tracking**: Real-time từ nhà vận chuyển
- **Quản lý chi phí shipping**: Tính phí theo khoảng cách/weight

#### 2.2.6 Quản Lý Thanh Toán

- **Danh sách thanh toán**: Tất cả giao dịch
- **Chi tiết thanh toán**: Đơn hàng, số tiền, phương thức, thời gian
- **Trạng thái thanh toán**: Pending, Success, Failed, Refunded
- **Xác nhận thanh toán thủ công**: Cho COD
- **Hoàn tiền**: Xử lý yêu cầu refund
- **Báo cáo doanh thu**: Ngày/tháng/năm

#### 2.2.7 Quản Lý Người Dùng

- **Danh sách người dùng**: Tất cả khách hàng
- **Chi tiết người dùng**: Email, tên, SĐT, lịch sử mua
- **Kích hoạt/vô hiệu hóa**: Tài khoản
- **Phân quyền**: Nâng/hạ quyền admin

#### 2.2.8 Quản Lý Mã Giảm Giá

- **Thêm discount**: Code, %, VNĐ, điều kiện
- **Chỉnh sửa discount**: Cập nhật thông tin
- **Xóa discount**: Vô hiệu hóa mã
- **Danh sách discount**: Hoạt động, hết hạn
- **Theo dõi sử dụng**: Số lần dùng, tổng tiết kiệm
- **Hạn sử dụng**: Ngày bắt đầu, ngày kết thúc

#### 2.2.9 Báo Cáo & Thống Kê

- **Thống kê bán hàng**: Doanh thu, số đơn, khách hàng mới
- **Sản phẩm bán chạy**: Top 10 sản phẩm
- **Danh mục phổ biến**: Smartphone > Tablet > Watch > Accessories
- **Phương thức thanh toán**: So sánh VNPay vs CC vs Banking
- **Export báo cáo**: PDF, Excel

---

## 3. KIẾN TRÚC HỆ THỐNG

### 3.1 Kiến Trúc Tổng Thể

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (Vite React)                        │
│  (localhost:5173)                                               │
│  - Product Listing, Comparison                                  │
│  - Shopping Cart                                                │
│  - Checkout & Payment                                           │
│  - User Dashboard                                               │
│  - Admin Panel, Inventory                                       │
│  - AI Chatbot (Product Advisory)                                │
└────────────────┬────────────────────────────────────────────────┘
                 │ HTTP REST API
                 ↓
┌─────────────────────────────────────────────────────────────────┐
│               Backend (Spring Boot 3.5.6)                       │
│  (localhost:12345)                                              │
│  - REST API Controllers                                         │
│  - Business Logic (Services)                                    │
│  - AI Product Advisory (Gemini)                                 │
│  - Inventory Management                                         │
│  - Payment Processing (VNPay)                                   │
│  - Email Service                                                │
└────────────┬────────────────┬─────────────────┬─────────────────┘
             │                │                 │
             ↓                ↓                 ↓
        ┌─────────┐    ┌──────────┐    ┌───────────────┐
        │PostgreSQL   │  Redis    │    │Gemini API    │
        │(Supabase)   │(Session)  │    │(1.5 Flash)   │
        └─────────┘    └──────────┘    └───────────────┘
```

---

Tài liệu này được tạo dựa theo mô hình **TechHub** - nền tảng thương mại điện tử bán smartphone & phụ kiện. Cấu trúc y hệt **SecureShop** nhưng tập trung vào domain công nghệ di động.

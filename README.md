# S-LIFE - Smart Health Commerce

S-LIFE là nền tảng thương mại điện tử tập trung vào thiết bị sức khỏe thông minh: smartwatch, vòng theo dõi sức khỏe, tai nghe Bluetooth và phụ kiện chính hãng.

## Cấu trúc dự án

Dự án được chia thành hai phần chính:

### 1. [Backend (Spring Boot)](./backend/java-mastery)
- **Công nghệ**: Java 21, Spring Boot 3.x, PostgreSQL, Spring Security JWT.
- **Tính năng**: Xác thực, quản lý catalog, giỏ hàng, đặt hàng, mã giảm giá, đánh giá sản phẩm và quản trị vận hành.
- **Cổng chạy**: `8089`

### 2. [Frontend (React)](./frontend)
- **Công nghệ**: ReactJS, Vite, Framer Motion, TailwindCSS.
- **Phong cách**: Gọn, sáng, tập trung vào trải nghiệm mua hàng và khả năng quét thông tin nhanh.
- **Tính năng**: Trang chủ, cửa hàng, chi tiết sản phẩm, giỏ hàng, thanh toán, lịch sử đơn hàng và dashboard quản trị.
- **Cổng chạy**: `5173`

## Khởi chạy nhanh

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

## Dữ liệu vận hành
Schema được quản lý bằng Flyway. Dữ liệu catalog và dữ liệu vận hành local được import riêng để không trộn dữ liệu khởi tạo vào migration schema.

---
**S-Life** - Nâng tầm sức khỏe, làm chủ công nghệ.

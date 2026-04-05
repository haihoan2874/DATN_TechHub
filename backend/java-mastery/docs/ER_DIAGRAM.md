# TechHub Entity-Relationship Diagram (ERD)

Sơ đồ thể hiện hệ thống quan hệ thực thể (ER Model) của dự án.
Dự án áp dụng chặt chẽ các quy chuẩn về toàn vẹn dữ liệu: 1-N (One to Many) và M-N (Many to Many - được cắt bằng bảng trung gian).

## Sơ Đồ Mermaid

```mermaid
erDiagram
    USERS ||--o{ ORDERS : "1 user có nhiều orders"
    USERS ||--o{ REVIEWS : "1 user đánh giá nhiều"
    USERS ||--o{ CUSTOMER_ADDRESSES : "1 user có nhiều địa chỉ nhận hàng"

    ROLES ||--o{ USERS : "1 role gán cho nhiều users"

    CATEGORIES ||--o{ PRODUCTS : "1 danh mục phân loại nhiều sp"
    BRANDS ||--o{ PRODUCTS : "1 thương hiệu sở hữu nhiều sp"

    PRODUCTS ||--|| INVENTORY : "Quan hệ 1-1"
    PRODUCTS ||--o{ ORDER_ITEMS : "1 sản phẩm nằm trong nhiều hóa đơn"
    PRODUCTS ||--o{ REVIEWS : "1 sản phẩm có nhiều reviews"

    ORDERS ||--o{ ORDER_ITEMS : "1 order có nhiều order_items (chi tiết)"

    USERS {
        UUID id PK
        VARCHAR email UK
        VARCHAR password_hash
        UUID role_id  FK
    }

    ROLES {
        UUID id PK
        VARCHAR name
    }

    CATEGORIES {
        UUID id PK
        VARCHAR name
        VARCHAR slug UK
    }

    BRANDS {
        UUID id PK
        VARCHAR name
        VARCHAR slug UK
        VARCHAR logo_url
    }

    PRODUCTS {
        UUID id PK
        UUID category_id  FK
        UUID brand_id  FK
        VARCHAR name
        VARCHAR slug UK
        JSONB specs "Technical Specifications"
        JSONB video_urls "Danh sách Video"
        DECIMAL price
        BOOLEAN is_active
    }

    INVENTORY {
        UUID id PK
        UUID product_id  FK "Unique"
        INTEGER quantity_available
        INTEGER quantity_reserved
    }

    ORDERS {
        UUID id PK
        UUID user_id  FK
        VARCHAR order_code UK "Mã ORD-..."
        DECIMAL total_amount
        VARCHAR status "PENDING, SHIPPED..."
        VARCHAR payment_method
        VARCHAR payment_status
    }

    ORDER_ITEMS {
        UUID id PK
        UUID order_id  FK
        UUID product_id  FK
        INTEGER quantity
        DECIMAL price_at_buy "Giá chốt"
    }

    REVIEWS {
        UUID id PK
        UUID product_id  FK
        UUID user_id  FK
        INTEGER rating "1 - 5 Sao"
        TEXT comment
    }
```

## Chú Thích Nghiệp vụ Quan Trọng
1. **Products - Inventory (1:1)**: Tách riêng bảng quản lý tồn kho để ngăn chặn Deadlocks (Xung đột khóa) khi có hàng ngàn user cùng update số lượng sản phẩm mua trong các sự kiện Flash Sale. Tồn kho được lock an toàn trên row trong `inventory`.
2. **Products - Order Items (1:N)**: Cột `price_at_buy` được snapshot tĩnh tại thời điểm khách hàng click thanh toán. Khi Product tăng hay giảm giá ở tương lai, không được phép ảnh hưởng vào tổng tiền của Hoá đơn đã được tạo trong lịch sử.
3. **Database Consistency**: Constraints (Unique, Nullable) đều được áp đặt ở tầng Database, giúp dữ liệu luôn an toàn ngay cả khi Application có bug thoát qua Java validation.
-- =====================================================
-- V13: Chuẩn hóa bảng products và order_items
--      để hỗ trợ quản lý giá vốn và tính lợi nhuận
-- =====================================================

-- 1. Xóa cột stock_quantity khỏi products
--    (Số lượng đã được quản lý chuyên biệt bởi bảng inventory)
UPDATE inventory i
SET quantity_available = p.stock_quantity,
    last_restock_date = COALESCE(i.last_restock_date, p.updated_at, p.created_at, NOW())
FROM products p
WHERE i.product_id = p.id
  AND p.stock_quantity IS NOT NULL
  AND COALESCE(i.quantity_available, 0) = 0;

ALTER TABLE products DROP COLUMN IF EXISTS stock_quantity;
ALTER TABLE products DROP CONSTRAINT IF EXISTS chk_products_stock;

-- 2. Thêm cột cost_price vào products
--    (Giá vốn hiện tại - được cập nhật mỗi khi có phiếu nhập kho mới)
ALTER TABLE products ADD COLUMN cost_price NUMERIC(10, 2);
ALTER TABLE products ADD CONSTRAINT chk_products_cost_price CHECK (cost_price IS NULL OR cost_price >= 0);

-- 3. Thêm cột cost_price vào order_items
--    (Snapshot giá vốn tại thời điểm khách đặt hàng - KHÔNG thay đổi theo thời gian)
--    Công thức: Lãi gộp = (price - cost_price) * quantity
ALTER TABLE order_items ADD COLUMN cost_price NUMERIC(10, 2);
ALTER TABLE order_items ADD CONSTRAINT chk_order_items_cost_price CHECK (cost_price IS NULL OR cost_price >= 0);

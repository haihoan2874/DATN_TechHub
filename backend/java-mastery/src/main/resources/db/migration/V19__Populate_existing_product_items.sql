-- =====================================================
-- V19: Tự động sinh dữ liệu IMEI (product_items) bù cho các Lô nhập kho cũ
--      Đảm bảo 100% lô hàng cũ trong CSDL đều có đầy đủ mã serial để bảo vệ đồ án
-- =====================================================

INSERT INTO product_items (id, product_id, stock_import_id, serial_number, status, created_at)
SELECT 
    gen_random_uuid(),
    si.product_id,
    si.id,
    'IMEI-' || COALESCE(UPPER(SUBSTRING(REPLACE(p.name, ' ', ''), 1, 8)), 'TECH') || '-' || SUBSTRING(REPLACE(si.id::text, '-', '') FROM 1 FOR 6) || '-' || LPAD(gs.i::text, 3, '0'),
    'AVAILABLE',
    si.imported_at
FROM stock_imports si
JOIN products p ON p.id = si.product_id
CROSS JOIN LATERAL generate_series(1, si.quantity) AS gs(i)
WHERE NOT EXISTS (
    SELECT 1 FROM product_items pi WHERE pi.stock_import_id = si.id
);

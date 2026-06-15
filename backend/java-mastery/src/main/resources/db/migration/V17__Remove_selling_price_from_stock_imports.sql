-- V17: Bỏ cột selling_price khỏi bảng stock_imports
-- Giá bán chỉ được quản lý tại bảng products.price
ALTER TABLE stock_imports DROP COLUMN IF EXISTS selling_price;

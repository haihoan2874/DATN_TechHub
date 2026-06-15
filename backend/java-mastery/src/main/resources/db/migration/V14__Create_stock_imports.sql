-- =====================================================
-- V14: Tạo bảng stock_imports (Lịch sử nhập kho)
--      Ghi lại mọi lần Admin nhập hàng về kho
-- =====================================================

CREATE TABLE stock_imports (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Sản phẩm nào được nhập về
    product_id    UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,

    -- Số lượng nhập trong lô này
    quantity      INTEGER NOT NULL,

    -- Giá nhập của lô hàng này (VD: 15.000.000đ/cái)
    import_price  NUMERIC(10, 2) NOT NULL,

    -- Giá bán đề xuất sau khi nhập lô này (VD: 20.000.000đ/cái)
    -- Khi lưu, hệ thống có thể tự cập nhật products.price = selling_price
    selling_price NUMERIC(10, 2) NOT NULL,

    -- Ghi chú (VD: "Nhập từ nhà phân phối A", "Hàng mới 2024")
    note          TEXT,

    -- Ngày nhập hàng thực tế (Admin tự nhập, có thể khác ngày tạo record)
    imported_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Audit
    created_by    UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Ràng buộc
    CONSTRAINT chk_stock_imports_quantity      CHECK (quantity > 0),
    CONSTRAINT chk_stock_imports_import_price  CHECK (import_price >= 0),
    CONSTRAINT chk_stock_imports_selling_price CHECK (selling_price >= 0)
);

-- Index để query nhanh lịch sử nhập theo sản phẩm và ngày
CREATE INDEX idx_stock_imports_product    ON stock_imports(product_id);
CREATE INDEX idx_stock_imports_imported_at ON stock_imports(imported_at DESC);
CREATE INDEX idx_stock_imports_created_by  ON stock_imports(created_by);

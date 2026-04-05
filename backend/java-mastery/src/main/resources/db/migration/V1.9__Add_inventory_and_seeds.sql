-- V1.9__Add_inventory_and_seeds.sql
-- Create Inventory table and seed initial data for TechHub

-- 1. Create INVENTORY table
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID UNIQUE NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity_available INTEGER NOT NULL DEFAULT 0,
    quantity_reserved INTEGER NOT NULL DEFAULT 0,
    min_stock_level INTEGER NOT NULL DEFAULT 10,
    last_restock_date TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory(product_id);

-- 2. Initial Brand Seeds
INSERT INTO brands (name, slug) VALUES ('Apple', 'apple') ON CONFLICT DO NOTHING;
INSERT INTO brands (name, slug) VALUES ('Samsung', 'samsung') ON CONFLICT DO NOTHING;
INSERT INTO brands (name, slug) VALUES ('Xiaomi', 'xiaomi') ON CONFLICT DO NOTHING;
INSERT INTO brands (name, slug) VALUES ('Oppo', 'oppo') ON CONFLICT DO NOTHING;
INSERT INTO brands (name, slug) VALUES ('Sony', 'sony') ON CONFLICT DO NOTHING;

-- 3. Initial Category Seeds
INSERT INTO categories (name, description, icon) VALUES ('Smartphone', 'Latest smartphones and accessories', 'phone') ON CONFLICT DO NOTHING;
INSERT INTO categories (name, description, icon) VALUES ('Tablet', 'Powerful tablets for work and play', 'tablet') ON CONFLICT DO NOTHING;
INSERT INTO categories (name, description, icon) VALUES ('Accessories', 'Cases, chargers, and more', 'bolt') ON CONFLICT DO NOTHING;

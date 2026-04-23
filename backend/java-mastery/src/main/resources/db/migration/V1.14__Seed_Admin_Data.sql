-- V1.14__Seed_Admin_Data.sql
-- Seed initial admin user and sample data for testing

-- 1. Insert Admin User (password: admin123)
-- BCrypt: $2a$10$8.UnVuG9HHgffUDAlk8qn.e/vPsYpx0.9Uvy5k5V.WfUnP3G1X.T.
INSERT INTO users (username, email, password, first_name, last_name, role)
VALUES ('admin', 'admin@slife.com', '$2a$10$8.UnVuG9HHgffUDAlk8qn.e/vPsYpx0.9Uvy5k5V.WfUnP3G1X.T.', 'S-Life', 'Admin', 'ROLE_ADMIN')
ON CONFLICT (username) DO NOTHING;

-- 2. Insert Sample Products (linking to existing Brands and Categories)
-- Apple Brand and Smartphone Category should exist from V1.9
DO $$
DECLARE
    brand_apple_id UUID;
    cat_phone_id UUID;
    prod_iphone_id UUID;
BEGIN
    SELECT id INTO brand_apple_id FROM brands WHERE slug = 'apple' LIMIT 1;
    SELECT id INTO cat_phone_id FROM categories WHERE name = 'Smartphone' LIMIT 1;

    IF brand_apple_id IS NOT NULL AND cat_phone_id IS NOT NULL THEN
        -- Insert iPhone 15 Pro
        INSERT INTO products (name, slug, description, price, brand_id, category_id, stock_quantity)
        VALUES ('iPhone 15 Pro', 'iphone-15-pro', 'Titanium design, A17 Pro chip', 1099.00, brand_apple_id, cat_phone_id, 50)
        ON CONFLICT (slug) DO UPDATE SET price = 1099.00, stock_quantity = 50
        RETURNING id INTO prod_iphone_id;

        -- Add Inventory if doesn't exist
        INSERT INTO inventory (product_id, quantity_available, min_stock_level)
        VALUES (prod_iphone_id, 50, 5)
        ON CONFLICT (product_id) DO UPDATE SET quantity_available = 50;
    END IF;
END $$;

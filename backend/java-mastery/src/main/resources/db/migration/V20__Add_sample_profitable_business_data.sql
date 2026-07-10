-- V20__Add_sample_profitable_business_data.sql
-- 1. Clean up any previously inserted sample data from test runs of this script
DELETE FROM product_items WHERE serial_number LIKE 'SL-2026-Q3-%' OR stock_import_id IN (SELECT id FROM stock_imports WHERE note LIKE '%Lãi suất cao%');
DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE order_number LIKE 'ORD-Q3-2026-%');
DELETE FROM orders WHERE order_number LIKE 'ORD-Q3-2026-%';
DELETE FROM stock_imports WHERE note LIKE '%Lãi suất cao%';

-- 2. Create a temporary table to hold 10 active flagship products for our new stock imports
CREATE TEMP TABLE temp_import_products AS
SELECT id, name, price, ROW_NUMBER() OVER (ORDER BY price DESC) as rn
FROM products
WHERE is_active = true AND price > 5000000
LIMIT 10;

-- 3. Insert 10 profitable Stock Imports with RECENT timestamps (so they appear at the TOP of UI)
INSERT INTO stock_imports (id, product_id, quantity, import_price, note, imported_at, created_by, created_at)
SELECT 
    gen_random_uuid(),
    tp.id,
    20,
    ROUND(tp.price * 0.70, -3), -- 30% gross profit margin
    'Nhập kho bổ sung lô hàng Quý 3 (Lãi suất cao)',
    CURRENT_TIMESTAMP - ((11 - tp.rn) || ' hours')::interval,
    (SELECT id FROM users WHERE role = 'ROLE_ADMIN' LIMIT 1),
    CURRENT_TIMESTAMP - ((11 - tp.rn) || ' hours')::interval
FROM temp_import_products tp;

-- 4. Generate 20 units (IMEIs) for each of these 10 new imports (total 200 units)
DO $$
DECLARE
    imp RECORD;
    i INT;
    v_serial VARCHAR(100);
BEGIN
    FOR imp IN SELECT id, product_id, imported_at FROM stock_imports WHERE note LIKE '%Lãi suất cao%' LOOP
        FOR i IN 1..20 LOOP
            v_serial := 'SL-2026-Q3-' || SUBSTRING(imp.product_id::text, 1, 4) || '-' || LPAD(i::text, 3, '0') || '-' || LPAD(FLOOR(RANDOM() * 9000 + 1000)::text, 4, '0');
            INSERT INTO product_items (id, product_id, stock_import_id, serial_number, status, created_at)
            VALUES (
                gen_random_uuid(),
                imp.product_id,
                imp.id,
                v_serial,
                'AVAILABLE',
                imp.imported_at
            ) ON CONFLICT (serial_number) DO NOTHING;
        END LOOP;
    END LOOP;
END $$;

-- 5. Insert 15 NEW PROFITABLE ORDERS (with status DELIVERED & VNPAY) with RECENT timestamps so they appear at the TOP of UI
DO $$
DECLARE
    v_user_id UUID;
    v_address_id UUID;
    v_order_id UUID;
    p RECORD;
    i INT;
    v_order_num VARCHAR(50);
    v_time TIMESTAMP;
BEGIN
    -- Loop 15 times to create 15 delivered orders
    FOR i IN 1..15 LOOP
        -- Select a valid user and shipping address
        SELECT user_id, shipping_address INTO v_user_id, v_address_id
        FROM orders
        WHERE user_id IS NOT NULL AND shipping_address IS NOT NULL
        LIMIT 1 OFFSET (i % 5);
        
        IF v_user_id IS NOT NULL AND v_address_id IS NOT NULL THEN
            v_order_id := gen_random_uuid();
            v_order_num := 'ORD-Q3-2026-' || LPAD(i::text, 4, '0');
            v_time := CURRENT_TIMESTAMP - ((16 - i) * 2 || ' hours')::interval;
            
            -- Pick a product from our temp table
            SELECT * INTO p FROM temp_import_products WHERE rn = ((i % 10) + 1);
            
            -- Insert order
            INSERT INTO orders (id, order_number, user_id, shipping_address, status, total, discount_amount, payment_method, notes, created_at, updated_at)
            VALUES (
                v_order_id,
                v_order_num,
                v_user_id,
                v_address_id,
                'DELIVERED',
                p.price * 2,
                0.00,
                'VNPAY',
                'Đơn hàng thanh toán trực tuyến VNPAY thành công (Đã giao)',
                v_time,
                v_time
            );
            
            -- Insert order item (quantity 2)
            INSERT INTO order_items (id, order_id, product_id, product_name, quantity, price, subtotal, cost_price, created_at)
            VALUES (
                gen_random_uuid(),
                v_order_id,
                p.id,
                p.name,
                2,
                p.price,
                p.price * 2,
                ROUND(p.price * 0.70, -3),
                v_time
            );
        END IF;
    END LOOP;
END $$;

-- 6. Backfill cost_price for any order_items missing it
UPDATE order_items oi
SET cost_price = (
    SELECT si.import_price
    FROM stock_imports si
    WHERE si.product_id = oi.product_id
    ORDER BY si.imported_at DESC
    LIMIT 1
)
WHERE oi.cost_price IS NULL OR oi.cost_price = 0;

-- 7. Automate FIFO-based IMEI mapping for DELIVERED orders (SOLD) and in-transit orders (RESERVED)
DO $$
DECLARE
    item_rec RECORD;
    i INT;
    assigned_pi_id UUID;
BEGIN
    -- 7a. First assign SOLD for DELIVERED orders (Bảo hành kích hoạt khi đã nhận hàng)
    FOR item_rec IN 
        SELECT oi.id AS order_item_id, oi.order_id, oi.product_id, oi.quantity
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE o.status = 'DELIVERED'
        ORDER BY o.created_at ASC
    LOOP
        FOR i IN 1..item_rec.quantity LOOP
            SELECT id INTO assigned_pi_id
            FROM product_items
            WHERE product_id = item_rec.product_id 
              AND status = 'AVAILABLE'
            ORDER BY created_at ASC
            LIMIT 1;

            IF assigned_pi_id IS NOT NULL THEN
                UPDATE product_items
                SET status = 'SOLD',
                    order_id = item_rec.order_id
                WHERE id = assigned_pi_id;
            END IF;
        END LOOP;
    END LOOP;

    -- 7b. Next assign RESERVED for SHIPPED / PROCESSING / PENDING orders (Đang giữ / Đang đi giao)
    FOR item_rec IN 
        SELECT oi.id AS order_item_id, oi.order_id, oi.product_id, oi.quantity
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE o.status IN ('SHIPPED', 'PROCESSING', 'PENDING')
        ORDER BY o.created_at ASC
    LOOP
        FOR i IN 1..item_rec.quantity LOOP
            SELECT id INTO assigned_pi_id
            FROM product_items
            WHERE product_id = item_rec.product_id 
              AND status = 'AVAILABLE'
            ORDER BY created_at ASC
            LIMIT 1;

            IF assigned_pi_id IS NOT NULL THEN
                UPDATE product_items
                SET status = 'RESERVED',
                    order_id = item_rec.order_id
                WHERE id = assigned_pi_id;
            END IF;
        END LOOP;
    END LOOP;
END $$;

-- 8. Synchronize inventory table so quantity_available perfectly matches actual AVAILABLE IMEIs
UPDATE inventory i
SET quantity_available = COALESCE((
    SELECT COUNT(*)
    FROM product_items pi
    WHERE pi.product_id = i.product_id AND pi.status = 'AVAILABLE'
), 0),
updated_at = CURRENT_TIMESTAMP;

DROP TABLE IF EXISTS temp_import_products;

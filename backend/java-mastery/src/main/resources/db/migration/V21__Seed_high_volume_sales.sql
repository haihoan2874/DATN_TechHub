-- V21__Seed_high_volume_sales.sql
-- Proactive Seed for High-Volume Thriving E-Commerce Business
-- Ensures every import lot has ~68% SOLD, ~18% RESERVED, and ~14% AVAILABLE so that presentations demonstrate high sales velocity.

DO $$
DECLARE
    imp RECORD;
    v_user_id UUID;
    v_address_id UUID;
    v_order_id UUID;
    v_order_item_id UUID;
    v_order_num VARCHAR(50);
    v_time TIMESTAMP;
    v_sold_count INT;
    v_res_count INT;
    v_avail_count INT;
    v_sold_target INT;
    v_res_target INT;
    v_needed_sold INT;
    v_needed_res INT;
    v_counter INT := 5000;
    q INT;
    r INT;
    i INT;
    q_arr INT[];
    r_arr INT[];
BEGIN
    -- 1. Get a valid user and address
    SELECT user_id, shipping_address INTO v_user_id, v_address_id
    FROM orders
    WHERE user_id IS NOT NULL AND shipping_address IS NOT NULL
    LIMIT 1;

    IF v_user_id IS NULL THEN
        SELECT id INTO v_user_id FROM users LIMIT 1;
        v_address_id := '123 Đường Cầu Giấy, Phường Dịch Vọng, Quận Cầu Giấy, Hà Nội';
    END IF;

    -- 2. Loop through every stock import batch
    FOR imp IN 
        SELECT si.id, si.product_id, p.name, COALESCE(p.price, 1000000) AS price, COALESCE(si.import_price, ROUND(COALESCE(p.price, 1000000) * 0.70, -3)) AS import_price, si.quantity
        FROM stock_imports si
        JOIN products p ON si.product_id = p.id
    LOOP
        -- Check current counts
        SELECT 
            COALESCE(SUM(CASE WHEN status = 'SOLD' THEN 1 ELSE 0 END), 0),
            COALESCE(SUM(CASE WHEN status = 'RESERVED' THEN 1 ELSE 0 END), 0),
            COALESCE(SUM(CASE WHEN status = 'AVAILABLE' THEN 1 ELSE 0 END), 0)
        INTO v_sold_count, v_res_count, v_avail_count
        FROM product_items 
        WHERE stock_import_id = imp.id;

        -- Target ratios: 68% sold, 18% reserved
        v_sold_target := ROUND(imp.quantity * 0.68)::int;
        v_res_target  := ROUND(imp.quantity * 0.18)::int;

        v_needed_sold := GREATEST(0, v_sold_target - v_sold_count);
        v_needed_res  := GREATEST(0, v_res_target - v_res_count);

        -- If not enough available items, scale down proportionally
        IF v_avail_count < (v_needed_sold + v_needed_res) THEN
            v_needed_sold := ROUND(v_avail_count * 0.75)::int;
            v_needed_res  := v_avail_count - v_needed_sold;
        END IF;

        -- 3. Process SOLD items in 3 orders per lot (to simulate wholesale/retail orders)
        IF v_needed_sold > 0 THEN
            q_arr := ARRAY[
                ROUND(v_needed_sold * 0.4)::int,
                ROUND(v_needed_sold * 0.3)::int,
                v_needed_sold - ROUND(v_needed_sold * 0.4)::int - ROUND(v_needed_sold * 0.3)::int
            ];

            FOR i IN 1..3 LOOP
                q := q_arr[i];
                IF q > 0 THEN
                    v_order_id := gen_random_uuid();
                    v_order_item_id := gen_random_uuid();
                    v_order_num := 'ORD-THESIS-S' || v_counter;
                    v_counter := v_counter + 1;
                    v_time := CURRENT_TIMESTAMP - ((v_counter % 720) || ' hours')::interval;

                    INSERT INTO orders (id, order_number, user_id, shipping_address, status, total, discount_amount, payment_method, notes, created_at, updated_at)
                    VALUES (
                        v_order_id,
                        v_order_num,
                        v_user_id,
                        v_address_id,
                        'DELIVERED',
                        imp.price * q,
                        0.00,
                        'VNPAY',
                        'Đơn hàng thanh toán trực tuyến VNPAY thành công (Đã giao)',
                        v_time,
                        v_time
                    );

                    INSERT INTO order_items (id, order_id, product_id, product_name, quantity, price, subtotal, cost_price, created_at)
                    VALUES (
                        v_order_item_id,
                        v_order_id,
                        imp.product_id,
                        imp.name,
                        q,
                        imp.price,
                        imp.price * q,
                        imp.import_price,
                        v_time
                    );

                    UPDATE product_items
                    SET status = 'SOLD',
                        order_id = v_order_id
                    WHERE id IN (
                        SELECT id FROM product_items
                        WHERE stock_import_id = imp.id AND status = 'AVAILABLE'
                        LIMIT q
                    );
                END IF;
            END LOOP;
        END IF;

        -- 4. Process RESERVED items in 2 orders per lot (in transit / processing)
        IF v_needed_res > 0 THEN
            r_arr := ARRAY[
                ROUND(v_needed_res * 0.6)::int,
                v_needed_res - ROUND(v_needed_res * 0.6)::int
            ];

            FOR i IN 1..2 LOOP
                r := r_arr[i];
                IF r > 0 THEN
                    v_order_id := gen_random_uuid();
                    v_order_item_id := gen_random_uuid();
                    v_order_num := 'ORD-THESIS-R' || v_counter;
                    v_counter := v_counter + 1;
                    v_time := CURRENT_TIMESTAMP - ((v_counter % 48) || ' hours')::interval;

                    INSERT INTO orders (id, order_number, user_id, shipping_address, status, total, discount_amount, payment_method, notes, created_at, updated_at)
                    VALUES (
                        v_order_id,
                        v_order_num,
                        v_user_id,
                        v_address_id,
                        CASE WHEN (i = 1) THEN 'SHIPPED' ELSE 'PROCESSING' END,
                        imp.price * r,
                        0.00,
                        'VNPAY',
                        'Đơn hàng đang trong quá trình giao vận / xử lý kho',
                        v_time,
                        v_time
                    );

                    INSERT INTO order_items (id, order_id, product_id, product_name, quantity, price, subtotal, cost_price, created_at)
                    VALUES (
                        v_order_item_id,
                        v_order_id,
                        imp.product_id,
                        imp.name,
                        r,
                        imp.price,
                        imp.price * r,
                        imp.import_price,
                        v_time
                    );

                    UPDATE product_items
                    SET status = 'RESERVED',
                        order_id = v_order_id
                    WHERE id IN (
                        SELECT id FROM product_items
                        WHERE stock_import_id = imp.id AND status = 'AVAILABLE'
                        LIMIT r
                    );
                END IF;
            END LOOP;
        END IF;
    END LOOP;
END $$;

-- 5. Synchronize inventory table so quantity_available perfectly matches actual AVAILABLE IMEIs
UPDATE inventory i
SET quantity_available = COALESCE((
    SELECT COUNT(*)
    FROM product_items pi
    WHERE pi.product_id = i.product_id AND pi.status = 'AVAILABLE'
), 0);

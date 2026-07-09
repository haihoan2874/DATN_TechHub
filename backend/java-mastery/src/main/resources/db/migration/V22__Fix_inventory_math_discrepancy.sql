-- V22__Fix_inventory_math_discrepancy.sql
-- Recalculates inventory.quantity_available to exactly match the formula:
-- Available = (Total Imported) - (Total Sold) - (Total In Transit)
-- This fixes any orphaned data issues caused by manual testing or dummy data scripts.

UPDATE inventory i
SET quantity_available = GREATEST(0, 
    COALESCE((
        SELECT SUM(si.quantity) 
        FROM stock_imports si 
        WHERE si.product_id = i.product_id
    ), 0)
    - COALESCE((
        SELECT SUM(oi.quantity) 
        FROM order_items oi 
        JOIN orders o ON o.id = oi.order_id 
        WHERE oi.product_id = i.product_id 
          AND o.status IN ('DELIVERED', 'PENDING', 'PROCESSING', 'SHIPPED')
    ), 0)
),
updated_at = CURRENT_TIMESTAMP;

UPDATE orders
SET status = 'PROCESSING'
WHERE status = 'CONFIRMED';

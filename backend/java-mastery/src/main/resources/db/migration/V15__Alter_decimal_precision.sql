-- V15__Alter_decimal_precision.sql
-- Increase precision from 10,2 to 15,2 to support large numbers > 100,000,000

ALTER TABLE public.products ALTER COLUMN price TYPE numeric(15, 2);
ALTER TABLE public.products ALTER COLUMN cost_price TYPE numeric(15, 2);

ALTER TABLE public.orders ALTER COLUMN total TYPE numeric(15, 2);
ALTER TABLE public.orders ALTER COLUMN discount_amount TYPE numeric(15, 2);

ALTER TABLE public.order_items ALTER COLUMN price TYPE numeric(15, 2);
ALTER TABLE public.order_items ALTER COLUMN subtotal TYPE numeric(15, 2);
ALTER TABLE public.order_items ALTER COLUMN cost_price TYPE numeric(15, 2);

ALTER TABLE public.vouchers ALTER COLUMN discount_value TYPE numeric(15, 2);
ALTER TABLE public.vouchers ALTER COLUMN min_order_amount TYPE numeric(15, 2);

ALTER TABLE public.stock_imports ALTER COLUMN import_price TYPE numeric(15, 2);
ALTER TABLE public.stock_imports ALTER COLUMN selling_price TYPE numeric(15, 2);

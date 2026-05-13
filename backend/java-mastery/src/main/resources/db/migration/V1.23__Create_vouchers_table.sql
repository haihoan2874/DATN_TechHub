CREATE TABLE IF NOT EXISTS vouchers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('AMOUNT', 'PERCENT')),
    discount_value NUMERIC(10, 2) NOT NULL CHECK (discount_value > 0),
    min_order_amount NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (min_order_amount >= 0),
    usage_limit INTEGER CHECK (usage_limit IS NULL OR usage_limit >= 0),
    used_count INTEGER NOT NULL DEFAULT 0 CHECK (used_count >= 0),
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE vouchers ADD COLUMN IF NOT EXISTS discount_type VARCHAR(20);
ALTER TABLE vouchers ADD COLUMN IF NOT EXISTS discount_value NUMERIC(10, 2);
ALTER TABLE vouchers ADD COLUMN IF NOT EXISTS min_order_amount NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE vouchers ADD COLUMN IF NOT EXISTS usage_limit INTEGER;
ALTER TABLE vouchers ADD COLUMN IF NOT EXISTS used_count INTEGER DEFAULT 0;
ALTER TABLE vouchers ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP;
ALTER TABLE vouchers ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE vouchers ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE vouchers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

UPDATE vouchers SET discount_type = 'AMOUNT' WHERE discount_type IS NULL;
UPDATE vouchers SET discount_value = 0 WHERE discount_value IS NULL;
UPDATE vouchers SET min_order_amount = 0 WHERE min_order_amount IS NULL;
UPDATE vouchers SET used_count = 0 WHERE used_count IS NULL;
UPDATE vouchers SET expires_at = CURRENT_TIMESTAMP + INTERVAL '1 year' WHERE expires_at IS NULL;
UPDATE vouchers SET is_active = TRUE WHERE is_active IS NULL;
UPDATE vouchers SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL;
UPDATE vouchers SET updated_at = CURRENT_TIMESTAMP WHERE updated_at IS NULL;

ALTER TABLE vouchers ALTER COLUMN discount_type SET NOT NULL;
ALTER TABLE vouchers ALTER COLUMN discount_value SET NOT NULL;
ALTER TABLE vouchers ALTER COLUMN min_order_amount SET NOT NULL;
ALTER TABLE vouchers ALTER COLUMN used_count SET NOT NULL;
ALTER TABLE vouchers ALTER COLUMN expires_at SET NOT NULL;
ALTER TABLE vouchers ALTER COLUMN is_active SET NOT NULL;
ALTER TABLE vouchers ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE vouchers ALTER COLUMN updated_at SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_vouchers_code ON vouchers (code);

INSERT INTO vouchers (code, discount_type, discount_value, min_order_amount, usage_limit, expires_at)
VALUES
    ('TECHHUB10', 'PERCENT', 10, 500000, 100, CURRENT_TIMESTAMP + INTERVAL '1 year'),
    ('FREESHIP50', 'AMOUNT', 50000, 300000, 100, CURRENT_TIMESTAMP + INTERVAL '1 year')
ON CONFLICT (code) DO NOTHING;

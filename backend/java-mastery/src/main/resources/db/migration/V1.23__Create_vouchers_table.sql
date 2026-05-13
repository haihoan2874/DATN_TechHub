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

CREATE INDEX IF NOT EXISTS idx_vouchers_code ON vouchers (code);

INSERT INTO vouchers (code, discount_type, discount_value, min_order_amount, usage_limit, expires_at)
VALUES
    ('TECHHUB10', 'PERCENT', 10, 500000, 100, CURRENT_TIMESTAMP + INTERVAL '1 year'),
    ('FREESHIP50', 'AMOUNT', 50000, 300000, 100, CURRENT_TIMESTAMP + INTERVAL '1 year')
ON CONFLICT (code) DO NOTHING;

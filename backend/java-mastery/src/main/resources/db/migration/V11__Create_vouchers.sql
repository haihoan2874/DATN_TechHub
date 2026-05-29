CREATE TABLE vouchers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    discount_type VARCHAR(20) NOT NULL,
    discount_value NUMERIC(10, 2) NOT NULL,
    min_order_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    usage_limit INTEGER,
    used_count INTEGER NOT NULL DEFAULT 0,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_vouchers_discount_type CHECK (discount_type IN ('AMOUNT', 'PERCENT')),
    CONSTRAINT chk_vouchers_discount_value CHECK (discount_value > 0),
    CONSTRAINT chk_vouchers_percent CHECK (discount_type <> 'PERCENT' OR discount_value <= 100),
    CONSTRAINT chk_vouchers_min_order CHECK (min_order_amount >= 0),
    CONSTRAINT chk_vouchers_usage_limit CHECK (usage_limit IS NULL OR usage_limit >= 0),
    CONSTRAINT chk_vouchers_used_count CHECK (used_count >= 0)
);

CREATE INDEX idx_vouchers_code ON vouchers(code);
CREATE INDEX idx_vouchers_active ON vouchers(is_active);
CREATE INDEX idx_vouchers_expires_at ON vouchers(expires_at);

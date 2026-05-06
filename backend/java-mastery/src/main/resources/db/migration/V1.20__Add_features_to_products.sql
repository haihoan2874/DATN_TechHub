-- V1.20__Add_features_to_products.sql
-- Add dynamic landing page features column to products table

ALTER TABLE products 
ADD COLUMN features JSONB;

COMMENT ON COLUMN products.features IS 'Modular landing page feature blocks in JSONB format';

-- Create GIN index for features to support JSONB searching if needed
CREATE INDEX IF NOT EXISTS idx_products_features ON products USING GIN (features);

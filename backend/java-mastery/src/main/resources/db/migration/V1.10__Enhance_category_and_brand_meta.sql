-- V1.10__Enhance_category_and_brand_meta.sql
-- Add slug and is_active to categories for SEO and soft delete support
-- Add description to brands to match entity

ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS slug VARCHAR(255),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Ensure existing categories have a slug (fallback to name if not set yet)
UPDATE categories SET slug = LOWER(REPLACE(name, ' ', '-')) WHERE slug IS NULL;

-- Now add unique constraint
ALTER TABLE categories ADD CONSTRAINT uk_categories_slug UNIQUE (slug);

-- Add description to brands if missing
ALTER TABLE brands ADD COLUMN IF NOT EXISTS description TEXT;

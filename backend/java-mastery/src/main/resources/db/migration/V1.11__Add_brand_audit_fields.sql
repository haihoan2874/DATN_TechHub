-- V1.12__Add_brand_audit_fields.sql
-- Add audit tracking to brands table

ALTER TABLE brands 
ADD COLUMN IF NOT EXISTS created_by UUID,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- Already exists, safe check
ADD COLUMN IF NOT EXISTS updated_by UUID;

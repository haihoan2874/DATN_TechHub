-- V1.1__Create_audit_log_table.sql
-- Create audit logging table using UUID tracking for TechHub Graduation Project

CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(255) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    changes JSONB,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID
);

-- Create indexes for audit log queries
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);

-- Add comments for documentation
COMMENT ON TABLE audit_log IS 'Audit trail for tracking all entity changes';
COMMENT ON COLUMN audit_log.entity_id IS 'The UUID of the entity being audited';
COMMENT ON COLUMN audit_log.created_by IS 'UUID of the user who made the change';

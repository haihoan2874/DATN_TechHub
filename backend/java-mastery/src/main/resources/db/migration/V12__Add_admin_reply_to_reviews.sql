ALTER TABLE reviews
    ADD COLUMN admin_reply TEXT,
    ADD COLUMN admin_replied_at TIMESTAMP,
    ADD COLUMN admin_replied_by UUID;

ALTER TABLE reviews
    ADD CONSTRAINT fk_reviews_admin_replied_by
    FOREIGN KEY (admin_replied_by) REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX idx_reviews_admin_replied_by ON reviews(admin_replied_by);

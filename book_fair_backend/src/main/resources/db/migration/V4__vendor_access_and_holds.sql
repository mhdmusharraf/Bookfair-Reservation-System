ALTER TABLE users
    ADD COLUMN IF NOT EXISTS status VARCHAR(32) NOT NULL DEFAULT 'PENDING_APPROVAL',
    ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP;

UPDATE users SET status = 'ACTIVE', approved_at = NOW() WHERE status IS NULL;

ALTER TABLE stalls
    ADD COLUMN IF NOT EXISTS held_by_user_id BIGINT,
    ADD COLUMN IF NOT EXISTS hold_expires_at TIMESTAMP,
    ADD CONSTRAINT fk_stalls_held_by_user FOREIGN KEY (held_by_user_id) REFERENCES users(id);

CREATE TABLE IF NOT EXISTS vendor_access_requests (
    id BIGSERIAL PRIMARY KEY,
    vendor_id BIGINT NOT NULL REFERENCES users(id),
    status VARCHAR(32) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    resolved_at TIMESTAMP,
    last_updated_by VARCHAR(255)
);
CREATE INDEX IF NOT EXISTS idx_vendor_access_status ON vendor_access_requests(status);

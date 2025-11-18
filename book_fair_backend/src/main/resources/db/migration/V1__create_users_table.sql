CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    business_name VARCHAR(255) NOT NULL,
    contact_number VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING_APPROVAL',
    approved_at TIMESTAMP WITHOUT TIME ZONE
);

DO
$$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'uk_users_email'
    ) THEN
        ALTER TABLE users
            ADD CONSTRAINT uk_users_email UNIQUE (email);
    END IF;
END
$$;

CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL,
    role VARCHAR(32) NOT NULL,
    PRIMARY KEY (user_id, role)
);

DO
$$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_user_roles_user'
    ) THEN
        ALTER TABLE user_roles
            ADD CONSTRAINT fk_user_roles_user
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END
$$;
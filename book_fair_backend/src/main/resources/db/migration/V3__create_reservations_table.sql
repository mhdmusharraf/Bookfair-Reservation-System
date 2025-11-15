CREATE TABLE IF NOT EXISTS reservations (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    reserved_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    confirmation_code VARCHAR(64) NOT NULL,
    email_sent_to VARCHAR(255),
    qr_code BYTEA
);

DO
$$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'uk_reservations_confirmation'
    ) THEN
        ALTER TABLE reservations
            ADD CONSTRAINT uk_reservations_confirmation UNIQUE (confirmation_code);
    END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_reservations_user_id
    ON reservations(user_id);

DO
$$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'reservations'
          AND column_name = 'qr_code'
    ) THEN
        ALTER TABLE reservations ADD COLUMN qr_code BYTEA;
    ELSIF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'reservations'
          AND column_name = 'qr_code'
          AND data_type <> 'bytea'
    ) THEN
        ALTER TABLE reservations DROP COLUMN qr_code;
        ALTER TABLE reservations ADD COLUMN qr_code BYTEA;
    END IF;
END
$$;

DO
$$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'reservations'
          AND column_name = 'email_sent_to'
    ) THEN
        ALTER TABLE reservations ADD COLUMN email_sent_to VARCHAR(255);
    END IF;
END
$$;

DO
$$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'reservations'
          AND column_name = 'confirmation_code'
    ) THEN
        ALTER TABLE reservations ADD COLUMN confirmation_code VARCHAR(64);
    END IF;
    ALTER TABLE reservations ALTER COLUMN confirmation_code SET NOT NULL;
END
$$;

DO
$$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'reservations'
          AND column_name = 'reserved_at'
    ) THEN
        ALTER TABLE reservations ADD COLUMN reserved_at TIMESTAMP WITHOUT TIME ZONE;
    END IF;
    ALTER TABLE reservations
        ALTER COLUMN reserved_at SET DEFAULT NOW();
    ALTER TABLE reservations
        ALTER COLUMN reserved_at SET NOT NULL;
END
$$;

DO
$$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'reservations'
          AND column_name = 'user_id'
    ) THEN
        ALTER TABLE reservations ADD COLUMN user_id BIGINT;
    END IF;
    ALTER TABLE reservations ALTER COLUMN user_id SET NOT NULL;
END
$$;

DO
$$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'fk_reservations_user'
    ) THEN
        ALTER TABLE reservations
            ADD CONSTRAINT fk_reservations_user
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END
$$;

CREATE TABLE IF NOT EXISTS reservation_stalls (
    reservation_id BIGINT NOT NULL,
    stall_id BIGINT NOT NULL,
    PRIMARY KEY (reservation_id, stall_id)
);

DO
$$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'fk_reservation_stalls_reservation'
    ) THEN
        ALTER TABLE reservation_stalls
            ADD CONSTRAINT fk_reservation_stalls_reservation
                FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'fk_reservation_stalls_stall'
    ) THEN
        ALTER TABLE reservation_stalls
            ADD CONSTRAINT fk_reservation_stalls_stall
                FOREIGN KEY (stall_id) REFERENCES stalls(id) ON DELETE CASCADE;
    END IF;
END
$$;

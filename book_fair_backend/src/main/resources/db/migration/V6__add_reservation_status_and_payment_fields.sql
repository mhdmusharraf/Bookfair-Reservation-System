-- Ensure reservation status column exists with defaults and constraints
DO
$$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'reservations'
          AND column_name = 'status'
    ) THEN
        ALTER TABLE reservations ADD COLUMN status VARCHAR(255);
    END IF;

    UPDATE reservations
    SET status = 'PENDING_PAYMENT'
    WHERE status IS NULL;

    ALTER TABLE reservations
        ALTER COLUMN status SET NOT NULL;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'chk_reservations_status'
    ) THEN
        ALTER TABLE reservations
            ADD CONSTRAINT chk_reservations_status
                CHECK (status IN ('PENDING_PAYMENT', 'PAID', 'CANCELLED'));
    END IF;
END
$$;
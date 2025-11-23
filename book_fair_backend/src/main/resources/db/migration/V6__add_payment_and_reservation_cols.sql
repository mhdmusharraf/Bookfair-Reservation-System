ALTER TABLE reservations ADD COLUMN status VARCHAR(50) DEFAULT 'PENDING_PAYMENT';
ALTER TABLE reservations ADD COLUMN total_amount BIGINT;
ALTER TABLE reservations ADD COLUMN currency VARCHAR(10) DEFAULT 'usd';
ALTER TABLE reservations ADD COLUMN stripe_session_id VARCHAR(255);
ALTER TABLE reservations ADD COLUMN payment_intent_id VARCHAR(255);

CREATE TABLE payments (
                          id SERIAL PRIMARY KEY,
                          reservation_id BIGINT,
                          user_id BIGINT,
                          stripe_session_id VARCHAR(255),
                          payment_intent_id VARCHAR(255),
                          amount BIGINT,
                          currency VARCHAR(10),
                          status VARCHAR(50),
                          created_at TIMESTAMP DEFAULT now()
);

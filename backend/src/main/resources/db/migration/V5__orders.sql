-- Day 5: orders table — every buy/sell intent a user submits, before
-- it's matched against anyone else's order.

CREATE TABLE orders (
    id              UUID PRIMARY KEY,
    user_id         UUID NOT NULL REFERENCES users(id),
    side            VARCHAR(4) NOT NULL CHECK (side IN ('BUY', 'SELL')),
    order_type      VARCHAR(6) NOT NULL CHECK (order_type IN ('LIMIT', 'MARKET')),
    price           DECIMAL(18, 8), -- NULL for MARKET orders — they take whatever price is available
    quantity        DECIMAL(18, 8) NOT NULL CHECK (quantity > 0),
    remaining_qty   DECIMAL(18, 8) NOT NULL CHECK (remaining_qty >= 0),
    status          VARCHAR(10) NOT NULL CHECK (status IN ('OPEN', 'PARTIALLY_FILLED', 'FILLED', 'CANCELLED')),
    idempotency_key UUID NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Enforces idempotency: the same key can never create two orders for the
-- same user, even under a retried request.
CREATE UNIQUE INDEX idx_orders_user_idempotency ON orders(user_id, idempotency_key);

-- The matching engine will constantly need "give me all OPEN orders,
-- cheapest sells first / highest buys first" — this index makes that fast.
CREATE INDEX idx_orders_status_price ON orders(status, price);
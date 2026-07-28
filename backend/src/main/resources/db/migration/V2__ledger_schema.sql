-- Day 2: double-entry ledger schema.
-- Every balance change is the sum of immutable ledger_entries rows —
-- never a direct UPDATE on a stored balance column.

CREATE TABLE accounts (
    id         UUID PRIMARY KEY,
    user_id    UUID NOT NULL,
    currency   VARCHAR(10) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ledger_entries (
    id             UUID PRIMARY KEY,
    transaction_id UUID NOT NULL,
    account_id     UUID NOT NULL REFERENCES accounts(id),
    amount         DECIMAL(18, 8) NOT NULL CHECK (amount > 0),
    direction      VARCHAR(10) NOT NULL CHECK (direction IN ('DEBIT', 'CREDIT')),
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ledger_entries_transaction_id ON ledger_entries(transaction_id);
CREATE INDEX idx_ledger_entries_account_id ON ledger_entries(account_id);
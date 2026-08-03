-- Day 3: a users table for login, and a seeded "faucet" account
-- that acts as the source of all simulated deposit money.

CREATE TABLE users (
    id            UUID PRIMARY KEY,
    username      VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- A single system user that "owns" the faucet account below.
INSERT INTO users (id, username, password_hash)
VALUES ('00000000-0000-0000-0000-000000000001', 'system-faucet', 'not-a-real-login');

-- Clean up leftover test-fixture accounts from Day 2's LedgerServiceTest runs.
-- Those tests created accounts with random, made-up user IDs before this
-- users table existed. They don't belong to any real user, so they're safe
-- to remove before we start enforcing that every account must have one.
DELETE FROM ledger_entries
WHERE account_id IN (
    SELECT id FROM accounts WHERE user_id NOT IN (SELECT id FROM users)
);

DELETE FROM accounts
WHERE user_id NOT IN (SELECT id FROM users);

-- Every wallet account must now belong to a real, existing user.
ALTER TABLE accounts
    ADD CONSTRAINT fk_accounts_user FOREIGN KEY (user_id) REFERENCES users(id);

-- The faucet account itself — an always-available USD source.
-- Deposits work by transferring FROM this account TO the user's account.
INSERT INTO accounts (id, user_id, currency)
VALUES ('00000000-0000-0000-0000-00000000000f', '00000000-0000-0000-0000-000000000001', 'USD');
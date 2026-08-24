-- Adds a BTC account for the existing faucet system user, so BTC deposits
-- can work the same way USD deposits already do (transfer from faucet to
-- the user's account). The faucet's own balance is allowed to go negative
-- since it represents an unlimited simulated source, same as USD today.
INSERT INTO accounts (id, user_id, currency)
VALUES ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'BTC');
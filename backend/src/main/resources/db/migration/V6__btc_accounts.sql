-- Day 8: every user needs a second account to hold simulated BTC,
-- alongside their existing ZAR account.
INSERT INTO accounts (id, user_id, currency)
SELECT gen_random_uuid(), user_id, 'BTC'
FROM accounts
WHERE currency = 'ZAR' AND user_id != '00000000-0000-0000-0000-000000000001';
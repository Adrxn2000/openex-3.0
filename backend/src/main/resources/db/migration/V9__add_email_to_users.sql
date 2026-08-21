-- Adds email to users. Nullable + unique (Postgres allows multiple NULLs
-- under a UNIQUE constraint), since the pre-existing system-faucet user
-- has no email. New registrations require one at the application layer.
ALTER TABLE users
    ADD COLUMN email VARCHAR(255) UNIQUE;
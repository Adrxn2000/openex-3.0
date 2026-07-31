-- switch the platform's simulated currency from USD to ZAR.
UPDATE accounts SET currency = 'ZAR' WHERE currency = 'USD';

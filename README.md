# OpenEx 3.0 — Day 1

Simulated crypto exchange capstone. This is the Day 1 skeleton: a Spring Boot
(Kotlin) backend, Postgres + Redis via Docker Compose, and a CI pipeline that
runs on every PR.

## Run it

```bash
# 1. Start Postgres + Redis
docker compose up -d

# 2. Run the backend
cd backend
./gradlew bootRun
```

Then check:

```bash
curl http://localhost:8080/api/health
# {"status":"UP"}
```

## Run tests

```bash
cd backend
./gradlew test
```

## Day 1 checklist (from the sprint plan)
- [x] Spring Boot project initialized with Kotlin DSL
- [x] docker-compose.yml for Postgres + Redis with healthchecks
- [x] GitHub Actions workflow running tests on PR
- [ ] Open a PR from a `feature/scaffolding` branch and merge it (do this yourself)

## What's next (Day 2)
Flyway migrations for `accounts` and `ledger_entries`, JPA entities, and a
`LedgerService` that keeps every transaction's debits and credits balanced.

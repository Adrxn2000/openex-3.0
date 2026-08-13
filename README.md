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
- [x] Open a PR from a `feature/scaffolding` branch and merge it (do this yourself)
## What's next (Day 2)
Flyway migrations for `accounts` and `ledger_entries`, JPA entities, and a
`LedgerService` that keeps every transaction's debits and credits balanced.


## AI Service Infrastructure & Deployment (Day 12 Configuration)

The AI assistant service runs inside the `market-sim` directory using an isolated Python ecosystem communicating with a local Ollama instance.

### External Runtime Dependencies
1. **Ollama Instance:** Must be installed and running on the host system machine (`http://localhost:11434`).
2. **Model Manifest:** Ensure the underlying framework model is pulled locally before starting the server application execution:
   ```bash
   ollama pull mistral
   ```

### Runtime Security Enhancements
- **Authentication:** All requests communicating with `/api/chat` must supply a valid `X-API-Key` string inside the request header block.
- **Rate-Limiting:** Enforces an explicit 10 requests per minute sliding window constraint per unique client machine IP address.
- **Circuit Breaker Timeouts:** Built-in 30-second connection termination parameters are attached to the LangChain invoke sequence to prevent application pipeline gridlocks.

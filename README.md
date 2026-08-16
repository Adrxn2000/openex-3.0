# OpenEx 3.0 — Simulated Crypto Exchange & AI Trading Terminal

A full-stack simulated cryptocurrency exchange built over a 15-day sprint for the
CAPACITI End-to-End Technologies Programme. OpenEx 3.0 implements a double-entry
ledger, a price-time priority matching engine, real-time order book streaming,
and a locally-hosted AI trading assistant — across four independent services.

## Architecture

| Service | Tech | Port | Responsibility |
|---|---|---|---|
| Backend | Kotlin / Spring Boot | 8080 | Ledger, matching engine, auth, REST API |
| Database | PostgreSQL | 5432 | Accounts, orders, ledger entries (Flyway-versioned) |
| Cache | Redis | 6379 | Reserved for future use |
| Frontend | React / Vite | 5173 | Trading terminal SPA |
| AI Service | Python / Flask / LangChain / Ollama | 5001 | Market simulation + AI assistant |

The AI assistant is accessed through a backend proxy, not directly:

```
Browser → Kotlin backend (JWT-verified) → Flask service (API-key verified) → local Ollama model
```

This keeps the Flask service's internal API key off the public internet — the browser
never sees it.

## Prerequisites

- Git
- JDK 21
- Node.js 18+
- Python 3.11+
- Docker Desktop
- [Ollama](https://ollama.com)

## Running it — cold start

```bash
# 1. Clone
git clone https://github.com/Adrxn2000/openex-3.0.git
cd openex-3.0

# 2. Start Postgres + Redis
docker compose up -d

# 3. Start the backend
cd backend
./gradlew.bat bootRun    # Windows
# ./gradlew bootRun      # macOS/Linux

# 4. Start the frontend (new terminal)
cd frontend
npm install
npm run dev

# 5. Set up the AI service (new terminal)
cd market-sim
python -m venv venv
.\venv\Scripts\activate           # Windows
# source venv/bin/activate        # macOS/Linux
pip install -r requirements.txt

# 6. Pull the local model
ollama pull tinyllama

# 7. Start the AI service
python app.py
```

Visit **http://localhost:5173** — register an account, deposit simulated funds,
place an order, and chat with the trading assistant.

### AI Model Note
The assistant uses **TinyLlama** rather than Mistral/Llama 3, due to local hardware
memory constraints encountered during development (Mistral requires more RAM than
available for CPU-only inference on the development machine). On higher-spec hardware,
swap the model name in `market-sim/app.py`:
```python
llm = ChatOllama(model="mistral", timeout=30)
```

## API Overview

| Endpoint | Method | Auth | Purpose |
|---|---|---|---|
| `/api/auth/register` | POST | — | Create a user + USD/BTC wallets |
| `/api/auth/login` | POST | — | Returns a JWT |
| `/api/wallets/balance` | GET | JWT | Single (USD) balance |
| `/api/wallets/balances` | GET | JWT | All currency balances |
| `/api/wallets/deposit` | POST | JWT | Simulated faucet deposit |
| `/api/orders` | POST | JWT + `Idempotency-Key` | Place a limit/market order |
| `/api/assistant/chat` | POST | JWT | AI trading assistant (proxied to Flask) |
| `/ws` | WebSocket | — | STOMP endpoint, subscribe to `/topic/orderbook` |

## Running Tests

```bash
cd backend
./gradlew.bat test
```

Covers the double-entry ledger (entries always net to zero, failed transfers roll
back completely) and the matching engine.

## Project Structure

```
openex-3.0/
├── backend/        # Kotlin/Spring Boot — ledger, matching engine, auth, API
├── frontend/        # React/Vite — trading terminal
├── market-sim/       # Python/Flask — market data + AI assistant
├── docker-compose.yml
└── .github/workflows/ # CI pipeline
```

## Key Architectural Decisions

- **Double-entry ledger** — balances are never stored directly, only derived by
  summing immutable `ledger_entries` rows. Every transfer writes a balancing DEBIT
  and CREDIT inside one `@Transactional` boundary.
- **Idempotent order placement** — a unique index on `(user_id, idempotency_key)`
  guarantees a retried request can never create a duplicate order.
- **Price-time priority matching** — sell orders matched cheapest-first, buy orders
  matched highest-first, with partial-fill support via `remaining_qty`.
- **Self-trade prevention** — the matching engine skips candidate orders belonging
  to the same user as the incoming order.
- **JWT authentication** — stateless, BCrypt-hashed passwords, 1-hour token expiry.

## Known Limitations

- Trade settlement currently moves only the USD leg of a trade; the traded asset
  (e.g. BTC) is not yet moved to a separate ledger account in the same transaction.
- Ollama and its model weights must be installed separately on each machine; not
  yet part of the standard `docker-compose up` flow.
- The AI assistant's tool-calling (fetching a live wallet balance) is currently
  triggered by keyword matching in the question text rather than full LLM-driven
  function selection — a pragmatic simplification made under deadline pressure.
- Dockerfiles exist for all three services but full multi-container orchestration
  (including Ollama in-container) has not been fully verified on constrained
  development hardware.

## Sprint Deliverables (15-Day Plan)

| Day | Delivered |
|---|---|
| 1 | Spring Boot skeleton, Docker Compose, CI pipeline |
| 2 | Double-entry ledger schema + `LedgerService` |
| 3 | JWT auth, BCrypt hashing, deposit endpoint |
| 4 | STOMP WebSocket config + broadcast service |
| 5 | Matching engine, idempotent order placement |
| 6 | Order book broadcasts wired to real trades |
| 7 | React scaffold, routing, Zustand store |
| 8 | Auth UI, wallet dashboard, USD/BTC accounts |
| 9 | Trading form with per-submission idempotency key |
| 10 | Live order book UI via STOMP subscription |
| 11 | Python/Flask market simulator |
| 12 | Ollama + LangChain chat endpoint |
| 13 | Agentic wallet-balance tool calling |
| 14 | Chart.js live price chart, AI chat widget |
| 15 | Dockerfiles, healthcheck-gated compose, this README |

## Author

Adrian Majavu — CAPACITI End-to-End Technologies Programme
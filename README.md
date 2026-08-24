# OpenEx 3.0 — Simulated Crypto Exchange & AI Trading Terminal

A full-stack simulated cryptocurrency exchange built over a 15-day sprint for the
CAPACITI End-to-End Technologies Programme. OpenEx 3.0 implements a double-entry
ledger, a price-time priority matching engine, real-time order book streaming,
live market data, and a locally-hosted AI trading assistant — across four
independent services.

## Architecture

| Service | Tech | Port | Responsibility |
|---|---|---|---|
| Backend | Kotlin / Spring Boot | 8080 | Ledger, matching engine, auth, REST API |
| Database | PostgreSQL | 5432 | Accounts, orders, ledger entries (Flyway-versioned) |
| Cache | Redis | 6379 | Reserved for future use |
| Frontend | React / Vite | 5173 | Trading terminal SPA |
| AI Service | Python / Flask / LangChain / Ollama | 5001 | Market data + AI assistant |

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
docker compose up -d postgres redis

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
ollama pull llama3.2:1b

# 7. Start the AI service
python app.py
```

Visit **http://localhost:5173** — register an account, deposit simulated USD
and/or BTC funds, place an order, and chat with the trading assistant.

### Running the full stack in Docker (all services)

```bash
cd backend
./gradlew.bat bootJar     # Windows — build the jar first, see note below
docker compose up -d --build
```

### AI Model Note
The assistant runs **Llama 3.2 1B** — a small, genuinely instruction-tuned model
that runs comfortably on CPU-only hardware via Ollama. An earlier version of this
project used TinyLlama, but it proved unreliable at following instructions (it
would ramble past its intended reply and occasionally fabricate account details
such as trade history or balances). Llama 3.2 1B is a similar size but far more
reliable at staying on-topic and respecting stop conditions.

To avoid any risk of the LLM inventing financial figures, **balance questions are
answered deterministically in Python**, not by the model: the Flask service
detects balance-related questions by keyword, fetches the real balance from the
backend, and returns it directly — the LLM never sees or paraphrases real account
numbers. The LLM only handles general conversational questions (e.g. "what's a
limit order?").

On higher-spec hardware, swap the model name in `market-sim/app.py`:
```python
llm = ChatOllama(model="mistral", timeout=30, ...)
```

### Docker Build Note
The backend Dockerfile copies a pre-built jar rather than compiling inside the
container — a deliberate trade-off made due to slow network conditions during
development (compiling fresh inside the container repeatedly failed to complete
in reasonable time). Before running `docker build ./backend`, build the jar locally:
```bash
cd backend
./gradlew.bat bootJar    # Windows
# ./gradlew bootJar      # macOS/Linux
```
On a faster connection, this could be converted back to a full multi-stage build
that compiles from source inside the container — the original Dockerfile approach
attempted first, kept here as a note for future improvement.

## API Overview

| Endpoint | Method | Auth | Purpose |
|---|---|---|---|
| `/api/auth/register` | POST | — | Create a user (username, email, password) + USD/BTC wallets |
| `/api/auth/login` | POST | — | Returns a JWT |
| `/api/wallets/balance` | GET | JWT | Single (USD) balance |
| `/api/wallets/balances` | GET | JWT | All currency balances |
| `/api/wallets/deposit` | POST | JWT | Simulated faucet deposit — `{ amount, currency }`, defaults to USD; supports BTC |
| `/api/orders` | POST | JWT + `Idempotency-Key` | Place a limit/market order |
| `/api/market/ticks` | GET | — | Real BTC/USD price history (proxied from CoinGecko, cached 60s) |
| `/api/chat` | POST | JWT + internal API key | AI trading assistant |
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
- **Full two-leg trade settlement** — executing a trade moves both the USD leg
  (buyer → seller) and the BTC leg (seller → buyer) through the ledger in the
  same transaction, so wallet balances accurately reflect completed trades.
- **Currency-generic faucet** — deposits look up a faucet account by currency
  dynamically, so USD and BTC (and future currencies) can all be funded the
  same way without hardcoding a second faucet path.
- **JWT authentication** — stateless, BCrypt-hashed passwords, expiring tokens;
  the frontend detects a `401` from an expired token and logs the user out
  automatically rather than retrying indefinitely.
- **Deterministic balance answers in chat** — the AI assistant never generates
  real financial figures itself; balance questions are answered from a direct
  backend lookup, sidestepping small-model hallucination risk entirely.

## Known Limitations

- The market-sim faucet allows unlimited simulated deposits of any currency —
  intentional for a demo/learning environment, not production behavior.
- Ollama and its model weights must be installed separately on each machine; not
  yet part of the standard `docker-compose up` flow.
- The AI assistant's balance lookup is triggered by keyword matching in the
  question text rather than full LLM-driven function selection — a deliberate
  simplification that also happens to eliminate hallucination risk on financial
  figures.
- BTC/USD chart data reflects real market history from CoinGecko, refreshed
  once per minute (cached), rather than a live tick-by-tick feed.
- Dockerfiles exist for all three services and `docker compose up -d --build`
  builds and runs the full stack; the backend still requires a locally-built
  jar first (see Docker Build Note above).

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
| 15 | Dockerfiles, healthcheck-gated compose, two-leg trade settlement, live BTC market data, deposit currency selection, README |

## Author

Adrian Majavu — CAPACITI End-to-End Technologies Programme

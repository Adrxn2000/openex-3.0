from flask import Flask, jsonify, request
from flask_cors import CORS
from langchain_ollama import ChatOllama
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
import numpy as np
import pandas as pd
import requests
import time
import os

app = Flask(__name__)
CORS(app, origins=["http://localhost:5174"])


OLLAMA_BASE_URL = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")
BACKEND_URL = os.environ.get("BACKEND_URL", "http://localhost:8080")
llm = ChatOllama(
    model="llama3.2:1b",
    timeout=30,
    base_url=OLLAMA_BASE_URL,
    keep_alive="30m",
    num_predict=60,
    stop=["\nUser:", "\nuser:", "User:", "\nAssistant:", "\nAI"]
)

RATE_LIMIT_WINDOW = 60
MAX_REQUESTS_PER_WINDOW = 10
rate_limit_store = {}
INTERNAL_API_KEY = "openex-secure-sim-key-2026"


SYSTEM_PROMPT = (
    "You are OpenEx Assistant for a simulated crypto exchange. "
    "Answer in 1-2 short, casual sentences. "
    "You do not have access to the user's real trades, balances, or "
    "account data — never invent numbers or trade history. "
    "If asked about their balance or trades, tell them to check the "
    "dashboard. Do not write out a conversation or continue speaking "
    "as the user."
)

FEW_SHOT = [
    HumanMessage(content="hi"),
    AIMessage(content="Hey! Ask me how OpenEx works or what a market order is."),
    HumanMessage(content="what's a limit order?"),
    AIMessage(content="It's an order that only fills at your chosen price or better."),
]


def build_messages(question: str):
    return [SystemMessage(content=SYSTEM_PROMPT), *FEW_SHOT, HumanMessage(content=question)]


def is_rate_limited(ip_address):
    current_time = time.time()
    if ip_address not in rate_limit_store:
        rate_limit_store[ip_address] = []
    rate_limit_store[ip_address] = [t for t in rate_limit_store[ip_address] if current_time - t < RATE_LIMIT_WINDOW]
    if len(rate_limit_store[ip_address]) >= MAX_REQUESTS_PER_WINDOW:
        return True
    rate_limit_store[ip_address].append(current_time)
    return False


def generate_ticks(n=300, start_price=45000):
    """Synthetic fallback — only used if the real CoinGecko feed is
    unreachable and there's no cached data yet."""
    returns = np.random.normal(loc=0.0001, scale=0.006, size=n)
    volatility_clusters = np.random.choice([1, 1, 1, 3], size=n)
    returns = returns * volatility_clusters
    prices = start_price * (1 + returns).cumprod()
    df = pd.DataFrame({'price': prices})
    df['moving_avg_10'] = df['price'].rolling(10).mean()
    return df


_ticks_cache = {"data": None, "fetched_at": 0}
TICKS_CACHE_TTL = 60  # seconds — refresh real data once a minute


def fetch_real_btc_ticks():
    now = time.time()
    if _ticks_cache["data"] is not None and now - _ticks_cache["fetched_at"] < TICKS_CACHE_TTL:
        return _ticks_cache["data"]

    try:
        resp = requests.get(
            "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart",
            params={"vs_currency": "usd", "days": "1"},
            timeout=8
        )
        resp.raise_for_status()
        prices = resp.json()["prices"]  # list of [timestamp_ms, price]
        df = pd.DataFrame(prices, columns=["timestamp", "price"])
        df['moving_avg_10'] = df['price'].rolling(10).mean()
        df = df.fillna(0)
        records = df[['price', 'moving_avg_10']].to_dict(orient='records')
        _ticks_cache["data"] = records
        _ticks_cache["fetched_at"] = now
        return records
    except (requests.exceptions.RequestException, KeyError, ValueError, IndexError):
        if _ticks_cache["data"] is not None:
            return _ticks_cache["data"]
        return generate_ticks().fillna(0).to_dict(orient='records')


@app.route('/api/market/ticks')
def ticks():
    records = fetch_real_btc_ticks()
    return jsonify(records)


@app.route('/api/chat', methods=['POST'])
def chat():
    client_ip = request.remote_addr or "unknown"
    if is_rate_limited(client_ip):
        return jsonify({'error': 'Too many requests. Please try again after a minute.'}), 429

    api_key = request.headers.get('X-API-Key')
    if not api_key or api_key != INTERNAL_API_KEY:
        return jsonify({'error': 'Unauthorized. Missing or invalid X-API-Key header.'}), 401

    user_jwt_auth = request.headers.get('Authorization', '')
    data = request.get_json() or {}
    question = data.get('question', '')

    if not question:
        return jsonify({'error': 'question field is required'}), 400

    q_lower = question.lower()
    wants_balance = 'balance' in q_lower or 'money' in q_lower or 'funds' in q_lower

    if user_jwt_auth and wants_balance:
        url = BACKEND_URL + "/api/wallets/balance"
        headers = {"Authorization": user_jwt_auth}
        try:
            response = requests.get(url, headers=headers, timeout=5)
            if response.status_code == 200:
                balance_data = response.json()
                balance = balance_data.get("balance", "0.00")
                currency = balance_data.get("currency", "USD")
                return jsonify({'response': f"Your balance is {balance} {currency}."})
            elif response.status_code == 401:
                return jsonify({'response': "Your session's expired — log in again to check your balance."})
            else:
                return jsonify({'response': "Couldn't reach your balance right now, try again in a moment."})
        except requests.exceptions.RequestException:
            return jsonify({'response': "Couldn't reach your balance right now, try again in a moment."})

    try:
        messages = build_messages(question)
        ai_message = llm.invoke(messages)
        response_text = ai_message.content if hasattr(ai_message, 'content') else str(ai_message)
        return jsonify({'response': response_text.strip()})
    except Exception as e:
        app.logger.error("Agentic Execution Error: " + str(e))
        return jsonify({'error': 'The trading assistant encountered an execution error. Please try again.'}), 503


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
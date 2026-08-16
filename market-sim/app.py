from flask import Flask, jsonify, request
from flask_cors import CORS
from langchain_ollama import ChatOllama
from langchain_core.prompts import PromptTemplate
from langchain_core.tools import tool
import numpy as np
import pandas as pd
import requests
import time

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"])

llm = ChatOllama(model="tinyllama", timeout=30)

RATE_LIMIT_WINDOW = 60
MAX_REQUESTS_PER_WINDOW = 10
rate_limit_store = {}
INTERNAL_API_KEY = "openex-secure-sim-key-2026"



@tool
def get_user_wallet_balance(auth_header_token: str) -> str:
    """Fetch the user's live simulated wallet balance from the backend, given their raw Authorization header value."""
    url = "http://localhost:8080/api/wallets/balance"
    headers = {"Authorization": auth_header_token}
    try:
        response = requests.get(url, headers=headers, timeout=5)
        if response.status_code == 200:
            data = response.json()
            balance = data.get("balance", "0.00")
            currency = data.get("currency", "ZAR")
            return "The user's actual wallet balance is " + str(balance) + " " + str(currency) + "."
        elif response.status_code == 401:
            return "Unauthorized. The user session token is invalid or expired."
        else:
            return "Could not fetch balance. Kotlin service returned status " + str(response.status_code) + "."
    except requests.exceptions.RequestException as e:
        return "Error connecting to Kotlin backend service: " + str(e)


FINANCIAL_PERSONA = "You are a calm, professional financial assistant for OpenEx, a simulated crypto exchange. You help users understand their trading activity. You never give real financial advice, and you always remind users this is a simulated environment.\n\nUser question: {question}\nResponse:"

chat_prompt = PromptTemplate(input_variables=["question"], template=FINANCIAL_PERSONA)


def is_rate_limited(ip_address):
    current_time = time.time()
    if ip_address not in rate_limit_store:
        rate_limit_store[ip_address] = []
    rate_limit_store[ip_address] = [t for t in rate_limit_store[ip_address] if current_time - t < RATE_LIMIT_WINDOW]
    if len(rate_limit_store[ip_address]) >= MAX_REQUESTS_PER_WINDOW:
        return True
    rate_limit_store[ip_address].append(current_time)
    return False


def generate_ticks(n=200, start_price=500000):
    returns = np.random.normal(loc=0.0002, scale=0.01, size=n)
    prices = start_price * (1 + returns).cumprod()
    df = pd.DataFrame({'price': prices})
    df['moving_avg_10'] = df['price'].rolling(10).mean()
    return df


@app.route('/api/market/ticks')
def ticks():
    df = generate_ticks()
    df = df.fillna(0)
    return jsonify(df.to_dict(orient='records'))


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

    try:
        prompt_string = chat_prompt.format(question=question)
        ai_message = llm.invoke(prompt_string)

        q_lower = question.lower()
        wants_balance = 'balance' in q_lower or 'money' in q_lower or 'funds' in q_lower

        if user_jwt_auth and wants_balance:
            tool_result = get_user_wallet_balance.invoke({"auth_header_token": user_jwt_auth})
            final_prompt = prompt_string + "\n[System Tool Result: " + tool_result + "]\nAnswer the user based on this real balance tool result."
            final_response = llm.invoke(final_prompt)
            return jsonify({'response': final_response.content})

        response_text = ai_message.content if hasattr(ai_message, 'content') else str(ai_message)
        return jsonify({'response': response_text})

    except Exception as e:
        app.logger.error("Agentic Execution Error: " + str(e))
        return jsonify({'error': 'The trading assistant encountered an execution error. Please try again.'}), 503


if __name__ == '__main__':
    app.run(port=5001)

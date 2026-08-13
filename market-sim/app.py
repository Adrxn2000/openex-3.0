from flask import Flask, jsonify, request
from langchain_ollama import OllamaLLM
from langchain_core.prompts import PromptTemplate
import numpy as np
import pandas as pd
import time

app = Flask(__name__)

# Initialize the LLM with a strict timeout configuration (in seconds)
# This prevents the service from hanging indefinitely if Ollama crashes
llm = OllamaLLM(model="mistral", timeout=30)

# Simplistic In-Memory Rate Limiting State (IP Address -> List of timestamps)
RATE_LIMIT_WINDOW = 60  # Window size in seconds
MAX_REQUESTS_PER_WINDOW = 10  # Max requests allowed per window
rate_limit_store = {}

# Simple static API key for internal microservice authentication
# In a full production layout, this would be loaded via os.environ.get("CHAT_API_KEY")
INTERNAL_API_KEY = "openex-secure-sim-key-2026"

FINANCIAL_PERSONA = """You are a calm, professional financial assistant for OpenEx, 
a simulated crypto exchange. You help users understand their trading activity and 
market conditions. You never give real financial advice, and you always remind users 
this is a simulated environment. Keep responses concise.

User question: {question}
Response:"""

chat_prompt = PromptTemplate(input_variables=["question"], template=FINANCIAL_PERSONA)


def is_rate_limited(ip_address: str) -> bool:
    """Helper function to clean old request windows and evaluate rate abuse."""
    current_time = time.time()
    if ip_address not in rate_limit_store:
        rate_limit_store[ip_address] = []
    
    # Filter out requests older than the current 60-second window
    rate_limit_store[ip_address] = [
        t for t in rate_limit_store[ip_address] if current_time - t < RATE_LIMIT_WINDOW
    ]
    
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
    # 1. Rate Limiting Check
    client_ip = request.remote_addr or "unknown"
    if is_rate_limited(client_ip):
        return jsonify({'error': 'Too many requests. Please try again after a minute.'}), 429

    # 2. Authentication Check
    auth_header = request.headers.get('X-API-Key')
    if not auth_header or auth_header != INTERNAL_API_KEY:
        return jsonify({'error': 'Unauthorized. Missing or invalid X-API-Key header.'}), 401

    # 3. Request Payload Validation
    data = request.get_json() or {}
    question = data.get('question', '')

    if not question:
        return jsonify({'error': 'question field is required'}), 400

    # 4. Error Handling & Timeout Wrapper around LLM Execution
    try:
        prompt = chat_prompt.format(question=question)
        response = llm.invoke(prompt)
        return jsonify({'response': response})
        
    except Exception as e:
        # Graceful handling of network failures, model down issues, or timeouts
        app.logger.error(f"LLM Invocation Failed: {str(e)}")
        return jsonify({
            'error': 'The AI assistant is temporarily unavailable or timed out. Please try again later.'
        }), 503


if __name__ == '__main__':
    app.run(port=5000)

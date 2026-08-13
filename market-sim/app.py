from flask import Flask, jsonify, request
import numpy as np
import pandas as pd
from langchain_community.llms import Ollama
from langchain_core.prompts import PromptTemplate

app = Flask(__name__)

def generate_ticks(n=200, start_price=500000):
    returns = np.random.normal(loc=0.0002, scale=0.01, size=n)
    prices = start_price * (1 + returns).cumprod()
    df = pd.DataFrame({'price': prices})
    df['moving_avg_10'] = df['price'].rolling(10).mean()
    return df

llm = Ollama(model="mistral")

FINANCIAL_PERSONA = """You are a calm, professional financial assistant for OpenEx,
a simulated crypto exchange. You help users understand their trading activity and
market conditions. You never give real financial advice, and you always remind users
this is a simulated environment. Keep responses concise.

User question: {question}
Response:"""

chat_prompt = PromptTemplate(input_variables=["question"], template=FINANCIAL_PERSONA)

@app.route('/api/market/ticks')
def ticks():
    df = generate_ticks()
    df = df.fillna(0)
    return jsonify(df.to_dict(orient='records'))

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.get_json()
    question = data.get('question', '')

    if not question:
        return jsonify({'error': 'question is required'}), 400

    prompt = chat_prompt.format(question=question)
    response = llm.invoke(prompt)

    return jsonify({'response': response})

if __name__ == '__main__':
    app.run(port=5000)
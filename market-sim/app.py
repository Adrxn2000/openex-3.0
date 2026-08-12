from flask import Flask, jsonify
import numpy as np
import pandas as pd

app = Flask(__name__)

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

if __name__ == '__main__':
    app.run(port=5000)
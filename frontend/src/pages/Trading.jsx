import { useState } from 'react';
import { placeOrder } from '../api/client';
import useAuthStore from '../store/authStore';
import { useOrderBook } from '../hooks/useOrderBook';
import AnimatedNumber from '../components/AnimatedNumber';
import AuthGate from '../components/AuthGate';

function Trading() {
  const token = useAuthStore((state) => state.token);
  const [side, setSide] = useState('BUY');
  const [orderType, setOrderType] = useState('LIMIT');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const orderBook = useOrderBook();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setResult(null);
    try {
      const order = await placeOrder(
        token,
        side,
        orderType,
        orderType === 'LIMIT' ? Number(price) : null,
        Number(quantity)
      );
      setResult(order);
    } catch (err) {
      setError(err.message);
    }
  }

  if (!token) {
    return <AuthGate title="Trading requires an account" message="Log in to place simulated orders." />;
  }

  return (
    <div className="page">
      <h1>Trading</h1>
      <p className="subtitle">Place a limit or market order</p>

      <div className="ticker-row">
        <div className="ticker-pill bid">
          Best Bid &nbsp; <AnimatedNumber value={Number(orderBook.bestBid) || 0} decimals={2} prefix="$" />
        </div>
        <div className="ticker-pill ask">
          Best Ask &nbsp; <AnimatedNumber value={Number(orderBook.bestAsk) || 0} decimals={2} prefix="$" />
        </div>
      </div>

      <div className="grid-2">
        <form onSubmit={handleSubmit}>
          <div>
            <label>Side</label>
            <div className="segmented">
              <button
                type="button"
                className={`buy ${side === 'BUY' ? 'active' : ''}`}
                onClick={() => setSide('BUY')}
              >
                Buy
              </button>
              <button
                type="button"
                className={`sell ${side === 'SELL' ? 'active' : ''}`}
                onClick={() => setSide('SELL')}
              >
                Sell
              </button>
            </div>
          </div>

          <div>
            <label>Order Type</label>
            <select value={orderType} onChange={(e) => setOrderType(e.target.value)}>
              <option value="LIMIT">Limit</option>
              <option value="MARKET">Market</option>
            </select>
          </div>

          {orderType === 'LIMIT' && (
            <div>
              <label>Price (USD)</label>
              <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
            </div>
          )}

          <div>
            <label>Quantity</label>
            <input type="number" step="0.00000001" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
          </div>

          <button type="submit" className={side === 'BUY' ? 'btn-buy' : 'btn-sell'}>
            Place {side === 'BUY' ? 'Buy' : 'Sell'} Order
          </button>

          {error && <div className="error-box">{error}</div>}
        </form>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Last Order</h3>
          {!result && <p>No order placed yet this session.</p>}
          {result && (
            <div className="result-card">
              <p style={{ margin: '0 0 8px' }}>
                <span className={`status-badge ${result.status}`}>{result.status}</span>
              </p>
              <p style={{ margin: '4px 0', fontSize: 13 }}>ID: {result.id}</p>
              <p style={{ margin: '4px 0', fontSize: 13 }}>Remaining Qty: {result.remainingQty}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Trading;
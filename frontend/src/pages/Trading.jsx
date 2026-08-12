import { useState } from 'react';
import { placeOrder } from '../api/client';
import useAuthStore from '../store/authStore';
import { useOrderBook } from '../hooks/useOrderBook';

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
    return (
      <div>
        <h1>Trading</h1>
        <p>You're not logged in. Go to the Login page first.</p>
      </div>
    );
  }


 
  return (
    <div>
      <h1>Trading</h1>
 <div>
  <p style={{ color: 'green' }}>Best Bid: R{orderBook.bestBid}</p>
  <p style={{ color: 'red' }}>Best Ask: R{orderBook.bestAsk}</p>
</div>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Side: </label>
          <select value={side} onChange={(e) => setSide(e.target.value)}>
            <option value="BUY">Buy</option>
            <option value="SELL">Sell</option>
          </select>
        </div>

        <div>
          <label>Order Type: </label>
          <select value={orderType} onChange={(e) => setOrderType(e.target.value)}>
            <option value="LIMIT">Limit</option>
            <option value="MARKET">Market</option>
          </select>
        </div>

        {orderType === 'LIMIT' && (
          <div>
            <label>Price (ZAR): </label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
        )}

        <div>
          <label>Quantity: </label>
          <input
            type="number"
            step="0.00000001"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
        </div>

        <button type="submit">Place Order</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {result && (
        <div>
          <p>Order placed:</p>
          <ul>
            <li>ID: {result.id}</li>
            <li>Status: {result.status}</li>
            <li>Remaining Qty: {result.remainingQty}</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default Trading;
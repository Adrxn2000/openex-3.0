import { useState, useEffect } from 'react';
import { getAllBalances } from '../api/client';
import useAuthStore from '../store/authStore';
import MarketChart from '../components/MarketChart';
import ChatWidget from '../components/ChatWidget';

function Dashboard() {
  const token = useAuthStore((state) => state.token);
  const username = useAuthStore((state) => state.username);
  const [balances, setBalances] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    getAllBalances(token)
      .then((data) => setBalances(data))
      .catch((err) => setError(err.message));
  }, [token]);

  if (!token) {
    return (
      <div className="page">
        <h1>Dashboard</h1>
        <p>You're not logged in. Go to the Login page first.</p>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Welcome, {username}</h1>
      <p className="subtitle">Here's your account overview</p>

      {error && <div className="error-box">{error}</div>}

      {balances && (
        <div className="balance-row">
          {Object.entries(balances).map(([currency, amount]) => (
            <div className="balance-card" key={currency}>
              <div className="label">{currency}</div>
              <div className="value">{Number(amount).toLocaleString(undefined, { maximumFractionDigits: 8 })}</div>
            </div>
          ))}
        </div>
      )}

      <MarketChart />
      <ChatWidget />
    </div>
  );
}

export default Dashboard;
import { useState, useEffect } from 'react';
import { getAllBalances } from '../api/client';
import useAuthStore from '../store/authStore';

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
      <div>
        <h1>Dashboard</h1>
        <p>You're not logged in. Go to the Login page first.</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {username}.</p>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {balances && (
        <ul>
          {Object.entries(balances).map(([currency, amount]) => (
            <li key={currency}>{currency}: {amount}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Dashboard;
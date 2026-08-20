import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllBalances } from '../api/client';
import useAuthStore from '../store/authStore';
import MarketChart from '../components/MarketChart';
import ChatWidget from '../components/ChatWidget';
import AnimatedNumber from '../components/AnimatedNumber';

function Dashboard() {
  const token = useAuthStore((state) => state.token);
  const username = useAuthStore((state) => state.username);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const [balances, setBalances] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    function load() {
      getAllBalances(token)
        .then((data) => {
          if (!cancelled) setBalances(data);
        })
        .catch((err) => {
          if (cancelled) return;
          // Expired or invalid token: stop polling and send the user
          // back to log in, instead of retrying forever every 8s.
          if (err.status === 401) {
            logout();
            navigate('/login');
            return;
          }
          setError(err.message);
        });
    }

    load();
    const interval = setInterval(load, 8000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [token]);

  if (!token) {
    return (
      <div className="page">
        <div className="hero">
          <div className="hero-eyebrow">Simulated Markets · Zero Risk</div>
          <h1 className="hero-title">Trade crypto markets<br />without the stakes.</h1>
          <p className="hero-sub">
            OpenEx is a fully simulated exchange — real market dynamics and real order
            matching, none of the real money. Practice strategies and learn how a live
            order book actually behaves.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn-primary">Create free account</Link>
            <Link to="/login" className="btn-ghost">Log in</Link>
          </div>
        </div>
        <MarketChart />
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Welcome back, {username}</h1>
      <p className="subtitle">Here's your account overview</p>

      {error && <div className="error-box">{error}</div>}

      {!balances && !error && (
        <div className="balance-row">
          {[1, 2, 3].map((i) => (
            <div className="balance-card skeleton" key={i} />
          ))}
        </div>
      )}

      {balances && (
        <div className="balance-row">
          {Object.entries(balances).map(([currency, amount]) => (
            <div className="balance-card" key={currency}>
              <div className="label">{currency}</div>
              <div className="value">
                <AnimatedNumber
                  value={Number(amount)}
                  decimals={currency === 'USD' || currency === 'ZAR' ? 2 : 8}
                />
              </div>
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
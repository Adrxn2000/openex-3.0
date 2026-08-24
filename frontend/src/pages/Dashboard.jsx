import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllBalances, deposit } from '../api/client';
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
  const [depositAmount, setDepositAmount] = useState('');
  const [depositCurrency, setDepositCurrency] = useState('USD');
  const [depositStatus, setDepositStatus] = useState('');
  const [depositing, setDepositing] = useState(false);

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

  function handleLogout() {
    logout();
    navigate('/login');
  }

  async function handleDeposit(e) {
    e.preventDefault();
    setDepositStatus('');
    const amount = Number(depositAmount);
    if (!amount || amount <= 0) {
      setDepositStatus('Enter an amount greater than 0');
      return;
    }
    setDepositing(true);
    try {
      await deposit(token, amount, depositCurrency);
      const fresh = await getAllBalances(token);
      setBalances(fresh);
      setDepositAmount('');
      const decimals = depositCurrency === 'USD' ? 2 : 8;
      setDepositStatus(`Deposited ${amount.toFixed(decimals)} ${depositCurrency}`);
    } catch (err) {
      if (err.status === 401) {
        logout();
        navigate('/login');
        return;
      }
      setDepositStatus(err.message);
    } finally {
      setDepositing(false);
    }
  }

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
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1>Welcome back, {username}</h1>
          <p className="subtitle">Here's your account overview</p>
        </div>
        <button onClick={handleLogout} className="btn-ghost" style={{ width: 'auto' }}>
          Log out
        </button>
      </div>

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

      <div className="card" style={{ marginTop: 8, marginBottom: 20, maxWidth: 360 }}>
        <h3 style={{ marginTop: 0, marginBottom: 14 }}>Deposit funds</h3>
        <form onSubmit={handleDeposit} style={{ padding: 0, border: 'none', background: 'transparent' }}>
          <div>
            <label>Currency</label>
            <select value={depositCurrency} onChange={(e) => setDepositCurrency(e.target.value)}>
              <option value="USD">USD</option>
              <option value="BTC">BTC</option>
            </select>
          </div>
          <div>
            <label>Amount</label>
            <input
              type="number"
              min="0"
              step={depositCurrency === 'USD' ? '0.01' : '0.00000001'}
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder={depositCurrency === 'USD' ? '100.00' : '0.01000000'}
            />
          </div>
          <button type="submit" disabled={depositing}>
            {depositing ? 'Depositing…' : 'Deposit'}
          </button>
          {depositStatus && (
            <div className="field-hint" style={{ marginTop: 10 }}>{depositStatus}</div>
          )}
        </form>
      </div>

      <MarketChart />
      <ChatWidget />
    </div>
  );
}

export default Dashboard;
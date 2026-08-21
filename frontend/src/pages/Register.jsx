import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api/client';
import useAuthStore from '../store/authStore';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const data = await register(username, email, password);
      login(data.token, username);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page auth-page">
      <div className="auth-split">
        <div className="auth-hero">
          <div className="hero-eyebrow">Simulated Markets · Zero Risk</div>
          <h2>Start trading in minutes.</h2>
          <p style={{ fontSize: 13.5 }}>
            Create a free OpenEx account and get a simulated USD wallet
            instantly — no real money, no risk, real order book dynamics.
          </p>
          <div className="auth-feature-list">
            <div className="auth-feature"><span className="check">✓</span> Instant simulated USD wallet</div>
            <div className="auth-feature"><span className="check">✓</span> Live order book & matching engine</div>
            <div className="auth-feature"><span className="check">✓</span> Real-time price charts</div>
          </div>
        </div>
        <div className="auth-form-col">
          <div className="brand-mark">Open<span>Ex</span></div>
          <p className="subtitle" style={{ marginBottom: 4 }}>Create your account</p>
          <form onSubmit={handleSubmit}>
            <div>
              <label>Username</label>
              <input value={username} onChange={(e) => setUsername(e.target.value)} autoFocus />
            </div>
            <div>
              <label>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <div>
              <label>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button type="submit" disabled={submitting}>
              {submitting ? 'Creating account…' : 'Create account'}
            </button>
            {error && <div className="error-box">{error}</div>}
          </form>
          <p className="switch-link">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
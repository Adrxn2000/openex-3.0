import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login as loginApi } from '../api/client';
import useAuthStore from '../store/authStore';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const loginToStore = useAuthStore((state) => state.login);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const data = await loginApi(username, password);
      loginToStore(data.token, username);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page auth-page">
      <div className="card login-card">
        <div className="avatar-ring">🔐</div>
        <div className="brand-mark" style={{ textAlign: 'center' }}>Open<span>Ex</span></div>
        <p className="subtitle" style={{ textAlign: 'center', marginBottom: 4 }}>
          Welcome back — sign in to continue
        </p>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Username</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} autoFocus />
          </div>
          <div>
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
          {error && <div className="error-box">{error}</div>}
        </form>
        <p className="switch-link" style={{ textAlign: 'center' }}>
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
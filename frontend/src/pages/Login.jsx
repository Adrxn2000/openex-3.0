import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login as loginApi } from '../api/client';
import useAuthStore from '../store/authStore';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const loginToStore = useAuthStore((state) => state.login);
  const currentUsername = useAuthStore((state) => state.username);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const data = await loginApi(username, password);
      loginToStore(data.token, username);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page">
      <div className="center-card">
        <div className="brand-mark">Open<span>Ex</span></div>
        <p className="subtitle" style={{ marginBottom: 4 }}>
          {currentUsername ? `Signed in as ${currentUsername}` : 'Sign in to your account'}
        </p>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Username</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div>
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit">Login</button>
          {error && <div className="error-box">{error}</div>}
        </form>
        <p className="switch-link">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
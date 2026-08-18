import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api/client';
import useAuthStore from '../store/authStore';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const data = await register(username, password);
      login(data.token, username);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page">
      <div className="center-card">
        <div className="brand-mark">Open<span>Ex</span></div>
        <p className="subtitle" style={{ marginBottom: 4 }}>Create your account</p>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Username</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div>
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit">Register</button>
          {error && <div className="error-box">{error}</div>}
        </form>
        <p className="switch-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    <div>
       <div className="page center-card">
      <h1>Login</h1>
      <p>Currently logged in as: {currentUsername ?? 'nobody'}</p>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username: </label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div>
          <label>Password: </label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button type="submit">Login</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
    </div>
  );
}

export default Login;
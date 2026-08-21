import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import Trading from './pages/Trading.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import NotFound from './pages/NotFound.jsx';
import TickerTape from './components/TickerTape.jsx';
import useAuthStore from './store/authStore';

const BASE_NAV_ITEMS = [
  { to: '/', label: 'Dashboard' },
  { to: '/trading', label: 'Trading' },
];

function NavLinks() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const username = useAuthStore((state) => state.username);
  const logout = useAuthStore((state) => state.logout);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="nav-links">
      {BASE_NAV_ITEMS.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className={location.pathname === item.to ? 'active' : ''}
        >
          {item.label}
        </Link>
      ))}
      {token ? (
        <>
          <span className="nav-username">{username}</span>
          <button onClick={handleLogout} className="nav-logout-btn">
            Log out
          </button>
        </>
      ) : (
        <>
          <Link to="/login" className={location.pathname === '/login' ? 'active' : ''}>
            Login
          </Link>
          <Link to="/register" className={location.pathname === '/register' ? 'active' : ''}>
            Register
          </Link>
        </>
      )}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <nav>
        <div className="nav-left">
          <div className="nav-brand">Open<span>Ex</span></div>
          <span className="status-live">
            <span className="pulse-dot"></span>
            Live
          </span>
        </div>
        <NavLinks />
      </nav>

      <TickerTape />

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/trading" element={<Trading />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
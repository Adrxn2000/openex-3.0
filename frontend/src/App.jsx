import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import Trading from './pages/Trading.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import NotFound from './pages/NotFound.jsx';
import TickerTape from './components/TickerTape.jsx';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard' },
  { to: '/trading', label: 'Trading' },
  { to: '/login', label: 'Login' },
  { to: '/register', label: 'Register' },
];

function NavLinks() {
  const location = useLocation();
  return (
    <div className="nav-links">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className={location.pathname === item.to ? 'active' : ''}
        >
          {item.label}
        </Link>
      ))}
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
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import Trading from './pages/Trading.jsx';
import Login from './pages/Login.jsx';

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Dashboard</Link>
        {' | '}
        <Link to="/trading">Trading</Link>
        {' | '}
        <Link to="/login">Login</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/trading" element={<Trading />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
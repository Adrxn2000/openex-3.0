import { Link } from 'react-router-dom';

// Shown on protected pages (Trading, etc.) when there's no active session.
function AuthGate({ title = "You're not logged in", message = 'Log in to continue.', cta = 'Go to Login' }) {
  return (
    <div className="page">
      <div className="empty-state">
        <div className="empty-icon">🔒</div>
        <h3>{title}</h3>
        <p>{message}</p>
        <Link to="/login" className="btn-link">{cta}</Link>
      </div>
    </div>
  );
}

export default AuthGate;
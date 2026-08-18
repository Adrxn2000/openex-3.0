import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="page">
      <div className="empty-state">
        <div className="empty-icon">🧭</div>
        <h1 style={{ marginTop: 0 }}>404</h1>
        <h3 style={{ marginTop: 0 }}>This page isn't listed</h3>
        <p>The route you're looking for doesn't exist on OpenEx.</p>
        <Link to="/" className="btn-link">Back to Dashboard</Link>
      </div>
    </div>
  );
}

export default NotFound;
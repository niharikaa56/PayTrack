import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-light d-flex flex-column align-items-center justify-content-center p-4">
      <div className="text-center">
        <i className="fa-solid fa-compass-drafting text-primary mb-4" style={{ fontSize: '100px', opacity: 0.8 }}></i>
        <h1 className="display-4 fw-bold text-dark mb-2">404 - Area Uncharted</h1>
        <p className="lead text-muted mb-4">The route or invoice receipt ledger you are seeking does not exist on our servers.</p>
        <Link to="/" className="btn btn-primary rounded-pill px-4.5 py-2.5 fw-bold shadow">
          <i className="fa-solid fa-house me-2"></i>Return to Landing
        </Link>
      </div>
    </div>
  );
}

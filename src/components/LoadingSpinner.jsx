import React from 'react';

export default function LoadingSpinner({ message = 'Loading, please wait...' }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5" style={{ minHeight: '300px' }}>
      <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="text-muted fw-medium">{message}</p>
    </div>
  );
}

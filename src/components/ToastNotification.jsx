import React from 'react';
import { useNotifications } from '../context/NotificationContext';

export default function ToastNotification() {
  const { toasts } = useNotifications();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div 
      className="position-fixed bottom-0 end-0 p-3" 
      style={{ zIndex: 1100, maxWidth: '350px' }}
    >
      {toasts.map((toast) => {
        const bgClass = 
          toast.type === 'success' ? 'bg-success text-white' : 
          toast.type === 'error' ? 'bg-danger text-white' : 
          toast.type === 'warning' ? 'bg-warning text-dark' : 
          'bg-primary text-white';

        return (
          <div 
            key={toast.id} 
            className={`toast show border-0 shadow-lg mb-2`} 
            role="alert" 
            aria-live="assertive" 
            aria-atomic="true"
          >
            <div className={`toast-header ${bgClass} border-0 d-flex justify-content-between py-2 px-3`}>
              <strong className="me-auto fw-bold">
                <i className="fa-solid fa-bell me-2"></i>
                {toast.title}
              </strong>
              <small className="opacity-75">just now</small>
            </div>
            <div className="toast-body bg-white text-dark py-3 px-3 border border-top-0 rounded-bottom fw-medium">
              {toast.message}
            </div>
          </div>
        );
      })}
    </div>
  );
}

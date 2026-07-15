import React from 'react';
import { useNotifications } from '../context/NotificationContext';

export default function Notifications() {
  const { notifications, markAsRead, markAllRead } = useNotifications();

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
        <div>
          <h1 className="fw-bold mb-1">Notifications Hub</h1>
          <p className="text-muted mb-0">Review historic billing updates, dunning cycle reports, and platform alerts.</p>
        </div>
        {notifications.length > 0 && (
          <button 
            type="button" 
            className="btn btn-outline-primary rounded-pill px-4 fw-semibold"
            onClick={markAllRead}
          >
            Clear All Alerts
          </button>
        )}
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-9">
          <div className="card border-0 bg-white rounded-4 shadow-sm p-4">
            {notifications.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <i className="fa-regular fa-bell-slash text-muted opacity-50 mb-3" style={{ fontSize: '60px' }}></i>
                <h5 className="fw-bold mb-1">Inbox Cleared</h5>
                <p className="text-muted small">You don't have any active notification banners or system alerts.</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {notifications.map((notif) => {
                  const iconClass = 
                    notif.type === 'billing' ? 'bg-success-subtle text-success fa-solid fa-credit-card' : 
                    notif.type === 'renewal' ? 'bg-warning-subtle text-warning fa-solid fa-arrows-spin' : 
                    notif.type === 'trial' ? 'bg-info-subtle text-info fa-solid fa-calendar-days' : 
                    'bg-primary-subtle text-primary fa-solid fa-bell';

                  return (
                    <div 
                      key={notif._id} 
                      className={`p-3.5 rounded-4 d-flex justify-content-between align-items-start gap-3 border ${notif.read ? 'bg-white opacity-75' : 'bg-light border-primary-subtle'}`}
                    >
                      <div className="d-flex gap-3 align-items-start">
                        <div className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0`} style={{ width: '45px', height: '45px', minWidth: '45px' }}>
                          <i className={`${iconClass} fs-5`}></i>
                        </div>
                        <div>
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <span className="fw-bold text-dark small text-uppercase">{notif.type} Event</span>
                            <span className="text-muted small" style={{ fontSize: '0.75rem' }}>• {new Date(notif.createdAt || Date.now()).toLocaleDateString()}</span>
                          </div>
                          <h6 className="fw-bold mb-1.5 text-dark">{notif.title}</h6>
                          <p className="text-muted small mb-0">{notif.message}</p>
                        </div>
                      </div>

                      {!notif.read && (
                        <button 
                          type="button" 
                          className="btn btn-sm btn-link text-primary p-0 text-decoration-none fw-bold"
                          onClick={() => markAsRead(notif._id)}
                        >
                          Mark as Read
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

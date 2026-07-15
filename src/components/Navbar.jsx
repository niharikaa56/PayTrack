import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications();
  const navigate = useNavigate();
  
  // React-managed dropdown states for reliability in React
  const [showBillingDropdown, setShowBillingDropdown] = useState(false);
  const [showAdminDropdown, setShowAdminDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/');
    closeAllDropdowns();
  };

  const closeAllDropdowns = () => {
    setShowBillingDropdown(false);
    setShowAdminDropdown(false);
    setShowProfileDropdown(false);
    setShowNotifDropdown(false);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm py-2 sticky-top border-bottom border-secondary-subtle">
      <div className="container">
        {/* Brand Logo - 1 Single Header Logo */}
        <Link 
          className="navbar-brand fw-bold text-primary fs-3 d-flex align-items-center" 
          to={user ? "/dashboard" : "/"}
          onClick={closeAllDropdowns}
        >
          <i className="fa-solid fa-wallet text-primary me-2"></i>
          <span>PayTrack</span>
        </Link>
        
        {/* Mobile Navigation Toggle Button */}
        <button 
          className="navbar-toggler border-0" 
          type="button" 
          onClick={() => setIsNavCollapsed(!isNavCollapsed)}
          aria-controls="paytrackNavbar" 
          aria-expanded={!isNavCollapsed} 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Collapsible Navigation Area */}
        <div className={`collapse navbar-collapse ${isNavCollapsed ? '' : 'show'}`} id="paytrackNavbar">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4 gap-1">
            {user ? (
              <>
                <li className="nav-item">
                  <Link 
                    className="nav-link fw-semibold px-3 py-2 text-dark" 
                    to="/dashboard"
                    onClick={() => { closeAllDropdowns(); setIsNavCollapsed(true); }}
                  >
                    Dashboard
                  </Link>
                </li>
                
                <li className="nav-item">
                  <Link 
                    className="nav-link fw-semibold px-3 py-2 text-dark" 
                    to="/subscriptions"
                    onClick={() => { closeAllDropdowns(); setIsNavCollapsed(true); }}
                  >
                    My Subscriptions
                  </Link>
                </li>
                
                <li className="nav-item">
                  <Link 
                    className="nav-link fw-semibold px-3 py-2 text-dark" 
                    to="/plans"
                    onClick={() => { closeAllDropdowns(); setIsNavCollapsed(true); }}
                  >
                    Plans & Pricing
                  </Link>
                </li>

                {/* Billing & Statements Dropdown */}
                <li className="nav-item dropdown">
                  <button 
                    className="nav-link fw-semibold px-3 py-2 text-dark btn btn-link border-0 align-items-center d-flex gap-1"
                    type="button"
                    onClick={() => {
                      const prev = showBillingDropdown;
                      closeAllDropdowns();
                      setShowBillingDropdown(!prev);
                    }}
                  >
                    <span>Billing & Invoices</span>
                    <i className="fa-solid fa-chevron-down small opacity-70"></i>
                  </button>
                  <ul className={`dropdown-menu border border-secondary-subtle shadow-sm m-0 ${showBillingDropdown ? 'show d-block' : 'd-none'}`} style={{ position: 'absolute' }}>
                    <li>
                      <Link 
                        className="dropdown-item py-2 px-3 fw-medium" 
                        to="/billing"
                        onClick={() => { closeAllDropdowns(); setIsNavCollapsed(true); }}
                      >
                        <i className="fa-solid fa-credit-card text-muted me-2"></i>Billing Methods
                      </Link>
                    </li>
                    <li>
                      <Link 
                        className="dropdown-item py-2 px-3 fw-medium" 
                        to="/invoices"
                        onClick={() => { closeAllDropdowns(); setIsNavCollapsed(true); }}
                      >
                        <i className="fa-solid fa-file-invoice-dollar text-muted me-2"></i>Invoice Lists
                      </Link>
                    </li>
                    <li>
                      <Link 
                        className="dropdown-item py-2 px-3 fw-medium" 
                        to="/payments/history"
                        onClick={() => { closeAllDropdowns(); setIsNavCollapsed(true); }}
                      >
                        <i className="fa-solid fa-history text-muted me-2"></i>Payment History
                      </Link>
                    </li>
                  </ul>
                </li>

                {/* Admin Management Dropdown */}
                {isAdmin && (
                  <li className="nav-item dropdown">
                    <button 
                      className="nav-link fw-bold px-3 py-2 text-danger btn btn-link border-0 align-items-center d-flex gap-1"
                      type="button"
                      onClick={() => {
                        const prev = showAdminDropdown;
                        closeAllDropdowns();
                        setShowAdminDropdown(!prev);
                      }}
                    >
                      <i className="fa-solid fa-shield-halved me-1"></i>
                      <span>Admin Tools</span>
                      <i className="fa-solid fa-chevron-down small opacity-70"></i>
                    </button>
                    <ul className={`dropdown-menu border border-secondary-subtle shadow-sm m-0 ${showAdminDropdown ? 'show d-block' : 'd-none'}`} style={{ position: 'absolute' }}>
                      <li>
                        <Link 
                          className="dropdown-item py-2 px-3 fw-medium text-danger" 
                          to="/admin"
                          onClick={() => { closeAllDropdowns(); setIsNavCollapsed(true); }}
                        >
                          <i className="fa-solid fa-chart-line me-2"></i>Admin Overview
                        </Link>
                      </li>
                      <li>
                        <Link 
                          className="dropdown-item py-2 px-3 fw-medium text-danger" 
                          to="/admin/analytics"
                          onClick={() => { closeAllDropdowns(); setIsNavCollapsed(true); }}
                        >
                          <i className="fa-solid fa-sack-dollar me-2"></i>Revenue Reports
                        </Link>
                      </li>
                      <li>
                        <Link 
                          className="dropdown-item py-2 px-3 fw-medium text-danger" 
                          to="/admin/plans"
                          onClick={() => { closeAllDropdowns(); setIsNavCollapsed(true); }}
                        >
                          <i className="fa-solid fa-sliders me-2"></i>Configure Plans
                        </Link>
                      </li>
                      <li>
                        <Link 
                          className="dropdown-item py-2 px-3 fw-medium text-danger" 
                          to="/admin/users"
                          onClick={() => { closeAllDropdowns(); setIsNavCollapsed(true); }}
                        >
                          <i className="fa-solid fa-users me-2"></i>User Directory
                        </Link>
                      </li>
                    </ul>
                  </li>
                )}
              </>
            ) : (
              <>
                <li className="nav-item">
                  <a className="nav-link fw-semibold px-3 text-dark" href="#features">Features</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link fw-semibold px-3 text-dark" href="#pricing">Pricing</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link fw-semibold px-3 text-dark" href="#testimonials">Testimonials</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link fw-semibold px-3 text-dark" href="#faq">FAQ</a>
                </li>
              </>
            )}
          </ul>

          {/* Right-aligned Profile, Alerts & Actions */}
          <div className="d-flex align-items-center gap-3 ms-auto mt-2 mt-lg-0">
            {user ? (
              <>
                {/* Alerts Notification Indicator */}
                <div className="dropdown position-relative">
                  <button 
                    className="btn btn-light border p-2 rounded-circle position-relative d-flex align-items-center justify-content-center"
                    type="button"
                    onClick={() => {
                      const prev = showNotifDropdown;
                      closeAllDropdowns();
                      setShowNotifDropdown(!prev);
                    }}
                    style={{ width: '40px', height: '40px' }}
                  >
                    <i className="fa-regular fa-bell fs-5 text-dark"></i>
                    {unreadCount > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger shadow-sm" style={{ fontSize: '0.65rem' }}>
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  <ul className={`dropdown-menu dropdown-menu-end border border-secondary-subtle shadow-lg py-2 ${showNotifDropdown ? 'show d-block' : 'd-none'}`} style={{ width: '320px', maxHeight: '400px', overflowY: 'auto', position: 'absolute', right: 0 }}>
                    <li className="px-3 py-2 d-flex justify-content-between align-items-center border-bottom bg-light">
                      <span className="fw-bold text-dark">Notifications</span>
                      {unreadCount > 0 && (
                        <button className="btn btn-sm btn-link text-primary p-0 text-decoration-none fw-semibold" onClick={markAllRead}>
                          Clear All
                        </button>
                      )}
                    </li>
                    {notifications.length === 0 ? (
                      <li className="text-center py-4 text-muted">
                        <i className="fa-regular fa-bell-slash fs-3 mb-2 d-block opacity-50"></i>
                        No active alerts
                      </li>
                    ) : (
                      notifications.slice(0, 5).map((notif) => (
                        <li key={notif._id} className={`px-3 py-2.5 border-bottom notif-item ${notif.read ? 'opacity-75' : 'bg-light fw-semibold'}`}>
                          <div className="d-flex justify-content-between align-items-start mb-1">
                            <span className="text-primary small fw-bold uppercase">
                              {notif.type === 'billing' && <i className="fa-solid fa-credit-card me-1"></i>}
                              {notif.type === 'renewal' && <i className="fa-solid fa-arrows-spin me-1"></i>}
                              {notif.type === 'trial' && <i className="fa-solid fa-calendar-check me-1"></i>}
                              {notif.type === 'system' && <i className="fa-solid fa-triangle-exclamation me-1"></i>}
                              {notif.type}
                            </span>
                            {!notif.read && (
                              <button className="btn p-0 btn-link text-muted" onClick={() => markAsRead(notif._id)}>
                                <i className="fa-solid fa-check small text-success"></i>
                              </button>
                            )}
                          </div>
                          <p className="mb-0 text-dark small" style={{ fontSize: '0.85rem' }}>{notif.message}</p>
                        </li>
                      ))
                    )}
                    <li className="text-center pt-2">
                      <Link 
                        className="dropdown-item text-primary text-center small fw-bold py-1" 
                        to="/notifications"
                        onClick={closeAllDropdowns}
                      >
                        View All Notifications
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Profile Settings Dropdown */}
                <div className="dropdown position-relative">
                  <button 
                    className="btn btn-primary px-3 py-2 fw-semibold rounded-pill d-flex align-items-center gap-2" 
                    type="button" 
                    onClick={() => {
                      const prev = showProfileDropdown;
                      closeAllDropdowns();
                      setShowProfileDropdown(!prev);
                    }}
                  >
                    <i className="fa-solid fa-user-circle fs-5"></i>
                    <span>{user.name}</span>
                    <i className="fa-solid fa-chevron-down small opacity-80"></i>
                  </button>
                  <ul className={`dropdown-menu dropdown-menu-end border border-secondary-subtle shadow-lg mt-2 ${showProfileDropdown ? 'show d-block' : 'd-none'}`} style={{ position: 'absolute', right: 0 }}>
                    <li>
                      <Link 
                        className="dropdown-item py-2 px-3 fw-medium" 
                        to="/profile"
                        onClick={closeAllDropdowns}
                      >
                        <i className="fa-regular fa-id-card me-2 text-primary"></i>My Profile
                      </Link>
                    </li>
                    <li>
                      <Link 
                        className="dropdown-item py-2 px-3 fw-medium" 
                        to="/settings"
                        onClick={closeAllDropdowns}
                      >
                        <i className="fa-solid fa-sliders me-2 text-primary"></i>Preferences
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item py-2 px-3 text-danger fw-bold" onClick={handleLogout}>
                        <i className="fa-solid fa-sign-out-alt me-2"></i>Log Out
                      </button>
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline-primary me-2 px-4 rounded-pill fw-semibold">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary px-4 rounded-pill fw-semibold shadow-sm">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

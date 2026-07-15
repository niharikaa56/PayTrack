import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen, toggleSidebar }) {
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard', icon: 'fa-solid fa-house' },
    { label: 'Plans', path: '/plans', icon: 'fa-solid fa-layer-group' },
    { label: 'Customers', path: '/admin/users', icon: 'fa-solid fa-users' },
    { label: 'Add Subscription', path: '/subscriptions', icon: 'fa-solid fa-plus' },
    { label: 'Subscriptions', path: '/subscriptions', icon: 'fa-solid fa-list' },
    { label: 'Billing History', path: '/payments/history', icon: 'fa-solid fa-credit-card' },
    { label: 'Invoices', path: '/invoices', icon: 'fa-solid fa-file-invoice-dollar' },
    { label: 'Coupons', path: '/plans', icon: 'fa-solid fa-tags' },
    { label: 'Analytics', path: '/admin/analytics', icon: 'fa-solid fa-chart-line' },
    { label: 'Customer Portal', path: '/profile', icon: 'fa-solid fa-user' },
    { label: 'Settings', path: '/settings', icon: 'fa-solid fa-gear' },
  ];

  return (
    <div 
      className={`sidebar bg-primary text-white flex-shrink-0 d-flex flex-column transition-all ${isOpen ? 'd-flex' : 'd-none d-md-flex'}`}
      style={{
        width: '240px',
        minHeight: '100vh',
        boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
        zIndex: 1020,
        position: 'sticky',
        top: 0,
      }}
    >
      {/* Sidebar Header Brand with 1 single PayTrack Logo */}
      <div className="p-4 border-bottom border-white border-opacity-10 d-flex align-items-center justify-content-between">
        <Link className="text-white text-decoration-none fw-bold fs-4 d-flex align-items-center gap-2" to="/dashboard">
          <i className="fa-solid fa-receipt text-white fs-3"></i>
          <span>PayTrack</span>
        </Link>
        {toggleSidebar && (
          <button 
            onClick={toggleSidebar} 
            className="btn btn-link text-white d-md-none p-0 border-0"
            aria-label="Close sidebar"
          >
            <i className="fa-solid fa-xmark fs-5"></i>
          </button>
        )}
      </div>

      {/* Nav Menu */}
      <div className="flex-grow-1 py-3 overflow-y-auto">
        <ul className="nav flex-column gap-1 px-2">
          {menuItems.map((item, idx) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={idx} className="nav-item">
                <Link
                  to={item.path}
                  className={`nav-link d-flex align-items-center gap-3 px-3 py-2.5 text-white transition-all`}
                  style={{
                    borderRadius: '6px',
                    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                    fontWeight: isActive ? '700' : '500',
                    fontSize: '0.95rem',
                    opacity: isActive ? 1 : 0.85,
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <i className={`${item.icon} text-white`} style={{ width: '20px', fontSize: '1.05rem' }}></i>
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Log Out button at the bottom */}
      <div className="p-3 border-top border-white border-opacity-10">
        <button 
          onClick={handleLogout}
          className="btn btn-link text-white text-decoration-none d-flex align-items-center gap-3 px-3 py-2 w-100 transition-all text-start"
          style={{ opacity: 0.85, fontWeight: '500', fontSize: '0.95rem' }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.85'}
        >
          <i className="fa-solid fa-sign-out-alt" style={{ width: '20px', fontSize: '1.05rem' }}></i>
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}

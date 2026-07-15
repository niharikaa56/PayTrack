import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider, useNotifications } from './context/NotificationContext';

// Components
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ToastNotification from './components/ToastNotification.jsx';

// Pages
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import CustomerProfile from './pages/CustomerProfile.jsx';
import SubscriptionList from './pages/SubscriptionList.jsx';
import SubscriptionDetails from './pages/SubscriptionDetails.jsx';
import Plans from './pages/Plans.jsx';
import Billing from './pages/Billing.jsx';
import Invoices from './pages/Invoices.jsx';
import PaymentHistory from './pages/PaymentHistory.jsx';
import Notifications from './pages/Notifications.jsx';
import Settings from './pages/Settings.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import ManageUsers from './pages/ManageUsers.jsx';
import ManagePlans from './pages/ManagePlans.jsx';
import RevenueAnalytics from './pages/RevenueAnalytics.jsx';
import NotFound from './pages/NotFound.jsx';

function AppContent() {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Determine if we should show the sidebar and dashboard top bar
  // Shows only for logged-in users on private pages
  const isPublicRoute = ['/', '/login', '/register'].includes(location.pathname);
  const showDashboardLayout = user && !isPublicRoute;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Trigger user subscription alert or handle search query
      const dashboardMain = document.getElementById('dashboard-main');
      if (dashboardMain) {
        dashboardMain.scrollIntoView({ behavior: 'smooth' });
      }
      setSearchQuery('');
    }
  };

  if (showDashboardLayout) {
    return (
      <div className="d-flex min-vh-screen bg-light overflow-hidden">
        {/* Sidebar on the Left (Solid Blue) */}
        <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(false)} />

        {/* Right side container */}
        <div className="d-flex flex-column flex-grow-1 min-vh-screen overflow-auto" style={{ backgroundColor: '#f4f6f9' }}>
          {/* Top Bar matching second screenshot exactly (no double-branding logo) */}
          <header className="navbar navbar-expand navbar-light bg-white px-4 py-3 border-bottom border-secondary-subtle sticky-top">
            <div className="container-fluid d-flex justify-content-between align-items-center p-0">
              {/* Left side: Mobile menu toggle and Search Input */}
              <div className="d-flex align-items-center gap-3 w-50">
                <button 
                  className="btn btn-outline-primary d-md-none border-0" 
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Open sidebar menu"
                >
                  <i className="fa-solid fa-bars fs-4"></i>
                </button>

                <form onSubmit={handleSearchSubmit} className="d-flex align-items-center w-100" style={{ maxWidth: '400px' }}>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Search Subscription..." 
                    style={{ 
                      borderRadius: '6px 0 0 6px',
                      borderRight: 'none',
                      borderColor: '#dee2e6',
                      height: '42px'
                    }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button 
                    type="submit" 
                    className="btn btn-primary d-flex align-items-center justify-content-center px-3" 
                    style={{ 
                      borderRadius: '0 6px 6px 0',
                      height: '42px'
                    }}
                  >
                    <i className="fa-solid fa-magnifying-glass text-white"></i>
                  </button>
                </form>
              </div>

              {/* Right side: Alerts bell and Profile avatar info */}
              <div className="d-flex align-items-center gap-4">
                {/* Alert bell icon linking to Notifications page */}
                <Link to="/notifications" className="position-relative text-dark text-decoration-none">
                  <i className="fa-solid fa-bell fs-4 opacity-80 hover:opacity-100"></i>
                  {unreadCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-circle bg-danger p-1" style={{ fontSize: '0.55rem' }}>
                      <span className="visually-hidden">unread alerts</span>
                    </span>
                  )}
                </Link>

                {/* Profile Display exactly like screenshot */}
                <Link to="/profile" className="d-flex align-items-center gap-2.5 text-decoration-none text-dark">
                  <div 
                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold text-uppercase shadow-sm border border-white"
                    style={{ width: '40px', height: '40px', fontSize: '1rem' }}
                  >
                    {user.name ? user.name.charAt(0) : 'N'}
                  </div>
                  <div className="d-none d-sm-block text-start lh-sm">
                    <div className="fw-bold text-dark mb-0" style={{ fontSize: '0.95rem' }}>
                      {user.name || 'Niharika'}
                    </div>
                    <div className="text-secondary opacity-75 small" style={{ fontSize: '0.75rem' }}>
                      User
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-grow-1 p-4">
            <div className="container-fluid p-0">
              <Routes>
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <CustomerProfile />
                  </ProtectedRoute>
                } />
                <Route path="/subscriptions" element={
                  <ProtectedRoute>
                    <SubscriptionList />
                  </ProtectedRoute>
                } />
                <Route path="/subscriptions/:id" element={
                  <ProtectedRoute>
                    <SubscriptionDetails />
                  </ProtectedRoute>
                } />
                <Route path="/plans" element={
                  <ProtectedRoute>
                    <Plans />
                  </ProtectedRoute>
                } />
                <Route path="/billing" element={
                  <ProtectedRoute>
                    <Billing />
                  </ProtectedRoute>
                } />
                <Route path="/invoices" element={
                  <ProtectedRoute>
                    <Invoices />
                  </ProtectedRoute>
                } />
                <Route path="/payments/history" element={
                  <ProtectedRoute>
                    <PaymentHistory />
                  </ProtectedRoute>
                } />
                <Route path="/notifications" element={
                  <ProtectedRoute>
                    <Notifications />
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } />

                {/* Protected Administrative Routes */}
                <Route path="/admin" element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin/users" element={
                  <ProtectedRoute adminOnly={true}>
                    <ManageUsers />
                  </ProtectedRoute>
                } />
                <Route path="/admin/plans" element={
                  <ProtectedRoute adminOnly={true}>
                    <ManagePlans />
                  </ProtectedRoute>
                } />
                <Route path="/admin/analytics" element={
                  <ProtectedRoute adminOnly={true}>
                    <RevenueAnalytics />
                  </ProtectedRoute>
                } />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </main>

          <Footer />
          <ToastNotification />
        </div>
      </div>
    );
  }

  // Fallback Public Layout
  return (
    <div className="d-flex flex-column min-vh-screen bg-white">
      {/* Navbar is only rendered for public routes if not already self-contained */}
      {!isPublicRoute && <Navbar />}
      <main className="flex-grow-1 py-0">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Fallback client routes inside public wrapper to prevent routing breaks */}
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute><CustomerProfile /></ProtectedRoute>
          } />
          <Route path="/subscriptions" element={
            <ProtectedRoute><SubscriptionList /></ProtectedRoute>
          } />
          <Route path="/subscriptions/:id" element={
            <ProtectedRoute><SubscriptionDetails /></ProtectedRoute>
          } />
          <Route path="/plans" element={
            <ProtectedRoute><Plans /></ProtectedRoute>
          } />
          <Route path="/billing" element={
            <ProtectedRoute><Billing /></ProtectedRoute>
          } />
          <Route path="/invoices" element={
            <ProtectedRoute><Invoices /></ProtectedRoute>
          } />
          <Route path="/payments/history" element={
            <ProtectedRoute><PaymentHistory /></ProtectedRoute>
          } />
          <Route path="/notifications" element={
            <ProtectedRoute><Notifications /></ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute><Settings /></ProtectedRoute>
          } />
          
          <Route path="/admin" element={
            <ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute adminOnly={true}><ManageUsers /></ProtectedRoute>
          } />
          <Route path="/admin/plans" element={
            <ProtectedRoute adminOnly={true}><ManagePlans /></ProtectedRoute>
          } />
          <Route path="/admin/analytics" element={
            <ProtectedRoute adminOnly={true}><RevenueAnalytics /></ProtectedRoute>
          } />

          {/* Fallback 404 handler */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <ToastNotification />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

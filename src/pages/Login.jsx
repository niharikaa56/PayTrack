import React, { useState } from 'react';
import { Link as RouterLink, useNavigate as useRouterNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export default function Login() {
  const { login, error } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useRouterNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      showToast(`Welcome back, ${user.name}!`, 'success', 'Sign In Succeeded');
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setLocalError(err.message || 'Login failed.');
      showToast('Check your email and password.', 'error', 'Sign In Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (role) => {
    if (role === 'admin') {
      setEmail('admin@paytrack.com');
      setPassword('admin123');
    } else {
      // Prompt will create a new account or we can pre-set a sample customer.
      // If we seed a default customer, that's perfect!
      setEmail('customer@paytrack.com');
      setPassword('customer123');
    }
  };

  return (
    <div className="min-h-screen bg-light d-flex flex-column">
      {/* Exact Brand Navbar matching screenshot */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white py-3 border-bottom border-light">
        <div className="container justify-content-between">
          <RouterLink className="navbar-brand d-flex align-items-center gap-2 no-underline" to="/">
            <div className="text-dark fs-3 d-flex align-items-center">
              <i className="fa-solid fa-receipt text-dark me-2 fs-3"></i>
              <span className="fw-bold text-dark" style={{ letterSpacing: '-0.5px' }}>Pay</span>
              <span className="fw-bold text-primary" style={{ letterSpacing: '-0.5px' }}>Track</span>
            </div>
          </RouterLink>
          <div className="d-flex align-items-center gap-2">
            <RouterLink to="/register" className="btn btn-outline-primary px-4 py-2 fw-semibold" style={{ borderRadius: '6px' }}>
              Signup
            </RouterLink>
          </div>
        </div>
      </nav>

      <div className="container my-auto py-5">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5 col-xl-4">
            <div className="card border border-secondary-subtle shadow-lg p-4 bg-white" style={{ borderRadius: '12px' }}>
              <div className="text-center mb-4">
                <h2 className="fw-bold text-dark mb-1" style={{ letterSpacing: '-0.5px' }}>Welcome Back</h2>
                <p className="text-secondary small">Sign in to manage your subscription expenses.</p>
              </div>

              {(localError || error) && (
                <div className="alert alert-danger py-2 rounded-3 small" role="alert">
                  <i className="fa-solid fa-triangle-exclamation me-2"></i>
                  {localError || error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="loginEmail" className="form-label fw-semibold small text-secondary">Email Address</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0" style={{ borderRadius: '6px 0 0 6px', borderColor: '#cbd5e1' }}><i className="fa-regular fa-envelope text-secondary"></i></span>
                    <input 
                      type="email" 
                      id="loginEmail"
                      className="form-control bg-white border-start-0 py-2" 
                      placeholder="name@company.com"
                      required
                      style={{ borderRadius: '0 6px 6px 0', borderColor: '#cbd5e1' }}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <div className="d-flex justify-content-between mb-1">
                    <label htmlFor="loginPassword" className="form-label fw-semibold small text-secondary mb-0">Password</label>
                    <a href="#forgot" className="small text-decoration-none fw-semibold text-primary">Forgot?</a>
                  </div>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0" style={{ borderRadius: '6px 0 0 6px', borderColor: '#cbd5e1' }}><i className="fa-solid fa-lock text-secondary"></i></span>
                    <input 
                      type="password" 
                      id="loginPassword"
                      className="form-control bg-white border-start-0 py-2" 
                      placeholder="••••••••"
                      required
                      style={{ borderRadius: '0 6px 6px 0', borderColor: '#cbd5e1' }}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary w-100 py-2.5 fw-bold text-white shadow-sm d-flex align-items-center justify-content-center gap-2"
                  style={{ borderRadius: '6px' }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      Signing In...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-sign-in-alt"></i>
                      Sign In
                    </>
                  )}
                </button>
              </form>

              <div className="my-4 text-center position-relative">
                <hr className="text-secondary opacity-25" />
                <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-secondary small fw-bold" style={{ fontSize: '0.75rem' }}>QUICK SEED SIGN IN</span>
              </div>

              <div className="row g-2 mb-4">
                <div className="col-6">
                  <button 
                    type="button" 
                    className="btn btn-outline-danger btn-sm w-100 py-2.5 fw-bold"
                    style={{ borderRadius: '6px' }}
                    onClick={() => handleQuickLogin('admin')}
                  >
                    <i className="fa-solid fa-user-shield me-1"></i>Admin Profile
                  </button>
                </div>
                <div className="col-6">
                  <button 
                    type="button" 
                    className="btn btn-outline-success btn-sm w-100 py-2.5 fw-bold"
                    style={{ borderRadius: '6px' }}
                    onClick={() => handleQuickLogin('customer')}
                  >
                    <i className="fa-solid fa-user me-1"></i>Customer Demo
                  </button>
                </div>
              </div>

              <p className="text-center text-secondary mb-0 small">
                Don't have an account? <RouterLink to="/register" className="fw-semibold text-primary text-decoration-none">Create Account</RouterLink>
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-white py-3 border-top text-center text-muted mt-auto">
        <p className="mb-0 small fw-medium">© 2026 PayTrack Platform. All Rights Reserved.</p>
      </footer>
    </div>
  );
}

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export default function Register() {
  const { register, error } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    company: '',
    phone: '',
    country: 'US'
  });
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleInputChange = (key, val) => {
    setFormData(prev => ({ ...prev, [key]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setLoading(true);

    try {
      const newUser = await register(
        formData.name,
        formData.email,
        formData.password,
        formData.company,
        formData.phone,
        formData.country
      );
      showToast(`Account created! Welcome, ${newUser.name}!`, 'success', 'Registration Complete');
      navigate('/plans'); // Take them directly to select a plan and set up billing!
    } catch (err) {
      setLocalError(err.message || 'Registration failed.');
      showToast('Verify all fields and try again.', 'error', 'Registration Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-light d-flex flex-column">
      {/* Exact Brand Navbar matching screenshot */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white py-3 border-bottom border-light">
        <div className="container justify-content-between">
          <Link className="navbar-brand d-flex align-items-center gap-2 no-underline" to="/">
            <div className="text-dark fs-3 d-flex align-items-center">
              <i className="fa-solid fa-receipt text-dark me-2 fs-3"></i>
              <span className="fw-bold text-dark" style={{ letterSpacing: '-0.5px' }}>Pay</span>
              <span className="fw-bold text-primary" style={{ letterSpacing: '-0.5px' }}>Track</span>
            </div>
          </Link>
          <div className="d-flex align-items-center gap-2">
            <Link to="/login" className="btn btn-primary text-white px-4 py-2 fw-semibold" style={{ borderRadius: '6px' }}>
              Login
            </Link>
          </div>
        </div>
      </nav>

      <div className="container my-auto py-5">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6 col-xl-5">
            <div className="card border border-secondary-subtle shadow-lg p-4 p-md-5 bg-white" style={{ borderRadius: '12px' }}>
              <div className="text-center mb-4">
                <h2 className="fw-bold text-dark mb-1" style={{ letterSpacing: '-0.5px' }}>Create Account</h2>
                <p className="text-secondary small">Begin tracking and optimizing your subscriptions cleanly.</p>
              </div>

              {(localError || error) && (
                <div className="alert alert-danger py-2 rounded-3 small" role="alert">
                  <i className="fa-solid fa-triangle-exclamation me-2"></i>
                  {localError || error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label htmlFor="regName" className="form-label fw-semibold small text-secondary">Full Name</label>
                    <input 
                      type="text" 
                      id="regName"
                      className="form-control bg-white px-3 py-2" 
                      placeholder="Jane Doe"
                      required
                      style={{ borderRadius: '6px', borderColor: '#cbd5e1' }}
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="regEmail" className="form-label fw-semibold small text-secondary">Email Address</label>
                    <input 
                      type="email" 
                      id="regEmail"
                      className="form-control bg-white px-3 py-2" 
                      placeholder="jane@company.com"
                      required
                      style={{ borderRadius: '6px', borderColor: '#cbd5e1' }}
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="regPass" className="form-label fw-semibold small text-secondary">Password</label>
                  <input 
                    type="password" 
                    id="regPass"
                    className="form-control bg-white px-3 py-2" 
                    placeholder="••••••••"
                    required
                    style={{ borderRadius: '6px', borderColor: '#cbd5e1' }}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                  />
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label htmlFor="regCompany" className="form-label fw-semibold small text-secondary">Company Name (Optional)</label>
                    <input 
                      type="text" 
                      id="regCompany"
                      className="form-control bg-white px-3 py-2" 
                      placeholder="Acme Corp"
                      style={{ borderRadius: '6px', borderColor: '#cbd5e1' }}
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="regPhone" className="form-label fw-semibold small text-secondary">Phone Number (Optional)</label>
                    <input 
                      type="tel" 
                      id="regPhone"
                      className="form-control bg-white px-3 py-2" 
                      placeholder="+1 (555) 012-3456"
                      style={{ borderRadius: '6px', borderColor: '#cbd5e1' }}
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="regCountry" className="form-label fw-semibold small text-secondary">Billing Country</label>
                  <select 
                    id="regCountry"
                    className="form-select bg-white px-3 py-2"
                    style={{ borderRadius: '6px', borderColor: '#cbd5e1' }}
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                  >
                    <option value="US">United States (US)</option>
                    <option value="CA">Canada (CA)</option>
                    <option value="GB">United Kingdom (GB)</option>
                    <option value="AU">Australia (AU)</option>
                    <option value="DE">Germany (DE)</option>
                    <option value="IN">India (IN)</option>
                  </select>
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
                      Registering...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-user-plus"></i>
                      Create Account
                    </>
                  )}
                </button>
              </form>

              <p className="text-center text-secondary mt-4 mb-0 small">
                Already registered? <Link to="/login" className="fw-semibold text-primary text-decoration-none">Sign In Instead</Link>
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

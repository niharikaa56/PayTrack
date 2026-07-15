import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export default function CustomerProfile() {
  const { user, updateProfile } = useAuth();
  const { showToast } = useNotifications();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    company: user?.company || '',
    phone: user?.phone || '',
    country: user?.country || 'US',
    emailNotifications: user?.preferences?.emailNotifications ?? true,
    monthlyReports: user?.preferences?.monthlyReports ?? true,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(formData);
      showToast('Profile settings updated successfully!', 'success', 'Profile Saved');
    } catch (err) {
      showToast(err.message || 'Profile update failed.', 'error', 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="border-bottom pb-3 mb-4">
        <h1 className="fw-bold mb-1">Customer Profile</h1>
        <p className="text-muted mb-0">Manage your basic details, company profile, and alert preferences.</p>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <h5 className="fw-bold text-dark mb-4"><i className="fa-regular fa-id-card text-primary me-2"></i>Personal Profile Settings</h5>
            
            <form onSubmit={handleSubmit}>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label htmlFor="profName" className="form-label fw-semibold small text-muted">Full Name</label>
                  <input 
                    type="text" 
                    id="profName"
                    className="form-control bg-light rounded-pill px-3" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="profEmail" className="form-label fw-semibold small text-muted">Email Address (Read-only)</label>
                  <input 
                    type="email" 
                    id="profEmail"
                    className="form-control bg-light rounded-pill px-3" 
                    disabled 
                    value={user?.email || ''} 
                  />
                </div>
              </div>

              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label htmlFor="profCompany" className="form-label fw-semibold small text-muted">Company Name</label>
                  <input 
                    type="text" 
                    id="profCompany"
                    className="form-control bg-light rounded-pill px-3" 
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="profPhone" className="form-label fw-semibold small text-muted">Phone Number</label>
                  <input 
                    type="tel" 
                    id="profPhone"
                    className="form-control bg-light rounded-pill px-3" 
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="mb-4 col-md-6">
                <label htmlFor="profCountry" className="form-label fw-semibold small text-muted">Billing Country</label>
                <select 
                  id="profCountry"
                  className="form-select bg-light rounded-pill px-3"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                >
                  <option value="US">United States (US)</option>
                  <option value="CA">Canada (CA)</option>
                  <option value="GB">United Kingdom (GB)</option>
                  <option value="AU">Australia (AU)</option>
                  <option value="DE">Germany (DE)</option>
                  <option value="IN">India (IN)</option>
                </select>
              </div>

              <hr className="my-4 text-muted opacity-25" />

              <h5 className="fw-bold text-dark mb-3"><i className="fa-regular fa-bell text-primary me-2"></i>Communication Preferences</h5>
              
              <div className="form-check form-switch mb-3">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  role="switch" 
                  id="emailNotifSwitch"
                  checked={formData.emailNotifications}
                  onChange={(e) => setFormData({ ...formData, emailNotifications: e.target.checked })}
                />
                <label className="form-check-label fw-medium text-dark small" htmlFor="emailNotifSwitch">
                  Enable automated email receipts & renewal alerts
                </label>
                <p className="text-muted small mb-0 ms-1" style={{ fontSize: '0.75rem' }}>We'll email you a PDF summary of invoices 48 hours before renew times.</p>
              </div>

              <div className="form-check form-switch mb-4">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  role="switch" 
                  id="reportNotifSwitch"
                  checked={formData.monthlyReports}
                  onChange={(e) => setFormData({ ...formData, monthlyReports: e.target.checked })}
                />
                <label className="form-check-label fw-medium text-dark small" htmlFor="reportNotifSwitch">
                  Enable monthly SaaS license cost reports
                </label>
                <p className="text-muted small mb-0 ms-1" style={{ fontSize: '0.75rem' }}>A monthly digest showing active seat distributions and total cost trends.</p>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary rounded-pill px-4.5 py-2 fw-semibold shadow-sm d-flex align-items-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-cloud-arrow-up"></i>
                    Update Profile
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 bg-white p-4 rounded-4 shadow-sm text-center">
            <div className="rounded-circle bg-primary-subtle text-primary mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
              <i className="fa-regular fa-user fs-1"></i>
            </div>
            <h4 className="fw-bold text-dark mb-1">{user?.name}</h4>
            <span className="badge bg-light text-primary fw-bold text-uppercase px-3 py-1.5 rounded-pill mb-3">{user?.role} ACCOUNT</span>
            <p className="text-muted small mb-0">Registered: {new Date(user?.createdAt || Date.now()).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export default function Settings() {
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

  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });
  const [passLoading, setPassLoading] = useState(false);

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(formData);
      showToast('Settings saved successfully!', 'success', 'Preferences Synced');
    } catch (err) {
      showToast(err.message || 'Saving failed.', 'error', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (passwordForm.next !== passwordForm.confirm) {
      showToast('New passwords do not match.', 'error', 'Validation Error');
      return;
    }
    setPassLoading(true);
    setTimeout(() => {
      showToast('Password updated successfully (simulation).', 'success', 'Security Settings');
      setPasswordForm({ current: '', next: '', confirm: '' });
      setPassLoading(false);
    }, 1000);
  };

  return (
    <div className="container py-4">
      <div className="border-bottom pb-3 mb-4">
        <h1 className="fw-bold mb-1">Preferences & Security</h1>
        <p className="text-muted mb-0">Control communication channels, password hashes, and user settings.</p>
      </div>

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card border-0 bg-white p-4 rounded-4 shadow-sm">
            <h5 className="fw-bold text-dark mb-4"><i className="fa-solid fa-gears text-primary me-2"></i>Account Configurations</h5>
            
            <form onSubmit={handleSubmitProfile}>
              <div className="mb-3">
                <label htmlFor="setNames" className="form-label fw-semibold small text-muted">Full Name</label>
                <input 
                  type="text" 
                  id="setNames"
                  className="form-control bg-light rounded-pill px-3" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="setCompany" className="form-label fw-semibold small text-muted">Company Name</label>
                <input 
                  type="text" 
                  id="setCompany"
                  className="form-control bg-light rounded-pill px-3" 
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>

              <div className="mb-4">
                <label htmlFor="setCountry" className="form-label fw-semibold small text-muted">Billing Territory</label>
                <select 
                  id="setCountry"
                  className="form-select bg-light rounded-pill px-3"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                >
                  <option value="US">United States (US)</option>
                  <option value="CA">Canada (CA)</option>
                  <option value="GB">United Kingdom (GB)</option>
                  <option value="AU">Australia (AU)</option>
                  <option value="IN">India (IN)</option>
                </select>
              </div>

              <h6 className="fw-bold text-dark mb-3"><i className="fa-solid fa-envelope-open-text text-primary me-2"></i>Subscriptions Alerts</h6>
              
              <div className="form-check mb-2">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  id="notifPref1" 
                  checked={formData.emailNotifications}
                  onChange={(e) => setFormData({ ...formData, emailNotifications: e.target.checked })}
                />
                <label className="form-check-label text-dark small" htmlFor="notifPref1">
                  Send email 48 hours prior to monthly billing renewal.
                </label>
              </div>

              <div className="form-check mb-4">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  id="notifPref2" 
                  checked={formData.monthlyReports}
                  onChange={(e) => setFormData({ ...formData, monthlyReports: e.target.checked })}
                />
                <label className="form-check-label text-dark small" htmlFor="notifPref2">
                  Send comprehensive monthly subscription expense reports.
                </label>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary rounded-pill px-4 py-2 fw-bold shadow-sm"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save General Settings'}
              </button>
            </form>
          </div>
        </div>

        {/* Password Security section */}
        <div className="col-lg-6">
          <div className="card border-0 bg-white p-4 rounded-4 shadow-sm h-100">
            <h5 className="fw-bold text-dark mb-4"><i className="fa-solid fa-shield-halved text-primary me-2"></i>Security credentials</h5>
            
            <form onSubmit={handleChangePassword}>
              <div className="mb-3">
                <label htmlFor="curPass" className="form-label fw-semibold small text-muted">Current Password</label>
                <input 
                  type="password" 
                  id="curPass"
                  className="form-control bg-light rounded-pill px-3" 
                  required
                  placeholder="••••••••"
                  value={passwordForm.current}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="newPass" className="form-label fw-semibold small text-muted">New Password</label>
                <input 
                  type="password" 
                  id="newPass"
                  className="form-control bg-light rounded-pill px-3" 
                  required
                  placeholder="Minimum 8 characters"
                  value={passwordForm.next}
                  onChange={(e) => setPasswordForm({ ...passwordForm, next: e.target.value })}
                />
              </div>

              <div className="mb-4">
                <label htmlFor="confPass" className="form-label fw-semibold small text-muted">Confirm New Password</label>
                <input 
                  type="password" 
                  id="confPass"
                  className="form-control bg-light rounded-pill px-3" 
                  required
                  placeholder="••••••••"
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-outline-danger rounded-pill px-4 py-2 fw-bold"
                disabled={passLoading}
              >
                {passLoading ? 'Updating credentials...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

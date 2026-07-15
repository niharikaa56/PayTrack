import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

export default function Billing() {
  const { user, updateProfile } = useAuth();
  const { showToast } = useNotifications();

  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [cardData, setCardData] = useState({
    brand: user?.paymentMethod?.brand || 'Visa',
    last4: user?.paymentMethod?.last4 || '4242',
    expiry: user?.paymentMethod?.expiry || '12/28'
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [retryLoading, setRetryLoading] = useState(null); // stores paymentId currently retrying

  const loadBillingData = async () => {
    try {
      const res = await api.get('/payments/history');
      setPayments(res.data);
    } catch (err) {
      console.error('Failed to load billing metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBillingData();
  }, []);

  const handleUpdateCard = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    try {
      const res = await api.put('/payments/method', cardData);
      showToast(res.data.message, 'success', 'Payment Method Updated');
    } catch (err) {
      showToast('Card update failed.', 'error', 'Error');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleRetryPayment = async (paymentId) => {
    setRetryLoading(paymentId);
    try {
      const res = await api.post('/payments/retry', { paymentId });
      showToast(res.data.message, 'success', 'Payment Recovered');
      await loadBillingData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Smart retry failed. Card declined.', 'error', 'Gateway decline');
      await loadBillingData(); // refresh retry count on table
    } finally {
      setRetryLoading(null);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Querying credit gateway details..." />;
  }

  // Check if there are any failed/past due payments to alert user
  const hasFailedPayment = payments.some(p => p.status === 'failed');

  return (
    <div className="container py-4">
      <div className="border-bottom pb-3 mb-4">
        <h1 className="fw-bold mb-1">Billing & Dunning</h1>
        <p className="text-muted mb-0">Update credit details, verify invoice balances, and trigger smart retries.</p>
      </div>

      {hasFailedPayment && (
        <div className="alert alert-danger py-3 px-4 rounded-4 shadow-sm mb-4 d-flex align-items-center gap-3">
          <i className="fa-solid fa-triangle-exclamation fs-3 text-danger"></i>
          <div>
            <span className="fw-bold d-block text-danger-emphasis">Action Required: Billing Decline Active</span>
            <small className="text-muted">
              Our automated smart retry system detected a declined charge. Please verify your card details below and click **Retry Payment** in the history ledger to restore services.
            </small>
          </div>
        </div>
      )}

      <div className="row g-4 mb-5">
        {/* Card visualization card */}
        <div className="col-lg-6">
          <div className="card border-0 bg-dark text-white rounded-4 shadow p-4 d-flex flex-column justify-content-between position-relative overflow-hidden" style={{ minHeight: '220px' }}>
            <div className="position-absolute end-0 bottom-0 opacity-10" style={{ transform: 'translate(10%, 10%)' }}>
              <i className="fa-solid fa-credit-card" style={{ fontSize: '180px' }}></i>
            </div>
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <span className="text-uppercase small fw-bold tracking-widest text-secondary opacity-75">PayTrack Primary Card</span>
                <h4 className="fw-bold mt-1 text-white">{cardData.brand.toUpperCase()}</h4>
              </div>
              <i className="fa-solid fa-wifi fs-4 opacity-75"></i>
            </div>

            <div>
              <h3 className="font-mono text-white mb-3" style={{ letterSpacing: '2px' }}>
                ••••  ••••  ••••  {cardData.last4}
              </h3>
              <div className="d-flex justify-content-between align-items-center small opacity-75">
                <div>
                  <span className="d-block text-uppercase" style={{ fontSize: '0.65rem' }}>Cardholder</span>
                  <span className="fw-bold text-white">{user?.name}</span>
                </div>
                <div>
                  <span className="d-block text-uppercase" style={{ fontSize: '0.65rem' }}>Expires</span>
                  <span className="fw-bold text-white font-mono">{cardData.expiry}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card update form */}
        <div className="col-lg-6">
          <div className="card border-0 bg-white shadow-sm rounded-4 p-4 h-100">
            <h5 className="fw-bold text-dark mb-3"><i className="fa-regular fa-credit-card text-primary me-2"></i>Update Saved Payment Details</h5>
            <form onSubmit={handleUpdateCard}>
              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label htmlFor="billBrand" className="form-label fw-semibold small text-muted">Card Brand</label>
                  <select 
                    id="billBrand"
                    className="form-select bg-light rounded-pill px-3 py-2"
                    value={cardData.brand}
                    onChange={(e) => setCardData({ ...cardData, brand: e.target.value })}
                  >
                    <option value="Visa">Visa</option>
                    <option value="Mastercard">Mastercard</option>
                    <option value="Amex">American Express</option>
                    <option value="Discover">Discover</option>
                  </select>
                </div>
                <div className="col-6">
                  <label htmlFor="billLast4" className="form-label fw-semibold small text-muted">Last 4 Digits</label>
                  <input 
                    type="text" 
                    id="billLast4"
                    maxLength="4"
                    className="form-control bg-light rounded-pill px-3 py-2" 
                    placeholder="4242"
                    required
                    value={cardData.last4}
                    onChange={(e) => setCardData({ ...cardData, last4: e.target.value.replace(/\D/g,'') })}
                  />
                </div>
              </div>

              <div className="mb-4 col-6">
                <label htmlFor="billExp" className="form-label fw-semibold small text-muted">Expiry Date (MM/YY)</label>
                <input 
                  type="text" 
                  id="billExp"
                  maxLength="5"
                  className="form-control bg-light rounded-pill px-3 py-2" 
                  placeholder="12/28"
                  required
                  value={cardData.expiry}
                  onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary rounded-pill px-4 py-2 fw-bold shadow-sm"
                disabled={updateLoading}
              >
                {updateLoading ? 'Saving Card...' : 'Update Primary Card'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Transaction History with retry capability */}
      <div className="card border-0 bg-white rounded-4 shadow-sm">
        <div className="card-body p-4">
          <h5 className="fw-bold mb-4 text-dark"><i className="fa-solid fa-list-check text-primary me-2"></i>Transaction Audits & Dunning Ledger</h5>
          
          {payments.length === 0 ? (
            <p className="text-muted small mb-0">No active charges on record.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0 text-dark">
                <thead className="table-light">
                  <tr className="small text-muted border-bottom">
                    <th className="py-3">Reference Code</th>
                    <th className="py-3">Method</th>
                    <th className="py-3">Amount</th>
                    <th className="py-3">Status</th>
                    <th className="py-3">Retry Counts</th>
                    <th className="py-3 text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => {
                    const isFailed = p.status === 'failed';
                    return (
                      <tr key={p._id} className="small">
                        <td className="py-3.5">
                          <div className="fw-bold font-mono">{p.transactionId || 'TXN-Direct'}</div>
                          <div className="text-muted small" style={{ fontSize: '0.75rem' }}>{new Date(p.createdAt).toLocaleDateString()}</div>
                        </td>
                        <td className="py-3.5 text-muted">{p.paymentMethod}</td>
                        <td className="py-3.5 fw-bold">${p.amount}</td>
                        <td className="py-3.5">
                          <span className={`badge rounded-pill ${p.status === 'success' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                            {p.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3.5 text-muted fw-bold">
                          {p.retryCount || 0} / 3 Attempts
                        </td>
                        <td className="py-3.5 text-end">
                          {isFailed ? (
                            <button 
                              type="button" 
                              className="btn btn-sm btn-outline-danger rounded-pill px-3 fw-bold shadow-sm"
                              disabled={retryLoading === p._id}
                              onClick={() => handleRetryPayment(p._id)}
                            >
                              {retryLoading === p._id ? (
                                <span className="spinner-border spinner-border-sm me-1"></span>
                              ) : (
                                <i className="fa-solid fa-arrows-spin me-1"></i>
                              )}
                              Smart Retry
                            </button>
                          ) : (
                            <span className="text-muted small fw-semibold"><i className="fa-solid fa-check text-success me-1"></i>Settled</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

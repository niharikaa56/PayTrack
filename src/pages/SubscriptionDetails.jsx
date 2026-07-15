import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNotifications } from '../context/NotificationContext';

export default function SubscriptionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useNotifications();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [subLoading, setSubLoading] = useState(false);

  const fetchDetails = async () => {
    try {
      const res = await api.get(`/subscriptions/${id}`);
      setData(res.data);
    } catch (err) {
      console.error('Failed to load subscription details:', err);
      showToast('Could not load subscription details.', 'error', 'Error');
      navigate('/subscriptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleCancelSub = async (instant) => {
    setSubLoading(true);
    try {
      const res = await api.post('/subscriptions/cancel', { instant });
      showToast(res.data.message, 'success', 'Cancelled Successfully');
      await fetchDetails();
    } catch (err) {
      showToast(err.response?.data?.message || 'Cancellation failed', 'error', 'Error');
    } finally {
      setSubLoading(false);
    }
  };

  const handleResumeSub = async () => {
    setSubLoading(true);
    try {
      const res = await api.post('/subscriptions/resume');
      showToast(res.data.message, 'success', 'Resumed Successfully');
      await fetchDetails();
    } catch (err) {
      showToast(err.response?.data?.message || 'Resume failed', 'error', 'Error');
    } finally {
      setSubLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Reassembling subscription ledger..." />;
  }

  const { subscription, plan, payments, invoices } = data;

  const isActive = subscription.status === 'active' || subscription.status === 'trial';
  const isCanceled = subscription.status === 'canceled';

  return (
    <div className="container py-4">
      {/* Header breadcrumbs */}
      <div className="mb-4 border-bottom pb-3">
        <Link to="/subscriptions" className="btn btn-sm btn-outline-secondary rounded-pill px-3 mb-3 text-decoration-none">
          <i className="fa-solid fa-arrow-left me-1"></i>Back to Subscriptions
        </Link>
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <h1 className="fw-bold mb-1">Manage Subscription</h1>
            <p className="text-muted mb-0">Invoice Ledger Number: <span className="font-mono">{subscription._id}</span></p>
          </div>
          <div className="d-flex gap-2">
            {!isCanceled && subscription.cancelAtPeriodEnd && (
              <button 
                type="button" 
                className="btn btn-success rounded-pill px-3.5 fw-semibold shadow-sm"
                disabled={subLoading}
                onClick={handleResumeSub}
              >
                {subLoading ? <span className="spinner-border spinner-border-sm me-1"></span> : <i className="fa-solid fa-arrows-spin me-2"></i>}
                Resume Auto-Renew
              </button>
            )}
            {!isCanceled && !subscription.cancelAtPeriodEnd && (
              <button 
                type="button" 
                className="btn btn-outline-danger rounded-pill px-3.5 fw-semibold"
                disabled={subLoading}
                onClick={() => handleCancelSub(false)}
              >
                {subLoading ? <span className="spinner-border spinner-border-sm me-1"></span> : <i className="fa-solid fa-pause me-2"></i>}
                Turn Off Auto-Renew
              </button>
            )}
            {!isCanceled && (
              <button 
                type="button" 
                className="btn btn-danger rounded-pill px-3.5 fw-semibold"
                disabled={subLoading}
                onClick={() => handleCancelSub(true)}
              >
                {subLoading ? <span className="spinner-border spinner-border-sm me-1"></span> : <i className="fa-solid fa-ban me-2"></i>}
                Cancel Instantly
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Plan Specs Column */}
        <div className="col-lg-5">
          <div className="card border-0 bg-white shadow-sm p-4 rounded-4 h-100">
            <h5 className="fw-bold mb-4"><i className="fa-solid fa-cube text-primary me-2"></i>Plan Specifications</h5>
            <div className="d-flex align-items-center gap-3 mb-4">
              <div className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                <i className="fa-solid fa-gem fs-4"></i>
              </div>
              <div>
                <h4 className="fw-bold mb-1">{plan.name}</h4>
                <p className="mb-0 text-muted fw-bold">${plan.price} / {plan.billingCycle}</p>
              </div>
            </div>

            <div className="alert bg-light border-0 py-2 rounded-3 small mb-4">
              <div className="row g-2">
                <div className="col-6 text-muted">Subscription Status:</div>
                <div className="col-6 text-dark fw-bold text-uppercase">{subscription.status}</div>
                <div className="col-6 text-muted">Created:</div>
                <div className="col-6 text-dark fw-bold">{new Date(subscription.startDate).toLocaleDateString()}</div>
                <div className="col-6 text-muted">Current Cycle Starts:</div>
                <div className="col-6 text-dark fw-bold">{new Date(subscription.currentPeriodStart).toLocaleDateString()}</div>
                <div className="col-6 text-muted">Current Cycle Ends:</div>
                <div className="col-6 text-dark fw-bold">{new Date(subscription.currentPeriodEnd).toLocaleDateString()}</div>
              </div>
            </div>

            <h6 className="fw-bold mb-3 text-dark">Included Seat Licenses & Limits:</h6>
            <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
              <li className="d-flex justify-content-between border-bottom pb-1.5 text-muted small">
                <span>Allowed User Logins:</span>
                <span className="fw-semibold text-dark">{plan.usageLimit?.users === 999 ? 'Unlimited' : plan.usageLimit?.users}</span>
              </li>
              <li className="d-flex justify-content-between border-bottom pb-1.5 text-muted small">
                <span>Active Trackers:</span>
                <span className="fw-semibold text-dark">{plan.usageLimit?.projects === 999 ? 'Unlimited' : plan.usageLimit?.projects}</span>
              </li>
              <li className="d-flex justify-content-between text-muted small">
                <span>API Calls quota / mo:</span>
                <span className="fw-semibold text-dark">{plan.usageLimit?.apiCalls.toLocaleString()}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Dynamic transaction billing tables */}
        <div className="col-lg-7">
          <div className="d-flex flex-column gap-4">
            
            {/* Invoice list */}
            <div className="card border-0 bg-white shadow-sm rounded-4">
              <div className="card-header bg-white border-0 pt-4 px-4 pb-0 d-flex justify-content-between align-items-center">
                <h5 className="fw-bold mb-0"><i className="fa-solid fa-file-invoice text-primary me-2"></i>Invoice Ledger Receipts</h5>
                <Link to="/invoices" className="btn btn-link text-primary p-0 text-decoration-none small fw-semibold">
                  All Invoices
                </Link>
              </div>
              <div className="card-body p-4">
                {invoices.length === 0 ? (
                  <p className="text-muted small mb-0">No active invoice ledger copies emitted.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-borderless table-hover align-middle mb-0 py-2">
                      <thead>
                        <tr className="border-bottom small text-muted">
                          <th>Invoice No</th>
                          <th>Total due</th>
                          <th>Date Issued</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoices.map((inv) => (
                          <tr key={inv._id} className="small">
                            <td>
                              <Link className="fw-bold text-primary text-decoration-none" to={`/invoices/${inv._id}`}>{inv.invoiceNumber}</Link>
                            </td>
                            <td className="fw-bold">${inv.total}</td>
                            <td>{new Date(inv.createdAt).toLocaleDateString()}</td>
                            <td>
                              <span className={`badge rounded-pill ${inv.status === 'paid' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'}`}>
                                {inv.status.toUpperCase()}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Payment history list */}
            <div className="card border-0 bg-white shadow-sm rounded-4">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-4 text-dark"><i className="fa-solid fa-wallet text-primary me-2"></i>Linked Transaction Audits</h5>
                {payments.length === 0 ? (
                  <p className="text-muted small mb-0 font-medium">No active credit transfers recorded.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-borderless table-hover align-middle mb-0">
                      <thead>
                        <tr className="border-bottom small text-muted">
                          <th>Reference Code</th>
                          <th>Method</th>
                          <th>Transferred</th>
                          <th>Transfer Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map((p) => (
                          <tr key={p._id} className="small">
                            <td className="font-mono text-dark fw-medium">{p.transactionId || 'TX-Webhook'}</td>
                            <td>{p.paymentMethod}</td>
                            <td className="fw-bold">${p.amount}</td>
                            <td>
                              <span className={`badge rounded-pill ${p.status === 'success' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                                {p.status.toUpperCase()}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

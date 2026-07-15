import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function SubscriptionList() {
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState([]);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const res = await api.get('/subscriptions');
        setSubscriptions(res.data);
      } catch (err) {
        console.error('Error fetching subscription list:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Scanning subscription directories..." />;
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
        <div>
          <h1 className="fw-bold mb-1">My Subscriptions</h1>
          <p className="text-muted mb-0">View subscription history, active packages, and upcoming renewal schedules.</p>
        </div>
        <Link to="/plans" className="btn btn-primary rounded-pill px-4.5 fw-semibold shadow-sm">
          <i className="fa-solid fa-plus me-2"></i>Add Subscription
        </Link>
      </div>

      {subscriptions.length === 0 ? (
        <div className="card border-0 shadow-sm p-5 text-center bg-white rounded-4">
          <i className="fa-solid fa-folder-open text-muted mb-3" style={{ fontSize: '60px', opacity: 0.5 }}></i>
          <h4 className="fw-bold">No Active Subscriptions</h4>
          <p className="text-muted mb-4">You are not currently subscribed to any pricing plans.</p>
          <div className="d-flex justify-content-center">
            <Link to="/plans" className="btn btn-primary rounded-pill px-4 fw-semibold shadow">
              Browse Plans & Catalog
            </Link>
          </div>
        </div>
      ) : (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 py-2">
              <thead className="table-light border-bottom">
                <tr className="small text-muted fw-bold">
                  <th className="ps-4 py-3">Plan Package</th>
                  <th className="py-3">Current Period</th>
                  <th className="py-3">Status</th>
                  <th className="py-3">Auto-Renew</th>
                  <th className="py-3 text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub) => {
                  const statusClass = 
                    sub.status === 'active' ? 'bg-success text-success-emphasis' :
                    sub.status === 'trial' ? 'bg-info text-info-emphasis' :
                    sub.status === 'past_due' ? 'bg-warning text-warning-emphasis' :
                    'bg-secondary text-secondary-emphasis';

                  return (
                    <tr key={sub._id}>
                      <td className="ps-4 py-3.5">
                        <div className="d-flex align-items-center gap-3">
                          <div className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                            <i className="fa-solid fa-cube"></i>
                          </div>
                          <div>
                            <h6 className="fw-bold mb-0 text-dark">{sub.planDetails?.name || 'Unknown Plan'}</h6>
                            <span className="small text-muted fw-semibold">
                              ${sub.planDetails?.price || 0} / {sub.planDetails?.billingCycle === 'yearly' ? 'yr' : 'mo'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 small text-dark fw-medium">
                        {new Date(sub.currentPeriodStart).toLocaleDateString()} - {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                      </td>
                      <td className="py-3.5">
                        <span className={`badge rounded-pill px-3 py-1.5 small fw-bold ${statusClass}`}>
                          {sub.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3.5 fw-medium text-dark">
                        {sub.cancelAtPeriodEnd ? (
                          <span className="text-danger small fw-bold">
                            <i className="fa-solid fa-circle-xmark me-1"></i>Ends on {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-success small fw-bold">
                            <i className="fa-solid fa-circle-check me-1"></i>Active Auto-renew
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 text-end pe-4">
                        <Link to={`/subscriptions/${sub._id}`} className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-semibold">
                          <i className="fa-solid fa-eye me-1"></i>Manage details
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

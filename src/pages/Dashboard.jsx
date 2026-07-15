import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNotifications } from '../context/NotificationContext';

export default function Dashboard() {
  const { showToast, fetchNotifications } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [simWebHookLoading, setSimWebHookLoading] = useState(false);
  
  // Local state for tracked user-subscriptions (persisted in localStorage for robust reliability)
  const [userSubs, setUserSubs] = useState(() => {
    const saved = localStorage.getItem('paytrack_user_subscriptions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing subscriptions from localStorage', e);
      }
    }
    // Default pre-populated list which matches the second screenshot mathematically
    return [
      { id: '1', service: 'Netflix', plan: 'Premium', amount: 649, status: 'Active' },
      { id: '2', service: 'Spotify', plan: 'Student', amount: 59, status: 'Active' },
      { id: '3', service: 'Amazon Prime', plan: 'Monthly', amount: 299, status: 'Renew Soon' },
      { id: '4', service: 'Disney+ Hotstar', plan: 'Super', amount: 149, status: 'Expired' },
      { id: '5', service: 'YouTube Premium', plan: 'Individual', amount: 129, status: 'Active' },
      { id: '6', service: 'iCloud', plan: '50GB', amount: 75, status: 'Active' },
      { id: '7', service: 'GitHub Copilot', plan: 'Monthly', amount: 299, status: 'Expired' },
      { id: '8', service: 'Adobe Express', plan: 'Monthly', amount: 588, status: 'Active' }
    ];
  });

  // Save to localStorage when changed
  useEffect(() => {
    localStorage.setItem('paytrack_user_subscriptions', JSON.stringify(userSubs));
  }, [userSubs]);

  // Form states for adding a subscription
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSub, setNewSub] = useState({
    service: '',
    plan: '',
    amount: '',
    status: 'Active'
  });

  // Form states for editing a subscription
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    service: '',
    plan: '',
    amount: '',
    status: 'Active'
  });

  // Calculate live statistics based on the tracked list
  const totalSubscriptions = userSubs.length;
  const activePlansCount = userSubs.filter(s => s.status === 'Active' || s.status === 'Renew Soon').length;
  const expiredCount = userSubs.filter(s => s.status === 'Expired').length;
  
  // Total monthly cost: sum of Active or Renew Soon subscriptions
  const monthlyCost = userSubs
    .filter(s => s.status === 'Active' || s.status === 'Renew Soon')
    .reduce((sum, s) => sum + Number(s.amount || 0), 0);

  // Simulates a Stripe Webhook Event
  const simulateWebhook = async (event, payloadData) => {
    setSimWebHookLoading(true);
    try {
      await api.post('/invoices/webhook', {
        event,
        data: payloadData
      });
      showToast(`Triggered simulated webhook event: ${event}`, 'info', 'Stripe Webhook Sync');
      setTimeout(async () => {
        await fetchNotifications();
        setSimWebHookLoading(false);
      }, 1000);
    } catch (err) {
      showToast('Webhook simulation failed.', 'error', 'Simulation Error');
      setSimWebHookLoading(false);
    }
  };

  // Add a new subscription
  const handleAddSub = (e) => {
    e.preventDefault();
    if (!newSub.service || !newSub.amount) {
      showToast('Please provide a service name and amount.', 'error', 'Form Error');
      return;
    }

    const added = {
      id: String(Date.now()),
      service: newSub.service,
      plan: newSub.plan || 'Standard',
      amount: Number(newSub.amount),
      status: newSub.status
    };

    setUserSubs([added, ...userSubs]);
    setNewSub({ service: '', plan: '', amount: '', status: 'Active' });
    setShowAddModal(false);
    showToast(`${added.service} subscription added successfully!`, 'success', 'Added Tracker');
  };

  // Start editing
  const startEdit = (sub) => {
    setEditingId(sub.id);
    setEditForm({
      service: sub.service,
      plan: sub.plan,
      amount: sub.amount,
      status: sub.status
    });
  };

  // Save edit
  const handleSaveEdit = (id) => {
    const updated = userSubs.map(s => {
      if (s.id === id) {
        return {
          ...s,
          service: editForm.service,
          plan: editForm.plan,
          amount: Number(editForm.amount),
          status: editForm.status
        };
      }
      return s;
    });
    setUserSubs(updated);
    setEditingId(null);
    showToast('Subscription updated successfully!', 'success', 'Updated Tracker');
  };

  // Delete subscription
  const handleDeleteSub = (id, name) => {
    if (window.confirm(`Are you sure you want to remove the ${name} subscription?`)) {
      setUserSubs(userSubs.filter(s => s.id !== id));
      showToast(`${name} removed.`, 'info', 'Removed Tracker');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Assembling your financial dashboard..." />;
  }

  return (
    <div className="py-2" id="dashboard-main">
      {/* Title block */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold text-dark mb-1" style={{ fontSize: '2rem' }}>Welcome Back 👋</h1>
          <p className="text-secondary mb-0">Here is the real-time overview of your tracked utility and SaaS subscriptions.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)} 
          className="btn btn-primary px-4 py-2.5 fw-semibold text-white d-flex align-items-center gap-2 shadow-sm"
          style={{ borderRadius: '6px' }}
        >
          <i className="fa-solid fa-plus"></i>
          <span>Add Subscription</span>
        </button>
      </div>

      {/* 4 Premium Cards Row in solid vibrant flat styling (as shown in second screenshot) */}
      <div className="row g-4 mb-4">
        {/* Total Subscriptions (Blue) */}
        <div className="col-xl-3 col-sm-6">
          <div className="bg-primary text-white p-4 d-flex justify-content-between align-items-center relative" style={{ borderRadius: '12px', minHeight: '130px' }}>
            <div>
              <div className="text-uppercase fw-bold small opacity-90 mb-1" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>Total Subscriptions</div>
              <div className="display-5 fw-bold">{totalSubscriptions}</div>
            </div>
            <i className="fa-solid fa-layer-group text-white opacity-40" style={{ fontSize: '2.5rem' }}></i>
          </div>
        </div>

        {/* Active Plans (Green) */}
        <div className="col-xl-3 col-sm-6">
          <div className="bg-success text-white p-4 d-flex justify-content-between align-items-center" style={{ borderRadius: '12px', minHeight: '130px' }}>
            <div>
              <div className="text-uppercase fw-bold small opacity-90 mb-1" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>Active Plans</div>
              <div className="display-5 fw-bold">{activePlansCount}</div>
            </div>
            <i className="fa-solid fa-circle-check text-white opacity-40" style={{ fontSize: '2.5rem' }}></i>
          </div>
        </div>

        {/* Expired (Red) */}
        <div className="col-xl-3 col-sm-6">
          <div className="bg-danger text-white p-4 d-flex justify-content-between align-items-center" style={{ borderRadius: '12px', minHeight: '130px' }}>
            <div>
              <div className="text-uppercase fw-bold small opacity-90 mb-1" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>Expired</div>
              <div className="display-5 fw-bold">{expiredCount}</div>
            </div>
            <i className="fa-solid fa-circle-xmark text-white opacity-40" style={{ fontSize: '2.5rem' }}></i>
          </div>
        </div>

        {/* Monthly Cost (Golden Amber) */}
        <div className="col-xl-3 col-sm-6">
          <div className="p-4 d-flex justify-content-between align-items-center text-white" style={{ borderRadius: '12px', minHeight: '130px', backgroundColor: '#f1b000' }}>
            <div>
              <div className="text-uppercase fw-bold small opacity-90 mb-1" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>Monthly Cost</div>
              <div className="display-5 fw-bold">₹{monthlyCost}</div>
            </div>
            <i className="fa-solid fa-indian-rupee-sign text-white opacity-40" style={{ fontSize: '2.5rem' }}></i>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Column Recent Subscriptions Table, Right Column Upcoming list & Budget Progress */}
      <div className="row g-4">
        {/* Left column: Recent Subscriptions table */}
        <div className="col-lg-8">
          <div className="card border border-secondary-subtle bg-white shadow-sm" style={{ borderRadius: '12px' }}>
            <div className="card-header bg-white border-bottom border-light px-4 py-3.5 d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0 text-dark">Recent Subscriptions</h5>
              <span className="badge bg-light text-secondary border fw-semibold px-2.5 py-1.5" style={{ borderRadius: '6px' }}>Manage Catalog</span>
            </div>

            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead>
                    <tr className="text-secondary small border-bottom" style={{ backgroundColor: '#fcfcfc' }}>
                      <th className="ps-4 py-3 text-uppercase fw-bold" style={{ fontSize: '0.75rem' }}>Service</th>
                      <th className="py-3 text-uppercase fw-bold" style={{ fontSize: '0.75rem' }}>Plan</th>
                      <th className="py-3 text-uppercase fw-bold" style={{ fontSize: '0.75rem' }}>Amount</th>
                      <th className="py-3 text-uppercase fw-bold" style={{ fontSize: '0.75rem' }}>Status</th>
                      <th className="py-3 text-end pe-4 text-uppercase fw-bold" style={{ fontSize: '0.75rem' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userSubs.map((sub) => {
                      const isEditing = editingId === sub.id;

                      // Badge styles matching the screenshot precisely
                      let statusBadge = '';
                      if (sub.status === 'Active') {
                        statusBadge = 'bg-success text-white';
                      } else if (sub.status === 'Renew Soon') {
                        statusBadge = 'bg-warning text-dark';
                      } else {
                        statusBadge = 'bg-danger text-white';
                      }

                      return (
                        <tr key={sub.id} className="border-bottom border-light">
                          {/* Service Name */}
                          <td className="ps-4 py-3.5">
                            {isEditing ? (
                              <input 
                                type="text" 
                                className="form-control form-control-sm"
                                value={editForm.service}
                                onChange={(e) => setEditForm({ ...editForm, service: e.target.value })}
                              />
                            ) : (
                              <div className="fw-semibold text-dark fs-6">{sub.service}</div>
                            )}
                          </td>

                          {/* Plan Name */}
                          <td className="py-3.5">
                            {isEditing ? (
                              <input 
                                type="text" 
                                className="form-control form-control-sm"
                                value={editForm.plan}
                                onChange={(e) => setEditForm({ ...editForm, plan: e.target.value })}
                              />
                            ) : (
                              <span className="text-secondary fw-medium">{sub.plan}</span>
                            )}
                          </td>

                          {/* Amount */}
                          <td className="py-3.5">
                            {isEditing ? (
                              <div className="input-group input-group-sm" style={{ maxWidth: '110px' }}>
                                <span className="input-group-text">₹</span>
                                <input 
                                  type="number" 
                                  className="form-control"
                                  value={editForm.amount}
                                  onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                                />
                              </div>
                            ) : (
                              <span className="fw-bold text-dark">₹{sub.amount}</span>
                            )}
                          </td>

                          {/* Status Badge */}
                          <td className="py-3.5">
                            {isEditing ? (
                              <select 
                                className="form-select form-select-sm"
                                value={editForm.status}
                                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                              >
                                <option value="Active">Active</option>
                                <option value="Renew Soon">Renew Soon</option>
                                <option value="Expired">Expired</option>
                              </select>
                            ) : (
                              <span className={`badge px-3 py-1.5 fw-bold`} style={{ borderRadius: '6px', backgroundColor: sub.status === 'Active' ? '#198754' : sub.status === 'Renew Soon' ? '#ffc107' : '#dc3545', color: sub.status === 'Renew Soon' ? '#111' : '#fff' }}>
                                {sub.status}
                              </span>
                            )}
                          </td>

                          {/* Action Buttons */}
                          <td className="py-3.5 text-end pe-4">
                            {isEditing ? (
                              <div className="d-flex justify-content-end gap-1">
                                <button onClick={() => handleSaveEdit(sub.id)} className="btn btn-sm btn-success text-white px-2.5 py-1">
                                  Save
                                </button>
                                <button onClick={() => setEditingId(null)} className="btn btn-sm btn-outline-secondary px-2.5 py-1">
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="d-flex justify-content-end gap-2">
                                <button 
                                  onClick={() => startEdit(sub)} 
                                  className="btn btn-sm btn-outline-primary border-0 p-1.5"
                                  title="Edit amount or status"
                                >
                                  <i className="fa-solid fa-pen-to-square"></i>
                                </button>
                                <button 
                                  onClick={() => handleDeleteSub(sub.id, sub.service)} 
                                  className="btn btn-sm btn-outline-danger border-0 p-1.5"
                                  title="Delete subscription"
                                >
                                  <i className="fa-solid fa-trash-can"></i>
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Upcoming Payments & Monthly Budget indicator */}
        <div className="col-lg-4">
          {/* Upcoming Payments */}
          <div className="card border border-secondary-subtle bg-white shadow-sm mb-4" style={{ borderRadius: '12px' }}>
            <div className="card-header bg-white border-bottom border-light px-4 py-3.5">
              <h5 className="fw-bold mb-0 text-dark">Upcoming Payments</h5>
            </div>
            <div className="card-body px-4 py-3">
              <div className="d-flex flex-column gap-3">
                {userSubs.filter(s => s.status === 'Active' || s.status === 'Renew Soon').slice(0, 4).map((sub) => (
                  <div key={sub.id} className="d-flex justify-content-between align-items-center py-1">
                    <span className="text-secondary fw-semibold fs-6">{sub.service}</span>
                    <span className="text-primary fw-bold fs-6">₹{sub.amount}</span>
                  </div>
                ))}
              </div>

              <hr className="my-4 text-secondary-subtle" />

              {/* Monthly Budget bar with exact matching color */}
              <div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fw-bold text-dark small">Monthly Budget</span>
                  <span className="text-success fw-bold small">75%</span>
                </div>
                <div className="progress" style={{ height: '10px', borderRadius: '5px', backgroundColor: '#e9ecef' }}>
                  <div 
                    className="progress-bar bg-success" 
                    role="progressbar" 
                    style={{ width: '75%', borderRadius: '5px' }} 
                    aria-valuenow="75" 
                    aria-valuemin="0" 
                    aria-valuemax="100"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick instructions widget card */}
          <div className="card border border-secondary-subtle bg-light p-4" style={{ borderRadius: '12px' }}>
            <h6 className="fw-bold text-dark mb-2">
              <i className="fa-solid fa-circle-info text-primary me-2"></i>Smart Spend Alerts
            </h6>
            <p className="text-secondary small mb-0" style={{ lineHeight: '1.5' }}>
              Your Monthly spend is calculated in real-time. If any active subscription renews, PayTrack sends automated SMS & WhatsApp reminders to help you prevent zombie SaaS leakage.
            </p>
          </div>
        </div>
      </div>

      {/* Hidden Webhook Tools Collapsible Trigger (For engineering compliance and manual tests) */}
      <div className="mt-5 border-top border-light pt-4">
        <p className="text-muted small d-flex align-items-center gap-2">
          <i className="fa-solid fa-gears text-secondary"></i>
          <span>Engineering Utilities:</span>
          <button 
            className="btn btn-link btn-sm text-secondary p-0 fw-semibold text-decoration-none"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#webhookCollapse"
            aria-expanded="false"
            aria-controls="webhookCollapse"
          >
            Show/Hide Webhook Simulation Tools
          </button>
        </p>

        <div className="collapse" id="webhookCollapse">
          <div className="card border-secondary-subtle bg-light p-4 mt-2" style={{ borderRadius: '12px' }}>
            <h6 className="fw-bold text-dark mb-2">Simulate Live Stripe Payment Webhooks</h6>
            <p className="text-secondary small mb-4">
              Trigger instant simulated backend events to verify webhooks, notification pipelines, and retry triggers.
            </p>
            <div className="d-flex flex-wrap gap-2">
              <button 
                type="button" 
                className="btn btn-sm btn-success text-white px-3 py-2 fw-semibold"
                disabled={simWebHookLoading}
                onClick={() => simulateWebhook('payment_intent.succeeded', {
                  email: 'customer@paytrack.com',
                  amount: 49,
                  subscriptionId: 'simulated-webhook'
                })}
                style={{ borderRadius: '6px' }}
              >
                <i className="fa-solid fa-play me-2"></i>Simulate Succeeded Charge ($49)
              </button>
              <button 
                type="button" 
                className="btn btn-sm btn-danger text-white px-3 py-2 fw-semibold"
                disabled={simWebHookLoading}
                onClick={() => simulateWebhook('invoice.payment_failed', {
                  email: 'customer@paytrack.com',
                  subscriptionId: 'simulated-webhook',
                  reason: 'Insufficient funds on credit card'
                })}
                style={{ borderRadius: '6px' }}
              >
                <i className="fa-solid fa-bug me-2"></i>Simulate Failed Charge (Past Due)
              </button>
            </div>
            {simWebHookLoading && (
              <div className="text-start mt-3">
                <span className="spinner-border spinner-border-sm text-primary me-2" role="status"></span>
                <span className="text-secondary small">Invoking backend webhook controllers...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Subscription Modal Dialog */}
      {showAddModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 p-2" style={{ borderRadius: '14px' }}>
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-dark">Add New Subscription</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)} aria-label="Close"></button>
              </div>
              <form onSubmit={handleAddSub}>
                <div className="modal-body py-3">
                  <div className="mb-3">
                    <label className="form-label fw-bold text-secondary small">Service Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      required 
                      placeholder="e.g. Netflix, Disney+, Spotify"
                      style={{ borderRadius: '6px' }}
                      value={newSub.service}
                      onChange={(e) => setNewSub({ ...newSub, service: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold text-secondary small">Plan Tier</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. Premium, Student, Super"
                      style={{ borderRadius: '6px' }}
                      value={newSub.plan}
                      onChange={(e) => setNewSub({ ...newSub, plan: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold text-secondary small">Monthly Amount (₹)</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      required 
                      placeholder="e.g. 649, 299, 149"
                      style={{ borderRadius: '6px' }}
                      value={newSub.amount}
                      onChange={(e) => setNewSub({ ...newSub, amount: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold text-secondary small">Subscription Status</label>
                    <select 
                      className="form-select"
                      style={{ borderRadius: '6px' }}
                      value={newSub.status}
                      onChange={(e) => setNewSub({ ...newSub, status: e.target.value })}
                    >
                      <option value="Active">Active</option>
                      <option value="Renew Soon">Renew Soon</option>
                      <option value="Expired">Expired</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-outline-secondary px-3" style={{ borderRadius: '6px' }} onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary text-white px-4" style={{ borderRadius: '6px' }}>Save Tracker</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

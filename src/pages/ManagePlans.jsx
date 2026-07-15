import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNotifications } from '../context/NotificationContext';

export default function ManagePlans() {
  const { showToast } = useNotifications();

  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  
  // Form states
  const [editingPlan, setEditingPlan] = useState(null); // stores plan object when editing
  const [showForm, setShowForm] = useState(false);
  const [formFields, setFormFields] = useState({
    name: '',
    price: '',
    billingCycle: 'monthly',
    description: '',
    featuresText: '', // split on newline
    trialDays: '0',
    active: true,
    usersLimit: '5',
    projectsLimit: '25',
    apiLimit: '10000'
  });

  const loadPlans = async () => {
    try {
      const res = await api.get('/plans/admin');
      setPlans(res.data);
    } catch (err) {
      console.error('Failed to load corporate plan listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleEditClick = (plan) => {
    setEditingPlan(plan);
    setFormFields({
      name: plan.name,
      price: plan.price.toString(),
      billingCycle: plan.billingCycle,
      description: plan.description,
      featuresText: plan.features.join('\n'),
      trialDays: plan.trialDays.toString(),
      active: plan.active,
      usersLimit: plan.usageLimit?.users.toString() || '1',
      projectsLimit: plan.usageLimit?.projects.toString() || '5',
      apiLimit: plan.usageLimit?.apiCalls.toString() || '1000'
    });
    setShowForm(true);
  };

  const handleCreateClick = () => {
    setEditingPlan(null);
    setFormFields({
      name: '',
      price: '',
      billingCycle: 'monthly',
      description: '',
      featuresText: 'Premium license key\nPrioritized response desk\nComprehensive metric reporting',
      trialDays: '7',
      active: true,
      usersLimit: '5',
      projectsLimit: '20',
      apiLimit: '10000'
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name: formFields.name,
      price: Number(formFields.price),
      billingCycle: formFields.billingCycle,
      description: formFields.description,
      features: formFields.featuresText.split('\n').filter(line => line.trim() !== ''),
      trialDays: Number(formFields.trialDays),
      active: formFields.active,
      usageLimit: {
        users: Number(formFields.usersLimit),
        projects: Number(formFields.projectsLimit),
        apiCalls: Number(formFields.apiLimit)
      }
    };

    try {
      if (editingPlan) {
        await api.put(`/plans/${editingPlan._id}`, payload);
        showToast('Plan specifications updated successfully!', 'success', 'Catalog Modified');
      } else {
        await api.post('/plans', payload);
        showToast('Brand new plan package compiled successfully!', 'success', 'Package Cataloged');
      }
      setShowForm(false);
      setEditingPlan(null);
      await loadPlans();
    } catch (err) {
      showToast(err.response?.data?.message || 'Transaction compilation failed', 'error', 'Error');
      setLoading(false);
    }
  };

  const handleDeletePlan = async (planId) => {
    if (!window.confirm('Are you sure you want to deactivate/deprecate this plan?')) return;
    setLoading(true);
    try {
      await api.delete(`/plans/${planId}`);
      showToast('Plan catalog item marked inactive successfully.', 'warning', 'Catalog Deprecated');
      await loadPlans();
    } catch (err) {
      showToast('Action failed.', 'error', 'Error');
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Consulting plan parameters catalog..." />;
  }

  return (
    <div className="container py-4">
      {/* Admin header */}
      <div className="mb-4 border-bottom pb-3">
        <Link to="/admin" className="btn btn-sm btn-outline-danger rounded-pill px-3 mb-3 text-decoration-none">
          <i className="fa-solid fa-arrow-left me-1"></i>Back to Admin Dashboard
        </Link>
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <h1 className="fw-bold mb-1 text-danger">Compile Product Packages</h1>
            <p className="text-muted mb-0">Create new pricing models, edit specifications, or soft-deprecate license catalog items.</p>
          </div>
          {!showForm && (
            <button 
              type="button" 
              className="btn btn-danger rounded-pill px-4 fw-bold shadow-sm"
              onClick={handleCreateClick}
            >
              <i className="fa-solid fa-plus-circle me-1.5"></i>Compile New Plan
            </button>
          )}
        </div>
      </div>

      {showForm ? (
        /* Create / Edit Plan Form Card */
        <div className="card border-0 bg-white rounded-4 shadow-sm p-4 p-md-5 mb-5">
          <div className="d-flex justify-content-between border-bottom pb-3 mb-4">
            <h4 className="fw-bold mb-0 text-dark">
              {editingPlan ? `Edit Specifications: ${editingPlan.name}` : 'Compile New Package Plan'}
            </h4>
            <button type="button" className="btn-close" onClick={() => setShowForm(false)}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label fw-bold small text-muted">Plan Package Title</label>
                <input 
                  type="text" 
                  className="form-control bg-light rounded-pill px-3 py-2"
                  placeholder="Enterprise Elite"
                  required
                  value={formFields.name}
                  onChange={(e) => setFormFields({ ...formFields, name: e.target.value })}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label fw-bold small text-muted">Price ($ USD)</label>
                <input 
                  type="number" 
                  className="form-control bg-light rounded-pill px-3 py-2"
                  placeholder="99"
                  required
                  value={formFields.price}
                  onChange={(e) => setFormFields({ ...formFields, price: e.target.value })}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label fw-bold small text-muted">Billing Frequency</label>
                <select 
                  className="form-select bg-light rounded-pill px-3 py-2"
                  value={formFields.billingCycle}
                  onChange={(e) => setFormFields({ ...formFields, billingCycle: e.target.value })}
                >
                  <option value="monthly">Monthly Cycle</option>
                  <option value="yearly">Yearly Cycle</option>
                </select>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold small text-muted">Short Descriptive Summary</label>
              <input 
                type="text" 
                className="form-control bg-light rounded-pill px-3 py-2"
                placeholder="Ideal for professional scaling organizations requiring custom SLA desk support."
                required
                value={formFields.description}
                onChange={(e) => setFormFields({ ...formFields, description: e.target.value })}
              />
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <label className="form-label fw-bold small text-muted">Seat Licenses (Users Limit)</label>
                <input 
                  type="number" 
                  className="form-control bg-light rounded-pill px-3 py-2"
                  required
                  value={formFields.usersLimit}
                  onChange={(e) => setFormFields({ ...formFields, usersLimit: e.target.value })}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-bold small text-muted">Project Trackers Limit</label>
                <input 
                  type="number" 
                  className="form-control bg-light rounded-pill px-3 py-2"
                  required
                  value={formFields.projectsLimit}
                  onChange={(e) => setFormFields({ ...formFields, projectsLimit: e.target.value })}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-bold small text-muted">API Queries Limit / mo</label>
                <input 
                  type="number" 
                  className="form-control bg-light rounded-pill px-3 py-2"
                  required
                  value={formFields.apiLimit}
                  onChange={(e) => setFormFields({ ...formFields, apiLimit: e.target.value })}
                />
              </div>
            </div>

            <div className="row g-3 mb-4">
              <div className="col-md-8">
                <label className="form-label fw-bold small text-muted">Key Marketing Features (one per line)</label>
                <textarea 
                  className="form-control bg-light rounded-4 px-3 py-2"
                  rows="4"
                  placeholder="Premium licensing key&#10;SLA dedicated support&#10;Full workspace dashboard controls"
                  required
                  value={formFields.featuresText}
                  onChange={(e) => setFormFields({ ...formFields, featuresText: e.target.value })}
                ></textarea>
              </div>
              <div className="col-md-4">
                <div className="mb-3">
                  <label className="form-label fw-bold small text-muted">Free Trial Interval (Days)</label>
                  <input 
                    type="number" 
                    className="form-control bg-light rounded-pill px-3 py-2"
                    required
                    value={formFields.trialDays}
                    onChange={(e) => setFormFields({ ...formFields, trialDays: e.target.value })}
                  />
                </div>
                <div className="form-check form-switch mt-4">
                  <input 
                    className="form-check-input text-danger" 
                    type="checkbox" 
                    role="switch" 
                    id="planActiveSwitch"
                    checked={formFields.active}
                    onChange={(e) => setFormFields({ ...formFields, active: e.target.checked })}
                  />
                  <label className="form-check-label fw-bold text-dark small" htmlFor="planActiveSwitch">
                    Publish Plan (Visible to Customers)
                  </label>
                </div>
              </div>
            </div>

            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-danger rounded-pill px-4.5 py-2 fw-bold shadow-sm">
                <i className="fa-solid fa-square-check me-1.5"></i>Commit Specs
              </button>
              <button type="button" className="btn btn-outline-secondary rounded-pill px-4 py-2" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {/* Catalog items list */}
      <div className="row g-4">
        {plans.map((plan) => (
          <div className="col-md-6 col-lg-4" key={plan._id}>
            <div className={`card h-100 rounded-4 p-4 shadow-sm border-0 bg-white d-flex flex-column justify-content-between border-top border-5 ${plan.active ? 'border-success-subtle' : 'border-danger-subtle'}`}>
              <div>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h4 className="fw-bold mb-0 text-dark">{plan.name}</h4>
                  <span className={`badge rounded-pill small px-2.5 py-1 ${plan.active ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                    {plan.active ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>
                <h5 className="fw-bold text-dark mb-2">${plan.price} <span className="small text-muted">/{plan.billingCycle}</span></h5>
                <p className="text-muted small mb-4">{plan.description}</p>
                <hr className="my-3 text-muted opacity-25" />
                <h6 className="fw-bold small text-muted text-uppercase mb-2.5">Quotas limit specifications:</h6>
                <div className="alert bg-light border-0 py-2 rounded-3 small d-flex flex-column gap-1 mb-0">
                  <div className="d-flex justify-content-between text-muted">
                    <span>User Logins:</span>
                    <span className="fw-bold text-dark">{plan.usageLimit?.users}</span>
                  </div>
                  <div className="d-flex justify-content-between text-muted">
                    <span>Logged Trackers:</span>
                    <span className="fw-bold text-dark">{plan.usageLimit?.projects}</span>
                  </div>
                  <div className="d-flex justify-content-between text-muted">
                    <span>API Injections / mo:</span>
                    <span className="fw-bold text-dark">{plan.usageLimit?.apiCalls.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="d-flex gap-2 pt-4">
                <button 
                  type="button" 
                  className="btn btn-sm btn-outline-danger rounded-pill flex-grow-1 fw-bold"
                  onClick={() => handleEditClick(plan)}
                >
                  <i className="fa-solid fa-pen-to-square me-1"></i>Edit specs
                </button>
                {plan.active && (
                  <button 
                    type="button" 
                    className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                    onClick={() => handleDeletePlan(plan._id)}
                  >
                    <i className="fa-solid fa-eye-slash"></i>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

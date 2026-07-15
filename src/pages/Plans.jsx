import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

export default function Plans() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [activeSub, setActiveSub] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Mock Billing details for checkout modal
  const [cardDetails, setCardDetails] = useState({ brand: 'Visa', last4: '4242', expiry: '12/28' });

  const loadPlans = async () => {
    try {
      const res = await api.get('/plans');
      setPlans(res.data);
      
      const subRes = await api.get('/subscriptions/active');
      setActiveSub(subRes.data);
    } catch (err) {
      console.error('Error loading plans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode) return;
    setCouponError('');
    setCouponLoading(true);
    try {
      const res = await api.get(`/coupons/validate/${couponCode.toUpperCase()}`);
      setCouponApplied(res.data);
      showToast(`Coupon applied! ${res.data.discountValue}% discount successfully mapped.`, 'success', 'Promo Code Validated');
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Invalid promo code');
      setCouponApplied(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleCheckout = async (plan) => {
    setCheckoutLoading(true);
    try {
      if (activeSub) {
        // Upgrade / Downgrade proration flow
        const res = await api.post('/subscriptions/change', {
          newPlanId: plan._id,
          couponCode: couponApplied ? couponApplied.code : null
        });
        showToast(res.data.message, 'success', 'Subscription Updated');
      } else {
        // Fresh creation flow
        const res = await api.post('/subscriptions', {
          planId: plan._id,
          couponCode: couponApplied ? couponApplied.code : null,
          paymentMethodDetails: cardDetails
        });
        showToast('Subscription active! Enjoy your new access.', 'success', 'Activated!');
      }
      navigate('/dashboard');
    } catch (err) {
      showToast(err.response?.data?.message || 'Transaction failed', 'error', 'Card Declined');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Consulting plan indexes..." />;
  }

  return (
    <div className="container py-4">
      <div className="border-bottom pb-3 mb-4 text-center text-md-start">
        <h1 className="fw-bold mb-1">Select a Subscription Plan</h1>
        <p className="text-muted mb-0">Browse packages. Adjust seats, and apply promotional coupons instantly.</p>
      </div>

      {activeSub && (
        <div className="alert alert-info py-3 px-4 rounded-4 shadow-sm mb-5 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <span className="fw-bold fs-5 text-info-emphasis d-block">
              <i className="fa-solid fa-circle-info me-2"></i>Active License Registered: {activeSub.planDetails?.name}
            </span>
            <small className="text-muted">
              We will automatically compute **proration credit** for any unused days in your previous plan and subtract it from your upgrade total!
            </small>
          </div>
          <span className="badge bg-primary text-white px-3 py-2 rounded-pill fw-bold font-mono">
            ${activeSub.planDetails?.price} / {activeSub.planDetails?.billingCycle}
          </span>
        </div>
      )}

      {/* Promocodes selector form */}
      <div className="row g-4 mb-5 justify-content-center">
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm p-4 rounded-4 bg-white">
            <h6 className="fw-bold text-dark mb-3">
              <i className="fa-solid fa-tags text-primary me-2"></i>Have an active Coupon Code?
            </h6>
            <form onSubmit={handleApplyCoupon} className="d-flex gap-2">
              <input 
                type="text" 
                placeholder="Type SAVE20 or HALFPRICE" 
                className="form-control rounded-pill px-3"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
              />
              <button 
                type="submit" 
                className="btn btn-primary px-4 rounded-pill fw-semibold shadow-sm"
                disabled={couponLoading}
              >
                {couponLoading ? 'Verifying...' : 'Apply Code'}
              </button>
            </form>
            {couponApplied && (
              <p className="text-success small fw-semibold mt-2 mb-0">
                <i className="fa-solid fa-circle-check me-1"></i>Applied: {couponApplied.code} ({couponApplied.discountValue}% Off!)
              </p>
            )}
            {couponError && (
              <p className="text-danger small fw-semibold mt-2 mb-0">
                <i className="fa-solid fa-circle-xmark me-1"></i>{couponError}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Plans catalog display */}
      <div className="row justify-content-center g-4">
        {plans.map((plan) => {
          const isCurrent = activeSub && String(activeSub.planId) === String(plan._id);
          const hasTrial = plan.trialDays > 0;
          
          let priceAfterPromo = plan.price;
          if (couponApplied) {
            priceAfterPromo = plan.price - (plan.price * couponApplied.discountValue) / 100;
          }

          return (
            <div className="col-md-6 col-lg-4" key={plan._id}>
              <div className={`card h-100 rounded-4 p-4 shadow-sm border-0 bg-white d-flex flex-column justify-content-between position-relative ${isCurrent ? 'border-primary border-2' : ''}`}>
                {isCurrent && (
                  <span className="position-absolute top-0 start-50 translate-middle badge rounded-pill bg-primary px-3 py-1.5 fw-bold text-uppercase" style={{ fontSize: '0.65rem' }}>
                    YOUR CURRENT PLAN
                  </span>
                )}
                
                <div>
                  <h4 className="fw-bold mb-1">{plan.name}</h4>
                  <div className="d-flex align-items-baseline mb-3 gap-1">
                    {couponApplied ? (
                      <>
                        <span className="fs-5 text-muted text-decoration-line-through">${plan.price}</span>
                        <span className="display-6 fw-bold text-success">${priceAfterPromo.toFixed(2)}</span>
                      </>
                    ) : (
                      <span className="display-6 fw-bold text-dark">${plan.price}</span>
                    )}
                    <span className="text-muted small">/{plan.billingCycle === 'yearly' ? 'yr' : 'mo'}</span>
                  </div>
                  <p className="text-muted small mb-4">{plan.description}</p>
                  
                  {hasTrial && !activeSub && (
                    <span className="badge bg-success-subtle text-success px-3 py-1.5 rounded-pill fw-bold small d-block text-center mb-4">
                      🎁 Includes {plan.trialDays}-day Free Trial!
                    </span>
                  )}

                  <hr className="my-3 text-muted opacity-25" />
                  
                  <h6 className="fw-bold text-dark mb-2.5 small text-uppercase">Limits & Features:</h6>
                  <ul className="list-unstyled d-flex flex-column gap-2 mb-4">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="small d-flex align-items-center gap-2">
                        <i className="fa-solid fa-check text-success"></i>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-3">
                  {isCurrent ? (
                    <button className="btn btn-outline-secondary w-100 rounded-pill fw-bold py-2" disabled>
                      Plan Active
                    </button>
                  ) : (
                    <button 
                      className={`btn w-100 rounded-pill fw-bold py-2 ${activeSub ? 'btn-outline-primary' : 'btn-primary shadow-sm'}`}
                      onClick={() => handleCheckout(plan)}
                      disabled={checkoutLoading}
                    >
                      {checkoutLoading ? (
                        <span className="spinner-border spinner-border-sm"></span>
                      ) : activeSub ? (
                        'Confirm Upgrade / Downgrade'
                      ) : (
                        'Subscribe and Start'
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

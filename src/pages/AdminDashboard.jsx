import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import DashboardCard from '../components/DashboardCard';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const res = await api.get('/analytics/admin');
        setMetrics(res.data);
      } catch (err) {
        console.error('Failed to load administrative analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Reassembling corporate ledger analytics..." />;
  }

  return (
    <div className="container py-4">
      {/* Admin header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3 border-bottom pb-3">
        <div>
          <h1 className="fw-bold mb-1 text-danger">
            <i className="fa-solid fa-gauge-high me-2"></i>Admin Dashboard
          </h1>
          <p className="text-muted mb-0">System-wide monitoring of recurring revenue pools, dunning states, and customer directories.</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/admin/plans" className="btn btn-outline-danger btn-sm rounded-pill px-3 fw-bold">
            <i className="fa-solid fa-box-archive me-1.5"></i>Manage Plans
          </Link>
          <Link to="/admin/users" className="btn btn-outline-danger btn-sm rounded-pill px-3 fw-bold">
            <i className="fa-solid fa-users-gear me-1.5"></i>Manage Users
          </Link>
          <Link to="/admin/analytics" className="btn btn-outline-danger btn-sm rounded-pill px-3 fw-bold">
            <i className="fa-solid fa-chart-line me-1.5"></i>Revenue Charts
          </Link>
        </div>
      </div>

      {/* Corporate specs grids */}
      <div className="row g-4 mb-4">
        <div className="col-md-6 col-lg-3">
          <DashboardCard 
            title="Monthly Recurring Revenue"
            value={`$${metrics.mrr.toLocaleString()}`}
            icon="fa-solid fa-chart-line"
            iconBg="bg-danger-subtle text-danger"
            subtitle="MRR dynamic pool value"
            trend="+12.4%"
            trendColor="text-success"
          />
        </div>
        <div className="col-md-6 col-lg-3">
          <DashboardCard 
            title="Average Revenue Per User"
            value={`$${metrics.arpu.toLocaleString()}`}
            icon="fa-solid fa-user-tag"
            iconBg="bg-info-subtle text-info"
            subtitle="ARPU metric value"
            trend="Stable"
            trendColor="text-muted"
          />
        </div>
        <div className="col-md-6 col-lg-3">
          <DashboardCard 
            title="Active Seats Tracked"
            value={metrics.activeSubscriptions}
            icon="fa-solid fa-server"
            iconBg="bg-success-subtle text-success"
            subtitle="Active license accounts"
            trend="+3.2%"
            trendColor="text-success"
          />
        </div>
        <div className="col-md-6 col-lg-3">
          <DashboardCard 
            title="Churn Ratio Estimate"
            value={`${metrics.churnRate}%`}
            icon="fa-solid fa-user-slash"
            iconBg="bg-warning-subtle text-warning"
            subtitle="Canceled vs total subs"
            trend="-0.5% drops"
            trendColor="text-success"
          />
        </div>
      </div>

      <div className="row g-4">
        {/* Quick admin controls links panel */}
        <div className="col-lg-4">
          <div className="card border-0 bg-white shadow-sm rounded-4 h-100">
            <div className="card-body p-4 d-flex flex-column justify-content-between">
              <div>
                <h5 className="fw-bold text-dark mb-2">Administrative Hub</h5>
                <p className="text-muted small mb-4">Select an entry point below to audit or make administrative adjustments to user registries, features catalog, or pricing tiers.</p>
              </div>

              <div className="d-flex flex-column gap-2">
                <Link to="/admin/plans" className="btn btn-light rounded-4 py-3 px-3.5 text-start fw-bold text-dark d-flex justify-content-between align-items-center">
                  <span><i className="fa-solid fa-boxes-packing text-danger me-2.5"></i>Catalog pricing & plans</span>
                  <i className="fa-solid fa-chevron-right text-muted small"></i>
                </Link>
                <Link to="/admin/users" className="btn btn-light rounded-4 py-3 px-3.5 text-start fw-bold text-dark d-flex justify-content-between align-items-center">
                  <span><i className="fa-solid fa-user-group text-danger me-2.5"></i>Customer accounts directory</span>
                  <i className="fa-solid fa-chevron-right text-muted small"></i>
                </Link>
                <Link to="/admin/analytics" className="btn btn-light rounded-4 py-3 px-3.5 text-start fw-bold text-dark d-flex justify-content-between align-items-center">
                  <span><i className="fa-solid fa-file-invoice-dollar text-danger me-2.5"></i>Revenue analytics visualizers</span>
                  <i className="fa-solid fa-chevron-right text-muted small"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Recent system-wide transaction table */}
        <div className="col-lg-8">
          <div className="card border-0 bg-white shadow-sm rounded-4">
            <div className="card-header bg-white border-0 pt-4 px-4 pb-0 d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0">Recent Corporate Sales</h5>
              <span className="badge bg-danger-subtle text-danger fw-bold px-2.5 py-1">Real-time ledger</span>
            </div>
            <div className="card-body p-4">
              {metrics.recentPayments?.length === 0 ? (
                <p className="text-muted small mb-0">No sales transactions logged yet.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead>
                      <tr className="border-bottom small text-muted">
                        <th className="py-2.5">Subscriber</th>
                        <th className="py-2.5">Plan Package</th>
                        <th className="py-2.5">Transferred</th>
                        <th className="py-2.5 text-end">Settled On</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.recentPayments?.map((p) => (
                        <tr key={p._id} className="small">
                          <td className="py-3">
                            <div className="fw-bold text-dark">{p.user}</div>
                          </td>
                          <td className="py-3 text-muted">{p.plan}</td>
                          <td className="py-3 fw-bold text-success">${p.amount}</td>
                          <td className="py-3 text-end text-muted">{new Date(p.date).toLocaleDateString()}</td>
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
  );
}

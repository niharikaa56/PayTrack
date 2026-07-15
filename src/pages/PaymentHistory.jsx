import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function PaymentHistory() {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await api.get('/payments/history');
        setPayments(res.data);
      } catch (err) {
        console.error('Failed to fetch payments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Consulting payments databases..." />;
  }

  return (
    <div className="container py-4">
      <div className="border-bottom pb-3 mb-4">
        <h1 className="fw-bold mb-1">Payment History</h1>
        <p className="text-muted mb-0">Review historic fees, transaction codes, and transaction states.</p>
      </div>

      <div className="card border-0 bg-white rounded-4 shadow-sm">
        <div className="card-body p-4">
          {payments.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="fa-solid fa-receipt fs-1 mb-3 opacity-50"></i>
              <p className="mb-0 fw-semibold">No transactions available yet.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr className="small text-muted border-bottom">
                    <th className="py-3 ps-3">Transaction ID</th>
                    <th className="py-3">Customer Email</th>
                    <th className="py-3">Method</th>
                    <th className="py-3">Amount Paid</th>
                    <th className="py-3">Date</th>
                    <th className="py-3 pe-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p._id} className="small">
                      <td className="py-3 ps-3 font-mono fw-bold text-dark">{p.transactionId || 'TXN-Direct'}</td>
                      <td className="py-3 fw-medium text-dark">{p.userEmail || 'My Account'}</td>
                      <td className="py-3 text-muted">{p.paymentMethod}</td>
                      <td className="py-3 fw-bold text-dark">${p.amount}</td>
                      <td className="py-3 text-muted">{new Date(p.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 pe-3">
                        <span className={`badge rounded-pill px-2.5 py-1.5 ${p.status === 'success' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
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
  );
}

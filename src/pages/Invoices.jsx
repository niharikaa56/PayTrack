import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNotifications } from '../context/NotificationContext';

export default function Invoices() {
  const { showToast } = useNotifications();

  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoiceDetailsLoading, setInvoiceDetailsLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  const fetchInvoices = async () => {
    try {
      const res = await api.get('/invoices');
      setInvoices(res.data);
    } catch (err) {
      console.error('Failed to load invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleSelectInvoice = async (invoiceId) => {
    setInvoiceDetailsLoading(true);
    try {
      const res = await api.get(`/invoices/${invoiceId}`);
      setSelectedInvoice(res.data);
    } catch (err) {
      showToast('Could not load invoice details', 'error', 'Error');
    } finally {
      setInvoiceDetailsLoading(false);
    }
  };

  const handleEmailInvoice = async () => {
    if (!selectedInvoice) return;
    setEmailLoading(true);
    try {
      const res = await api.post(`/invoices/${selectedInvoice._id}/email`);
      showToast(res.data.message, 'success', 'Invoice Sent');
      // Update local state to mark as emailed
      setSelectedInvoice(prev => ({ ...prev, emailSent: true }));
      await fetchInvoices();
    } catch (err) {
      showToast('Email transmission failed.', 'error', 'Error');
    } finally {
      setEmailLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <LoadingSpinner message="Recompiling transaction invoice ledgers..." />;
  }

  return (
    <div className="container py-4">
      <div className="border-bottom pb-3 mb-4 d-print-none">
        <h1 className="fw-bold mb-1">Invoice Ledger</h1>
        <p className="text-muted mb-0">Retrieve receipts, check taxable breakdowns, and email PDF summaries.</p>
      </div>

      <div className="row g-4">
        {/* Invoice List column (Hidden on print) */}
        <div className={`col-lg-5 d-print-none ${selectedInvoice ? 'd-none d-lg-block' : ''}`}>
          <div className="card border-0 bg-white rounded-4 shadow-sm h-100">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-4 text-dark">Invoice Ledgers</h5>
              
              {invoices.length === 0 ? (
                <p className="text-muted small mb-0">No invoices generated.</p>
              ) : (
                <div className="list-group list-group-flush d-flex flex-column gap-2">
                  {invoices.map((inv) => (
                    <button 
                      key={inv._id}
                      type="button"
                      className={`list-group-item list-group-item-action border-0 p-3 rounded-3 shadow-sm d-flex justify-content-between align-items-center ${selectedInvoice?._id === inv._id ? 'bg-primary-subtle text-primary fw-bold' : 'bg-light text-dark'}`}
                      onClick={() => handleSelectInvoice(inv._id)}
                    >
                      <div>
                        <div className="fw-bold small">{inv.invoiceNumber}</div>
                        <div className="text-muted small mt-1" style={{ fontSize: '0.75rem' }}>{new Date(inv.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div className="text-end">
                        <div className="fw-bold text-dark">${inv.total}</div>
                        <span className={`badge rounded-pill small mt-1.5 ${inv.status === 'paid' ? 'bg-success text-white' : 'bg-warning text-dark'}`} style={{ fontSize: '0.65rem' }}>
                          {inv.status.toUpperCase()}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Invoice details sheet column (Spans full page on print) */}
        <div className={`col-lg-7 ${!selectedInvoice ? 'd-none d-lg-block' : ''}`}>
          {selectedInvoice ? (
            <div className="d-flex flex-column gap-3">
              {/* Actions Header bar */}
              <div className="d-flex justify-content-between align-items-center d-print-none bg-white p-3 rounded-3 shadow-sm border">
                <button 
                  type="button" 
                  className="btn btn-sm btn-outline-secondary rounded-pill d-lg-none"
                  onClick={() => setSelectedInvoice(null)}
                >
                  <i className="fa-solid fa-arrow-left me-1"></i>Back to List
                </button>
                <div className="d-flex gap-2 ms-auto">
                  <button 
                    type="button" 
                    className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-bold"
                    onClick={handlePrint}
                  >
                    <i className="fa-solid fa-print me-1.5"></i>Print Invoice
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-sm btn-primary rounded-pill px-3 fw-bold d-flex align-items-center gap-1"
                    disabled={emailLoading}
                    onClick={handleEmailInvoice}
                  >
                    {emailLoading ? (
                      <span className="spinner-border spinner-border-sm"></span>
                    ) : (
                      <i className="fa-regular fa-envelope me-1"></i>
                    )}
                    {selectedInvoice.emailSent ? 'Resend PDF' : 'Email PDF Receipt'}
                  </button>
                </div>
              </div>

              {/* Invoice printable content sheet */}
              <div className="card border-0 bg-white shadow rounded-4 p-4 p-md-5">
                {/* Brand / Logo */}
                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center border-bottom pb-4 mb-4 gap-3">
                  <div>
                    <h2 className="fw-bold text-primary mb-1"><i className="fa-solid fa-wallet text-primary me-2"></i>PayTrack Inc</h2>
                    <p className="text-muted small mb-0">100 Pioneer Way, Mountain View, CA 94043</p>
                    <p className="text-muted small mb-0">billing@paytrack.com</p>
                  </div>
                  <div className="text-sm-end">
                    <h3 className="fw-bold text-dark mb-1">INVOICE RECEIPT</h3>
                    <p className="text-muted small mb-0">Invoice Number: <span className="font-mono fw-bold">{selectedInvoice.invoiceNumber}</span></p>
                    <p className="text-muted small mb-0">Date Issued: {new Date(selectedInvoice.createdAt).toLocaleDateString()}</p>
                    <p className="text-muted small mb-0">Invoice Due: {selectedInvoice.dueDate ? new Date(selectedInvoice.dueDate).toLocaleDateString() : 'Paid on Receipt'}</p>
                  </div>
                </div>

                {/* Client Metadata */}
                <div className="row mb-5 g-3">
                  <div className="col-sm-6">
                    <h6 className="text-muted text-uppercase fw-bold small">Invoiced To:</h6>
                    <h5 className="fw-bold text-dark mb-1">{selectedInvoice.userName}</h5>
                    <p className="text-muted small mb-0">{selectedInvoice.userEmail}</p>
                    {selectedInvoice.userCompany && <p className="text-muted small mb-0">Company: {selectedInvoice.userCompany}</p>}
                    <p className="text-muted small mb-0">Billing Country: {selectedInvoice.userCountry}</p>
                  </div>
                  <div className="col-sm-6 text-sm-end">
                    <h6 className="text-muted text-uppercase fw-bold small">Payment Status:</h6>
                    <span className={`badge rounded-pill px-3 py-1.5 fw-bold fs-6 mt-1.5 ${selectedInvoice.status === 'paid' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'}`}>
                      {selectedInvoice.status.toUpperCase()}
                    </span>
                    {selectedInvoice.emailSent && (
                      <p className="text-success small fw-semibold mt-2.5 mb-0">
                        <i className="fa-solid fa-envelope-circle-check me-1"></i>PDF Receipt Emailed!
                      </p>
                    )}
                  </div>
                </div>

                {/* Ledger Items */}
                <h6 className="text-dark fw-bold mb-3 border-bottom pb-2">Itemized Invoice Breakdown</h6>
                <div className="table-responsive mb-4">
                  <table className="table table-borderless">
                    <thead>
                      <tr className="border-bottom small text-muted">
                        <th>Description / Service Details</th>
                        <th className="text-end">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.lineItems?.map((item, idx) => (
                        <tr key={idx} className="small border-bottom">
                          <td className="py-2.5 fw-medium text-dark">{item.description}</td>
                          <td className="py-2.5 text-end fw-bold text-dark">${Number(item.amount).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Summing calculations */}
                <div className="row justify-content-end">
                  <div className="col-md-6 col-lg-5">
                    <div className="d-flex flex-column gap-2 small">
                      <div className="d-flex justify-content-between border-bottom pb-1.5 text-muted">
                        <span>Invoice Subtotal:</span>
                        <span className="fw-bold text-dark">${Number(selectedInvoice.amount).toFixed(2)}</span>
                      </div>
                      <div className="d-flex justify-content-between border-bottom pb-1.5 text-muted">
                        <span>Proration & Promo Deductions:</span>
                        <span className="fw-bold text-success">-${Number(selectedInvoice.discount || 0).toFixed(2)}</span>
                      </div>
                      <div className="d-flex justify-content-between border-bottom pb-1.5 text-muted">
                        <span>Tax Added (8%):</span>
                        <span className="fw-bold text-dark">${Number(selectedInvoice.tax || 0).toFixed(2)}</span>
                      </div>
                      <div className="d-flex justify-content-between pt-1.5 fs-5 fw-bold border-top">
                        <span className="text-dark">Grand Total Due:</span>
                        <span className="text-primary">${Number(selectedInvoice.total).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footnote stamp */}
                <div className="text-center mt-5 pt-4 border-top">
                  <p className="text-muted small mb-0">Thank you for choosing PayTrack Subscription Management services.</p>
                  <p className="text-muted small font-mono" style={{ fontSize: '0.65rem' }}>Receipt Digital Fingerprint ID: {selectedInvoice._id}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="card border-0 bg-white p-5 rounded-4 shadow-sm text-center h-100 d-flex flex-column align-items-center justify-content-center">
              <i className="fa-solid fa-receipt text-muted mb-3" style={{ fontSize: '60px', opacity: 0.5 }}></i>
              <h5 className="fw-bold mb-1">Select an Invoice</h5>
              <p className="text-muted small mb-0 col-md-8 mx-auto">Click any invoice in the ledger on the left to pull itemized details, taxable calculations, PDF download, and email commands.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

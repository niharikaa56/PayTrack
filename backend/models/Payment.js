const db = require('../config/db');

const PaymentSchema = new db.Schema({
  userId: { type: String, required: true },
  subscriptionId: { type: String, required: true },
  invoiceId: { type: String, default: null },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  status: { type: String, enum: ['success', 'failed', 'pending'], default: 'success' },
  paymentMethod: { type: String, default: 'Credit Card' },
  transactionId: { type: String },
  retryCount: { type: Number, default: 0 },
  failureReason: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = db.model('Payment', PaymentSchema);

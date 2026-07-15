const db = require('../config/db');

const InvoiceSchema = new db.Schema({
  userId: { type: String, required: true },
  subscriptionId: { type: String, required: true },
  invoiceNumber: { type: String, required: true },
  amount: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  status: { type: String, enum: ['paid', 'open', 'uncollectible'], default: 'paid' },
  dueDate: { type: Date },
  pdfUrl: { type: String, default: '' },
  emailSent: { type: Boolean, default: false },
  lineItems: [{
    description: { type: String },
    amount: { type: Number }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = db.model('Invoice', InvoiceSchema);

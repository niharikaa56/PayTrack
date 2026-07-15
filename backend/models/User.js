const db = require('../config/db');

const UserSchema = new db.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  company: { type: String, default: '' },
  phone: { type: String, default: '' },
  country: { type: String, default: 'US' },
  paymentMethod: {
    brand: { type: String, default: '' },
    last4: { type: String, default: '' },
    expiry: { type: String, default: '' }
  },
  preferences: {
    emailNotifications: { type: Boolean, default: true },
    monthlyReports: { type: Boolean, default: true }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = db.model('User', UserSchema);

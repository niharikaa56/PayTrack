const db = require('../config/db');

const CouponSchema = new db.Schema({
  code: { type: String, required: true, unique: true },
  discountType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
  discountValue: { type: Number, required: true },
  active: { type: Boolean, default: true },
  expiryDate: { type: Date },
  maxRedemptions: { type: Number, default: 100 },
  redemptionsCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = db.model('Coupon', CouponSchema);

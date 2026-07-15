const db = require('../config/db');

const SubscriptionSchema = new db.Schema({
  userId: { type: String, required: true },
  planId: { type: String, required: true },
  status: { type: String, enum: ['trial', 'active', 'past_due', 'canceled'], default: 'active' },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  trialEndsAt: { type: Date },
  currentPeriodStart: { type: Date, default: Date.now },
  currentPeriodEnd: { type: Date },
  cancelAtPeriodEnd: { type: Boolean, default: false },
  couponId: { type: String, default: null },
  prorationCredit: { type: Number, default: 0 },
  stripeSubscriptionId: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = db.model('Subscription', SubscriptionSchema);

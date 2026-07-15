const db = require('../config/db');

const PlanSchema = new db.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  billingCycle: { type: String, enum: ['monthly', 'yearly'], default: 'monthly' },
  description: { type: String, default: '' },
  features: [{ type: String }],
  trialDays: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  usageLimit: {
    users: { type: Number, default: 1 },
    projects: { type: Number, default: 5 },
    apiCalls: { type: Number, default: 1000 }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = db.model('Plan', PlanSchema);

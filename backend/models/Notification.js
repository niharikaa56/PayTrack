const db = require('../config/db');

const NotificationSchema = new db.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['billing', 'renewal', 'trial', 'system'], default: 'system' },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = db.model('Notification', NotificationSchema);

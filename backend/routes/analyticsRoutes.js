const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.get('/admin', authMiddleware, adminMiddleware, analyticsController.getAdminAnalytics);
router.get('/customer', authMiddleware, analyticsController.getCustomerAnalytics);

module.exports = router;

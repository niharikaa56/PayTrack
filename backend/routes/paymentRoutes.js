const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authMiddleware } = require('../middleware/auth');

router.get('/history', authMiddleware, paymentController.getPaymentHistory);
router.put('/method', authMiddleware, paymentController.updatePaymentMethod);
router.post('/retry', authMiddleware, paymentController.retryPayment);

module.exports = router;

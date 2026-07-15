const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { authMiddleware } = require('../middleware/auth');

router.get('/active', authMiddleware, subscriptionController.getActiveSubscription);
router.get('/', authMiddleware, subscriptionController.getSubscriptionsList);
router.get('/:id', authMiddleware, subscriptionController.getSubscriptionDetails);
router.post('/', authMiddleware, subscriptionController.createSubscription);
router.post('/change', authMiddleware, subscriptionController.upgradeDowngradeSubscription);
router.post('/cancel', authMiddleware, subscriptionController.cancelSubscription);
router.post('/resume', authMiddleware, subscriptionController.resumeSubscription);

module.exports = router;

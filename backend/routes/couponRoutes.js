const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.get('/validate/:code', authMiddleware, couponController.validateCoupon);
router.get('/', authMiddleware, adminMiddleware, couponController.getAllCoupons);
router.post('/', authMiddleware, adminMiddleware, couponController.createCoupon);
router.delete('/:id', authMiddleware, adminMiddleware, couponController.deleteCoupon);

module.exports = router;

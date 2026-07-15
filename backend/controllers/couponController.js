const Coupon = require('../models/Coupon');

const validateCoupon = async (req, res) => {
  try {
    const { code } = req.params;
    if (!code) {
      return res.status(400).json({ message: 'Coupon code is required' });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) {
      return res.status(404).json({ message: 'Invalid coupon code' });
    }

    if (!coupon.active) {
      return res.status(400).json({ message: 'This coupon is no longer active' });
    }

    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({ message: 'This coupon has expired' });
    }

    if (coupon.redemptionsCount >= coupon.maxRedemptions) {
      return res.status(400).json({ message: 'This coupon has reached its maximum redemptions limit' });
    }

    return res.json({
      valid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error validating coupon', error: error.message });
  }
};

const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({});
    return res.json(coupons);
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving coupons', error: error.message });
  }
};

const createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, expiryDate, maxRedemptions } = req.body;

    if (!code || !discountType || discountValue === undefined) {
      return res.status(400).json({ message: 'Code, discount type, and discount value are required' });
    }

    const exists = await Coupon.findOne({ code: code.toUpperCase() });
    if (exists) {
      return res.status(400).json({ message: 'A coupon with this code already exists' });
    }

    const newCoupon = await Coupon.create({
      code: code.toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      expiryDate: expiryDate || null,
      maxRedemptions: Number(maxRedemptions) || 100,
      active: true
    });

    return res.status(201).json({ message: 'Coupon created successfully', coupon: newCoupon });
  } catch (error) {
    return res.status(500).json({ message: 'Error creating coupon', error: error.message });
  }
};

const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    await Coupon.findByIdAndUpdate(req.params.id, { active: false });
    return res.json({ message: 'Coupon marked as inactive successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting coupon', error: error.message });
  }
};

module.exports = {
  validateCoupon,
  getAllCoupons,
  createCoupon,
  deleteCoupon
};

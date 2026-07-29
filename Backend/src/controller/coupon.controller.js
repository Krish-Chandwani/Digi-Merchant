const Coupon = require('../models/Coupon');
const { applyCouponForCheckout } = require('../utils/couponUtils');

async function listCoupons(req, res) {
  try {
    const coupons = await Coupon.find({ isActive: true })
      .select('code description discountType discountValue maxDiscount minOrderAmount rule -_id')
      .sort({ code: 1 })
      .lean();

    res.status(200).json({ coupons });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function validateCoupon(req, res) {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Only customers can use coupons' });
    }

    const { code, shopId, subtotal } = req.body;

    if (!code || !String(code).trim()) {
      return res.status(400).json({ valid: false, message: 'Coupon code is required' });
    }

    if (!shopId) {
      return res.status(400).json({ message: 'shopId is required' });
    }

    const amount = Number(subtotal);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ message: 'Valid subtotal is required' });
    }

    const result = await applyCouponForCheckout({
      code,
      customerId: req.user._id,
      shopId,
      subtotal: amount
    });

    res.status(200).json({
      valid: true,
      code: result.couponCode,
      description: result.coupon.description,
      discountAmount: result.discountAmount,
      subtotal: result.subtotal,
      finalAmount: result.finalAmount
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ valid: false, message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
}

module.exports = { listCoupons, validateCoupon };

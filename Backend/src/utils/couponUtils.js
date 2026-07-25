const Coupon = require('../models/Coupon');
const Order = require('../models/Order');

const DEFAULT_COUPONS = [
  {
    code: 'FIRST10',
    description: '10% off on your first order from this shop',
    discountType: 'percentage',
    discountValue: 10,
    maxDiscount: 0,
    minOrderAmount: 0,
    rule: 'first_order_at_shop',
    isActive: true
  },
  {
    code: 'SAVE50',
    description: 'Flat ₹50 off on orders of ₹299 or more',
    discountType: 'flat',
    discountValue: 50,
    maxDiscount: 0,
    minOrderAmount: 299,
    rule: 'none',
    isActive: true
  },
  {
    code: 'WELCOME15',
    description: '15% off (max ₹150) on your first Digi-Merchant order',
    discountType: 'percentage',
    discountValue: 15,
    maxDiscount: 150,
    minOrderAmount: 0,
    rule: 'first_order_ever',
    isActive: true
  }
];

async function ensureDefaultCoupons() {
  for (const coupon of DEFAULT_COUPONS) {
    await Coupon.updateOne(
      { code: coupon.code },
      { $setOnInsert: coupon },
      { upsert: true }
    );
  }
}

function computeDiscount(coupon, subtotal) {
  let discountAmount = 0;

  if (coupon.discountType === 'percentage') {
    discountAmount = (subtotal * coupon.discountValue) / 100;
    if (coupon.maxDiscount > 0) {
      discountAmount = Math.min(discountAmount, coupon.maxDiscount);
    }
  } else {
    discountAmount = coupon.discountValue;
  }

  discountAmount = Math.min(discountAmount, subtotal);
  discountAmount = Math.round(discountAmount * 100) / 100;

  const finalAmount = Math.round((subtotal - discountAmount) * 100) / 100;

  return { discountAmount, finalAmount };
}

/**
 * Validate a coupon for a customer + shop + cart subtotal.
 * Throws { status, message } on failure.
 */
async function applyCouponForCheckout({
  code,
  customerId,
  shopId,
  subtotal
}) {
  if (!code || !String(code).trim()) {
    return {
      coupon: null,
      couponCode: '',
      discountAmount: 0,
      finalAmount: subtotal,
      subtotal
    };
  }

  const normalized = String(code).trim().toUpperCase();
  const coupon = await Coupon.findOne({ code: normalized, isActive: true });

  if (!coupon) {
    throw { status: 400, message: 'Invalid or inactive coupon code' };
  }

  if (subtotal < coupon.minOrderAmount) {
    throw {
      status: 400,
      message: `Minimum order of ₹${coupon.minOrderAmount} required for ${coupon.code}`
    };
  }

  if (coupon.rule === 'first_order_at_shop') {
    const prior = await Order.countDocuments({
      customer: customerId,
      shop: shopId,
      status: { $ne: 'cancelled' }
    });
    if (prior > 0) {
      throw {
        status: 400,
        message: `${coupon.code} is only valid on your first order from this shop`
      };
    }
  }

  if (coupon.rule === 'first_order_ever') {
    const prior = await Order.countDocuments({
      customer: customerId,
      status: { $ne: 'cancelled' }
    });
    if (prior > 0) {
      throw {
        status: 400,
        message: `${coupon.code} is only valid on your first Digi-Merchant order`
      };
    }
  }

  const { discountAmount, finalAmount } = computeDiscount(coupon, subtotal);

  if (discountAmount <= 0) {
    throw { status: 400, message: 'Coupon does not apply to this order' };
  }

  return {
    coupon,
    couponCode: coupon.code,
    discountAmount,
    finalAmount,
    subtotal
  };
}

module.exports = {
  ensureDefaultCoupons,
  applyCouponForCheckout
};

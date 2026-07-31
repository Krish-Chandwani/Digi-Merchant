const Product = require('../models/Product');
const Shop = require('../models/Shop');
const sendNotification = require('./sendNotification');
const { getRazorpay } = require('../config/razorpay');

/**
 * Cancel an order: refund if needed, restock, set status cancelled.
 * Throws { status, message } on failure. Does not restock/cancel if Razorpay refund fails.
 */
async function finalizeCancellation(order, cancelledBy) {
  if (order.status === 'cancelled') {
    return { order, alreadyCancelled: true };
  }

  // Refund online payments before mutating stock/status
  if (
    order.paymentMethod === 'online' &&
    order.paymentStatus === 'paid' &&
    order.paymentId &&
    !order.refundId
  ) {
    try {
      const razorpay = getRazorpay();
      const refund = await razorpay.payments.refund(order.paymentId, {
        amount: Math.round(order.totalAmount * 100),
      });
      order.refundId = refund.id;
      order.paymentStatus = 'refunded';
    } catch (err) {
      const message =
        err?.error?.description ||
        err?.message ||
        'Refund failed. Order was not cancelled.';
      throw { status: 502, message };
    }
  } else if (
    order.paymentMethod === 'cod' &&
    order.paymentStatus === 'paid'
  ) {
    order.paymentStatus = 'refunded';
  }

  for (const item of order.items) {
    const productId = item.product?._id || item.product;
    const product = await Product.findById(productId);
    if (product) {
      product.stock += item.quantity;
      await product.save();
    }
  }

  order.status = 'cancelled';
  order.cancelledBy = cancelledBy || '';
  order.statusHistory.push({ status: 'cancelled', at: new Date() });
  await order.save();

  const shop = await Shop.findById(order.shop);
  if (shop) {
    if (cancelledBy === 'customer') {
      await sendNotification({
        recipientId: shop.owner,
        type: 'order_status',
        message: `A customer cancelled an order at ${shop.name}`,
        orderId: order._id,
        shopId: shop._id,
      });
    } else {
      await sendNotification({
        recipientId: order.customer,
        type: 'order_status',
        message: `Your order at ${shop.name} was cancelled`,
        orderId: order._id,
        shopId: shop._id,
      });
    }
  }

  return { order, alreadyCancelled: false };
}

module.exports = { finalizeCancellation };

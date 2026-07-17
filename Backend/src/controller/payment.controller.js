const crypto = require('crypto');
const Payment = require('../models/Payment');
const Product = require('../models/Product');
const Shop = require('../models/Shop');
const Order = require('../models/Order');
const generateWhatsappLink = require('../utils/generateWhatsappLink');
const sendNotification = require('../utils/sendNotification');
const { getRazorpay } = require('../config/razorpay');

async function validateAndBuildOrderItems(shopId, items) {
  let totalAmount = 0;
  const orderItems = [];
  const productsMap = {};
  const productsToUpdate = [];

  for (let item of items) {
    const product = await Product.findById(item.productId);

    if (!product) {
      throw { status: 404, message: `Product with ID ${item.productId} not found` };
    }

    if (product.shop.toString() !== shopId) {
      throw {
        status: 400,
        message: `Product ${product.name} does not belong to this shop`
      };
    }

    if (product.stock < item.quantity) {
      throw {
        status: 400,
        message: `Not enough stock for ${product.name}`
      };
    }

    totalAmount += product.price * item.quantity;

    orderItems.push({
      product: product._id,
      quantity: item.quantity,
      priceAtPurchase: product.price
    });

    productsMap[product._id.toString()] = product.name;
    productsToUpdate.push({ product, quantity: item.quantity });
  }

  return { totalAmount, orderItems, productsMap, productsToUpdate };
}

async function createPaymentSession(req, res) {
  try {
    const { shopId, items } = req.body;

    if (!shopId) {
      return res.status(400).json({ message: 'Shop ID is required' });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order items are required' });
    }

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    const { totalAmount } = await validateAndBuildOrderItems(shopId, items);

    if (totalAmount <= 0) {
      return res.status(400).json({ message: 'Invalid payment amount' });
    }

    const payment = await Payment.create({
      customer: req.user._id,
      shop: shopId,
      items,
      amount: totalAmount,
      status: 'pending'
    });

    const razorpay = getRazorpay();
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: 'INR',
      receipt: payment.paymentId,
      notes: {
        paymentId: payment.paymentId,
        shopId: shopId.toString(),
        customerId: req.user._id.toString()
      }
    });

    payment.razorpayOrderId = razorpayOrder.id;
    await payment.save();

    res.status(201).json({
      success: true,
      message: 'Payment session created',
      payment: {
        paymentId: payment.paymentId,
        amount: payment.amount,
        shopName: shop.name,
        status: payment.status,
        razorpayOrderId: razorpayOrder.id,
        keyId: process.env.RAZORPAY_KEY_ID
      }
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    console.error('Payment session error:', error);
    res.status(500).json({ message: error.message || 'Failed to create payment session' });
  }
}

async function verifyPayment(req, res) {
  try {
    const {
      paymentId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    if (!paymentId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Missing payment verification details' });
    }

    const payment = await Payment.findOne({ paymentId });

    if (!payment) {
      return res.status(404).json({ message: 'Payment session not found' });
    }

    if (payment.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (payment.status === 'paid') {
      return res.status(200).json({
        success: true,
        message: 'Payment already verified',
        order: payment.order
      });
    }

    if (payment.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({ message: 'Order ID mismatch' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      payment.status = 'failed';
      await payment.save();
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    const shop = await Shop.findById(payment.shop);
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    const { totalAmount, orderItems, productsMap, productsToUpdate } =
      await validateAndBuildOrderItems(
        payment.shop.toString(),
        payment.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity
        }))
      );

    for (let item of productsToUpdate) {
      item.product.stock -= item.quantity;
      await item.product.save();
    }

    const order = await Order.create({
      customer: req.user._id,
      shop: payment.shop,
      items: orderItems,
      totalAmount,
      paymentMethod: 'online',
      paymentStatus: 'paid',
      paymentId: razorpay_payment_id,
      statusHistory: [{ status: 'pending', at: new Date() }]
    });

    payment.status = 'paid';
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.order = order._id;
    await payment.save();

    const whatsappLink = generateWhatsappLink(shop.whatsappNumber, order, productsMap);

    await sendNotification({
      recipientId: shop.owner,
      type: 'new_order',
      message: `${req.user.name} paid ₹${totalAmount} for a new order`,
      orderId: order._id,
      shopId: shop._id
    });

    res.status(200).json({
      success: true,
      message: 'Payment successful',
      order,
      whatsappLink,
      payment: {
        paymentId: payment.paymentId,
        amount: payment.amount,
        status: payment.status
      }
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    console.error('Payment verify error:', error);
    res.status(500).json({ message: error.message || 'Payment verification failed' });
  }
}

async function getPaymentSession(req, res) {
  try {
    const payment = await Payment.findOne({ paymentId: req.params.paymentId })
      .populate('shop', 'name');

    if (!payment) {
      return res.status(404).json({ message: 'Payment session not found' });
    }

    if (payment.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.status(200).json({
      payment: {
        paymentId: payment.paymentId,
        amount: payment.amount,
        status: payment.status,
        shopName: payment.shop?.name || 'Shop',
        razorpayOrderId: payment.razorpayOrderId,
        keyId: process.env.RAZORPAY_KEY_ID
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = { createPaymentSession, verifyPayment, getPaymentSession };

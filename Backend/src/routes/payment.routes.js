const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  createPaymentSession,
  verifyPayment,
  getPaymentSession
} = require('../controller/payment.controller');
const { validateRequest } = require('../validators/validateRequest');
const { createOrderValidation } = require('../validators/orderValidator');
const { body } = require('express-validator');

router.post(
  '/create-session',
  protect,
  [
    body('shopId').notEmpty().withMessage('Shop ID is required'),
    ...createOrderValidation
  ],
  validateRequest,
  createPaymentSession
);

router.post('/verify', protect, verifyPayment);
router.get('/:paymentId', protect, getPaymentSession);

module.exports = router;

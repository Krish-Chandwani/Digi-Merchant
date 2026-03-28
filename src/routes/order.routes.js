const express = require('express');
const router = express.Router();

const { createOrder } = require('../controller/order.controller');
const {protect} = require('../middleware/auth.middleware');

router.post('/shops/:shopId/orders', protect, createOrder);

module.exports = router;
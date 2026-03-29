const express = require('express');
const router = express.Router();

const { createOrder,getMyOrders,getShopOrders,updateOrderStatus } = require('../controller/order.controller');
const {protect,isMerchant} = require('../middleware/auth.middleware');

router.post('/shops/:shopId/orders', protect, createOrder);
router.get('/orders/my', protect, getMyOrders);
router.get('/shops/:shopId/orders', protect,isMerchant, getShopOrders);
router.patch('/shops/:shopId/orders/:orderId/status', protect,isMerchant, updateOrderStatus);

module.exports = router;
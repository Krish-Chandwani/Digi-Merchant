const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  subscribeStockAlert,
  getMyStockAlerts
} = require('../controller/stockAlert.controller');

router.get('/my', protect, getMyStockAlerts);
router.post('/products/:productId', protect, subscribeStockAlert);

module.exports = router;

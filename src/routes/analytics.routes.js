const analyticsController = require('../controller/analytics.controller');
const {protect,isMerchant} = require('../middleware/auth.middleware');


const express = require('express');
const router = express.Router();

router.get('/shops/:shopId/analytics', protect, isMerchant, analyticsController.getShopAnalytics);

module.exports = router;
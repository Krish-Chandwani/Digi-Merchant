const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { listCoupons, validateCoupon } = require('../controller/coupon.controller');

router.get('/', listCoupons);
router.post('/validate', protect, validateCoupon);

module.exports = router;

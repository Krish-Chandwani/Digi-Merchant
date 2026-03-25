const express = require('express');
const router = express.Router();
const { protect, isMerchant } = require('../middleware/auth.middleware');
const { createShop, getShops, getShopById } = require('../controller/shop.controller');

router.post('/', protect, isMerchant, createShop);
router.get('/my', protect, isMerchant, getShops);
router.get('/:id', getShopById);

module.exports = router;
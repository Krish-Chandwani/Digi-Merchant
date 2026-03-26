const productController = require('../controller/product.controller');
const express = require('express');
const router = express.Router();
const { protect, isMerchant } = require('../middleware/auth.middleware');

router.post('/shops/:shopId/products', protect, isMerchant, productController.createProduct);
router.get('/shops/:shopId/products', productController.getProductsByShop);

module.exports = router;
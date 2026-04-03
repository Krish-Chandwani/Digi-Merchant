const productController = require('../controller/product.controller');
const express = require('express');
const router = express.Router();
const { protect, isMerchant } = require('../middleware/auth.middleware');
const {createProductValidation } = require('../validators/productValidator');
const { validateRequest } = require('../validators/validateRequest');

router.post('/shops/:shopId/products', protect, isMerchant, createProductValidation, validateRequest, productController.createProduct);
router.get('/shops/:shopId/products', productController.getProductsByShop);
router.patch('/shops/:shopId/products/:productId', protect, isMerchant, productController.updateProduct);
router.delete('/shops/:shopId/products/:productId', protect, isMerchant, productController.deleteProduct);

module.exports = router;
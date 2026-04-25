const productController = require('../controller/product.controller');
const express = require('express');
const router = express.Router();
const { protect, isMerchant } = require('../middleware/auth.middleware');
const {createProductValidation } = require('../validators/productValidator');
const { validateRequest } = require('../validators/validateRequest');
const upload = require('../middleware/upload');

router.post('/shops/:shopId/products', protect, isMerchant, upload.array("images", 5),createProductValidation, validateRequest, productController.createProduct);
router.get('/shops/:shopId/products', productController.getProductsByShop);
router.patch('/shops/:shopId/products/:productId', protect, isMerchant, upload.array("images", 5), productController.updateProduct);
router.delete('/shops/:shopId/products/:productId', protect, isMerchant, productController.deleteProduct);

module.exports = router;
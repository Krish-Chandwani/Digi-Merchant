const express = require('express');
const router = express.Router();

const { protect, isMerchant } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload');

const {
  createShop,
  getShops,
  getAllShops,
  getShopById,
  updateShop,
  deleteShop
} = require('../controller/shop.controller');

const { createShopValidation } = require('../validators/shopValidator');
const { validateRequest } = require('../validators/validateRequest');

router.post(
  '/',
  protect,
  isMerchant,
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "banner", maxCount: 1 }
  ]),
  createShopValidation,
  validateRequest,
  createShop
);

router.get('/', getAllShops);

router.get('/my', protect, isMerchant, getShops);

router.get('/:id', getShopById);

router.patch(
  '/:id',
  protect,
  isMerchant,
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "banner", maxCount: 1 }
  ]),
  updateShop
);

router.delete('/:id', protect, isMerchant, deleteShop);

module.exports = router;
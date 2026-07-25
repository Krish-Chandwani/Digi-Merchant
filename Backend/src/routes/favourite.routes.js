const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  toggleFavourite,
  getFavouriteIds,
  getMyFavourites
} = require('../controller/favourite.controller');

router.post('/toggle', protect, toggleFavourite);
router.get('/ids', protect, getFavouriteIds);
router.get('/my', protect, getMyFavourites);

module.exports = router;

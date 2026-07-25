const Favourite = require('../models/Favourite');
const Shop = require('../models/Shop');
const Product = require('../models/Product');

function ensureCustomer(req, res) {
  if (req.user.role !== 'customer') {
    res.status(403).json({ message: 'Only customers can manage favourites' });
    return false;
  }
  return true;
}

async function toggleFavourite(req, res) {
  try {
    if (!ensureCustomer(req, res)) return;

    const { type, id } = req.body;

    if (!type || !id || !['shop', 'product'].includes(type)) {
      return res.status(400).json({
        message: 'Body must include type ("shop" | "product") and id'
      });
    }

    const existing = await Favourite.findOne({
      user: req.user._id,
      itemType: type,
      item: id
    });

    if (existing) {
      await existing.deleteOne();
      return res.status(200).json({
        favourited: false,
        message: 'Removed from favourites'
      });
    }

    let shopId = null;

    if (type === 'shop') {
      const shop = await Shop.findById(id);
      if (!shop) {
        return res.status(404).json({ message: 'Shop not found' });
      }
      shopId = shop._id;
    } else {
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      shopId = product.shop;
    }

    await Favourite.create({
      user: req.user._id,
      itemType: type,
      item: id,
      itemModel: type === 'shop' ? 'Shop' : 'Product',
      shop: shopId
    });

    res.status(201).json({
      favourited: true,
      message: 'Added to favourites'
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(200).json({
        favourited: true,
        message: 'Already in favourites'
      });
    }
    res.status(500).json({ message: error.message });
  }
}

async function getFavouriteIds(req, res) {
  try {
    if (!ensureCustomer(req, res)) return;

    const favourites = await Favourite.find({ user: req.user._id }).select(
      'itemType item'
    );

    const shopIds = [];
    const productIds = [];

    for (const fav of favourites) {
      const id = fav.item.toString();
      if (fav.itemType === 'shop') shopIds.push(id);
      else productIds.push(id);
    }

    res.status(200).json({ shopIds, productIds });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function getMyFavourites(req, res) {
  try {
    if (!ensureCustomer(req, res)) return;

    const favourites = await Favourite.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('item')
      .populate('shop', 'name banner logo address category isOpen');

    const shops = [];
    const products = [];

    for (const fav of favourites) {
      if (!fav.item) continue;

      if (fav.itemType === 'shop') {
        shops.push(fav.item);
      } else {
        const productData = fav.item.toObject
          ? fav.item.toObject()
          : fav.item;
        const shopId =
          fav.shop?._id ||
          fav.shop ||
          productData.shop?._id ||
          productData.shop;

        products.push({
          ...productData,
          shopName: fav.shop?.name,
          shopId: shopId?.toString?.() || shopId
        });
      }
    }

    res.status(200).json({ shops, products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  toggleFavourite,
  getFavouriteIds,
  getMyFavourites
};

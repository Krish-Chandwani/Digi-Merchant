const StockAlert = require('../models/StockAlert');
const Product = require('../models/Product');
const Shop = require('../models/Shop');

async function subscribeStockAlert(req, res) {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Only customers can subscribe to stock alerts' });
    }

    const { productId } = req.params;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.stock > 0) {
      return res.status(400).json({ message: 'Product is already in stock' });
    }

    const shop = await Shop.findById(product.shop);
    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    const existing = await StockAlert.findOne({
      user: req.user._id,
      product: productId
    });

    if (existing) {
      if (existing.notified) {
        existing.notified = false;
        await existing.save();
      }

      return res.status(200).json({
        message: 'You will be notified when this product is back in stock',
        alert: existing
      });
    }

    const alert = await StockAlert.create({
      user: req.user._id,
      product: productId,
      shop: product.shop
    });

    res.status(201).json({
      message: 'You will be notified when this product is back in stock',
      alert
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(200).json({
        message: 'You will be notified when this product is back in stock'
      });
    }
    res.status(500).json({ message: error.message });
  }
}

async function getMyStockAlerts(req, res) {
  try {
    const { shopId } = req.query;
    const filter = { user: req.user._id, notified: false };

    if (shopId) filter.shop = shopId;

    const alerts = await StockAlert.find(filter).select('product shop');

    res.status(200).json({
      alerts,
      productIds: alerts.map((a) => a.product.toString())
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = { subscribeStockAlert, getMyStockAlerts };

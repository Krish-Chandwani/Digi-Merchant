const mongoose = require('mongoose');

const stockAlertSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true
  },
  notified: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

stockAlertSchema.index({ user: 1, product: 1 }, { unique: true });

const StockAlert = mongoose.model('StockAlert', stockAlertSchema);

module.exports = StockAlert;

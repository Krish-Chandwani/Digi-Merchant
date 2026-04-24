const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String,
    default: "",
    trim: true
  },

  price: {
    type: Number,
    required: true,
    min: 0
  },

  stock: {
    type: Number,
    required: true,
    min: 0
  },

  category: {
    type: String,
    required: true
  },

  images: [
    {
      type: String
    }
  ],

  thumbnail: {
    type: String,
    default: ""
  },

  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true
  }

}, { timestamps: true });


productSchema.index({ name: 1 });         // search by name
productSchema.index({ category: 1 });     // filter
productSchema.index({ shop: 1 });         // fetch shop products
productSchema.index({ createdAt: -1 });   // latest products


productSchema.index({ name: "text", description: "text" });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
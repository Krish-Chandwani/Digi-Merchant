const mongoose = require('mongoose');

const favouriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    itemType: {
      type: String,
      enum: ['shop', 'product'],
      required: true
    },
    item: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'itemModel'
    },
    itemModel: {
      type: String,
      enum: ['Shop', 'Product'],
      required: true
    },
    // For products: the parent shop (helps favourites page grouping/links)
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop'
    }
  },
  { timestamps: true }
);

favouriteSchema.index({ user: 1, itemType: 1, item: 1 }, { unique: true });

const Favourite = mongoose.model('Favourite', favouriteSchema);

module.exports = Favourite;

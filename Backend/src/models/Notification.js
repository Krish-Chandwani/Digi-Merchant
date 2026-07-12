const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['new_order', 'order_status'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop'
  },
  read: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

notificationSchema.index({ recipient: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;

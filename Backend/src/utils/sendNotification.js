const Notification = require('../models/Notification');
const { getIO } = require('../config/socket');

async function sendNotification({ recipientId, type, message, orderId, shopId }) {
  const notification = await Notification.create({
    recipient: recipientId,
    type,
    message,
    order: orderId,
    shop: shopId
  });

  try {
    getIO().to(recipientId.toString()).emit('notification', notification);
  } catch (error) {
    console.error('Socket emit failed:', error.message);
  }

  return notification;
}

module.exports = sendNotification;

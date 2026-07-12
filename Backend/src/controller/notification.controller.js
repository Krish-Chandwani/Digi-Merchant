const Notification = require('../models/Notification');

async function getNotifications(req, res) {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      read: false
    });

    res.status(200).json({
      message: 'Notifications retrieved successfully',
      notifications,
      unreadCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function markAsRead(req, res) {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.read = true;
    await notification.save();

    res.status(200).json({
      message: 'Notification marked as read',
      notification
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function markAllAsRead(req, res) {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { read: true }
    );

    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = { getNotifications, markAsRead, markAllAsRead };

const Notification = require('../models/Notification');

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id });
    
    // Sort by date descending
    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.json(notifications);
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving notifications', error: error.message });
  }
};

const markRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (String(notification.userId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const updated = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: 'Error marking read', error: error.message });
  }
};

const markAllRead = async (req, res) => {
  try {
    await Notification.deleteMany({ userId: req.user._id }); // Or set read = true. We can delete or set read to keep dashboard fast. Setting read: true is standard.
    const items = await Notification.find({ userId: req.user._id });
    for (let item of items) {
      item.read = true;
      await item.save();
    }
    return res.json({ message: 'All notifications marked read' });
  } catch (error) {
    return res.status(500).json({ message: 'Error marking all read', error: error.message });
  }
};

module.exports = {
  getNotifications,
  markRead,
  markAllRead
};

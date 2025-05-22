const Notification = require("../models/Notification.model");

// Get all notifications for the logged-in user
exports.getAllNotifications = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 }).lean();
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

// Mark a notification as read
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId },
      { $set: { read: true } },
      { new: true }
    );
    if (!notif) return res.status(404).json({ error: "Notification not found" });
    res.json(notif);
  } catch (err) {
    res.status(500).json({ error: "Failed to mark as read" });
  }
};

// Mark all as read
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    await Notification.updateMany({ userId, read: false }, { $set: { read: true } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to mark all as read" });
  }
};

// Delete all notifications for the user
exports.clearNotifications = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    await Notification.deleteMany({ userId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to clear notifications" });
  }
};

const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/authMiddleware");
const notificationsController = require("../../controllers/notificationsController");

// Get all notifications for the logged-in user
router.get("/", authMiddleware, notificationsController.getAllNotifications);

// Mark a notification as read
router.patch("/:id/read", authMiddleware, notificationsController.markAsRead);

// Mark all as read
router.patch("/read-all", authMiddleware, notificationsController.markAllAsRead);

// Delete all notifications for the user
router.delete("/", authMiddleware, notificationsController.clearNotifications);

module.exports = router;

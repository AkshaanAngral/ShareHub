// utils/notificationHelper.js
const Notification = require("../models/Notification.model");

let ioInstance = null;
let userSocketsInstance = null;

function setSocketIO(io, userSockets) {
  ioInstance = io;
  userSocketsInstance = userSockets;
}

async function sendNotificationToUser({ userId, type, title, message, relatedId }) {
  if (!ioInstance || !userSocketsInstance) {
    console.error("Socket.IO not initialized for notifications.");
    return;
  }
  const notification = {
    id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
    userId,
    type,
    title,
    message,
    relatedId,
    createdAt: new Date(),
    read: false,
  };
  // Emit to user (real-time)
  if (userSocketsInstance.has(userId)) {
    ioInstance.to(userSocketsInstance.get(userId)).emit("notification", notification);
    ioInstance.to(userId).emit("notification", notification);
  }
  // Save to database (persistent)
  try {
    await Notification.create({
      userId,
      type,
      title,
      message,
      relatedId,
      createdAt: notification.createdAt,
      read: false
    });
  } catch (err) {
    console.error("Failed to persist notification:", err);
  }
}

module.exports = { setSocketIO, sendNotificationToUser };

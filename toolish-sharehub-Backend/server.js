// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
require("dotenv").config();
require("./passport");
const Chat = require("./models/Chat.model");
const Notification = require("./models/Notification.model");
const apiRoutes = require("./routes/api");
const { setSocketIO, sendNotificationToUser } = require("./utils/notificationHelper");
const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "default-session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// API Routes
app.use("/api", apiRoutes);

// Dashboard Routes (ADD THIS LINE)
const dashboardRoutes = require("./routes/api/dashboard.route");
app.use("/api/dashboard", dashboardRoutes);

const bookingRoutes = require("./routes/api/Booking.route");
app.use("/api/bookings", bookingRoutes);
// --- SOCKET.IO SETUP ---
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Track connected users
const userSockets = new Map(); // userId -> socketId

// Initialize the notification helper with io and userSockets
setSocketIO(io, userSockets);

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("Authentication error: Token missing"));
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) return next(new Error("Authentication error: Invalid or expired token"));
    socket.userId = decoded.id || decoded._id;
    next();
  });
});

io.on("connection", (socket) => {
  if (socket.userId) {
    userSockets.set(socket.userId, socket.id);
    socket.join(socket.userId); // join a room for direct notifications
  }

  // --- CHAT MESSAGE HANDLER ---
  socket.on("sendMessage", async ({ roomId, message, messageId }) => {
    try {
      const newChat = new Chat({
        roomId,
        message,
        senderId: socket.userId,
        messageId,
      });
      await newChat.save();

      // Broadcast message to chat room
      io.to(roomId).emit("receiveMessage", {
        message,
        senderId: socket.userId,
        createdAt: newChat.createdAt,
        messageId,
        roomId,
      });

      // Send notification to recipient
      const [user1, user2] = roomId.split('_');
      const recipientId = user1 === socket.userId ? user2 : user1;
      await sendNotificationToUser({
        userId: recipientId,
        type: "chat",
        title: "New Message",
        message: `You have a new message.`,
        relatedId: roomId,
      });
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  // --- ORDER & PAYMENT NOTIFICATIONS (example custom events) ---
  socket.on("orderPlaced", async ({ userId, orderId }) => {
    await sendNotificationToUser({
      userId,
      type: "order",
      title: "Order Placed",
      message: "Your order has been placed successfully.",
      relatedId: orderId,
    });
  });

  socket.on("paymentReceived", async ({ userId, paymentId }) => {
    await sendNotificationToUser({
      userId,
      type: "payment",
      title: "Payment Received",
      message: "Your payment has been processed.",
      relatedId: paymentId,
    });
  });

  // --- GENERIC NOTIFICATION HANDLER (for admin/system, etc.) ---
  socket.on("send_notification", async (notif) => {
    await sendNotificationToUser(notif);
  });

  socket.on("disconnect", () => {
    if (socket.userId) {
      userSockets.delete(socket.userId);
      socket.leave(socket.userId);
    }
  });
});

const notificationsRoutes = require("./routes/api/notifications.route");
app.use("/api/notifications", notificationsRoutes);

const MONGO_URI = process.env.MONGO_URI || "your-default-uri";
const PORT = process.env.PORT || 5000;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");
    server.listen(PORT, () => {
      console.log(`🚀 Server running on: http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
  });

app.get("/", (req, res) => {
  res.send("API is running...");
});
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
require("./passport"); // passport config
const Chat = require("./models/Chat.model");
const apiRoutes = require("./routes/api");

const app = express();
const server = http.createServer(app);

// ✅ MIDDLEWARES
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || "default-session-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,  // true only if HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  },
}));

app.use(passport.initialize());
app.use(passport.session());

// ✅ API ROUTES
app.use("/api", apiRoutes);

// ✅ SOCKET.IO SETUP (With JWT Authentication)
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Middleware to verify token on every socket connection
io.use((socket, next) => {
  const token = socket.handshake.auth?.token; // Use optional chaining
  if (!token) {
    return next(new Error("Authentication error: Token missing"));
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.error("JWT verification error:", err.message);
      return next(new Error("Authentication error: Invalid or expired token"));
    }
    socket.user = decoded; // Attach decoded user to socket
    console.log(`✅ Socket authenticated for user: ${decoded.name}`); // Log success
    next();
  });
});

// Socket event handlers
io.on("connection", (socket) => {
  console.log(`🟢 New user connected: ${socket.id}, UserID: ${socket.user.id}`);

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.user.id} joined room ${roomId}`);
  });

  socket.on("sendMessage", async ({ roomId, message }) => {
    try {
      const newChat = new Chat({
        roomId,
        message,
        senderId: socket.user.id, // use socket.user.id from authenticated socket
      });
      await newChat.save();

      io.to(roomId).emit("receiveMessage", {
        message,
        senderId: socket.user.id,
        createdAt: newChat.createdAt,
      });
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log(`🔴 User disconnected: ${socket.id}`);
  });
});

// ✅ DATABASE CONNECTION
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

// ✅ TEST ROUTE
app.get("/", (req, res) => {
  res.send("API is running...");
});

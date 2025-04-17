const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();
require("./passport");
const Chat = require("./models/Chat.model");

const apiRoutes = require("./routes/api");

const app = express();
const server = http.createServer(app);

// ✅ Socket.IO Setup
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("🟢 New user connected:", socket.id);

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on("sendMessage", async ({ roomId, message, senderId }) => {
    try {
      const newChat = new Chat({ roomId, message, senderId });
      await newChat.save();

      io.to(roomId).emit("receiveMessage", {
        message,
        senderId,
        createdAt: newChat.createdAt,
      });
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});

// ✅ Middleware
app.use(
  session({
    secret: "toolish-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

// ✅ API Routes should come **after** middlewares
app.use("/api", apiRoutes);

// ✅ MongoDB connection
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

// ✅ Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

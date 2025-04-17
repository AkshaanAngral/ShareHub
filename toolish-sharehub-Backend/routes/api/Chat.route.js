const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/authMiddleware");
const chatController = require("../../controllers/chatController");

// Route to get all conversations for a user
router.get("/", authMiddleware, chatController.getAllConversations);

// Route to get messages for a specific room
router.get("/:roomId", authMiddleware, chatController.getMessagesForRoom);

// Route to post a new message with roomId auto-generation
router.post("/", authMiddleware, chatController.postNewMessage);

// Route to create a new conversation
router.post("/conversations", authMiddleware, chatController.createConversation);

module.exports = router;

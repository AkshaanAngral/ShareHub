const Chat = require("../models/Chat.model");

// Function to get all conversations for a user
exports.getAllConversations = async (req, res) => {
  try {
    // Find all conversations where the user is a participant
    const conversations = await Chat.find({
      participants: { $in: [req.user.id] }
    }).populate('participants', 'username email'); // Populate user info
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
};

// Function to get messages for a specific room
exports.getMessagesForRoom = async (req, res) => {
  try {
    // Get all messages from the room sorted by createdAt
    const messages = await Chat.find({ roomId: req.params.roomId }).sort("createdAt");
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

// Function to post a new message with roomId auto-generation
exports.postNewMessage = async (req, res) => {
    const { senderId, receiverId, message } = req.body;
  
    // Auto-generate the roomId by sorting and joining sender and receiver IDs
    const roomId = [senderId, receiverId].sort().join("_");
  
    try {
      const newMessage = new Chat({
        roomId,
        senderId,
        message,
      });
  
      // Save the new message
      await newMessage.save();
      res.status(201).json(newMessage);
    } catch (err) {
      console.error("Error sending message:", err);
      res.status(500).json({ error: "Failed to send message" });
    }
  };
// Function to create a new conversation
exports.createConversation = async (req, res) => {
  const { receiverId } = req.body;

  try {
    // Generate a unique conversation ID
    const conversationId = [receiverId, String(req.user.id)].sort().join("_");

    // Check if a conversation already exists between these two users
    let conversation = await Chat.findOne({
      _id: conversationId,
      participants: { $all: [receiverId, String(req.user.id)] }
    });

    // If a conversation exists, return it
    if (conversation) {
      return res.status(200).json({ conversationId: conversation._id });
    }

    // If no conversation exists, create a new one
    conversation = new Chat({
      _id: conversationId,
      participants: [receiverId, String(req.user.id)],
      messages: []
    });

    // Save the new conversation
    await conversation.save();
    res.status(201).json({ conversationId: conversation._id });
  } catch (err) {
    console.error("Error creating conversation:", err);
    res.status(500).json({ error: "Failed to create conversation" });
  }
};

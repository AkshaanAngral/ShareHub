const Chat = require("../models/Chat.model");
const User = require("../models/User.model");
const mongoose = require("mongoose");

// Get all conversations for a user
exports.getAllConversations = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const userId = req.user.id || req.user._id;
    const userChats = await Chat.find({
      roomId: { $regex: userId }
    }).sort({ createdAt: -1 });

    const roomIds = [...new Set(userChats.map(chat => chat.roomId))];
    const conversations = [];

    for (const roomId of roomIds) {
      const participants = roomId.split('_');
      const otherUserId = participants[0] === userId ? participants[1] : participants[0];

      const messages = await Chat.find({ roomId })
        .sort({ createdAt: 1 })
        .limit(50);

      let participantName = otherUserId;
      try {
        let otherUser;
        
        // Check if otherUserId is a valid ObjectId
        if (mongoose.Types.ObjectId.isValid(otherUserId)) {
          otherUser = await User.findById(otherUserId);
        } 
        
        // If not found or not a valid ObjectId, try looking up by email
        if (!otherUser) {
          otherUser = await User.findOne({ email: otherUserId });
        }
        
        // If still not found, try looking up by username
        if (!otherUser) {
          otherUser = await User.findOne({ username: otherUserId });
        }
        
        if (otherUser) {
          participantName = otherUser.name || otherUser.username || otherUser.email;
        }
      } catch (err) {
        console.error("Error fetching user info:", err);
      }

      let toolName = undefined;
      if (messages.length > 0 && messages[0].metadata && messages[0].metadata.toolName) {
        toolName = messages[0].metadata.toolName;
      }

      const unreadCount = await Chat.countDocuments({
        roomId,
        senderId: { $ne: userId },
        read: { $ne: true }
      });

      conversations.push({
        _id: roomId,
        participants: [userId, otherUserId],
        messages: messages.map(msg => ({
          senderId: msg.senderId,
          text: msg.message,
          timestamp: msg.createdAt,
          _id: msg._id.toString(),
          read: msg.read || false
        })),
        unreadCount,
        participantName,
        participantId: otherUserId,
        toolName
      });
    }

    res.json(conversations);
  } catch (err) {
    console.error("Error fetching conversations:", err);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
};

// Get messages for a specific room
exports.getMessagesForRoom = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const userId = req.user.id || req.user._id;
    const { roomId } = req.params;
    if (!roomId.includes(userId)) {
      return res.status(403).json({ error: "Not authorized to access this conversation" });
    }
    const chats = await Chat.find({ roomId }).sort({ createdAt: 1 });
    const messages = chats.map(chat => ({
      senderId: chat.senderId,
      text: chat.message,
      timestamp: chat.createdAt,
      _id: chat._id.toString(),
      read: chat.read || false
    }));
    await Chat.updateMany(
      {
        roomId,
        senderId: { $ne: userId },
        read: { $ne: true }
      },
      { $set: { read: true } }
    );
    res.json(messages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

// Post a new message
exports.postNewMessage = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const senderId = req.user.id || req.user._id;
    const { receiverId, message, messageId } = req.body;
    if (!receiverId || !message) {
      return res.status(400).json({ error: "receiverId and message are required" });
    }
    const roomId = [senderId, receiverId].sort().join("_");
    if (messageId) {
      const existingMessage = await Chat.findOne({ messageId });
      if (existingMessage) {
        return res.status(200).json({
          _id: existingMessage._id,
          senderId,
          text: existingMessage.message,
          timestamp: existingMessage.createdAt,
          messageId: existingMessage.messageId
        });
      }
    }
    const newMessage = new Chat({
      roomId,
      senderId,
      message,
      messageId,
      read: false
    });
    await newMessage.save();
    res.status(201).json({
      _id: newMessage._id.toString(),
      senderId,
      text: message,
      timestamp: newMessage.createdAt,
      messageId: newMessage.messageId
    });
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
};

// Create a new conversation
exports.createConversation = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const userId = req.user.id || req.user._id;
    const { receiverId, receiverName, toolName } = req.body;
    if (!receiverId) {
      return res.status(400).json({ error: "receiverId is required" });
    }
    const conversationId = [userId, receiverId].sort().join("_");
    let participantName = receiverName || receiverId;
    if (!receiverName) {
      try {
        let recipient;
        
        // Check if receiverId is a valid ObjectId
        if (mongoose.Types.ObjectId.isValid(receiverId)) {
          recipient = await User.findById(receiverId);
        } 
        
        // If not found or not a valid ObjectId, try looking up by email
        if (!recipient) {
          recipient = await User.findOne({ email: receiverId });
        }
        
        // If still not found, try looking up by username
        if (!recipient) {
          recipient = await User.findOne({ username: receiverId });
        }
        
        if (recipient) {
          participantName = recipient.name || recipient.username || recipient.email;
        }
      } catch (err) {
        console.error("Error fetching user info:", err);
      }
    }
    const existingMessages = await Chat.find({ roomId: conversationId }).sort({ createdAt: 1 });
    const conversation = {
      _id: conversationId,
      participants: [userId, receiverId],
      participantName,
      participantId: receiverId,
      messages: existingMessages.map(msg => ({
        senderId: msg.senderId,
        text: msg.message,
        timestamp: msg.createdAt,
        _id: msg._id.toString(),
        read: msg.read || false
      })),
      unreadCount: 0,
      toolName
    };
    if (toolName && existingMessages.length === 0) {
      conversation.toolName = toolName;
    }
    res.status(201).json(conversation);
  } catch (err) {
    console.error("Error creating conversation:", err);
    res.status(500).json({ error: "Failed to create conversation" });
  }
};
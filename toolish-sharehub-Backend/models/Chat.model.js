const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      index: true // Add index for faster queries
    },
    senderId: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    messageId: {
      type: String,
    
    },
    read: {
      type: Boolean,
      default: false
    },
    metadata: {
      type: Object,
      default: {}
    }
  },
  { timestamps: true }
);

// Compound index for faster conversation queries
chatSchema.index({ roomId: 1, createdAt: 1 });

// Prevent duplicate messages
chatSchema.index({ messageId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("Chat", chatSchema);
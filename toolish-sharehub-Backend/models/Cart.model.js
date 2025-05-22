const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    toolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tool',
      required: true
    },
    quantity: {
      type: Number,
      default: 1
    },
    // Add these fields to match what's being set in the controller
    price: {
      type: Number,
      required: true
    },
    rentalDays: {
      type: Number,
      default: 1
    },
    insurance: {
      type: Boolean,
      default: false
    }
  }],
  total: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('Cart', CartSchema);
// models/Cart.model.js
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
    }
  }],
  total: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('Cart', CartSchema);

const mongoose = require('mongoose');
const PaymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cartId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cart', required: true },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  amount: Number,
  currency: { type: String, default: 'INR' },
  // Change the deliveryAddress to be an object with structured fields
  deliveryAddress: { 
    line1: String,
    line2: String,
    city: String,
    state: String,
    pincode: String,
    country: String
  },
  status: { type: String, enum: ['created', 'paid', 'failed'], default: 'created' },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Payment', PaymentSchema);
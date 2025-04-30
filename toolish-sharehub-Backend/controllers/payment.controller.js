const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment.model');
const Cart = require('../models/Cart.model');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay order
exports.createOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id }).populate('items.toolId', 'price');
    if (!cart || cart.items.length === 0) return res.status(400).json({ message: 'Cart is empty' });

    const amount = Math.round(cart.total * 1.1 * 100); // Add 10% fee, convert to paise
    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`
    });

    const payment = new Payment({
      userId: req.user.id,
      cartId: cart._id,
      razorpayOrderId: order.id,
      amount: amount / 100,
      currency: 'INR'
    });
    await payment.save();

    res.json({ order, key: process.env.RAZORPAY_KEY_ID, paymentId: payment._id });
  } catch (err) {
    res.status(500).json({ message: 'Could not create order', error: err.message });
  }
};

// Verify Razorpay payment
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, paymentId } = req.body;
    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body).digest("hex");
    if (expectedSignature !== razorpaySignature)
      return res.status(400).json({ message: "Payment signature mismatch" });

    const payment = await Payment.findByIdAndUpdate(paymentId, {
      razorpayPaymentId,
      razorpaySignature,
      status: "paid"
    }, { new: true });

    // Optionally, clear the user's cart here
    await Cart.findOneAndUpdate({ userId: req.user.id }, { items: [], total: 0 });

    res.json({ message: "Payment verified", payment });
  } catch (err) {
    res.status(500).json({ message: 'Could not verify payment', error: err.message });
  }
};

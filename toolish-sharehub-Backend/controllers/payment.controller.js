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
    const { address, items: clientItems } = req.body;
    
    if (!address) {
      return res.status(400).json({ message: 'Delivery address is required' });
    }
    
    if (!clientItems || !Array.isArray(clientItems) || clientItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }
    
    // Calculate totals from the client items
    const subtotal = clientItems.reduce((sum, item) => sum + item.subtotal, 0);
    const total = clientItems.reduce((sum, item) => sum + item.total, 0);
    
    // Create or update cart in database
    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      cart = new Cart({ userId: req.user.id });
    }
    
    // Update cart with client items
    cart.items = clientItems.map(item => ({
      toolId: item.id,
      price: item.price,
      rentalDays: item.rentalDays || 1,
      insurance: item.insurance || false
    }));
    
    cart.total = total;
    await cart.save();
    
    // Continue with Razorpay order creation
    const amount = Math.round(total * 100); // Convert to paise
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
      currency: 'INR',
      deliveryAddress: address
    });
    
    await payment.save();
    res.json({ order, key: process.env.RAZORPAY_KEY_ID, paymentId: payment._id });
  }catch (err) {
    console.error('Order creation error:', err); // Log the full error
    res.status(500).json({ 
      message: 'Could not create order', 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
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

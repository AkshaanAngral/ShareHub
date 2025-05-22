const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment.model');
const Cart = require('../models/Cart.model');
const { sendNotificationToUser } = require("../utils/notificationHelper");
const { sendRenterOrderConfirmation, sendUserOrderConfirmation } = require("../utils/emailHelper");
const Tool = require('../models/Tool.model');
const User = require('../models/User.model');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay order (NO booking logic here)
exports.createOrder = async (req, res) => {
  try {
    const { address, items: clientItems } = req.body;
    
    // Validate address
    if (!address || typeof address !== 'object' || !address.line1) {
      return res.status(400).json({ message: 'Valid delivery address is required' });
    }

    // Validate items
    if (!clientItems || !Array.isArray(clientItems) || clientItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Calculate totals from the client items
    const subtotal = clientItems.reduce((sum, item) => {
      const itemPrice = item.price * (item.rentalDays || 1);
      return sum + itemPrice;
    }, 0);

    // Calculate service fee (10%)
    const serviceFee = subtotal * 0.1;
    const total = subtotal + serviceFee;

    // Create or update cart in database
    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      cart = new Cart({ userId: req.user.id });
    }
    cart.items = clientItems.map(item => ({
      toolId: item.id || item.toolId,
      price: item.price,
      rentalDays: item.rentalDays || 1,
      insurance: item.insurance || false
    }));
    cart.total = total;
    await cart.save();

    // Create Razorpay order
    const amount = Math.round(total * 100); // Convert to paise
    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`
    });

    // Save payment with status "created"
    const deliveryAddress = {
      line1: address.line1 || '',
      line2: address.line2 || '',
      city: address.city || '',
      state: address.state || '',
      pincode: address.pincode || '',
      country: address.country || 'India'
    };

    const payment = new Payment({
      userId: req.user.id,
      cartId: cart._id,
      razorpayOrderId: order.id,
      amount: amount / 100,
      currency: 'INR',
      deliveryAddress: deliveryAddress,
      status: "created"
    });

    await payment.save();

    // NO booking notifications or emails here!

    res.json({ order, key: process.env.RAZORPAY_KEY_ID, paymentId: payment._id });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ 
      message: 'Could not create order', 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// Verify Razorpay payment (ALL booking logic here)
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, paymentId } = req.body;
    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body).digest("hex");
    if (expectedSignature !== razorpaySignature)
      return res.status(400).json({ message: "Payment signature mismatch" });

    // Mark payment as paid
    const payment = await Payment.findByIdAndUpdate(paymentId, {
      razorpayPaymentId,
      razorpaySignature,
      status: "paid"
    }, { new: true });

    // Get the full payment details with populated data
    const fullPayment = await Payment.findById(paymentId);
    const user = await User.findById(req.user.id);
    const cart = await Cart.findById(fullPayment.cartId);

    // --- BOOKING LOGIC: Only after payment is paid ---

    // Notify the buyer (user)
    await sendNotificationToUser({
      userId: req.user.id,
      type: "order",
      title: "Order Confirmed",
      message: "Your order has been confirmed and the tool is now booked.",
      relatedId: paymentId,
    });

    // Notify the tool owner(s)
    const tools = [];
    const toolOwners = [];
    if (cart && cart.items && cart.items.length > 0) {
      for (const item of cart.items) {
        const tool = await Tool.findById(item.toolId);
        if (tool) {
          tools.push(tool);

          // Optionally, mark tool as booked (if you track this)
          // await Tool.findByIdAndUpdate(tool._id, { $set: { isBooked: true } });

          if (tool.owner) {
            if (tool.owner.toString() !== req.user.id.toString()) {
              const buyer = await User.findById(req.user.id);
              await sendNotificationToUser({
                userId: tool.owner.toString(),
                type: "order",
                title: "New Booking Received",
                message: `You have received a booking from ${buyer ? (buyer.name || buyer.email) : 'a user'}.`,
                relatedId: paymentId,
              });
            }
            const owner = await User.findById(tool.owner);
            if (owner) {
              toolOwners.push({ owner, tool, cartItem: item });
            }
          }
        }
      }

      // Send booking confirmation email to user (buyer)
      try {
        await sendUserOrderConfirmation({
          user,
          tools,
          payment: fullPayment,
          cartItems: cart.items,
          address: fullPayment.deliveryAddress
        });
        console.log(`Email sent to buyer: ${user.email}`);
      } catch (emailError) {
        console.error('Error sending email to buyer:', emailError);
      }

      // Send booking confirmation email to each tool owner
      for (const item of toolOwners) {
        try {
          await sendRenterOrderConfirmation({
            renter: item.owner,
            tool: item.tool,
            user,
            payment: fullPayment,
            cartItem: item.cartItem
          });
          console.log(`Email sent to tool owner: ${item.owner.email}`);
        } catch (emailError) {
          console.error(`Error sending email to tool owner ${item.owner.email}:`, emailError);
        }
      }
    }

    // Clear the user's cart
    await Cart.findOneAndUpdate({ userId: req.user.id }, { items: [], total: 0 });

    res.json({ message: "Payment verified", payment });
  } catch (err) {
    console.error('Payment verification error:', err);
    res.status(500).json({ message: 'Could not verify payment', error: err.message });
  }
};
// Get user's payments
exports.getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user.id })
      .populate('cartId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      payments: payments || []
    });
  } catch (err) {
    console.error('Get payments error:', err);
    res.status(500).json({ 
      message: 'Could not fetch payments', 
      error: err.message 
    });
  }
};
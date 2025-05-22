// routes/api/dashboard.route.js
const express = require('express');
const router = express.Router();
const authenticateUser = require('../../middleware/authMiddleware');
const Tool = require('../../models/Tool.model');
const Payment = require('../../models/Payment.model');
const Cart = require('../../models/Cart.model');

// @route   GET api/dashboard/stats
// @desc    Get user dashboard statistics
// @access  Private
router.get('/stats', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Get tools listed by user
    const userTools = await Tool.find({ owner: userId });
    const toolsListed = userTools.length;
    const userToolIds = userTools.map(tool => tool._id);

    // 2. Get active rentals (payments where user bought tools)
    const userRentals = await Payment.find({
      userId: userId,
      status: 'paid'
    }).populate({
      path: 'cartId',
      populate: {
        path: 'items.toolId',
        model: 'Tool'
      }
    });

    const activeRentals = userRentals.length;

    // 3. Get total earnings (payments received for user's tools)
    // Find all paid payments and check if they contain user's tools
    const allPaidPayments = await Payment.find({ status: 'paid' })
      .populate({
        path: 'cartId',
        populate: {
          path: 'items.toolId',
          model: 'Tool'
        }
      });

    let totalEarnings = 0;
    let earningsBreakdown = [];

    for (const payment of allPaidPayments) {
      if (payment.cartId && payment.cartId.items) {
        for (const item of payment.cartId.items) {
          if (item.toolId && userToolIds.some(toolId => toolId.equals(item.toolId._id))) {
            // This payment includes one of user's tools
            const itemEarnings = item.price * (item.rentalDays || 1);
            totalEarnings += itemEarnings;
            
            earningsBreakdown.push({
              toolName: item.toolId.name,
              amount: itemEarnings,
              rentalDays: item.rentalDays || 1,
              paymentDate: payment.createdAt,
              renterInfo: payment.userId
            });
          }
        }
      }
    }

    // 4. Get recent activity (recent rentals of user's tools)
    const recentRentals = earningsBreakdown
      .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))
      .slice(0, 5);

    res.json({
      success: true,
      stats: {
        toolsListed,
        activeRentals,
        totalEarnings: Math.round(totalEarnings * 100) / 100, // Round to 2 decimal places
      },
      tools: userTools,
      recentActivity: recentRentals,
      earningsBreakdown
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message
    });
  }
});

// @route   GET api/dashboard/earnings
// @desc    Get detailed earnings information
// @access  Private
router.get('/earnings', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's tools
    const userTools = await Tool.find({ owner: userId });
    const userToolIds = userTools.map(tool => tool._id);

    // Get all payments that include user's tools
    const allPaidPayments = await Payment.find({ status: 'paid' })
      .populate({
        path: 'cartId',
        populate: {
          path: 'items.toolId',
          model: 'Tool'
        }
      })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    let earnings = [];
    let monthlyEarnings = {};

    for (const payment of allPaidPayments) {
      if (payment.cartId && payment.cartId.items) {
        for (const item of payment.cartId.items) {
          if (item.toolId && userToolIds.some(toolId => toolId.equals(item.toolId._id))) {
            const itemEarnings = item.price * (item.rentalDays || 1);
            const month = new Date(payment.createdAt).toISOString().slice(0, 7); // YYYY-MM
            
            earnings.push({
              toolName: item.toolId.name,
              amount: itemEarnings,
              rentalDays: item.rentalDays || 1,
              paymentDate: payment.createdAt,
              renterName: payment.userId?.name || 'Unknown',
              renterEmail: payment.userId?.email || 'Unknown'
            });

            // Aggregate monthly earnings
            monthlyEarnings[month] = (monthlyEarnings[month] || 0) + itemEarnings;
          }
        }
      }
    }

    res.json({
      success: true,
      earnings,
      monthlyEarnings,
      totalEarnings: earnings.reduce((sum, earning) => sum + earning.amount, 0)
    });

  } catch (error) {
    console.error('Earnings fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch earnings',
      error: error.message
    });
  }
});

module.exports = router;
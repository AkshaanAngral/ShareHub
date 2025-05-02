// routes/api/Cart.route.js
const express = require('express');
const router = express.Router();
const CartController = require('../../controllers/Cartcontroller');
const authMiddleware = require('../../middleware/authMiddleware');

// @route   GET api/cart
// @desc    Get user's cart
// @access  Private
router.get('/', authMiddleware, CartController.getCart);

// @route   POST api/cart/add
// @desc    Add item to cart
// @access  Private
router.post('/add', authMiddleware, CartController.addItemToCart);

// @route   PUT api/cart/update/:toolId
// @desc    Update item quantity in cart
// @access  Private
router.put('/update/:toolId', authMiddleware, CartController.updateCartItem);

// @route   DELETE api/cart/remove/:toolId
// @desc    Remove item from cart
// @access  Private
router.delete('/remove/:toolId', authMiddleware, CartController.removeCartItem);

// @route   DELETE api/cart/clear
// @desc    Clear cart
// @access  Private
router.delete('/clear', authMiddleware, CartController.clearCart);

module.exports = router;

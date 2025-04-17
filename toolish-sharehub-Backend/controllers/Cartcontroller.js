// controllers/CartController.js
const Cart = require('../models/Cart.model');
const Tool = require('../models/Tool.model');

const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id }).populate('items.toolId', 'name price');
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    res.json(cart);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

const addItemToCart = async (req, res) => {
  try {
    const { toolId, quantity } = req.body;

    // Check if the tool exists
    const tool = await Tool.findById(toolId);
    if (!tool) {
      return res.status(404).json({ message: 'Tool not found' });
    }

    let cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      // Create a new cart
      cart = new Cart({
        userId: req.user.id,
        items: [{ toolId, quantity }],
        total: tool.price * quantity
      });
    } else {
      // Cart exists, check if the item already exists
      const itemIndex = cart.items.findIndex(item => item.toolId.toString() === toolId);

      if (itemIndex > -1) {
        // Item exists, update the quantity
        let item = cart.items[itemIndex];
        item.quantity += quantity;
        cart.items[itemIndex] = item;
      } else {
        // Item does not exist, add to cart
        cart.items.push({ toolId, quantity });
      }
      cart.total = cart.items.reduce((total, item) => total + (item.toolId.price * item.quantity), 0);
    }

    await cart.save();
    cart = await Cart.findOne({ userId: req.user.id }).populate('items.toolId', 'name price');
    res.json(cart);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

const updateCartItem = async (req, res) => {
    try {
        const {
            toolId
        } = req.params;
        const {
            quantity
        } = req.body;

        let cart = await Cart.findOne({
            userId: req.user.id
        });

        if (!cart) {
            return res.status(404).json({
                msg: "Cart not found"
            });
        }

        const itemIndex = cart.items.findIndex(item => item.toolId == toolId)

        if (itemIndex === -1) {
            return res.status(400).json({
                msg: 'Item not found in cart'
            })
        }

        cart.items[itemIndex].quantity = quantity

        cart.total = cart.items.reduce((total, item) => total + (item.toolId.price * item.quantity), 0);

        await cart.save();

        res.json(cart);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

const removeCartItem = async (req, res) => {
    try {
        const {
            toolId
        } = req.params;

        let cart = await Cart.findOne({
            userId: req.user.id
        });

        if (!cart) {
            return res.status(404).json({
                msg: "Cart not found"
            });
        }

        const itemIndex = cart.items.findIndex(item => item.toolId == toolId)

        if (itemIndex === -1) {
            return res.status(400).json({
                msg: 'Item not found in cart'
            })
        }

        cart.items.splice(itemIndex, 1)

        cart.total = cart.items.reduce((total, item) => total + (item.toolId.price * item.quantity), 0);

        await cart.save();

        res.json(cart);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

const clearCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({
            userId: req.user.id
        });

        if (!cart) {
            return res.status(404).json({
                msg: "Cart not found"
            });
        }

        cart.items = []
        cart.total = 0

        await cart.save();

        res.json(cart);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

module.exports = {
    getCart,
    addItemToCart,
    updateCartItem,
    removeCartItem,
    clearCart
};

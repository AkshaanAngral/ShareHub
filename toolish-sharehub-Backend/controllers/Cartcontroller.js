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
    console.error("CartController getCart error:", err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

const addItemToCart = async (req, res) => {
  try {
    const { toolId, quantity } = req.body;

    // Validate tool existence
    const tool = await Tool.findById(toolId);
    if (!tool) {
      return res.status(404).json({ message: 'Tool not found' });
    }

    let cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      // Create new cart with initial item and total
      cart = new Cart({
        userId: req.user._id,
        items: [{ toolId, quantity }],
        total: tool.price * quantity
      });
    } else {
      // Cart exists, check if item exists
      const itemIndex = cart.items.findIndex(item => item.toolId.toString() === toolId);

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({ toolId, quantity });
      }

      // Fetch tool prices for all items to calculate total
      const toolIds = cart.items.map(item => item.toolId);
      const tools = await Tool.find({ _id: { $in: toolIds } });
      const toolPriceMap = {};
      tools.forEach(t => {
        toolPriceMap[t._id.toString()] = t.price;
      });

      cart.total = cart.items.reduce((total, item) => {
        const price = toolPriceMap[item.toolId.toString()] || 0;
        return total + price * item.quantity;
      }, 0);
    }

    await cart.save();

    // Populate items.toolId for response
    cart = await Cart.findOne({ userId: req.user.id }).populate('items.toolId', 'name price');

    res.json(cart);
  } catch (err) {
    console.error("CartController addItemToCart error:", err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { toolId } = req.params;
    const { quantity } = req.body;

    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(item => item.toolId.toString() === toolId);
    if (itemIndex === -1) {
      return res.status(400).json({ message: 'Item not found in cart' });
    }

    cart.items[itemIndex].quantity = quantity;

    // Recalculate total
    const toolIds = cart.items.map(item => item.toolId);
    const tools = await Tool.find({ _id: { $in: toolIds } });
    const toolPriceMap = {};
    tools.forEach(t => {
      toolPriceMap[t._id.toString()] = t.price;
    });

    cart.total = cart.items.reduce((total, item) => {
      const price = toolPriceMap[item.toolId.toString()] || 0;
      return total + price * item.quantity;
    }, 0);

    await cart.save();

    cart = await Cart.findOne({ userId: req.user.id }).populate('items.toolId', 'name price');
    res.json(cart);
  } catch (err) {
    console.error("CartController updateCartItem error:", err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

const removeCartItem = async (req, res) => {
  try {
    const { toolId } = req.params;

    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(item => item.toolId.toString() === toolId);
    if (itemIndex === -1) {
      return res.status(400).json({ message: 'Item not found in cart' });
    }

    cart.items.splice(itemIndex, 1);

    // Recalculate total
    const toolIds = cart.items.map(item => item.toolId);
    const tools = await Tool.find({ _id: { $in: toolIds } });
    const toolPriceMap = {};
    tools.forEach(t => {
      toolPriceMap[t._id.toString()] = t.price;
    });

    cart.total = cart.items.reduce((total, item) => {
      const price = toolPriceMap[item.toolId.toString()] || 0;
      return total + price * item.quantity;
    }, 0);

    await cart.save();

    cart = await Cart.findOne({ userId: req.user.id }).populate('items.toolId', 'name price');
    res.json(cart);
  } catch (err) {
    console.error("CartController removeCartItem error:", err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

const clearCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = [];
    cart.total = 0;

    await cart.save();

    cart = await Cart.findOne({ userId: req.user.id }).populate('items.toolId', 'name price');
    res.json(cart);
  } catch (err) {
    console.error("CartController clearCart error:", err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

module.exports = {
  getCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearCart
};

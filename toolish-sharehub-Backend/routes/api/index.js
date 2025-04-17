const express = require("express");
const router = express.Router();

const authRoutes = require("./Auth.route");
const categoryRoutes = require("./Category.route");
const toolRoutes = require("./Tool.route"); // Import the tool route
const cartRoutes = require('./Cart.route');
const chatRoutes = require("./Chat.route");


// Use the routes
router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);
router.use("/tools", toolRoutes); // Use the tool route
router.use('/cart', cartRoutes);
router.use("/chat", chatRoutes);


module.exports = router;

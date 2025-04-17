const express = require("express");
const router = express.Router();
const { addTool } = require("../../controllers/tool/addTool");
const { getTools } = require("../../controllers/tool/getTools");
const protect = require("../../middleware/authMiddleware"); // Import authentication middleware

// Route to add a tool (protected, requires login)
router.post("/", protect, addTool);

// Route to get all tools (public)
router.get("/", getTools);

module.exports = router;

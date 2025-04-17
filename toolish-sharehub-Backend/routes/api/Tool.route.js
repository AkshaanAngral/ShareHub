const express = require("express");
const router = express.Router();
const { addTool } = require("../../controllers/tool/addTool");
const { getTools } = require("../../controllers/tool/getTools");
const { getToolById } = require("../../controllers/tool/getToolById");
const authMiddleware = require("../../middleware/authMiddleware");

// ✅ Add a tool - POST /api/tools
router.post("/", authMiddleware, addTool); // Protect the route with authentication
// ✅ Get all tools - GET /api/tools
router.get("/", getTools);
// ✅ Get a tool by ID - GET /api/tools/:id
router.get("/:id", getToolById);

module.exports = router;

const express = require("express");
const router = express.Router();
const { addTool } = require("../../controllers/tool/addTool");
const { getTools } = require("../../controllers/tool/getTools");
const { getToolById } = require("../../controllers/tool/getToolById");
const authMiddleware = require("../../middleware/authMiddleware");
const { getMyTools } = require("../../controllers/tool/getMyTools");
// ✅ Add a tool - POST /api/tools
router.post("/", authMiddleware, addTool); // Protect the route with authentication
// ✅ Get all tools - GET /api/tools
router.get("/", getTools);
// ✅ Get a tool by ID - GET /api/tools/:id
router.get("/my", authMiddleware, getMyTools);
router.get("/:id", getToolById);
// ✅ Get tools by current user - GET /api/tools/my


module.exports = router;

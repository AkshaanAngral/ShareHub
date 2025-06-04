const express = require("express");
const router = express.Router();
const { addTool } = require("../../controllers/tool/addTool");
const { getTools } = require("../../controllers/tool/getTools");
const { getToolById } = require("../../controllers/tool/getToolById");
const { getMyTools } = require("../../controllers/tool/getMyTools");
const authMiddleware = require("../../middleware/authMiddleware");
const { upload } = require("../../config/cloudinary");

// POST /api/tools - Add a tool (with image upload)
router.post("/", authMiddleware, upload.single('image'), addTool);

// GET /api/tools - Get all tools
router.get("/", getTools);

// GET /api/tools/my - Get tools by current user
router.get("/my", authMiddleware, getMyTools);

// GET /api/tools/:id - Get a tool by ID
router.get("/:id", getToolById);

module.exports = router;

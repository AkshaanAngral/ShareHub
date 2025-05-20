const Tool = require("../../models/Tool.model");

const getMyTools = async (req, res) => {
  try {
    // req.user is set by your authMiddleware
    const tools = await Tool.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ tools });
  } catch (error) {
    console.error("Error fetching user's tools:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { getMyTools };

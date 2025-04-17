const Tool = require("../../models/Tool.model");

const getTools = async (req, res) => {
  try {
    const tools = await Tool.find().populate("owner", "name email"); // Fetch tools with owner details

    res.status(200).json({ tools });
  } catch (error) {
    console.error("Error fetching tools:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { getTools };

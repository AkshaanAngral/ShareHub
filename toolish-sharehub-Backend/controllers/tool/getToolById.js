const Tool = require("../../models/Tool.model");

const getToolById = async (req, res) => {
    try {
        const tool = await Tool.findById(req.params.id).populate('owner', 'name rating responseTime');

        if (!tool) {
            return res.status(404).json({ message: "Tool not found" });
        }

        // Check if owner exists
        if (!tool.owner) {
            return res.status(404).json({ message: "Owner not found" });
        }

        res.json(tool);
    } catch (error) {
        console.error("Error fetching tool:", error);
        if (error.name === "CastError") {
            return res.status(400).json({ message: "Invalid tool ID" });
        }
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { getToolById };

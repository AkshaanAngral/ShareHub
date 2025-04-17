const Tool = require("../../models/Tool.model");

const addTool = async (req, res) => {
  const { name, category, description, price, image } = req.body;
  try {
    // Check if req.user exists
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const owner = req.user._id;

    if (!name || !category || !description || !price || !image) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newTool = new Tool({
      name,
      category,
      description,
      price,
      image,
      owner,
    });

    await newTool.save();

    res.status(201).json({ message: "Tool added successfully!", tool: newTool });
  } catch (error) {
    console.error("Error adding tool:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: "Validation error", errors: error.errors });
    }
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

module.exports = { addTool };

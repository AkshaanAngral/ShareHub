const Tool = require("../../models/Tool.model");

const addTool = async (req, res) => {
  try {
    // Multer parses form-data, so fields are in req.body, file in req.file
    const { name, category, description, price, imageUrl } = req.body;
    const owner = req.user?._id;

    // Validate required fields
    if (!name || !category || !description || !price) {
      return res.status(400).json({ message: "Name, category, description, and price are required" });
    }

    // Handle image: prefer uploaded file, fallback to URL
    let image = imageUrl;
    if (req.file && req.file.path) {
      image = req.file.path;
    }
    if (!image) {
      return res.status(400).json({ message: "Either upload an image or provide an image URL" });
    }

    const toolData = {
      name,
      category,
      description,
      price: parseFloat(price),
      image,
      owner,
    };

    const newTool = new Tool(toolData);
    await newTool.save();

    res.status(201).json({ message: "Tool added successfully!", tool: newTool });
  } catch (error) {
    console.error('❌ Error in addTool controller:', error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

module.exports = { addTool };

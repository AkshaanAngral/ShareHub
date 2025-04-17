const User = require("../../models/User.model");
const jwt = require("jsonwebtoken");

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Simple password check (no hashing)
    if (password !== user.password) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    // Generate JWT
    const secretKey = process.env.ACCESS_TOKEN_SECRET;
    if (!secretKey) {
      return res.status(500).json({ message: "JWT Secret Key is missing!" });
    }

    const payload = {
      id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin || false,
    };

    const token = jwt.sign(payload, secretKey, { expiresIn: "30d" });

    // Send token back
    res.status(200).json({
      message: "Login successful",
      token, // <-- You’ll copy this in Postman
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin || false,
      },
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

module.exports = login;

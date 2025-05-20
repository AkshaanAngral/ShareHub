const jwt = require("jsonwebtoken");
const User = require("../models/User.model");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 1. Check if authorization header exists and starts with "Bearer "
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, token missing" });
    }

    const token = authHeader.split(" ")[1];

    // 2. Check if the secret key is set
    const secret = process.env.ACCESS_TOKEN_SECRET;
    if (!secret) {
      return res.status(500).json({ message: "Internal server error: Secret key missing" });
    }

    // 3. Verify the token
    const decoded = jwt.verify(token, secret);

    // 4. Fetch the user from the database
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Not authorized, user not found" });
    }

    // 5. Keep original user object but add chatId property for chat functionality
    req.user = user;
    req.user.chatId = user.email; // Add email as chatId for chat system

    // 6. Proceed to next middleware/controller
    next();

  } catch (error) {
    // Handle specific JWT errors with appropriate status and messages
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Session expired, please login again" });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token, please login again" });
    } else {
      return res.status(500).json({ message: "Internal server error during authentication" });
    }
  }
};

module.exports = protect;
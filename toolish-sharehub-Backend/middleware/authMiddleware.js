const jwt = require("jsonwebtoken");
const User = require("../models/User.model");

const protect = async (req, res, next) => {
  console.log("authMiddleware called");
  console.log("Request Headers:", req.headers);

  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      console.log("Token:", token);
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      console.log("Decoded Token:", decoded);

      // Fetch the user based on the decoded ID
      const user = await User.findById(decoded.id).select("-password");
      console.log("User:", user);

      if (!user) {
        console.log("User not found");
        return res.status(401).json({ message: "Not authorized, user not found" });
      }

      req.user = user; // Attach the user object to the request
      next();
    } catch (error) {
      console.error("JWT Verification Error:", error);
      return res.status(401).json({ message: "Not authorized, invalid token" });
    }
  } else {
    console.log("No token found");
    return res.status(401).json({ message: "Not authorized, token missing" });
  }
};

module.exports = protect;

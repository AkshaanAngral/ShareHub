const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken"); // Import jwt
require("../../passport"); // Google OAuth strategy config

const register = require("../../controllers/auth/register");
const login = require("../../controllers/auth/login");

const router = express.Router();

// 🟢 Email/Password Authentication
router.post("/register", register);
router.post("/login", login);

// 🔵 Google OAuth Login Route
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], prompt: 'select_account' })
);

// 🔵 Google OAuth Callback
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    // Generate JWT token after successful Google authentication
    const payload = {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      isAdmin: req.user.isAdmin,
    };

    const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "1h",
    });

    // Redirect to frontend with the JWT token
    res.redirect(`http://localhost:5173/?token=${token}`);
  }
);

// 🟣 Fetch Current Logged-in Google User
router.get("/google/user", (req, res) => {
  if (req.user) {
    res.status(200).json({ user: req.user });
  } else {
    res.status(401).json({ message: "Not Authenticated" });
  }
});

// 🔴 Logout Route
router.get("/logout", async (req, res) => {
  if (req.isAuthenticated() && req.user && req.user.accessToken) {
    try {
      const revokeUrl = `https://accounts.google.com/o/oauth2/revoke?token=${req.user.accessToken}`;
      await fetch(revokeUrl, { method: 'GET' });

      console.log("Google token revoked successfully");
    } catch (error) {
      console.error("Error revoking Google token:", error);
    }
  }

  req.logout((err) => {
    if (err) return res.status(500).send("Logout error");

    // Clear cookies and local storage
    res.clearCookie('connect.sid');
    res.clearCookie('google-auth-token');

    res.redirect("http://localhost:5173/");
  });
});

module.exports = router;

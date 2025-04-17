const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Optional for Google users
    googleId: { type: String, default: null }, // Add Google ID
    avatar: { type: String }, // Optional profile picture
    accessToken: { type: String }, // Add accessToken for revocation
    isAdmin: { type: Boolean, default: false }, // Add isAdmin field
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);

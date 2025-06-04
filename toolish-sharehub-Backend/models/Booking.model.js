const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    tool: { type: mongoose.Schema.Types.ObjectId, ref: "Tool", required: true },
    toolName: String,
    toolImage: String,
    toolCategory: String,
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Tool owner
    renter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Who rents
    renterName: String,
    renterEmail: String,
    bookingDate: Date,
    returnDate: Date,
    status: {
      type: String,
      enum: ["pending", "confirmed", "rejected", "completed", "cancelled"],
      default: "pending"
    },
    paymentId: String,
    price: Number,
    location: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);

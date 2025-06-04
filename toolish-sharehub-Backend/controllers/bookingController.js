const Booking = require("../models/Booking.model");
const Tool = require("../models/Tool.model");
const User = require("../models/User.model");

// Create a booking
exports.createBooking = async (req, res) => {
  try {
    const { toolId, bookingDate, returnDate, price, location } = req.body;
    const tool = await Tool.findById(toolId).populate("owner");
    if (!tool) return res.status(404).json({ message: "Tool not found" });

    const booking = new Booking({
      tool: tool._id,
      toolName: tool.name,
      toolImage: tool.image,
      toolCategory: tool.category,
      owner: tool.owner,
      renter: req.user._id,
      renterName: req.user.name,
      renterEmail: req.user.email,
      bookingDate,
      returnDate,
      price,
      location,
      status: "pending"
    });
    await booking.save();

    // Real-time: Notify tool owner
    req.app.get("io").to(tool.owner.toString()).emit("booking:new", booking);

    res.status(201).json({ success: true, booking });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get bookings made by the logged-in user (as renter)
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ renter: req.user._id })
      .populate("tool")
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get bookings for tools owned by the logged-in user (as owner)
exports.getOwnerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ owner: req.user._id })
      .populate("tool renter")
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update booking status (confirm, reject, complete)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Only owner or renter can update (add more checks as needed)
    if (
      booking.owner.toString() !== req.user._id.toString() &&
      booking.renter.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    booking.status = status;
    await booking.save();

    // Real-time: Notify both parties
    req.app.get("io").to(booking.owner.toString()).emit("booking:update", booking);
    req.app.get("io").to(booking.renter.toString()).emit("booking:update", booking);

    res.json({ success: true, booking });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Cancel booking (by renter)
exports.cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.renter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only renter can cancel" });
    }
    booking.status = "cancelled";
    await booking.save();

    req.app.get("io").to(booking.owner.toString()).emit("booking:update", booking);
    req.app.get("io").to(booking.renter.toString()).emit("booking:update", booking);

    res.json({ success: true, booking });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

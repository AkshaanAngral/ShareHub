const express = require("express");
const router = express.Router();
const protect = require("../../middleware/authMiddleware");
const bookingController = require("../../controllers/bookingController");

router.post("/", protect, bookingController.createBooking);
router.get("/my", protect, bookingController.getMyBookings);
router.get("/owner", protect, bookingController.getOwnerBookings);
router.patch("/:bookingId/status", protect, bookingController.updateBookingStatus);
router.patch("/:bookingId/cancel", protect, bookingController.cancelBooking);

module.exports = router;

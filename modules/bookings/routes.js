//bookings/routes.js
const express = require("express");
const router = express.Router();
const bookingController = require("./controller");
const { authenticateUser } = require("../../middleware/firebaseAuth");
const { verifyCustomJwt } = require("../../middleware/verifyCustomJwt");
const { verifyAnyToken } = require("../../middleware/verifyAnyTokens");

// Public: Get available time slots for specific staff/date/service
router.get("/slots", bookingController.getAvailableSlots);

// Public: Get available time slots for specific staff/date/service
router.get("/slots", bookingController.getAvailableSlots);

// Customers: Get available barbers and calculated time slots
router.get(
  "/available",
  verifyCustomJwt,
  bookingController.getAvailableBarbersAndSlots
);

// Book appointment (Customer)
router.post("/book", verifyCustomJwt, bookingController.bookAppointment);

// Reschedule appointment (Customer)
router.put(
  "/reschedule/:id",
  verifyCustomJwt,
  bookingController.rescheduleAppointment
);

// Cancel appointment (Customer)
router.delete(
  "/cancel/:id",
  verifyCustomJwt,
  bookingController.cancelAppointment
);

// Barber: Get daily schedule
router.get(
  "/barber/schedule",
  verifyAnyToken,
  bookingController.getBarberSchedule
);

// Barber: Block time off (unavailable slots)
router.post(
  "/barber/block-slot",
  verifyAnyToken,
  bookingController.blockTimeSlot
);

// Barber: Get blocked time slots
router.get(
  "/barber/blocked-slots",
  verifyAnyToken,
  bookingController.getBlockedTimeSlots
);

// Barber: Update blocked time slot
router.put(
  "/barber/blocked-slots/:timeoff_id",
  verifyAnyToken,
  bookingController.updateBlockedTimeSlot
);

// Barber: Delete blocked time slot
router.delete(
  "/barber/blocked-slots/:timeoff_id",
  verifyAnyToken,
  bookingController.deleteBlockedTimeSlot
);

module.exports = router;


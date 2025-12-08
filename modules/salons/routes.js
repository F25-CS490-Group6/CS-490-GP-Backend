const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { verifyAnyToken } = require("../../middleware/verifyAnyTokens");
const salonController = require("./controller");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "salon-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// Always define specific routes BEFORE dynamic ones
// Services endpoint (authenticated - for salon settings, must be before public)
router.get(
  "/:salon_id/services",
  verifyAnyToken,
  salonController.getSalonServices
);

// Products endpoint (authenticated - for salon settings, must be before public)
router.get(
  "/:salon_id/products",
  verifyAnyToken,
  salonController.getSalonProducts
);

// Public endpoint for services (customer view - must be after authenticated)
router.get(
  "/public/:salon_id/services",
  salonController.getSalonServicesPublic
);

// Public endpoint for products (customer view - for salon page)
router.get(
  "/public/:salon_id/products",
  salonController.getSalonProductsPublic
);

router.get("/", verifyAnyToken, salonController.getAllSalons);
router.get("/check-owner", verifyAnyToken, salonController.checkOwnerSalon);
router.get(
  "/:salonId/staff",
  verifyAnyToken,
  salonController.getStaffBySalonId
);
router.get("/staff/schedule", verifyAnyToken, salonController.getDailySchedule);
router.get(
  "/user/visit-history",
  verifyAnyToken,
  salonController.getUserVisitHistory
);
// Salon owner: Get customer visit history
// As a salon owner, I want to see customer visit histories so that I can provide personalized service
router.get(
  "/customers/:customer_id/history",
  verifyAnyToken,
  salonController.getCustomerVisitHistory
);

// POST route for creating a salon - use upload.any() to handle all form fields including files
router.post("/", verifyAnyToken, upload.any(), salonController.createSalon);

// Business hours endpoints (must be before /:salon_id to avoid route conflicts)
router.get("/:salon_id/business-hours", verifyAnyToken, salonController.getSalonBusinessHours);
router.put("/:salon_id/business-hours", verifyAnyToken, salonController.updateSalonBusinessHours);

// Notification settings endpoints (must be before /:salon_id to avoid route conflicts)
router.get("/:salon_id/notification-settings", verifyAnyToken, salonController.getSalonNotificationSettings);
router.put("/:salon_id/notification-settings", verifyAnyToken, salonController.updateSalonNotificationSettings);

// Amenities endpoints (must be before /:salon_id to avoid route conflicts)
router.get("/:salon_id/amenities", verifyAnyToken, salonController.getSalonAmenities);
router.put("/:salon_id/amenities", verifyAnyToken, salonController.updateSalonAmenities);

// Booking settings endpoints (must be before /:salon_id to avoid route conflicts)
router.get("/:salon_id/booking-settings", verifyAnyToken, salonController.getSalonBookingSettings);
router.put("/:salon_id/booking-settings", verifyAnyToken, salonController.updateSalonBookingSettings);

// Loyalty settings endpoints (must be before /:salon_id to avoid route conflicts)
router.get("/:salon_id/loyalty-settings", verifyAnyToken, salonController.getSalonLoyaltySettings);
router.put("/:salon_id/loyalty-settings", verifyAnyToken, salonController.updateSalonLoyaltySettings);

// Slot settings endpoints (must be before /:salon_id to avoid route conflicts)
router.get("/:salon_id/slot-settings", verifyAnyToken, salonController.getSalonSlotSettings);
router.put("/:salon_id/slot-settings", verifyAnyToken, salonController.updateSalonSlotSettings);

// Review settings endpoints (must be before /:salon_id to avoid route conflicts)
router.get("/:salon_id/review-settings", verifyAnyToken, salonController.getSalonReviewSettings);
router.put("/:salon_id/review-settings", verifyAnyToken, salonController.updateSalonReviewSettings);

// Reviews endpoint (public - for customer view, must be before /:salon_id to avoid route conflicts)
const reviewController = require("../reviews/controller");
router.get("/:salon_id/reviews", reviewController.getSalonReviews);

// Operating policies endpoints (must be before /:salon_id to avoid route conflicts)
router.get("/:salon_id/operating-policies", verifyAnyToken, salonController.getSalonOperatingPolicies);
router.put("/:salon_id/operating-policies", verifyAnyToken, salonController.updateSalonOperatingPolicies);

// Public salon endpoints (for customer view - no auth required)
router.get("/public/:salon_id", salonController.getSalonByIdPublic);
router.get("/public/:salon_id/business-hours", salonController.getSalonBusinessHoursPublic);
router.get("/public/:salon_id/booking-policy", salonController.getSalonBookingPolicyPublic);
router.get("/public/:salon_id/reviews", reviewController.getSalonReviews);

// Salon settings endpoints
router.get("/:salon_id", verifyAnyToken, salonController.getSalonById);
router.put("/:salon_id", verifyAnyToken, upload.any(), salonController.updateSalon);

module.exports = router;

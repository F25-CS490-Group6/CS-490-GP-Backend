//admins/routes.js
const express = require("express");
const router = express.Router();
const adminController = require("./controller");
const { verifyCustomJwt } = require("../../middleware/verifyCustomJwt");
const checkRoles = require("../../middleware/checkRoles");

// All admin routes require admin role
const adminOnly = [verifyCustomJwt, checkRoles("admin")];

router.get("/user-engagement", ...adminOnly, adminController.getUserEngagement);
router.get("/appointment-trends", ...adminOnly, adminController.getAppointmentTrends);
router.get("/salon-revenues", ...adminOnly, adminController.getSalonRevenues);
router.get("/loyalty-usage", ...adminOnly, adminController.getLoyaltyUsage);
router.get("/user-demographics", ...adminOnly, adminController.getUserDemographics);
router.get("/customer-retention", ...adminOnly, adminController.getCustomerRetention);
router.get("/reports", ...adminOnly, adminController.getReports);
router.get("/system-logs", ...adminOnly, adminController.getSystemLogs);
router.get("/pending-salons", ...adminOnly, adminController.getPendingSalons);
router.get("/system-health", ...adminOnly, adminController.getSystemHealth);

// Salon verification route
// As an admin, I want to verify salon registrations so that only legitimate businesses are listed.
router.post("/verify/:salon_id", ...adminOnly, adminController.verifySalonRegistration);
// Also support the shorter :sid parameter for backward compatibility
router.post("/verify/:sid", ...adminOnly, adminController.verifySalonRegistration);

module.exports = router;

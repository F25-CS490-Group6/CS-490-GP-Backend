const express = require("express");
const router = express.Router();
const staffController = require("./controller");
const { verifyCustomJwt } = require("../../middleware/verifyCustomJwt");
const checkRoles = require("../../middleware/checkRoles");

// ===== Public routes =====
router.post("/login", staffController.verifyStaffLogin);
router.post("/set-pin", staffController.setStaffPin);
router.get("/public/salon/:id", staffController.getStaffBySalonPublic);

// Get all staff for salon (public endpoint for customer view) - MUST be before protected routes
router.get(
  "/salon/:id/staff",
  staffController.getStaffBySalonPublic
);

// ===== Staff role management =====
router.get("/staff_roles", staffController.getStaffRoles);
router.post("/staff_roles", staffController.addStaffRole);

// ===== Protected routes =====

// Add or edit staff (Owner/Admin only)
router.post(
  "/staff",
  verifyCustomJwt,
  checkRoles("owner", "admin"),
  staffController.addStaff
);

router.put(
  "/staff/:id",
  verifyCustomJwt,
  checkRoles("owner", "admin"),
  staffController.editStaff
);

// Get single staff
router.get(
  "/staff/:id",
  verifyCustomJwt,
  checkRoles(["owner", "admin", "staff"]),
  staffController.getStaff
);

router.delete(
  "/staff/:id",
  verifyCustomJwt,
  checkRoles("owner", "admin"),
  staffController.deleteStaff
);

// Metrics
router.get(
  "/count",
  verifyCustomJwt,
  checkRoles("owner", "admin"),
  staffController.getStaffCount
);

router.get(
  "/avg",
  verifyCustomJwt,
  checkRoles("owner", "admin"),
  staffController.getStaffAvgRev
);

router.get(
  "/efficiency/:id",
  verifyCustomJwt,
  checkRoles("owner", "admin", "staff"),
  staffController.getStaffEfficiency
);

router.get(
  "/efficiency",
  verifyCustomJwt,
  checkRoles("owner", "admin"),
  staffController.getAvgEfficiency
);

router.get(
  "/revenue/:id",
  verifyCustomJwt,
  checkRoles("owner", "admin", "staff"),
  staffController.getStaffRevenue
);

module.exports = router;

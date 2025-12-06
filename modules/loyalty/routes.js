//loyalty/routes.js
const express = require("express");
const router = express.Router();
const loyaltyController = require("./controller");
const { verifyCustomJwt } = require("../../middleware/verifyCustomJwt");

// User endpoints - manage personal loyalty points
router.get("/my-summary", verifyCustomJwt, loyaltyController.getMyLoyaltySummary);
router.get("/my-points/:salon_id", verifyCustomJwt, loyaltyController.getMyPoints);
router.post("/redeem", verifyCustomJwt, loyaltyController.redeemLoyaltyPoints);
router.post("/calculate-discount", verifyCustomJwt, loyaltyController.calculateDiscount);

// Admin/manual endpoints (legacy - use auto-award instead)
router.post("/earn", verifyCustomJwt, loyaltyController.earnLoyaltyPoints);
router.get("/:user_id/:salon_id", verifyCustomJwt, loyaltyController.getLoyaltyPoints);

// Salon owner endpoints - configure loyalty program
router.post("/config", verifyCustomJwt, loyaltyController.setLoyaltyConfig);
router.get("/config/:salon_id", verifyCustomJwt, loyaltyController.getLoyaltyConfig);

module.exports = router;


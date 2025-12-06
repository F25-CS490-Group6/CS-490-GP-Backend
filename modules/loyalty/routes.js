//loyalty/routes.js
const express = require("express");
const router = express.Router();
const loyaltyController = require("./controller");
const { verifyAnyToken } = require("../../middleware/verifyAnyTokens");

// User endpoints - manage personal loyalty points
router.get("/my-summary", verifyAnyToken, loyaltyController.getMyLoyaltySummary);
router.get("/my-points/:salon_id", verifyAnyToken, loyaltyController.getMyPoints);
router.post("/redeem", verifyAnyToken, loyaltyController.redeemLoyaltyPoints);
router.post("/calculate-discount", verifyAnyToken, loyaltyController.calculateDiscount);

// Admin/manual endpoints (legacy - use auto-award instead)
router.post("/earn", verifyAnyToken, loyaltyController.earnLoyaltyPoints);
router.get("/:user_id/:salon_id", verifyAnyToken, loyaltyController.getLoyaltyPoints);

// Salon owner endpoints - configure loyalty program
router.post("/config", verifyAnyToken, loyaltyController.setLoyaltyConfig);
router.get("/config/:salon_id", verifyAnyToken, loyaltyController.getLoyaltyConfig);

module.exports = router;


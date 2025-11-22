const express = require("express");
const router = express.Router();
const subscriptionController = require("./controller");
const { verifyAnyToken } = require("../../middleware/verifyAnyToken");

// Create checkout session (requires auth)
router.post("/checkout", verifyAnyToken, subscriptionController.createCheckout);

// Webhook endpoint (no auth - Stripe verifies via signature)
router.post(
  "/webhook",
  express.raw({ type: "application/json" }), // Required by Stripe
  subscriptionController.handleWebhook
);

// Get subscription history (requires auth)
router.get("/history", verifyAnyToken, subscriptionController.getHistory);

// Get subscription status (requires auth)
router.get("/status", verifyAnyToken, subscriptionController.getStatus);

module.exports = router;


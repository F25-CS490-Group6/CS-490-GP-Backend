const express = require("express");
const router = express.Router();
const subscriptionController = require("./controller");
const { verifyAnyToken } = require("../../middleware/verifyAnyTokens");

// Create checkout session (requires auth)
router.post("/checkout", verifyAnyToken, subscriptionController.createCheckout);

// Note: Webhook endpoint is handled in app.js with raw body middleware
// This route should not be used directly since webhook is registered in app.js
// Keeping it here for reference but it won't be hit due to app.js registration

// Get subscription history (requires auth)
router.get("/history", verifyAnyToken, subscriptionController.getHistory);

// Get subscription status (requires auth)
router.get("/status", verifyAnyToken, subscriptionController.getStatus);

module.exports = router;


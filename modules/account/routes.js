const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const { verifyAnyToken } = require("../../middleware/verifyAnyTokens");
const accountController = require("./controller");

// Rate limiter for password changes - prevents brute force attacks
const passwordChangeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes per IP
  message: "Too many password change attempts, please try again later",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Account settings
router.get("/settings", verifyAnyToken, accountController.getAccountSettings);
router.put("/settings", verifyAnyToken, accountController.updateAccountSettings);

// Password (with rate limiting)
router.put("/password", verifyAnyToken, passwordChangeLimiter, accountController.changePassword);

// Subscription
router.get("/subscription/plans", verifyAnyToken, accountController.getSubscriptionPlans);
router.get("/subscription", verifyAnyToken, accountController.getCurrentSubscription);
router.put("/subscription", verifyAnyToken, accountController.updateSubscription);

// Account deletion
router.delete("/", verifyAnyToken, accountController.deleteAccount);

module.exports = router;


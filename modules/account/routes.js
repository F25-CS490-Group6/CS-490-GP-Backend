const express = require("express");
const router = express.Router();
const { verifyAnyToken } = require("../../middleware/verifyAnyTokens");
const accountController = require("./controller");

// Account settings
router.get("/settings", verifyAnyToken, accountController.getAccountSettings);
router.put("/settings", verifyAnyToken, accountController.updateAccountSettings);

// Password
router.put("/password", verifyAnyToken, accountController.changePassword);

// Subscription
router.get("/subscription/plans", verifyAnyToken, accountController.getSubscriptionPlans);
router.get("/subscription", verifyAnyToken, accountController.getCurrentSubscription);
router.put("/subscription", verifyAnyToken, accountController.updateSubscription);

// Account deletion
router.delete("/", verifyAnyToken, accountController.deleteAccount);

module.exports = router;


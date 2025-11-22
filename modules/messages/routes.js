//messages/routes.js
const express = require("express");
const router = express.Router();
const { verifyAnyToken } = require("../../middleware/verifyAnyTokens");
const messageController = require("./controller");

router.post("/", verifyAnyToken, messageController.sendMessage);
router.get("/salon/:salon_id", verifyAnyToken, messageController.getSalonMessages);
router.get("/salon/:salon_id/customers", verifyAnyToken, messageController.getSalonCustomers);
router.get("/salon/:salon_id/conversation/:customer_id", verifyAnyToken, messageController.getConversation);

module.exports = router;


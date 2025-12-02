//history/routes.js
const express = require("express");
const router = express.Router();
const historyController = require("./controller");
const { verifyAnyToken } = require("../../middleware/verifyAnyTokens");

router.get("/user", verifyAnyToken, historyController.getUserHistory);
router.get("/user/export", verifyAnyToken, historyController.exportUserHistory);
router.get("/salon/:salon_id", verifyAnyToken, historyController.getSalonVisitHistory);

module.exports = router;


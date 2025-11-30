const express = require("express");
const router = express.Router();
const { verifyAnyToken } = require("../../middleware/verifyAnyTokens");
const serviceController = require("./controller");

// Service management routes - accessible by owners and staff
router.post("/", verifyAnyToken, serviceController.createService);
router.put("/:id", verifyAnyToken, serviceController.updateService);
router.delete("/:id", verifyAnyToken, serviceController.deleteService);

module.exports = router;


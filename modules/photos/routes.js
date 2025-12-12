//photos/routes.js
const express = require("express");
const router = express.Router();
const photoController = require("./controller");
const { verifyAnyToken } = require("../../middleware/verifyAnyTokens");
const upload = require("../../middleware/upload");

// Service photos (before/after)
// IMPORTANT: Specific routes must come before dynamic routes
router.post("/add", verifyAnyToken, upload.single('photo'), photoController.addServicePhoto);
router.get("/user/:user_id", verifyAnyToken, photoController.getUserPhotos);
router.delete("/service/:photo_id", verifyAnyToken, photoController.deleteServicePhoto);
router.get("/:appointment_id", verifyAnyToken, photoController.getServicePhotos);

// Salon gallery photos
router.get("/salon/:salon_id", photoController.getSalonGallery);
router.post("/salon", verifyAnyToken, upload.single('photo'), photoController.addSalonPhoto);
router.delete("/salon/:photo_id", verifyAnyToken, photoController.deleteSalonPhoto);

module.exports = router;


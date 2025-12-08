//notifications/routes.js
const express = require("express");
const router = express.Router();
const notificationController = require("./controller");
const { verifyAnyToken } = require("../../middleware/verifyAnyTokens");

router.post("/reminder", verifyAnyToken, notificationController.sendAppointmentReminder);
router.post("/promotion", verifyAnyToken, notificationController.sendPromotionalOffer);
router.post("/delay", verifyAnyToken, notificationController.notifyClientDelay);
router.post("/discount", verifyAnyToken, notificationController.notifyUserDiscount);

router.get("/", verifyAnyToken, notificationController.getUserNotifications);
router.put("/:id/read", verifyAnyToken, notificationController.markNotificationRead);
router.put("/read-all", verifyAnyToken, notificationController.markAllNotificationsRead);

// Salon owner endpoints for promotional offers
router.post("/loyal-customers", verifyAnyToken, notificationController.getLoyalCustomers);
router.post("/send-promotion", verifyAnyToken, notificationController.sendPromotionToCustomers);

module.exports = router;


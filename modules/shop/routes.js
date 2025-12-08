//shop/routes.js
const express = require("express");
const router = express.Router();
const shopController = require("./controller");
const { verifyAnyToken } = require("../../middleware/verifyAnyTokens");

// Product management
router.post("/add-product", verifyAnyToken, shopController.addProduct);
router.put("/update-product/:product_id", verifyAnyToken, shopController.updateProduct);
router.get("/products/:salon_id", shopController.getSalonProducts);

// Cart management
router.post("/add-to-cart", verifyAnyToken, shopController.addToCart);
router.post("/add-appointment-to-cart", verifyAnyToken, shopController.addAppointmentToCart);
router.get("/cart", verifyAnyToken, shopController.getCart);
router.get("/unified-cart", verifyAnyToken, shopController.getUnifiedCart);
router.delete("/cart/:item_id", verifyAnyToken, shopController.removeFromCart);
router.delete("/cart-services", verifyAnyToken, shopController.deleteAllServiceItems);

// Checkout (deprecated - use unified checkout via payments endpoint)
router.post("/checkout", verifyAnyToken, shopController.checkoutCart);

module.exports = router;


//shop/routes.js
const express = require("express");
const router = express.Router();
const shopController = require("./controller");
const { verifyCustomJwt } = require("../../middleware/verifyCustomJwt");

// Product management
router.post("/add-product", verifyCustomJwt, shopController.addProduct);
router.put("/update-product/:product_id", verifyCustomJwt, shopController.updateProduct);
router.get("/products/:salon_id", shopController.getSalonProducts);

// Cart management
router.post("/add-to-cart", verifyCustomJwt, shopController.addToCart);
router.post("/add-appointment-to-cart", verifyCustomJwt, shopController.addAppointmentToCart);
router.get("/cart", verifyCustomJwt, shopController.getCart);
router.get("/unified-cart", verifyCustomJwt, shopController.getUnifiedCart);
router.delete("/cart/:item_id", verifyCustomJwt, shopController.removeFromCart);

// Checkout (deprecated - use unified checkout via payments endpoint)
router.post("/checkout", verifyCustomJwt, shopController.checkoutCart);

module.exports = router;


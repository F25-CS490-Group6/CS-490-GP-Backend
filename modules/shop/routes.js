//shop/routes.js
const express = require("express");
const router = express.Router();
const shopController = require("./controller");
const { verifyAnyToken } = require("../../middleware/verifyAnyTokens");

router.post("/add-product", verifyAnyToken, shopController.addProduct);
router.put("/update-product/:product_id", verifyAnyToken, shopController.updateProduct);
router.get("/products/:salon_id", shopController.getSalonProducts);
router.post("/add-to-cart", verifyAnyToken, shopController.addToCart);
router.get("/cart", verifyAnyToken, shopController.getCart);
router.post("/checkout", verifyAnyToken, shopController.checkoutCart);

module.exports = router;


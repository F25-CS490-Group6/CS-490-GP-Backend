//reviews/routes.js
const express = require("express");
const router = express.Router();
const reviewController = require("./controller");
const { verifyCustomJwt } = require("../../middleware/verifyCustomJwt");

// Public route - get reviews for a salon
router.get("/salon/:salon_id", reviewController.getSalonReviews);

// Protected routes
const { verifyAnyToken } = require("../../middleware/verifyAnyTokens");
router.post("/add", verifyAnyToken, reviewController.addReview);
router.put("/respond/:id", verifyCustomJwt, reviewController.addReviewResponse);

module.exports = router;


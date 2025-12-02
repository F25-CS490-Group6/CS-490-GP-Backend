//reviews/routes.js
const express = require("express");
const router = express.Router();
const reviewController = require("./controller");
const { verifyCustomJwt } = require("../../middleware/verifyCustomJwt");

// Protected routes (must be before generic :salon_id route)
const { verifyAnyToken } = require("../../middleware/verifyAnyTokens");
router.post("/add", verifyAnyToken, reviewController.addReview);
router.put("/respond/:id", verifyCustomJwt, reviewController.addReviewResponse);
router.put("/:id", verifyAnyToken, reviewController.updateReview);
router.delete("/:id", verifyAnyToken, reviewController.deleteReview);

// Public routes - get reviews for a salon (optional auth to show edit/delete for own reviews)
// Support both /api/reviews/salon/:salon_id and /api/reviews/:salon_id
// Use verifyAnyToken as optional middleware - it won't fail if no token, but will attach user if token exists
router.get("/salon/:salon_id", (req, res, next) => {
  // Try to verify token if present, but don't fail if missing
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
  if (token) {
    // Token exists, verify it
    const { verifyAnyToken } = require("../../middleware/verifyAnyTokens");
    return verifyAnyToken(req, res, next);
  }
  // No token, continue without auth
  next();
}, reviewController.getSalonReviews);
router.get("/:salon_id", (req, res, next) => {
  // Try to verify token if present, but don't fail if missing
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
  if (token) {
    // Token exists, verify it
    const { verifyAnyToken } = require("../../middleware/verifyAnyTokens");
    return verifyAnyToken(req, res, next);
  }
  // No token, continue without auth
  next();
}, reviewController.getSalonReviews);

module.exports = router;


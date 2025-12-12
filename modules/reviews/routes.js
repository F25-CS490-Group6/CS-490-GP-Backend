//reviews/routes.js
const express = require("express");
const router = express.Router();
const reviewController = require("./controller");
const { verifyCustomJwt } = require("../../middleware/verifyCustomJwt");

// Protected routes (must be before generic :salon_id route)
const { verifyAnyToken } = require("../../middleware/verifyAnyTokens");
router.post("/add", verifyAnyToken, reviewController.addReview);
router.put("/respond/:id", verifyAnyToken, reviewController.addReviewResponse);
router.put("/:id", verifyAnyToken, reviewController.updateReview);
router.delete("/:id", verifyAnyToken, reviewController.deleteReview);

// Public routes - get reviews for a salon (optional auth to show edit/delete for own reviews)
// Support both /api/reviews/salon/:salon_id and /api/reviews/:salon_id
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
  if (token) {
    // Try to verify, but don't fail if invalid - just continue without user
    const { verifyAnyToken } = require("../../middleware/verifyAnyTokens");
    verifyAnyToken(req, res, (err) => {
      // If verification fails, just continue without user (public route)
      if (err) {
        req.user = null;
      }
      next();
    });
  } else {
    next();
  }
};

router.get("/salon/:salon_id", optionalAuth, reviewController.getSalonReviews);
router.get("/:salon_id", optionalAuth, reviewController.getSalonReviews);

module.exports = router;


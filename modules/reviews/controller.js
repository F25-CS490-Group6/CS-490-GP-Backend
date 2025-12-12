//reviews/controller.js
const reviewService = require("./service");

exports.addReview = async (req, res) => {
  try {
    const { appointment_id, salon_id, staff_id, rating, comment } = req.body;
    const user_id = req.user?.user_id || req.user?.id;

    if (!user_id) {
      return res.status(400).json({ error: "User not authenticated" });
    }

    if (!salon_id || !rating || !comment) {
      return res.status(400).json({ error: "Salon ID, rating, and comment are required" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    // appointment_id and staff_id are optional (can be null/0 for salon-only reviews)
    const review_id = await reviewService.addReview(
      appointment_id && appointment_id > 0 ? appointment_id : null, 
      user_id, 
      salon_id, 
      staff_id && staff_id > 0 ? staff_id : null, 
      rating, 
      comment
    );
    res.json({ message: "Review added", review_id });
  } catch (err) {
    console.error("Add review error:", err);
    res.status(500).json({ error: err.message || "Failed to add review" });
  }
};

exports.addReviewResponse = async (req, res) => {
  try {
    const review_id = req.params.id;
    const { response, salon_id } = req.body;
    const userId = req.user?.user_id || req.user?.id;
    const staffId = req.user?.staff_id;
    
    if (!userId && !staffId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    if (!salon_id) {
      return res.status(400).json({ error: "Salon ID is required" });
    }
    
    const { db } = require("../../config/database");
    
    // Check if user is salon owner OR staff member of the salon
    let isAuthorized = false;
    
    // Check if salon owner
    const [salons] = await db.query(
      "SELECT owner_id FROM salons WHERE salon_id = ?",
      [salon_id]
    );
    
    if (!salons || salons.length === 0) {
      return res.status(404).json({ error: "Salon not found" });
    }
    
    if (salons[0].owner_id === userId || req.user?.user_role === 'admin') {
      isAuthorized = true;
    }
    
    // Check if staff member of this salon
    if (!isAuthorized && staffId) {
      const [staff] = await db.query(
        "SELECT staff_id FROM staff WHERE staff_id = ? AND salon_id = ?",
        [staffId, salon_id]
      );
      if (staff && staff.length > 0) {
        isAuthorized = true;
      }
    }
    
    if (!isAuthorized) {
      return res.status(403).json({ error: "Not authorized to respond to reviews for this salon" });
    }
    
    await reviewService.addReviewResponse(review_id, response, salon_id);
    res.json({ message: "Response added successfully" });
  } catch (err) {
    console.error("Response error:", err);
    res.status(500).json({ error: err.message || "Failed to add response" });
  }
};

/**
 * Get reviews for a salon (public endpoint)
 * If user is authenticated, include their user_id to show edit/delete options
 */
exports.getSalonReviews = async (req, res) => {
  try {
    const { salon_id } = req.params;
    const currentUserId = req.user?.user_id || req.user?.id || null;
    const reviews = await reviewService.getSalonReviews(salon_id, currentUserId);
    res.json(reviews);
  } catch (err) {
    console.error("Get reviews error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Update review
 * PUT /api/reviews/:id
 */
exports.updateReview = async (req, res) => {
  try {
    const review_id = req.params.id;
    const user_id = req.user?.user_id || req.user?.id;
    const { rating, comment } = req.body;

    if (!user_id) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const updatedReview = await reviewService.updateReview(review_id, user_id, { rating, comment });
    res.json({ message: "Review updated", review: updatedReview });
  } catch (err) {
    console.error("Update review error:", err);
    res.status(500).json({ error: err.message || "Failed to update review" });
  }
};

/**
 * Delete review
 * DELETE /api/reviews/:id
 */
exports.deleteReview = async (req, res) => {
  try {
    const review_id = req.params.id;
    const user_id = req.user?.user_id || req.user?.id;

    if (!user_id) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    await reviewService.deleteReview(review_id, user_id);
    res.json({ message: "Review deleted" });
  } catch (err) {
    console.error("Delete review error:", err);
    res.status(500).json({ error: err.message || "Failed to delete review" });
  }
};


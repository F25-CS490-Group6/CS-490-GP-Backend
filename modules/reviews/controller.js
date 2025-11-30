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
    const { response } = req.body;
    await reviewService.addReviewResponse(review_id, response);
    res.json({ message: "Response added" });
  } catch (err) {
    console.error("Response error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get reviews for a salon (public endpoint)
 */
exports.getSalonReviews = async (req, res) => {
  try {
    const { salon_id } = req.params;
    const reviews = await reviewService.getSalonReviews(salon_id);
    res.json(reviews);
  } catch (err) {
    console.error("Get reviews error:", err);
    res.status(500).json({ error: err.message });
  }
};


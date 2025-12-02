//reviews/service.js
const { db } = require("../../config/database");

exports.addReview = async (appointment_id, user_id, salon_id, staff_id, rating, comment) => {
  const [result] = await db.query(
    `INSERT INTO reviews (appointment_id, user_id, salon_id, staff_id, rating, comment, is_visible, is_flagged)
     VALUES (?, ?, ?, ?, ?, ?, TRUE, FALSE)`,
    [appointment_id || null, user_id, salon_id, staff_id || null, rating, comment]
  );
  return result.insertId;
};

exports.addReviewResponse = async (review_id, response) => {
  await db.query(`UPDATE reviews SET response = ? WHERE review_id = ?`, [
    response,
    review_id,
  ]);
};

/**
 * Get review by ID
 */
exports.getReviewById = async (review_id) => {
  const [reviews] = await db.query(
    `SELECT r.*, u.full_name AS customer_name, s.name AS salon_name
     FROM reviews r
     JOIN users u ON r.user_id = u.user_id
     LEFT JOIN salons s ON r.salon_id = s.salon_id
     WHERE r.review_id = ?`,
    [review_id]
  );
  return reviews.length > 0 ? reviews[0] : null;
};

/**
 * Update review
 */
exports.updateReview = async (review_id, user_id, updates) => {
  const { rating, comment } = updates;
  
  // Verify user owns the review
  const review = await exports.getReviewById(review_id);
  if (!review || review.user_id !== user_id) {
    throw new Error("Not authorized to update this review");
  }

  const updateFields = [];
  const values = [];

  if (rating !== undefined) {
    if (rating < 1 || rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }
    updateFields.push("rating = ?");
    values.push(rating);
  }

  if (comment !== undefined) {
    updateFields.push("comment = ?");
    values.push(comment);
  }

  if (updateFields.length === 0) {
    throw new Error("No fields to update");
  }

  values.push(review_id);
  await db.query(
    `UPDATE reviews SET ${updateFields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE review_id = ?`,
    values
  );

  return exports.getReviewById(review_id);
};

/**
 * Delete review
 */
exports.deleteReview = async (review_id, user_id) => {
  // Verify user owns the review
  const review = await exports.getReviewById(review_id);
  if (!review || review.user_id !== user_id) {
    throw new Error("Not authorized to delete this review");
  }

  await db.query(`DELETE FROM reviews WHERE review_id = ?`, [review_id]);
  return { success: true };
};

/**
 * Get reviews for a salon (public)
 * Optionally include user_id if provided (for authenticated users to see their own reviews)
 */
exports.getSalonReviews = async (salonId, currentUserId = null) => {
  const [reviews] = await db.query(
    `SELECT 
      r.review_id,
      r.rating,
      r.comment,
      r.created_at,
      r.user_id,
      u.full_name as customer_name
    FROM reviews r
    JOIN users u ON r.user_id = u.user_id
    WHERE r.salon_id = ? AND r.is_visible = 1 AND r.is_flagged = 0
    ORDER BY r.created_at DESC`,
    [salonId]
  );

  // Calculate stats
  const totalReviews = reviews.length;
  const average = totalReviews > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    : 0;
  
  const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach(r => {
    const rating = Math.round(r.rating);
    if (rating >= 1 && rating <= 5) {
      breakdown[rating] = (breakdown[rating] || 0) + 1;
    }
  });

  return {
    average,
    totalReviews,
    breakdown,
    reviews
  };
};


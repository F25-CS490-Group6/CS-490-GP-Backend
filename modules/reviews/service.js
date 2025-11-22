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
 * Get reviews for a salon (public)
 */
exports.getSalonReviews = async (salonId) => {
  const [reviews] = await db.query(
    `SELECT 
      r.rating,
      r.comment,
      r.created_at,
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


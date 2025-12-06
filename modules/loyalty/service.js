//loyalty/service.js
const { db } = require("../../config/database");

exports.getLoyaltyRecord = async (user_id, salon_id) => {
  const [rows] = await db.query(
    `SELECT * FROM loyalty WHERE user_id = ? AND salon_id = ?`,
    [user_id, salon_id]
  );
  return rows[0];
};

exports.earnLoyaltyPoints = async (user_id, salon_id, points_earned) => {
  const loyalty = await this.getLoyaltyRecord(user_id, salon_id);
  
  if (loyalty) {
    await db.query(
      `UPDATE loyalty SET points = points + ?, last_earned = NOW(), updated_at = NOW() WHERE loyalty_id = ?`,
      [points_earned, loyalty.loyalty_id]
    );
  } else {
    await db.query(
      `INSERT INTO loyalty (user_id, salon_id, points, last_earned) VALUES (?, ?, ?, NOW())`,
      [user_id, salon_id, points_earned]
    );
  }
};

exports.getLoyaltyPoints = async (user_id, salon_id) => {
  const [rows] = await db.query(
    `SELECT points FROM loyalty WHERE user_id = ? AND salon_id = ?`,
    [user_id, salon_id]
  );
  if (rows[0]) {
    return rows[0].points || 0;
  }
  return 0;
};

exports.redeemLoyaltyPoints = async (user_id, salon_id, points_to_redeem) => {
  const loyalty = await this.getLoyaltyRecord(user_id, salon_id);
  
  if (!loyalty || loyalty.points < points_to_redeem) {
    throw new Error("Not enough points");
  }
  
  await db.query(
    `UPDATE loyalty SET points = points - ?, last_redeemed = NOW(), updated_at = NOW() WHERE user_id = ? AND salon_id = ?`,
    [points_to_redeem, user_id, salon_id]
  );
};

/**
 * Set or update loyalty configuration for a salon
 */
exports.setLoyaltyConfig = async (salon_id, config) => {
  const {
    loyalty_enabled = true,
    points_per_dollar = 1.00,
    points_per_visit = 10,
    redeem_rate = 0.01,
    min_points_redeem = 100
  } = config;

  await db.query(
    `INSERT INTO salon_settings (salon_id, loyalty_enabled, points_per_dollar, points_per_visit, redeem_rate, min_points_redeem)
     VALUES (?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       loyalty_enabled = VALUES(loyalty_enabled),
       points_per_dollar = VALUES(points_per_dollar),
       points_per_visit = VALUES(points_per_visit),
       redeem_rate = VALUES(redeem_rate),
       min_points_redeem = VALUES(min_points_redeem)`,
    [salon_id, loyalty_enabled, points_per_dollar, points_per_visit, redeem_rate, min_points_redeem]
  );
};

/**
 * Get loyalty configuration for a salon
 */
exports.getLoyaltyConfig = async (salon_id) => {
  const [rows] = await db.query(
    `SELECT loyalty_enabled, points_per_dollar, points_per_visit, redeem_rate, min_points_redeem
     FROM salon_settings
     WHERE salon_id = ?`,
    [salon_id]
  );

  if (rows[0]) {
    return rows[0];
  }

  // Return defaults if not configured
  return {
    loyalty_enabled: true,
    points_per_dollar: 1.00,
    points_per_visit: 10,
    redeem_rate: 0.01,
    min_points_redeem: 100
  };
};

/**
 * Auto-award points based on purchase amount
 */
exports.awardPointsForPurchase = async (user_id, salon_id, amount) => {
  const config = await this.getLoyaltyConfig(salon_id);

  if (!config.loyalty_enabled) {
    return 0;
  }

  // Calculate points: (amount * points_per_dollar) + bonus per visit
  const pointsFromAmount = Math.floor(amount * config.points_per_dollar);
  const totalPoints = pointsFromAmount + config.points_per_visit;

  await this.earnLoyaltyPoints(user_id, salon_id, totalPoints);

  return totalPoints;
};

/**
 * Calculate discount amount from points
 */
exports.calculateDiscount = async (salon_id, points_to_redeem) => {
  const config = await this.getLoyaltyConfig(salon_id);

  if (points_to_redeem < config.min_points_redeem) {
    throw new Error(`Minimum ${config.min_points_redeem} points required to redeem`);
  }

  const discount = points_to_redeem * config.redeem_rate;
  return parseFloat(discount.toFixed(2));
};

/**
 * Get user's loyalty summary across all salons
 */
exports.getUserLoyaltySummary = async (user_id) => {
  const [rows] = await db.query(
    `SELECT l.salon_id, s.salon_name, l.points, l.last_earned, l.last_redeemed
     FROM loyalty l
     JOIN salons s ON l.salon_id = s.salon_id
     WHERE l.user_id = ?
     ORDER BY l.points DESC`,
    [user_id]
  );
  return rows;
};


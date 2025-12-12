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
  console.log(`[Loyalty] earnLoyaltyPoints called: user_id=${user_id}, salon_id=${salon_id}, points=${points_earned}`);
  const loyalty = await this.getLoyaltyRecord(user_id, salon_id);
  
  if (loyalty) {
    console.log(`[Loyalty] Updating existing loyalty record ${loyalty.loyalty_id}, adding ${points_earned} points`);
    await db.query(
      `UPDATE loyalty SET points = points + ?, last_earned = NOW(), updated_at = NOW() WHERE loyalty_id = ?`,
      [points_earned, loyalty.loyalty_id]
    );
    console.log(`[Loyalty] Successfully updated loyalty record`);
  } else {
    console.log(`[Loyalty] Creating new loyalty record with ${points_earned} points`);
    await db.query(
      `INSERT INTO loyalty (user_id, salon_id, points, last_earned) VALUES (?, ?, ?, NOW())`,
      [user_id, salon_id, points_earned]
    );
    console.log(`[Loyalty] Successfully created new loyalty record`);
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
  console.log(`[Loyalty] redeemLoyaltyPoints called: user_id=${user_id}, salon_id=${salon_id}, points_to_redeem=${points_to_redeem}`);
  const loyalty = await this.getLoyaltyRecord(user_id, salon_id);
  
  if (!loyalty) {
    throw new Error("No loyalty record found");
  }
  
  if (loyalty.points < points_to_redeem) {
    console.error(`[Loyalty] Not enough points: user has ${loyalty.points}, trying to redeem ${points_to_redeem}`);
    throw new Error(`Not enough points. You have ${loyalty.points} points, but trying to redeem ${points_to_redeem}`);
  }
  
  const pointsBefore = loyalty.points;
  await db.query(
    `UPDATE loyalty SET points = points - ?, last_redeemed = NOW(), updated_at = NOW() WHERE user_id = ? AND salon_id = ?`,
    [points_to_redeem, user_id, salon_id]
  );
  
  // Verify the redemption
  const pointsAfter = await this.getLoyaltyPoints(user_id, salon_id);
  console.log(`[Loyalty] Points redeemed successfully: ${pointsBefore} -> ${pointsAfter} (redeemed ${points_to_redeem})`);
  
  if (pointsAfter !== (pointsBefore - points_to_redeem)) {
    console.error(`[Loyalty] WARNING: Points mismatch! Expected ${pointsBefore - points_to_redeem}, got ${pointsAfter}`);
  }
};

/**
 * Set or update loyalty configuration for a salon
 */
exports.setLoyaltyConfig = async (salon_id, config) => {
  const {
    loyalty_enabled = true,
    points_per_dollar = 1.00,
    points_per_visit = 10,
    redeem_rate = 100,
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
    // Properly coerce loyalty_enabled to boolean (MySQL returns 0/1)
    return {
      loyalty_enabled: rows[0].loyalty_enabled === 1 || rows[0].loyalty_enabled === true,
      points_per_dollar: parseFloat(rows[0].points_per_dollar) || 1.00,
      points_per_visit: parseInt(rows[0].points_per_visit) || 10,
      redeem_rate: parseFloat(rows[0].redeem_rate) || 100,
      min_points_redeem: parseInt(rows[0].min_points_redeem) || 100
    };
  }

  // Return defaults if not configured - loyalty enabled by default
  return {
    loyalty_enabled: true,
    points_per_dollar: 1.00,
    points_per_visit: 10,
    redeem_rate: 100,
    min_points_redeem: 100
  };
};

/**
 * Auto-award points based on purchase amount
 */
exports.awardPointsForPurchase = async (user_id, salon_id, amount) => {
  console.log(`[Loyalty] awardPointsForPurchase called: user_id=${user_id}, salon_id=${salon_id}, amount=$${amount}`);
  const config = await this.getLoyaltyConfig(salon_id);
  console.log(`[Loyalty] Config for salon ${salon_id}:`, JSON.stringify(config, null, 2));

  if (!config.loyalty_enabled) {
    console.log(`[Loyalty] Loyalty is disabled for salon ${salon_id}, returning 0 points`);
    return 0;
  }

  // Calculate points: (amount * points_per_dollar) + bonus per visit
  const pointsFromAmount = Math.floor(amount * config.points_per_dollar);
  const totalPoints = pointsFromAmount + config.points_per_visit;
  console.log(`[Loyalty] Calculated points: ${pointsFromAmount} from amount + ${config.points_per_visit} bonus = ${totalPoints} total`);

  await this.earnLoyaltyPoints(user_id, salon_id, totalPoints);
  console.log(`[Loyalty] Points saved to database: ${totalPoints} points for user ${user_id}, salon ${salon_id}`);

  return totalPoints;
};

/**
 * Calculate discount amount from points
 * redeem_rate = points per $1 discount (e.g., 100 points = $1)
 */
exports.calculateDiscount = async (salon_id, points_to_redeem) => {
  const config = await this.getLoyaltyConfig(salon_id);

  if (points_to_redeem < config.min_points_redeem) {
    throw new Error(`Minimum ${config.min_points_redeem} points required to redeem`);
  }

  // redeem_rate = points needed per $1 discount (e.g., 100 means 100 points = $1)
  const pointsPerDollar = parseFloat(config.redeem_rate) || 100;
  const discount = points_to_redeem / pointsPerDollar;
  return parseFloat(discount.toFixed(2));
};

/**
 * Get user's loyalty summary across all salons
 */
exports.getUserLoyaltySummary = async (user_id) => {
  const [rows] = await db.query(
    `SELECT l.salon_id, s.name AS salon_name, l.points, l.last_earned, l.last_redeemed
     FROM loyalty l
     JOIN salons s ON l.salon_id = s.salon_id
     WHERE l.user_id = ?
     ORDER BY l.points DESC`,
    [user_id]
  );
  console.log(`[Loyalty] getUserLoyaltySummary for user ${user_id}: found ${rows.length} salons with points`);
  return rows;
};

// ===== REWARDS =====

exports.getSalonRewards = async (salon_id) => {
  const [rows] = await db.query(
    `SELECT * FROM salon_rewards WHERE salon_id = ? AND is_active = TRUE ORDER BY points_required ASC`,
    [salon_id]
  );
  return rows;
};

exports.createReward = async (salon_id, name, description, points_required) => {
  const [result] = await db.query(
    `INSERT INTO salon_rewards (salon_id, name, description, points_required) VALUES (?, ?, ?, ?)`,
    [salon_id, name, description, points_required]
  );
  return result.insertId;
};

exports.deleteReward = async (reward_id, salon_id) => {
  await db.query(`DELETE FROM salon_rewards WHERE reward_id = ? AND salon_id = ?`, [reward_id, salon_id]);
};

exports.redeemReward = async (user_id, salon_id, reward_id) => {
  const [[reward]] = await db.query(
    `SELECT * FROM salon_rewards WHERE reward_id = ? AND salon_id = ? AND is_active = TRUE`,
    [reward_id, salon_id]
  );
  if (!reward) throw new Error("Reward not found");

  const userPoints = await this.getLoyaltyPoints(user_id, salon_id);
  if (userPoints < reward.points_required) {
    throw new Error(`Need ${reward.points_required} points, have ${userPoints}`);
  }

  await this.redeemLoyaltyPoints(user_id, salon_id, reward.points_required);
  
  await db.query(
    `INSERT INTO user_rewards (user_id, salon_id, reward_id) VALUES (?, ?, ?)`,
    [user_id, salon_id, reward_id]
  );

  return reward;
};

exports.getUserRewards = async (user_id) => {
  const [rows] = await db.query(
    `SELECT ur.*, sr.name, sr.points_required, s.name as salon_name
     FROM user_rewards ur
     JOIN salon_rewards sr ON ur.reward_id = sr.reward_id
     JOIN salons s ON ur.salon_id = s.salon_id
     WHERE ur.user_id = ? ORDER BY ur.redeemed_at DESC`,
    [user_id]
  );
  return rows;
};

// ===== PROMO CODES =====

exports.validatePromoCode = async (code, salon_id, subtotal, user_id = null) => {
  const [rows] = await db.query(
    `SELECT * FROM promo_codes 
     WHERE code = ? AND salon_id = ? AND is_active = 1
     AND (end_date IS NULL OR end_date >= CURDATE())
     AND (usage_limit IS NULL OR usage_limit = 0 OR used_count < usage_limit)`,
    [code.toUpperCase(), salon_id]
  );
  
  if (!rows[0]) return { valid: false, error: "Invalid or expired promo code" };
  
  const promo = rows[0];

  // Check if user has already used this promo code (single-use per customer)
  if (user_id) {
    const [usage] = await db.query(
      `SELECT usage_id FROM promo_code_usage WHERE promo_id = ? AND user_id = ?`,
      [promo.promo_id, user_id]
    );
    if (usage.length > 0) {
      return { valid: false, error: "You have already used this promo code" };
    }
  }
  
  const discount = promo.discount_type === 'percentage' 
    ? (subtotal * promo.discount_value / 100)
    : Math.min(promo.discount_value, subtotal);
  
  return { valid: true, discount: parseFloat(discount.toFixed(2)), promo };
};

exports.usePromoCode = async (promo_id, user_id) => {
  // Increment global usage count
  await db.query(`UPDATE promo_codes SET used_count = used_count + 1 WHERE promo_id = ?`, [promo_id]);
  
  // Track per-user usage (so they can't use again)
  if (user_id) {
    await db.query(
      `INSERT IGNORE INTO promo_code_usage (promo_id, user_id) VALUES (?, ?)`,
      [promo_id, user_id]
    );
  }
};

exports.getSalonPromoCodes = async (salon_id) => {
  const [rows] = await db.query(
    `SELECT * FROM promo_codes WHERE salon_id = ? ORDER BY created_at DESC`,
    [salon_id]
  );
  return rows;
};

exports.createPromoCode = async (salon_id, code, discount_type, discount_value) => {
  const [result] = await db.query(
    `INSERT INTO promo_codes (salon_id, code, discount_type, discount_value)
     VALUES (?, ?, ?, ?)`,
    [salon_id, code.toUpperCase(), discount_type === 'percent' ? 'percentage' : 'fixed', discount_value]
  );
  return result.insertId;
};

exports.deletePromoCode = async (promo_id, salon_id) => {
  await db.query(`DELETE FROM promo_codes WHERE promo_id = ? AND salon_id = ?`, [promo_id, salon_id]);
};


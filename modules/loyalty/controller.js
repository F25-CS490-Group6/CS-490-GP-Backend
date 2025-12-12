//loyalty/controller.js
const loyaltyService = require("./service");

exports.earnLoyaltyPoints = async (req, res) => {
  try {
    const { salon_id, points_earned } = req.body;
    const user_id = req.user.user_id || req.user.id;

    await loyaltyService.earnLoyaltyPoints(user_id, salon_id, points_earned);
    res.json({ message: "Points added" });
  } catch (err) {
    console.error("Earn points error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getLoyaltyPoints = async (req, res) => {
  try {
    const { user_id, salon_id } = req.params;
    const points = await loyaltyService.getLoyaltyPoints(user_id, salon_id);
    res.json({ points });
  } catch (err) {
    console.error("Get points error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.redeemLoyaltyPoints = async (req, res) => {
  try {
    const { salon_id, points_to_redeem } = req.body;
    const user_id = req.user.user_id || req.user.id;

    await loyaltyService.redeemLoyaltyPoints(user_id, salon_id, points_to_redeem);
    res.json({ message: "Points redeemed" });
  } catch (err) {
    console.error("Redeem error:", err);
    if (err.message === "Not enough points") {
      return res.status(400).json({ error: "Not enough points" });
    }
    res.status(500).json({ error: err.message });
  }
};

/**
 * Set loyalty configuration (Salon Owner)
 */
exports.setLoyaltyConfig = async (req, res) => {
  try {
    const { salon_id } = req.body;
    const config = {
      loyalty_enabled: req.body.loyalty_enabled,
      points_per_dollar: req.body.points_per_dollar,
      points_per_visit: req.body.points_per_visit,
      redeem_rate: req.body.redeem_rate,
      min_points_redeem: req.body.min_points_redeem
    };

    await loyaltyService.setLoyaltyConfig(salon_id, config);
    res.json({ message: "Loyalty configuration updated successfully" });
  } catch (err) {
    console.error("Config error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get loyalty configuration for a salon
 */
exports.getLoyaltyConfig = async (req, res) => {
  try {
    const { salon_id } = req.params;
    const config = await loyaltyService.getLoyaltyConfig(salon_id);
    res.json(config);
  } catch (err) {
    console.error("Get config error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get current user's loyalty summary across all salons
 */
exports.getMyLoyaltySummary = async (req, res) => {
  try {
    const user_id = req.user.user_id || req.user.id;
    const summary = await loyaltyService.getUserLoyaltySummary(user_id);
    res.json({ summary });
  } catch (err) {
    console.error("Get summary error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get current user's points for a specific salon
 */
exports.getMyPoints = async (req, res) => {
  try {
    const { salon_id } = req.params;
    const user_id = req.user.user_id || req.user.id;
    const points = await loyaltyService.getLoyaltyPoints(user_id, salon_id);
    const config = await loyaltyService.getLoyaltyConfig(salon_id);

    // Ensure redeem_rate is a number (it might come from DB as string)
    const redeemRate = parseFloat(config.redeem_rate) || 0.01;

    res.json({
      salon_id,
      points,
      min_points_redeem: config.min_points_redeem,
      redeem_rate: redeemRate,
      can_redeem: points >= config.min_points_redeem,
      estimated_discount: points >= config.min_points_redeem
        ? (points * redeemRate).toFixed(2)
        : '0.00'
    });
  } catch (err) {
    console.error("Get my points error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Calculate discount for points
 */
exports.calculateDiscount = async (req, res) => {
  try {
    const { salon_id, points_to_redeem } = req.body;
    const discount = await loyaltyService.calculateDiscount(salon_id, points_to_redeem);
    res.json({ discount, points_to_redeem });
  } catch (err) {
    console.error("Calculate discount error:", err);
    if (err.message.includes("Minimum")) {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

// ===== REWARDS =====

exports.getSalonRewards = async (req, res) => {
  try {
    const { salon_id } = req.params;
    const rewards = await loyaltyService.getSalonRewards(salon_id);
    res.json({ rewards });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createReward = async (req, res) => {
  try {
    const { salon_id, name, description, points_required } = req.body;
    const reward_id = await loyaltyService.createReward(salon_id, name, description, points_required);
    res.status(201).json({ reward_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteReward = async (req, res) => {
  try {
    const { reward_id } = req.params;
    const { salon_id } = req.body;
    await loyaltyService.deleteReward(reward_id, salon_id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.redeemReward = async (req, res) => {
  try {
    const user_id = req.user.user_id || req.user.id;
    const { salon_id, reward_id } = req.body;
    const reward = await loyaltyService.redeemReward(user_id, salon_id, reward_id);
    res.json({ message: "Reward redeemed!", reward });
  } catch (err) {
    res.status(err.message.includes("Need") ? 400 : 500).json({ error: err.message });
  }
};

exports.getMyRewards = async (req, res) => {
  try {
    const user_id = req.user.user_id || req.user.id;
    const rewards = await loyaltyService.getUserRewards(user_id);
    res.json({ rewards });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===== PROMO CODES =====

exports.validatePromoCode = async (req, res) => {
  try {
    const { code, salon_id, subtotal } = req.body;
    const result = await loyaltyService.validatePromoCode(code, salon_id, subtotal || 0);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSalonPromoCodes = async (req, res) => {
  try {
    const { salon_id } = req.params;
    const codes = await loyaltyService.getSalonPromoCodes(salon_id);
    res.json({ codes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createPromoCode = async (req, res) => {
  try {
    const { salon_id, code, discount_type, discount_value } = req.body;
    const promo_id = await loyaltyService.createPromoCode(salon_id, code, discount_type, discount_value);
    res.status(201).json({ promo_id });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: "This code already exists" });
    }
    res.status(500).json({ error: err.message });
  }
};

exports.deletePromoCode = async (req, res) => {
  try {
    const { promo_id } = req.params;
    const { salon_id } = req.body;
    await loyaltyService.deletePromoCode(promo_id, salon_id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


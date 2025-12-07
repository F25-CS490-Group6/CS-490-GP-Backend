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

    res.json({
      salon_id,
      points,
      min_points_redeem: config.min_points_redeem,
      redeem_rate: config.redeem_rate,
      can_redeem: points >= config.min_points_redeem,
      estimated_discount: points >= config.min_points_redeem
        ? (points * config.redeem_rate).toFixed(2)
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


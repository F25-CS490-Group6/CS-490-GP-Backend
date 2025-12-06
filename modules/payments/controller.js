//payments/controller.js
const paymentService = require("./service");

/**
 * Create checkout session and send payment email
 * Supports:
 * - Services only (appointment_id)
 * - Products only (type: "products", items array)
 * - Combined (appointment_id + products array)
 */
exports.createCheckout = async (req, res) => {
  try {
    const { amount, appointment_id, type, items, products } = req.body;
    const user_id = req.user.user_id || req.user.id || req.user.userId;

    if (!user_id) {
      return res.status(400).json({ error: "User ID not found in token" });
    }

    if (!amount) {
      return res.status(400).json({ error: "Amount is required" });
    }

    // Handle products-only checkout
    if (type === "products" && (items || products) && Array.isArray(items || products)) {
      const productItems = items || products;
      const result = await paymentService.createProductCheckoutAndNotify(
        user_id,
        parseFloat(amount),
        productItems
      );

      return res.json({
        success: true,
        message: "Payment link sent to your email",
        payment_id: result.payment_id,
        payment_link: result.payment_link,
      });
    }

    // Handle combined checkout (appointment + products)
    if (appointment_id && (products || items) && Array.isArray(products || items)) {
      const productItems = products || items;
      const result = await paymentService.createCombinedCheckoutAndNotify(
        user_id,
        parseFloat(amount),
        appointment_id,
        productItems
      );

      return res.json({
        success: true,
        message: "Payment link sent to your email",
        payment_id: result.payment_id,
        payment_link: result.payment_link,
      });
    }

    // Handle services-only checkout (appointment_id required)
    if (!appointment_id) {
      return res.status(400).json({ error: "appointment_id required for service checkout" });
    }

    const result = await paymentService.createCheckoutAndNotify(
      user_id,
      parseFloat(amount),
      appointment_id
    );

    res.json({
      success: true,
      message: "Payment link sent to your email",
      payment_id: result.payment_id,
      payment_link: result.payment_link,
    });
  } catch (err) {
    console.error("Checkout error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get payments for a salon
 */
exports.getPaymentsForSalon = async (req, res) => {
  try {
    const { salon_id } = req.params;
    const payments = await paymentService.getPaymentsForSalon(salon_id);
    res.json({ payments });
  } catch (err) {
    console.error("Get payments error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Create unified checkout (for cart with products + services)
 * Supports optional loyalty point redemption
 */
exports.createUnifiedCheckout = async (req, res) => {
  try {
    const { salon_id, cart_id, points_to_redeem = 0 } = req.body;
    const user_id = req.user.user_id || req.user.id;

    if (!salon_id || !cart_id) {
      return res.status(400).json({ error: "salon_id and cart_id are required" });
    }

    const result = await paymentService.createUnifiedCheckout(
      user_id,
      salon_id,
      cart_id,
      points_to_redeem
    );

    res.json({
      success: true,
      message: "Payment link sent to your email",
      payment_id: result.payment_id,
      payment_link: result.payment_link,
      points_redeemed: points_to_redeem,
    });
  } catch (err) {
    console.error("Create unified checkout error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get payment details by session ID (for payment success page)
 */
exports.getPaymentBySessionId = async (req, res) => {
  try {
    const { session_id } = req.query;

    if (!session_id) {
      return res.status(400).json({ error: "session_id is required" });
    }

    const payment = await paymentService.getPaymentBySessionId(session_id);

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    res.json({ payment });
  } catch (err) {
    console.error("Get payment by session error:", err);
    res.status(500).json({ error: err.message });
  }
};

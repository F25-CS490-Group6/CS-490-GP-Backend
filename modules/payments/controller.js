//payments/controller.js
const paymentService = require("./service");
const { db } = require("../../config/database");

/**
 * Create checkout session and send payment email
 * Supports:
 * - Services only (appointment_id)
 * - Products only (type: "products", items array)
 * - Combined (appointment_id + products array)
 */
exports.createCheckout = async (req, res) => {
  try {
    const { amount, appointment_id, type, items, products, points_to_redeem = 0, salon_id, promo_code, promo_discount = 0, skip_email = true } = req.body;
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
      appointment_id,
      points_to_redeem,
      salon_id,
      promo_code,
      promo_discount,
      skip_email // Skip email for direct web checkout (user will be redirected to Stripe)
    );

    res.json({
      success: true,
      message: skip_email ? "Redirecting to payment" : "Payment link sent to your email",
      payment_id: result.payment_id,
      payment_link: result.payment_link,
      points_redeemed: result.points_redeemed || 0,
      discount_applied: result.discount_applied || 0,
      promo_applied: !!promo_code,
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
 * Supports optional loyalty point redemption and promo codes
 */
exports.createUnifiedCheckout = async (req, res) => {
  try {
    const { salon_id, cart_id, points_to_redeem = 0, promo_code } = req.body;
    const user_id = req.user.user_id || req.user.id;

    if (!salon_id || !cart_id) {
      return res.status(400).json({ error: "salon_id and cart_id are required" });
    }

    const result = await paymentService.createUnifiedCheckout(
      user_id,
      salon_id,
      cart_id,
      points_to_redeem,
      promo_code
    );

    res.json({
      success: true,
      message: "Payment link sent to your email",
      payment_id: result.payment_id,
      payment_link: result.payment_link,
      points_redeemed: result.points_redeemed || points_to_redeem,
      promo_discount: result.promo_discount || 0,
    });
  } catch (err) {
    console.error("Create unified checkout error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Create pay-in-store payment (appointment confirmed, payment pending)
 */
exports.createPayInStore = async (req, res) => {
  try {
    const { amount, appointment_id, points_to_redeem = 0, salon_id } = req.body;
    const user_id = req.user.user_id || req.user.id;

    if (!user_id) {
      return res.status(400).json({ error: "User ID not found in token" });
    }

    if (!amount || !appointment_id) {
      return res.status(400).json({ error: "Amount and appointment_id are required" });
    }

    const paymentService = require("./service");
    const result = await paymentService.createPayInStorePayment(
      user_id,
      parseFloat(amount),
      appointment_id,
      points_to_redeem,
      salon_id
    );

    res.json({
      success: true,
      message: result.deposit_required 
        ? `Appointment confirmed. Please pay the $${result.deposit_amount?.toFixed(2)} deposit to complete your booking.`
        : "Appointment confirmed. Payment will be collected at the salon.",
      payment_id: result.payment_id,
      points_redeemed: result.points_redeemed || 0,
      discount_applied: result.discount_applied || 0,
      deposit_required: result.deposit_required || false,
      deposit_amount: result.deposit_amount || 0,
      payment_link: result.payment_link || null,
    });
  } catch (err) {
    console.error("Pay in store error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get payment details by session ID (for payment success page)
 * Also checks if payment needs confirmation (webhook might not have fired)
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

    // Check if payment needs confirmation (webhook might not have fired)
    // This is a fallback for development when webhooks might not be configured
    // Set timeout to prevent hanging
    let responseSent = false;
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Payment verification timeout")), 10000)
      );

      const confirmationPromise = (async () => {
        try {
          const stripe = require("../../config/stripe");
          // Add rate limiting: only check Stripe if payment status is not completed
          const [[paymentCheck]] = await db.query(
            `SELECT payment_status FROM payments WHERE stripe_checkout_session_id = ?`,
            [session_id]
          );
          
          // If payment is already completed, skip Stripe API call to avoid rate limits
          if (paymentCheck?.payment_status === 'completed') {
            console.log(`[Payment] Payment already completed, skipping Stripe API call to avoid rate limits`);
            return payment;
          }
          
          const session = await stripe.checkout.sessions.retrieve(session_id);
      console.log(`[Payment] Checking session ${session_id}: payment_status=${session.payment_status}`);
      console.log(`[Payment] Session metadata:`, JSON.stringify(session.metadata, null, 2));
      
      // Check if payment needs confirmation (webhook might not have fired)
      // Check Stripe session status - in test mode it's 'paid', in live mode it's 'complete'
      const isPaid = session.payment_status === 'complete' || session.payment_status === 'paid';
      const isUnifiedCheckout = session.metadata?.checkout_type === 'unified';
      const { cart_id, user_id, salon_id } = session.metadata || {};
      
      console.log(`[Payment] Payment check: isPaid=${isPaid}, isUnifiedCheckout=${isUnifiedCheckout}, cart_id=${cart_id || 'none'}`);
      
      // If payment is paid, check if it needs confirmation
      if (isPaid) {
        const { db } = require("../../config/database");
        
        // Try to find cart_id from metadata, or from payment record
        let resolvedCartId = cart_id;
        if (!resolvedCartId) {
          // Check if payment record has cart_id or if we can find it from cart_items
          const [[paymentRecord]] = await db.query(
            `SELECT payment_id FROM payments WHERE stripe_checkout_session_id = ?`,
            [session_id]
          );
          
          if (paymentRecord) {
            // Try to find cart_id by checking if there are any active carts with items for this user/salon
            if (user_id && salon_id) {
              const [carts] = await db.query(
                `SELECT c.cart_id FROM carts c
                 JOIN cart_items ci ON c.cart_id = ci.cart_id
                 WHERE c.user_id = ? AND c.salon_id = ? AND c.status = 'active'
                 LIMIT 1`,
                [user_id, salon_id]
              );
              if (carts.length > 0) {
                resolvedCartId = carts[0].cart_id;
                console.log(`[Payment] Found cart_id ${resolvedCartId} from active cart for user ${user_id}, salon ${salon_id}`);
              }
            }
          }
        }
        
        // Check if this is actually a legacy checkout (has appointment_id but no cart_id in metadata)
        const hasAppointmentId = session.metadata?.appointment_id;
        const hasCartIdInMetadata = session.metadata?.cart_id;
        
        console.log(`[Payment] Checking checkout type: hasAppointmentId=${!!hasAppointmentId}, hasCartIdInMetadata=${!!hasCartIdInMetadata}, resolvedCartId=${resolvedCartId || 'none'}`);
        
        // If metadata has appointment_id but no cart_id, it's a legacy checkout
        if (hasAppointmentId && !hasCartIdInMetadata) {
          console.log(`[Payment] ✅ Legacy single-appointment checkout detected (appointment_id: ${hasAppointmentId}, no cart_id in metadata)`);
          
          // Check if payment is already confirmed and linked
          const [[paymentCheck]] = await db.query(
            `SELECT payment_status, appointment_id FROM payments WHERE stripe_checkout_session_id = ?`,
            [session_id]
          );
          
          // If Stripe says payment is paid but payment status is not 'completed', confirm it
          // This handles cases where webhook hasn't fired or payment was just completed
          // CRITICAL: Check payment_status, not just appointment_id, because loyalty points are only processed when status becomes 'completed'
          const needsConfirmation = isPaid && paymentCheck?.payment_status !== 'completed';
          
          if (needsConfirmation) {
            console.log(`[Payment] ⚠️ Webhook hasn't processed legacy checkout ${session_id}, manually confirming...`);
            console.log(`[Payment] Payment status: ${paymentCheck?.payment_status}, appointment_id: ${paymentCheck?.appointment_id || 'none'}`);
            const paymentService = require("./service");
            await paymentService.confirmPayment(session.id, session.payment_intent);
            console.log(`[Payment] ✅ Manually confirmed legacy checkout ${session_id}`);
            
            // Refetch payment to get updated data
            const updatedPayment = await paymentService.getPaymentBySessionId(session_id);
            if (updatedPayment) {
              responseSent = true;
              return res.json({ payment: updatedPayment });
            }
          } else {
            console.log(`[Payment] Legacy checkout already processed (payment_status: ${paymentCheck?.payment_status}, appointment_id: ${paymentCheck?.appointment_id || 'none'})`);
          }
          // IMPORTANT: Return here to prevent falling through to unified checkout logic
          const finalPayment = await paymentService.getPaymentBySessionId(session_id);
          responseSent = true;
          return res.json({ payment: finalPayment });
        } else if (resolvedCartId && hasCartIdInMetadata) {
          // True unified checkout with cart_id in metadata
          const [cartItems] = await db.query(
            `SELECT COUNT(*) as count FROM cart_items WHERE cart_id = ?`,
            [resolvedCartId]
          );
          
          console.log(`[Payment] Cart ${resolvedCartId} has ${cartItems[0]?.count || 0} items remaining`);
          
          // If cart items still exist, webhook hasn't processed it - trigger confirmation manually
          if (cartItems[0]?.count > 0) {
            console.log(`[Payment] ⚠️ Webhook hasn't processed unified checkout ${session_id}, manually confirming...`);
            const paymentService = require("./service");
            await paymentService.confirmUnifiedCheckout(session.id, session.payment_intent);
            console.log(`[Payment] ✅ Manually confirmed unified checkout ${session_id}`);
            
            // Refetch payment to get updated data
            const updatedPayment = await paymentService.getPaymentBySessionId(session_id);
            responseSent = true;
            return res.json({ payment: updatedPayment || payment });
          } else {
            console.log(`[Payment] Cart items already cleared, webhook likely processed this payment`);
          }
        } else if (resolvedCartId && !hasCartIdInMetadata) {
          // Found cart_id from active cart but not in metadata - might be a mismatch
          // Don't try to process as unified checkout since metadata doesn't match
          console.log(`[Payment] Warning: Found cart_id ${resolvedCartId} from active cart but session metadata has appointment_id ${hasAppointmentId} - treating as legacy checkout`);
          
          if (hasAppointmentId) {
            // Process as legacy checkout
            const [[paymentCheck]] = await db.query(
              `SELECT payment_status, appointment_id FROM payments WHERE stripe_checkout_session_id = ?`,
              [session_id]
            );
            
            // CRITICAL: Check if payment_status is not 'completed' - loyalty points are only processed when status becomes 'completed'
            if (isPaid && paymentCheck?.payment_status !== 'completed') {
              console.log(`[Payment] ⚠️ Webhook hasn't processed legacy checkout ${session_id}, manually confirming...`);
              console.log(`[Payment] Payment status: ${paymentCheck?.payment_status}, appointment_id: ${paymentCheck?.appointment_id || 'none'}`);
              const paymentService = require("./service");
              await paymentService.confirmPayment(session.id, session.payment_intent);
              console.log(`[Payment] ✅ Manually confirmed legacy checkout ${session_id}`);
              
              const updatedPayment = await paymentService.getPaymentBySessionId(session_id);
              if (updatedPayment) {
                responseSent = true;
                return res.json({ payment: updatedPayment });
              }
            }
          }
        } else if (hasAppointmentId) {
          // Legacy single-appointment checkout - check if it needs confirmation
          console.log(`[Payment] Legacy single-appointment checkout detected (appointment_id: ${session.metadata.appointment_id})`);
          
          // Check if payment is already confirmed
          const [[paymentCheck]] = await db.query(
            `SELECT payment_status, appointment_id FROM payments WHERE stripe_checkout_session_id = ?`,
            [session_id]
          );
          
          // CRITICAL: Check if payment_status is not 'completed' - loyalty points are only processed when status becomes 'completed'
          // If Stripe says payment is paid but payment status is not 'completed', confirm it
          if (isPaid && paymentCheck?.payment_status !== 'completed') {
            console.log(`[Payment] ⚠️ Webhook hasn't processed legacy checkout ${session_id}, manually confirming...`);
            console.log(`[Payment] Payment status: ${paymentCheck?.payment_status}, appointment_id: ${paymentCheck?.appointment_id || 'none'}`);
            const paymentService = require("./service");
            await paymentService.confirmPayment(session.id, session.payment_intent);
            console.log(`[Payment] ✅ Manually confirmed legacy checkout ${session_id}`);
            
            // Refetch payment to get updated data
            const updatedPayment = await paymentService.getPaymentBySessionId(session_id);
            if (updatedPayment) {
              responseSent = true;
              return res.json({ payment: updatedPayment });
            }
          } else {
            console.log(`[Payment] Legacy checkout already processed or payment not completed`);
          }
        } else {
          // No cart_id or appointment_id - unknown checkout type
          console.log(`[Payment] Unknown checkout type: payment_status=${session.payment_status}, metadata:`, JSON.stringify(session.metadata, null, 2));
        }
        } else {
          console.log(`[Payment] Payment not yet completed: payment_status=${session.payment_status}`);
        }
        return payment;
        } catch (err) {
          console.error("[Payment] Error checking/confirming payment:", err);
          console.error("[Payment] Error stack:", err.stack);
          // Continue with original payment data even if confirmation check fails
          return payment;
        }
      })();

      // Race between payment confirmation and timeout
      try {
        await Promise.race([confirmationPromise, timeoutPromise]);
      } catch (err) {
        if (err.message === "Payment verification timeout") {
          console.log("[Payment] Verification timed out, returning payment data anyway");
        } else {
          console.error("[Payment] Error in confirmation:", err);
        }
      }
    } catch (err) {
      console.error("[Payment] Error in payment verification:", err);
      // Continue with original payment data even if verification fails
    }

    if (!responseSent) {
      res.json({ payment });
    }
  } catch (err) {
    console.error("Get payment by session error:", err);
    res.status(500).json({ error: err.message });
  }
};

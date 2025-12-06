//payments/service.js
const { db } = require("../../config/database");
const stripe = require("../../config/stripe");
const { sendEmail } = require("../../services/email");

/**
 * Create Stripe checkout session and send payment link email
 */
exports.createCheckoutAndNotify = async (user_id, amount, appointment_id) => {
  // 1. Get user and appointment details
  const [[user]] = await db.query(
    "SELECT email, full_name FROM users WHERE user_id = ?",
    [user_id]
  );

  const [[appointment]] = await db.query(
    `SELECT a.*, s.salon_name,
            GROUP_CONCAT(sv.custom_name SEPARATOR ', ') as service_name
     FROM appointments a
     JOIN salons s ON a.salon_id = s.salon_id
     LEFT JOIN appointment_services asv ON a.appointment_id = asv.appointment_id
     LEFT JOIN services sv ON asv.service_id = sv.service_id
     WHERE a.appointment_id = ?
     GROUP BY a.appointment_id`,
    [appointment_id]
  );

  if (!user || !appointment) {
    throw new Error("User or appointment not found");
  }

  // 2. Create Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${appointment.salon_name} - ${appointment.service_name}`,
            description: `Appointment on ${new Date(appointment.appointment_date).toLocaleString()}`,
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/payment-canceled`,
    metadata: {
      appointment_id: appointment_id,
      user_id: user_id,
    },
  });

  // 3. Save payment record
  const [result] = await db.query(
    `INSERT INTO payments
    (user_id, amount, payment_method, payment_status, appointment_id, stripe_checkout_session_id, payment_link)
    VALUES (?, ?, 'stripe', 'pending', ?, ?, ?)`,
    [user_id, amount, appointment_id, session.id, session.url]
  );

  // 4. Send email notification with payment link
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Complete Your Payment</h2>
      <p>Hi ${user.full_name},</p>
      <p>Your appointment has been booked! Please complete your payment to confirm:</p>

      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Salon:</strong> ${appointment.salon_name}</p>
        <p><strong>Service:</strong> ${appointment.service_name}</p>
        <p><strong>Date:</strong> ${new Date(appointment.appointment_date).toLocaleString()}</p>
        <p><strong>Amount:</strong> $${amount.toFixed(2)}</p>
      </div>

      <a href="${session.url}"
         style="display: inline-block; background: #5469d4; color: white; padding: 14px 28px;
                text-decoration: none; border-radius: 6px; font-weight: bold;">
        Pay Now - $${amount.toFixed(2)}
      </a>

      <p style="color: #666; font-size: 13px; margin-top: 20px;">
        This link expires in 24 hours.
      </p>

      <p>Thank you,<br>${appointment.salon_name}</p>
    </div>
  `;

  await sendEmail(
    user.email,
    `Payment Required - ${appointment.salon_name} Appointment`,
    emailHtml
  );

  return {
    payment_id: result.insertId,
    payment_link: session.url,
    checkout_session_id: session.id,
  };
};

/**
 * Confirm payment (called by webhook)
 */
exports.confirmPayment = async (checkoutSessionId, paymentIntentId) => {
  await db.query(
    `UPDATE payments
    SET payment_status = 'completed', stripe_payment_intent_id = ?
    WHERE stripe_checkout_session_id = ?`,
    [paymentIntentId, checkoutSessionId]
  );

  // Get appointment_id and update appointment status
  const [[payment]] = await db.query(
    "SELECT appointment_id FROM payments WHERE stripe_checkout_session_id = ?",
    [checkoutSessionId]
  );

  if (payment?.appointment_id) {
    await db.query(
      "UPDATE appointments SET status = 'confirmed' WHERE appointment_id = ?",
      [payment.appointment_id]
    );
  }
};

/**
 * Mark payment failed (called by webhook)
 */
exports.failPayment = async (checkoutSessionId, reason) => {
  await db.query(
    `UPDATE payments SET payment_status = 'failed', failure_reason = ?
    WHERE stripe_checkout_session_id = ?`,
    [reason, checkoutSessionId]
  );
};

/**
 * Get payments for a salon
 */
exports.getPaymentsForSalon = async (salon_id) => {
  const [payments] = await db.query(
    `SELECT p.*, u.full_name AS customer_name
     FROM payments p
     LEFT JOIN appointments a ON p.appointment_id = a.appointment_id
     LEFT JOIN users u ON p.user_id = u.user_id
     WHERE a.salon_id = ?`,
    [salon_id]
  );
  return payments || [];
};

/**
 * Create unified checkout session for cart (products + services)
 * Supports loyalty point redemption for discounts
 */
exports.createUnifiedCheckout = async (user_id, salon_id, cart_id, points_to_redeem = 0) => {
  const loyaltyService = require("../loyalty/service");
  // 1. Get user details
  const [[user]] = await db.query(
    "SELECT email, full_name FROM users WHERE user_id = ?",
    [user_id]
  );

  // 2. Get salon details
  const [[salon]] = await db.query(
    "SELECT salon_name FROM salons WHERE salon_id = ?",
    [salon_id]
  );

  // 3. Get all cart items (products + services)
  const [cartItems] = await db.query(
    `SELECT
      ci.item_id,
      ci.type,
      ci.quantity,
      ci.price,
      ci.notes,
      CASE
        WHEN ci.type = 'product' THEN p.name
        WHEN ci.type = 'service' THEN s.custom_name
      END as item_name,
      CASE
        WHEN ci.type = 'product' THEN p.description
        WHEN ci.type = 'service' THEN s.description
      END as item_description
     FROM cart_items ci
     LEFT JOIN products p ON ci.product_id = p.product_id
     LEFT JOIN services s ON ci.service_id = s.service_id
     WHERE ci.cart_id = ?`,
    [cart_id]
  );

  if (!cartItems || cartItems.length === 0) {
    throw new Error("Cart is empty");
  }

  // 4. Calculate total and apply loyalty discount
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  let discount = 0;
  let actualPointsRedeemed = 0;

  if (points_to_redeem > 0) {
    try {
      // Validate user has enough points
      const userPoints = await loyaltyService.getLoyaltyPoints(user_id, salon_id);
      if (userPoints < points_to_redeem) {
        throw new Error(`You only have ${userPoints} points available`);
      }

      // Calculate discount from points
      discount = await loyaltyService.calculateDiscount(salon_id, points_to_redeem);

      // Ensure discount doesn't exceed subtotal
      if (discount > subtotal) {
        discount = subtotal;
        // Recalculate points needed for this discount
        const config = await loyaltyService.getLoyaltyConfig(salon_id);
        actualPointsRedeemed = Math.ceil(discount / config.redeem_rate);
      } else {
        actualPointsRedeemed = points_to_redeem;
      }
    } catch (err) {
      throw new Error(`Loyalty redemption error: ${err.message}`);
    }
  }

  const total = subtotal - discount;

  // 5. Create Stripe line items
  const lineItems = cartItems.map(item => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: `${item.item_name}`,
        description: item.item_description || (item.type === 'service' ? 'Service' : 'Product'),
      },
      unit_amount: Math.round(item.price * 100),
    },
    quantity: item.quantity,
  }));

  // 6. Create Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/payment-canceled`,
    metadata: {
      user_id: user_id,
      salon_id: salon_id,
      cart_id: cart_id,
      checkout_type: 'unified',
      points_redeemed: actualPointsRedeemed.toString(),
      subtotal: subtotal.toFixed(2),
      discount: discount.toFixed(2),
    },
  });

  // 7. Save payment record with cart_id
  const [result] = await db.query(
    `INSERT INTO payments
    (user_id, amount, payment_method, payment_status, stripe_checkout_session_id, payment_link)
    VALUES (?, ?, 'stripe', 'pending', ?, ?)`,
    [user_id, total, session.id, session.url]
  );

  // 8. Link payment to cart (add cart_id column reference if needed)
  await db.query(
    `UPDATE carts SET status = 'pending_payment' WHERE cart_id = ?`,
    [cart_id]
  );

  // 9. Send email notification
  const itemsList = cartItems.map(item =>
    `<li><strong>${item.item_name}</strong> ${item.type === 'product' ? `(x${item.quantity})` : ''} - $${(item.price * item.quantity).toFixed(2)}</li>`
  ).join('');

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Complete Your Payment</h2>
      <p>Hi ${user.full_name},</p>
      <p>Your order is ready! Please complete your payment to confirm:</p>

      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Salon:</strong> ${salon.salon_name}</p>
        <p><strong>Items:</strong></p>
        <ul style="margin: 10px 0; padding-left: 20px;">
          ${itemsList}
        </ul>
        ${discount > 0 ? `
          <p style="margin-top: 15px;"><strong>Subtotal:</strong> $${subtotal.toFixed(2)}</p>
          <p style="color: #28a745;"><strong>Loyalty Discount:</strong> -$${discount.toFixed(2)} (${actualPointsRedeemed} points)</p>
        ` : ''}
        <p style="font-size: 18px; font-weight: bold; margin-top: 15px;">
          <strong>Total:</strong> $${total.toFixed(2)}
        </p>
      </div>

      <a href="${session.url}"
         style="display: inline-block; background: #5469d4; color: white; padding: 14px 28px;
                text-decoration: none; border-radius: 6px; font-weight: bold;">
        Pay Now - $${total.toFixed(2)}
      </a>

      <p style="color: #666; font-size: 13px; margin-top: 20px;">
        This link expires in 24 hours.
      </p>

      <p>Thank you,<br>${salon.salon_name}</p>
    </div>
  `;

  await sendEmail(
    user.email,
    `Payment Required - ${salon.salon_name} Order`,
    emailHtml
  );

  return {
    payment_id: result.insertId,
    payment_link: session.url,
    checkout_session_id: session.id,
  };
};

/**
 * Process unified checkout completion (called by webhook)
 */
exports.confirmUnifiedCheckout = async (checkoutSessionId, paymentIntentId) => {
  const loyaltyService = require("../loyalty/service");

  // 1. Update payment status
  await db.query(
    `UPDATE payments
    SET payment_status = 'completed', stripe_payment_intent_id = ?
    WHERE stripe_checkout_session_id = ?`,
    [paymentIntentId, checkoutSessionId]
  );

  // 2. Get the checkout session metadata to find cart_id
  const session = await stripe.checkout.sessions.retrieve(checkoutSessionId);
  const { cart_id, salon_id, user_id, points_redeemed, subtotal } = session.metadata;

  if (!cart_id) {
    console.error("No cart_id in session metadata");
    return;
  }

  // 3. Get payment_id
  const [[payment]] = await db.query(
    "SELECT payment_id, amount FROM payments WHERE stripe_checkout_session_id = ?",
    [checkoutSessionId]
  );

  // 4. Get all cart items
  const [cartItems] = await db.query(
    `SELECT * FROM cart_items WHERE cart_id = ?`,
    [cart_id]
  );

  // 5. Create order for products
  const productItems = cartItems.filter(item => item.type === 'product');
  if (productItems.length > 0) {
    // Calculate product total
    const productTotal = productItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const [orderResult] = await db.query(
      `INSERT INTO orders (user_id, salon_id, total_amount, payment_id, payment_status, order_status)
       VALUES (?, ?, ?, ?, 'paid', 'completed')`,
      [user_id, salon_id, productTotal, payment.payment_id]
    );

    const order_id = orderResult.insertId;

    // Add order items
    for (const item of productItems) {
      await db.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price, type)
         VALUES (?, ?, ?, ?, 'product')`,
        [order_id, item.product_id, item.quantity, item.price]
      );
    }
  }

  // 6. Confirm appointments for services
  const serviceItems = cartItems.filter(item => item.type === 'service');
  if (serviceItems.length > 0) {
    // Extract appointment IDs from notes (format: "Appointment #123")
    const appointmentIds = serviceItems
      .map(item => {
        const match = item.notes?.match(/Appointment #(\d+)/);
        return match ? match[1] : null;
      })
      .filter(id => id !== null);

    // Update appointment statuses
    for (const appointment_id of [...new Set(appointmentIds)]) {
      await db.query(
        "UPDATE appointments SET status = 'confirmed' WHERE appointment_id = ?",
        [appointment_id]
      );

      // Link payment to appointment
      await db.query(
        "UPDATE payments SET appointment_id = ? WHERE payment_id = ?",
        [appointment_id, payment.payment_id]
      );
    }
  }

  // 7. Mark cart as checked out
  await db.query(
    `UPDATE carts SET status = 'checked_out' WHERE cart_id = ?`,
    [cart_id]
  );

  // 8. Process loyalty points
  try {
    // Redeem points that were used for discount
    if (points_redeemed && parseInt(points_redeemed) > 0) {
      await loyaltyService.redeemLoyaltyPoints(user_id, salon_id, parseInt(points_redeemed));
      console.log(`Redeemed ${points_redeemed} loyalty points for user ${user_id}`);
    }

    // Award new points based on purchase amount (use subtotal before discount)
    const purchaseAmount = parseFloat(subtotal) || payment.amount;
    const pointsEarned = await loyaltyService.awardPointsForPurchase(user_id, salon_id, purchaseAmount);
    console.log(`Awarded ${pointsEarned} loyalty points to user ${user_id} for purchase of $${purchaseAmount}`);
  } catch (loyaltyErr) {
    console.error('Loyalty processing error (non-fatal):', loyaltyErr);
    // Don't fail the whole transaction if loyalty fails
  }
};

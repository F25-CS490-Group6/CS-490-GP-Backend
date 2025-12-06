//payments/service.js
const { db } = require("../../config/database");
const stripe = require("../../config/stripe");
const { sendEmail } = require("../../services/email");

/**
 * Create Stripe checkout session and send payment link email
 * Supports optional loyalty point redemption
 */
exports.createCheckoutAndNotify = async (user_id, amount, appointment_id, points_to_redeem = 0, salon_id = null) => {
  // 1. Get user and appointment details
  const [[user]] = await db.query(
    "SELECT email, full_name FROM users WHERE user_id = ?",
    [user_id]
  );

  const [[appointment]] = await db.query(
    `SELECT a.*, s.name AS salon_name,
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

  // Use salon_id from appointment if not provided
  const effective_salon_id = salon_id || appointment.salon_id;

  // 1.5. Calculate loyalty discount if points provided
  let discount = 0;
  let actualPointsRedeemed = 0;
  const subtotal = amount;

  if (points_to_redeem > 0 && effective_salon_id) {
    const loyaltyService = require("../loyalty/service");
    try {
      // Validate user has enough points
      const userPoints = await loyaltyService.getLoyaltyPoints(user_id, effective_salon_id);
      if (userPoints < points_to_redeem) {
        throw new Error(`You only have ${userPoints} points available`);
      }

      // Calculate discount from points
      discount = await loyaltyService.calculateDiscount(effective_salon_id, points_to_redeem);

      // Ensure discount doesn't exceed subtotal
      if (discount > subtotal) {
        discount = subtotal;
        const config = await loyaltyService.getLoyaltyConfig(effective_salon_id);
        actualPointsRedeemed = Math.ceil(discount / config.redeem_rate);
      } else {
        actualPointsRedeemed = points_to_redeem;
      }
    } catch (err) {
      console.error('Loyalty redemption error:', err);
      throw new Error(`Loyalty redemption error: ${err.message}`);
    }
  }

  const finalAmount = subtotal - discount;

  // 2. Get all individual services for the appointment
  const [services] = await db.query(
    `SELECT asv.service_id, sv.custom_name, asv.price
     FROM appointment_services asv
     JOIN services sv ON asv.service_id = sv.service_id
     WHERE asv.appointment_id = ?`,
    [appointment_id]
  );

  // 3. Create line items for each service
  const lineItems = services.length > 0
    ? services.map(service => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: service.custom_name,
            description: `${appointment.salon_name} - Appointment on ${new Date(appointment.scheduled_time || appointment.appointment_date).toLocaleString()}`,
          },
          unit_amount: Math.round(Number(service.price) * 100),
        },
        quantity: 1,
      }))
    : [
        // Fallback: single line item with total amount if no services found
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${appointment.salon_name} - ${appointment.service_name || 'Appointment'}`,
              description: `Appointment on ${new Date(appointment.scheduled_time || appointment.appointment_date).toLocaleString()}`,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ];

  // 3. Create Stripe Checkout Session with discount if applicable
  // Apply discount to line items proportionally
  const discountedLineItems = discount > 0 && lineItems.length > 0
    ? lineItems.map((item, index) => {
        // Calculate proportional discount for each item
        const itemTotal = item.price_data.unit_amount * item.quantity;
        const totalBeforeDiscount = lineItems.reduce((sum, li) => sum + (li.price_data.unit_amount * li.quantity), 0);
        const itemDiscount = Math.round((itemTotal / totalBeforeDiscount) * (discount * 100));

        return {
          ...item,
          price_data: {
            ...item.price_data,
            unit_amount: Math.max(0, item.price_data.unit_amount - itemDiscount)
          }
        };
      })
    : lineItems;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: discountedLineItems,
    mode: "payment",
    success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/payment-canceled`,
    metadata: {
      appointment_id: appointment_id,
      user_id: user_id,
      salon_id: effective_salon_id,
      points_redeemed: actualPointsRedeemed.toString(),
      subtotal: subtotal.toFixed(2),
      discount: discount.toFixed(2),
    },
  });

  // 4. Save payment record with final amount
  const [result] = await db.query(
    `INSERT INTO payments
    (user_id, amount, payment_method, payment_status, appointment_id, stripe_checkout_session_id, payment_link)
    VALUES (?, ?, 'stripe', 'pending', ?, ?, ?)`,
    [user_id, finalAmount, appointment_id, session.id, session.url]
  );

  // 5. Send email notification with payment link
  const servicesList = services.length > 0
    ? services.map(s => `<li>${s.custom_name} - $${Number(s.price).toFixed(2)}</li>`).join('')
    : `<li>${appointment.service_name || 'Appointment'} - $${subtotal.toFixed(2)}</li>`;

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Complete Your Payment</h2>
      <p>Hi ${user.full_name},</p>
      <p>Your appointment has been booked! Please complete your payment to confirm:</p>

      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Salon:</strong> ${appointment.salon_name}</p>
        <p><strong>Date:</strong> ${new Date(appointment.scheduled_time || appointment.appointment_date).toLocaleString()}</p>
        <p><strong>Services:</strong></p>
        <ul style="margin: 10px 0; padding-left: 20px;">
          ${servicesList}
        </ul>
        ${discount > 0 ? `
          <p style="margin-top: 15px;"><strong>Subtotal:</strong> $${subtotal.toFixed(2)}</p>
          <p style="color: #28a745;"><strong>Loyalty Discount:</strong> -$${discount.toFixed(2)} (${actualPointsRedeemed} points)</p>
          <p style="font-size: 18px; font-weight: bold;"><strong>Total Amount:</strong> $${finalAmount.toFixed(2)}</p>
        ` : `
          <p style="margin-top: 15px; font-size: 18px;"><strong>Total Amount:</strong> $${finalAmount.toFixed(2)}</p>
        `}
      </div>

      <a href="${session.url}"
         style="display: inline-block; background: #5469d4; color: white; padding: 14px 28px;
                text-decoration: none; border-radius: 6px; font-weight: bold;">
        Pay Now - $${finalAmount.toFixed(2)}
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
    points_redeemed: actualPointsRedeemed,
    discount_applied: discount,
  };
};

/**
 * Create Stripe checkout session for products and send payment email
 */
exports.createProductCheckoutAndNotify = async (user_id, amount, items) => {
  // 1. Get user details
  const [[user]] = await db.query(
    "SELECT email, full_name FROM users WHERE user_id = ?",
    [user_id]
  );

  if (!user) {
    throw new Error("User not found");
  }

  // 2. Get salon details from first product (assuming all products are from same salon)
  const [[firstProduct]] = await db.query(
    `SELECT p.product_id, p.name, p.price, s.salon_id, s.name AS salon_name
     FROM products p
     JOIN salons s ON p.salon_id = s.salon_id
     WHERE p.product_id = ?`,
    [items[0]?.product_id]
  );

  if (!firstProduct) {
    throw new Error("Product not found");
  }

  // 3. Create line items for each product
  const lineItems = items.map(item => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: item.name || `Product ${item.product_id}`,
        description: `${firstProduct.salon_name} - Product Purchase`,
      },
      unit_amount: Math.round(Number(item.price) * 100),
    },
    quantity: item.quantity || 1,
  }));

  // 4. Create Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/payment-canceled`,
    metadata: {
      user_id: user_id,
      type: "products",
      salon_id: firstProduct.salon_id,
    },
  });

  // 5. Save payment record (no appointment_id for products)
  const [result] = await db.query(
    `INSERT INTO payments
    (user_id, amount, payment_method, payment_status, stripe_checkout_session_id, payment_link)
    VALUES (?, ?, 'stripe', 'pending', ?, ?)`,
    [user_id, amount, session.id, session.url]
  );

  // 6. Send email notification with payment link
  const productsList = items.map(item => 
    `<li>${item.name || `Product ${item.product_id}`} - $${Number(item.price).toFixed(2)} × ${item.quantity || 1}</li>`
  ).join('');

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Complete Your Payment</h2>
      <p>Hi ${user.full_name},</p>
      <p>Please complete your payment for the following products:</p>

      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Salon:</strong> ${firstProduct.salon_name}</p>
        <p><strong>Products:</strong></p>
        <ul style="margin: 10px 0; padding-left: 20px;">
          ${productsList}
        </ul>
        <p style="margin-top: 15px; font-size: 18px;"><strong>Total Amount:</strong> $${amount.toFixed(2)}</p>
      </div>

      <a href="${session.url}"
         style="display: inline-block; background: #5469d4; color: white; padding: 14px 28px;
                text-decoration: none; border-radius: 6px; font-weight: bold;">
        Pay Now - $${amount.toFixed(2)}
      </a>

      <p style="color: #666; font-size: 13px; margin-top: 20px;">
        This link expires in 24 hours.
      </p>

      <p>Thank you,<br>${firstProduct.salon_name}</p>
    </div>
  `;

  await sendEmail(
    user.email,
    `Payment Required - ${firstProduct.salon_name} Products`,
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
 * Handles loyalty point redemption and awarding
 */
exports.confirmPayment = async (checkoutSessionId, paymentIntentId) => {
  await db.query(
    `UPDATE payments
    SET payment_status = 'completed', stripe_payment_intent_id = ?
    WHERE stripe_checkout_session_id = ?`,
    [paymentIntentId, checkoutSessionId]
  );

  // Get payment details
  const [[payment]] = await db.query(
    "SELECT appointment_id, user_id, amount FROM payments WHERE stripe_checkout_session_id = ?",
    [checkoutSessionId]
  );

  if (payment?.appointment_id) {
    await db.query(
      "UPDATE appointments SET status = 'confirmed' WHERE appointment_id = ?",
      [payment.appointment_id]
    );
  }

  // Process loyalty points if metadata includes them
  try {
    const session = await stripe.checkout.sessions.retrieve(checkoutSessionId);
    const { salon_id, points_redeemed, subtotal } = session.metadata || {};

    if (salon_id && payment) {
      const loyaltyService = require("../loyalty/service");

      // Redeem points that were used for discount
      if (points_redeemed && parseInt(points_redeemed) > 0) {
        await loyaltyService.redeemLoyaltyPoints(payment.user_id, salon_id, parseInt(points_redeemed));
        console.log(`Redeemed ${points_redeemed} loyalty points for user ${payment.user_id}`);
      }

      // Award new points based on purchase amount (use subtotal before discount)
      const purchaseAmount = parseFloat(subtotal) || payment.amount;
      const pointsEarned = await loyaltyService.awardPointsForPurchase(payment.user_id, salon_id, purchaseAmount);
      console.log(`Awarded ${pointsEarned} loyalty points to user ${payment.user_id} for purchase of $${purchaseAmount}`);
    }
  } catch (loyaltyErr) {
    console.error('Loyalty processing error (non-fatal):', loyaltyErr);
    // Don't fail the whole transaction if loyalty fails
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
 * Create Stripe checkout session for combined appointment + products
 */
exports.createCombinedCheckoutAndNotify = async (user_id, amount, appointment_id, products) => {
  // 1. Get user and appointment details
  const [[user]] = await db.query(
    "SELECT email, full_name FROM users WHERE user_id = ?",
    [user_id]
  );

  const [[appointment]] = await db.query(
    `SELECT a.*, s.name AS salon_name,
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

  // 2. Get all individual services for the appointment
  const [services] = await db.query(
    `SELECT asv.service_id, sv.custom_name, asv.price
     FROM appointment_services asv
     JOIN services sv ON asv.service_id = sv.service_id
     WHERE asv.appointment_id = ?`,
    [appointment_id]
  );

  // 3. Get product details from database
  const productIds = products.map(p => p.product_id);
  const [dbProducts] = await db.query(
    `SELECT product_id, name, price FROM products WHERE product_id IN (?)`,
    [productIds]
  );

  const productMap = {};
  dbProducts.forEach(p => {
    productMap[p.product_id] = p;
  });

  // 4. Create line items for services
  const serviceLineItems = services.length > 0
    ? services.map(service => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: service.custom_name,
            description: `${appointment.salon_name} - Appointment on ${new Date(appointment.scheduled_time || appointment.appointment_date).toLocaleString()}`,
          },
          unit_amount: Math.round(Number(service.price) * 100),
        },
        quantity: 1,
      }))
    : [
        // Fallback: single line item with total amount if no services found
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${appointment.salon_name} - ${appointment.service_name || 'Appointment'}`,
              description: `Appointment on ${new Date(appointment.scheduled_time || appointment.appointment_date).toLocaleString()}`,
            },
            unit_amount: Math.round(Number(appointment.price || amount) * 100),
          },
          quantity: 1,
        },
      ];

  // 5. Create line items for products
  const productLineItems = products.map(item => {
    const product = productMap[item.product_id];
    return {
      price_data: {
        currency: "usd",
        product_data: {
          name: product?.name || item.name || `Product ${item.product_id}`,
          description: `${appointment.salon_name} - Product Purchase`,
        },
        unit_amount: Math.round(Number(item.price || product?.price || 0) * 100),
      },
      quantity: item.quantity || 1,
    };
  });

  // 6. Combine all line items
  const lineItems = [...serviceLineItems, ...productLineItems];

  // 7. Create Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/payment-canceled`,
    metadata: {
      appointment_id: appointment_id,
      user_id: user_id,
      type: "combined",
    },
  });

  // 8. Save payment record
  const [result] = await db.query(
    `INSERT INTO payments
    (user_id, amount, payment_method, payment_status, appointment_id, stripe_checkout_session_id, payment_link)
    VALUES (?, ?, 'stripe', 'pending', ?, ?, ?)`,
    [user_id, amount, appointment_id, session.id, session.url]
  );

  // 9. Send email notification with payment link
  const servicesList = services.length > 0
    ? services.map(s => `<li>${s.custom_name} - $${Number(s.price).toFixed(2)}</li>`).join('')
    : `<li>${appointment.service_name || 'Appointment'} - $${(appointment.price || amount).toFixed(2)}</li>`;

  const productsList = products.map(item => {
    const product = productMap[item.product_id];
    const productName = product?.name || item.name || `Product ${item.product_id}`;
    const productPrice = item.price || product?.price || 0;
    return `<li>${productName} - $${Number(productPrice).toFixed(2)} × ${item.quantity || 1}</li>`;
  }).join('');

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Complete Your Payment</h2>
      <p>Hi ${user.full_name},</p>
      <p>Your appointment and products are ready! Please complete your payment to confirm:</p>

      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Salon:</strong> ${appointment.salon_name}</p>
        <p><strong>Date:</strong> ${new Date(appointment.scheduled_time || appointment.appointment_date).toLocaleString()}</p>
        <p><strong>Services:</strong></p>
        <ul style="margin: 10px 0; padding-left: 20px;">
          ${servicesList}
        </ul>
        ${productsList ? `
        <p><strong>Products:</strong></p>
        <ul style="margin: 10px 0; padding-left: 20px;">
          ${productsList}
        </ul>
        ` : ''}
        <p style="margin-top: 15px; font-size: 18px;"><strong>Total Amount:</strong> $${amount.toFixed(2)}</p>
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
    `Payment Required - ${appointment.salon_name} Appointment & Products`,
    emailHtml
  );

  return {
    payment_id: result.insertId,
    payment_link: session.url,
    checkout_session_id: session.id,
  };
};

/**
 * Get payment details by Stripe checkout session ID
 * Used for payment success page
 */
exports.getPaymentBySessionId = async (sessionId) => {
  const [payments] = await db.query(
    `SELECT 
      p.payment_id,
      p.amount,
      p.payment_method,
      p.payment_status,
      p.created_at AS payment_date,
      a.appointment_id,
      a.scheduled_time,
      a.price AS appointment_price,
      s.name AS salon_name,
      GROUP_CONCAT(sv.custom_name SEPARATOR ', ') AS service_name,
      su.full_name AS staff_name
     FROM payments p
     LEFT JOIN appointments a ON p.appointment_id = a.appointment_id
     LEFT JOIN salons s ON a.salon_id = s.salon_id
     LEFT JOIN appointment_services asv ON a.appointment_id = asv.appointment_id
     LEFT JOIN services sv ON asv.service_id = sv.service_id
     LEFT JOIN staff st ON a.staff_id = st.staff_id
     LEFT JOIN users su ON st.user_id = su.user_id
     WHERE p.stripe_checkout_session_id = ?
     GROUP BY p.payment_id, a.appointment_id`,
    [sessionId]
  );
  
  if (!payments || payments.length === 0) {
    return null;
  }
  
  const payment = payments[0];
  // Ensure amount is a number
  payment.amount = Number(payment.amount) || 0;
  payment.appointment_price = Number(payment.appointment_price) || 0;
  
  return payment;
};
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

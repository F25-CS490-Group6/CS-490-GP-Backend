//payments/service.js
const { db } = require("../../config/database");
const stripe = require("../../config/stripe");
const { sendEmail } = require("../../services/email");

/**
 * Create Stripe checkout session and send payment link email
 * Supports optional loyalty point redemption
 */
exports.createCheckoutAndNotify = async (user_id, amount, appointment_id, points_to_redeem = 0, salon_id = null, promo_code = null, promo_discount = 0, skip_email = false) => {
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

  // Apply promo discount (already validated on frontend, but ensure non-negative)
  const effectivePromoDiscount = Math.max(0, promo_discount || 0);
  const totalDiscount = discount + effectivePromoDiscount;
  const finalAmount = Math.max(0, subtotal - totalDiscount);

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
  const discountedLineItems = totalDiscount > 0 && lineItems.length > 0
    ? lineItems.map((item, index) => {
        // Calculate proportional discount for each item
        const itemTotal = item.price_data.unit_amount * item.quantity;
        const totalBeforeDiscount = lineItems.reduce((sum, li) => sum + (li.price_data.unit_amount * li.quantity), 0);
        const itemDiscount = Math.round((itemTotal / totalBeforeDiscount) * (totalDiscount * 100));

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
      loyalty_discount: discount.toFixed(2),
      promo_code: promo_code || '',
      promo_discount: effectivePromoDiscount.toFixed(2),
    },
  });

  // Mark promo code as used (if provided)
  if (promo_code && effective_salon_id) {
    try {
      const loyaltyService = require("../loyalty/service");
      // Find the promo_id for this code
      const [[promo]] = await db.query(
        `SELECT promo_id FROM promo_codes WHERE code = ? AND salon_id = ?`,
        [promo_code.toUpperCase(), effective_salon_id]
      );
      if (promo) {
        await loyaltyService.usePromoCode(promo.promo_id, user_id);
      }
    } catch (err) {
      console.error('Error marking promo code as used:', err);
      // Don't fail the payment for this
    }
  }

  // 4. Save payment record with final amount
  const [result] = await db.query(
    `INSERT INTO payments
    (user_id, amount, payment_method, payment_status, appointment_id, stripe_checkout_session_id, payment_link)
    VALUES (?, ?, 'stripe', 'pending', ?, ?, ?)`,
    [user_id, finalAmount, appointment_id, session.id, session.url]
  );

  // 5. Send email notification with payment link (only if not skipped - skip for direct web checkout)
  if (!skip_email) {
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
  }

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

  // Get session metadata to check payment type
  const session = await stripe.checkout.sessions.retrieve(checkoutSessionId);
  const isDepositPayment = session.metadata?.payment_type === 'deposit';
  const { salon_id, points_redeemed, subtotal, appointment_id: metadataAppointmentId, user_id: metadataUserId } = session.metadata || {};

  // Use appointment_id from metadata first (for legacy checkouts), then from payment record
  const resolvedAppointmentId = metadataAppointmentId || payment?.appointment_id;
  
  // Get salon_id from appointment if not in metadata
  let resolvedSalonId = salon_id;
  if (!resolvedSalonId && resolvedAppointmentId) {
    const [[appointment]] = await db.query(
      "SELECT salon_id FROM appointments WHERE appointment_id = ?",
      [resolvedAppointmentId]
    );
    if (appointment) {
      resolvedSalonId = appointment.salon_id;
    }
  }

  // Use user_id from metadata or payment record
  const resolvedUserId = metadataUserId || payment?.user_id;

  if (resolvedAppointmentId) {
    // Get payment_id to link to appointment
    const [[paymentRecord]] = await db.query(
      "SELECT payment_id FROM payments WHERE stripe_checkout_session_id = ?",
      [checkoutSessionId]
    );
    
    if (!paymentRecord) {
      console.error(`[Payment] No payment record found for session ${checkoutSessionId}`);
      return;
    }
    
    // Confirm the appointment after payment (both full payments and deposit payments)
    await db.query(
      "UPDATE appointments SET status = 'confirmed' WHERE appointment_id = ?",
      [resolvedAppointmentId]
    );
    console.log(`[Payment] Confirmed appointment ${resolvedAppointmentId} for payment ${paymentRecord.payment_id} (${isDepositPayment ? 'deposit' : 'full'} payment)`);
    
    // Link payment to appointment (this is how we check if appointment is paid)
    await db.query(
      "UPDATE payments SET appointment_id = ? WHERE payment_id = ?",
      [resolvedAppointmentId, paymentRecord.payment_id]
    );
    console.log(`[Payment] Linked payment ${paymentRecord.payment_id} to appointment ${resolvedAppointmentId}`);

    // Send confirmation email to customer
    try {
      const { sendEmail } = require("../../config/mailer");
      const [[appointment]] = await db.query(
        `SELECT a.*, s.name as salon_name, s.address as salon_address, u.full_name, u.email 
         FROM appointments a
         JOIN salons s ON a.salon_id = s.salon_id
         JOIN users u ON a.user_id = u.user_id
         WHERE a.appointment_id = ?`,
        [resolvedAppointmentId]
      );
      
      if (appointment && appointment.email) {
        const emailHtml = `
          <h2>Appointment Confirmed!</h2>
          <p>Dear ${appointment.full_name || "Customer"},</p>
          <p>Your payment has been received and your appointment at <b>${appointment.salon_name}</b> is now confirmed.</p>
          <ul>
            <li><b>Date & Time:</b> ${new Date(appointment.scheduled_time).toLocaleString()}</li>
            <li><b>Amount Paid:</b> $${payment?.amount?.toFixed(2) || '0.00'}</li>
          </ul>
          <p><b>Salon Address:</b> ${appointment.salon_address || "N/A"}</p>
          <p>We look forward to seeing you!</p>
        `;
        await sendEmail(appointment.email, "Your Appointment is Confirmed!", emailHtml);
        console.log(`[Payment] Confirmation email sent to ${appointment.email}`);
      }
    } catch (emailErr) {
      console.error("[Payment] Error sending confirmation email:", emailErr);
      // Don't fail if email fails
    }
  }

  // Process loyalty points if metadata includes them
  // Note: For deposit payments, we don't award points yet - points will be awarded when full payment is made
  try {
    if (!isDepositPayment) {
      if (resolvedSalonId && resolvedUserId) {
        console.log(`[Loyalty] Processing loyalty points for legacy checkout: user ${resolvedUserId}, salon ${resolvedSalonId}, subtotal: ${subtotal}, points_redeemed: ${points_redeemed}`);
        const loyaltyService = require("../loyalty/service");

        // Get starting balance for verification
        const startingPoints = await loyaltyService.getLoyaltyPoints(resolvedUserId, resolvedSalonId);
        console.log(`[Loyalty] ===== Starting loyalty points processing (legacy checkout) =====`);
        console.log(`[Loyalty] User ${resolvedUserId}, Salon ${resolvedSalonId}`);
        console.log(`[Loyalty] Starting balance: ${startingPoints} points`);
        console.log(`[Loyalty] Subtotal: $${subtotal}, Points to redeem: ${points_redeemed || 0}`);
        
        let pointsAfterRedemption = startingPoints;
        
        // STEP 1: Redeem points that were used for discount (DEDUCT FIRST)
        if (points_redeemed && parseInt(points_redeemed) > 0) {
          const pointsToRedeem = parseInt(points_redeemed);
          console.log(`[Loyalty] STEP 1: Redeeming ${pointsToRedeem} points...`);
          console.log(`[Loyalty] Balance before redemption: ${pointsAfterRedemption} points`);
          
          await loyaltyService.redeemLoyaltyPoints(resolvedUserId, resolvedSalonId, pointsToRedeem);
          
          pointsAfterRedemption = await loyaltyService.getLoyaltyPoints(resolvedUserId, resolvedSalonId);
          console.log(`[Loyalty] Balance after redemption: ${pointsAfterRedemption} points`);
          console.log(`[Loyalty] ✅ Verified: ${startingPoints} - ${pointsToRedeem} = ${pointsAfterRedemption} (expected: ${startingPoints - pointsToRedeem})`);
          
          if (pointsAfterRedemption !== (startingPoints - pointsToRedeem)) {
            console.error(`[Loyalty] ❌ REDEMPTION MATH ERROR! Expected ${startingPoints - pointsToRedeem}, got ${pointsAfterRedemption}`);
          }
        }

        // STEP 2: Award new points based on purchase amount (ADD AFTER REDEMPTION)
        const purchaseAmount = parseFloat(subtotal) || payment?.amount || 0;
        console.log(`[Loyalty] STEP 2: Awarding points for purchase amount: $${purchaseAmount}...`);
        console.log(`[Loyalty] Balance before awarding: ${pointsAfterRedemption} points`);
        
        const pointsEarned = await loyaltyService.awardPointsForPurchase(resolvedUserId, resolvedSalonId, purchaseAmount);
        console.log(`[Loyalty] Points earned from purchase: ${pointsEarned} points`);
        
        // Verify final balance
        const finalPoints = await loyaltyService.getLoyaltyPoints(resolvedUserId, resolvedSalonId);
        console.log(`[Loyalty] Final balance: ${finalPoints} points`);
        console.log(`[Loyalty] ✅ Verified: ${pointsAfterRedemption} + ${pointsEarned} = ${finalPoints} (expected: ${pointsAfterRedemption + pointsEarned})`);
        
        if (finalPoints !== (pointsAfterRedemption + pointsEarned)) {
          console.error(`[Loyalty] ❌ AWARD MATH ERROR! Expected ${pointsAfterRedemption + pointsEarned}, got ${finalPoints}`);
        }
        
        // Overall verification
        const expectedFinal = startingPoints - (parseInt(points_redeemed) || 0) + pointsEarned;
        console.log(`[Loyalty] ===== Summary (legacy checkout) =====`);
        console.log(`[Loyalty] Starting: ${startingPoints} points`);
        console.log(`[Loyalty] Redeemed: -${points_redeemed || 0} points`);
        console.log(`[Loyalty] Earned: +${pointsEarned} points`);
        console.log(`[Loyalty] Expected final: ${expectedFinal} points`);
        console.log(`[Loyalty] Actual final: ${finalPoints} points`);
        
        if (finalPoints !== expectedFinal) {
          console.error(`[Loyalty] ❌ OVERALL MATH ERROR! Expected ${expectedFinal}, got ${finalPoints}`);
        } else {
          console.log(`[Loyalty] ✅ All loyalty point calculations verified correctly!`);
        }
      } else {
        console.warn(`[Loyalty] Cannot process loyalty points: resolvedSalonId=${resolvedSalonId}, resolvedUserId=${resolvedUserId}`);
      }
    } else {
      // For deposit payments, send notification that deposit was received
      const notificationService = require("../notifications/service");
      const { appointment_id, user_id, salon_id } = session.metadata || {};
      if (appointment_id && user_id) {
        const [[appointment]] = await db.query(
          `SELECT a.*, s.name as salon_name FROM appointments a JOIN salons s ON a.salon_id = s.salon_id WHERE a.appointment_id = ?`,
          [appointment_id]
        );
        if (appointment) {
          await notificationService.createNotification(
            user_id,
            "appointment",
            `Your deposit of $${payment.amount.toFixed(2)} for ${appointment.salon_name} has been received. Your appointment is confirmed!`
          );
        }
      }
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
  // First, get the payment record
  const [[payment]] = await db.query(
    `SELECT 
      p.payment_id,
      p.amount,
      p.payment_method,
      p.payment_status,
      p.created_at AS payment_date,
      p.appointment_id
     FROM payments p
     WHERE p.stripe_checkout_session_id = ?`,
    [sessionId]
  );
  
  if (!payment) {
    return null;
  }

  // Ensure amount is a number
  payment.amount = Number(payment.amount) || 0;

  // Get cart_id from Stripe session metadata (for unified checkouts)
  let cart_id = null;
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    cart_id = session.metadata?.cart_id;
  } catch (err) {
    console.error("Error retrieving Stripe session:", err);
  }

  // If there's an appointment_id, get appointment details
  if (payment.appointment_id) {
    const [[appointmentData]] = await db.query(
      `SELECT 
        a.appointment_id,
        a.scheduled_time,
        a.price AS appointment_price,
        s.name AS salon_name,
        GROUP_CONCAT(sv.custom_name SEPARATOR ', ') AS service_name,
        su.full_name AS staff_name
       FROM appointments a
       LEFT JOIN salons s ON a.salon_id = s.salon_id
       LEFT JOIN appointment_services asv ON a.appointment_id = asv.appointment_id
       LEFT JOIN services sv ON asv.service_id = sv.service_id
       LEFT JOIN staff st ON a.staff_id = st.staff_id
       LEFT JOIN users su ON st.user_id = su.user_id
       WHERE a.appointment_id = ?
       GROUP BY a.appointment_id`,
      [payment.appointment_id]
    );

    if (appointmentData) {
      payment.scheduled_time = appointmentData.scheduled_time;
      payment.appointment_price = Number(appointmentData.appointment_price) || 0;
      payment.salon_name = appointmentData.salon_name;
      payment.service_name = appointmentData.service_name;
      payment.staff_name = appointmentData.staff_name;
      payment.stylist_name = appointmentData.staff_name;
    }
  } else if (cart_id) {
    // For unified checkout (cart with products/services), get cart details
    const [[cartData]] = await db.query(
      `SELECT 
        c.salon_id,
        s.name AS salon_name
       FROM carts c
       LEFT JOIN salons s ON c.salon_id = s.salon_id
       WHERE c.cart_id = ?`,
      [cart_id]
    );

    if (cartData) {
      payment.salon_name = cartData.salon_name;
      payment.salon_id = cartData.salon_id;
    }

    // Get cart items for display
    const [cartItems] = await db.query(
      `SELECT 
        ci.type,
        ci.quantity,
        ci.price,
        CASE
          WHEN ci.type = 'product' THEN p.name
          WHEN ci.type = 'service' THEN s.custom_name
        END as item_name
       FROM cart_items ci
       LEFT JOIN products p ON ci.product_id = p.product_id
       LEFT JOIN services s ON ci.service_id = s.service_id
       WHERE ci.cart_id = ?`,
      [cart_id]
    );

    payment.cart_items = cartItems || [];
  }
  
  return payment;
};
exports.createUnifiedCheckout = async (user_id, salon_id, cart_id, points_to_redeem = 0, promo_code = null) => {
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

  // 3. Verify cart exists and is active
  const [[cart]] = await db.query(
    `SELECT cart_id, status FROM carts WHERE cart_id = ? AND user_id = ? AND salon_id = ?`,
    [cart_id, user_id, salon_id]
  );

  if (!cart) {
    throw new Error("Cart not found");
  }

  // If cart is in pending_payment status, check if there's an active payment
  // If payment exists and is still pending, allow checkout (user might be retrying)
  // Only clear if payment is expired or cancelled
  if (cart.status === 'pending_payment') {
    // Check if there's a recent pending payment for this cart (within last 30 minutes)
    const [pendingPayments] = await db.query(
      `SELECT payment_id, created_at FROM payments 
       WHERE user_id = ? AND payment_status = 'pending' 
       AND created_at > DATE_SUB(NOW(), INTERVAL 30 MINUTE)
       ORDER BY created_at DESC LIMIT 1`,
      [user_id]
    );
    
    if (pendingPayments.length > 0) {
      // There's a recent pending payment - allow checkout to proceed (might be retry)
      console.log(`[Payment] Cart in pending_payment but recent payment exists (${pendingPayments[0].payment_id}), allowing checkout`);
    } else {
      // No recent payment - previous checkout was likely cancelled/expired
      // Clear all items from the cart since payment was cancelled
      await db.query(
        `DELETE FROM cart_items WHERE cart_id = ?`,
        [cart_id]
      );
      // Reset cart status to active
      await db.query(
        `UPDATE carts SET status = 'active' WHERE cart_id = ?`,
        [cart_id]
      );
      // Return empty cart - user needs to add items again
      throw new Error("Your previous checkout was cancelled or expired. Please add items to your cart again.");
    }
  }

  if (cart.status !== 'active' && cart.status !== 'pending_payment') {
    throw new Error(`Cart is not available (status: ${cart.status}). Please create a new cart.`);
  }

  // 4. Get all cart items (products + services) - only from active cart
  // Filter out services for past/completed/paid appointments
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
      END as item_description,
      a.appointment_id,
      a.scheduled_time,
      a.status as appointment_status
     FROM cart_items ci
     LEFT JOIN products p ON ci.product_id = p.product_id
     LEFT JOIN services s ON ci.service_id = s.service_id
     LEFT JOIN appointments a ON a.appointment_id = CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(ci.notes, 'Appointment #', -1), ' ', 1) AS UNSIGNED)
     JOIN carts c ON ci.cart_id = c.cart_id
     WHERE ci.cart_id = ? AND c.status = 'active'
     AND (
       ci.type = 'product'
       OR
       (ci.type = 'service' 
        AND ci.notes LIKE 'Appointment #%'
        AND a.appointment_id IS NOT NULL
        AND a.status IN ('confirmed', 'pending')
        AND a.scheduled_time > NOW()
        AND NOT EXISTS (
          -- Exclude appointments that have been paid for (completed payments)
          SELECT 1 FROM payments p 
          WHERE p.appointment_id = a.appointment_id 
          AND p.payment_status = 'completed'
        ))
     )`,
    [cart_id]
  );
  
  // Delete any invalid service items from the cart (cleanup)
  await db.query(
    `DELETE ci FROM cart_items ci
     JOIN carts c ON ci.cart_id = c.cart_id
     WHERE ci.cart_id = ? AND ci.type = 'service' AND ci.notes LIKE 'Appointment #%'
     AND (
       NOT EXISTS (
         SELECT 1 FROM appointments a 
         WHERE a.appointment_id = CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(ci.notes, 'Appointment #', -1), ' ', 1) AS UNSIGNED)
         AND a.status IN ('confirmed', 'pending')
         AND a.scheduled_time > NOW()
       )
     )`,
    [cart_id]
  );

  if (!cartItems || cartItems.length === 0) {
    throw new Error("Cart is empty. Please add items to your cart before checkout.");
  }

  // 5. Calculate total and apply discounts
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  let loyaltyDiscount = 0;
  let promoDiscount = 0;
  let actualPointsRedeemed = 0;
  let appliedPromoId = null;

  // Apply loyalty points discount
  if (points_to_redeem > 0) {
    try {
      const userPoints = await loyaltyService.getLoyaltyPoints(user_id, salon_id);
      if (userPoints < points_to_redeem) {
        throw new Error(`You only have ${userPoints} points available`);
      }
      loyaltyDiscount = await loyaltyService.calculateDiscount(salon_id, points_to_redeem);
      if (loyaltyDiscount > subtotal) {
        loyaltyDiscount = subtotal;
        const config = await loyaltyService.getLoyaltyConfig(salon_id);
        actualPointsRedeemed = Math.ceil(loyaltyDiscount / config.redeem_rate);
      } else {
        actualPointsRedeemed = points_to_redeem;
      }
    } catch (err) {
      throw new Error(`Loyalty redemption error: ${err.message}`);
    }
  }

  // Apply promo code discount
  if (promo_code) {
    const promoResult = await loyaltyService.validatePromoCode(promo_code, salon_id, subtotal - loyaltyDiscount, user_id);
    if (promoResult.valid && promoResult.discount) {
      promoDiscount = promoResult.discount;
      appliedPromoId = promoResult.promo?.promo_id;
    } else if (promoResult.error) {
      throw new Error(promoResult.error);
    }
  }

  const totalDiscount = loyaltyDiscount + promoDiscount;
  const total = Math.max(0, subtotal - totalDiscount);

  // 6. Create Stripe line items with discounts applied proportionally
  const lineItems = cartItems.map(item => {
    const itemTotal = item.price * item.quantity;
    const itemDiscountProportion = itemTotal / subtotal;
    const itemDiscount = totalDiscount * itemDiscountProportion;
    const discountedPrice = Math.max(0, item.price - (itemDiscount / item.quantity));
    
    return {
      price_data: {
        currency: "usd",
        product_data: {
          name: `${item.item_name}`,
          description: item.item_description || (item.type === 'service' ? 'Service' : 'Product'),
        },
        unit_amount: Math.round(discountedPrice * 100),
      },
      quantity: item.quantity,
    };
  });

  // 7. Create Stripe Checkout Session
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
      loyalty_discount: loyaltyDiscount.toFixed(2),
      promo_discount: promoDiscount.toFixed(2),
      promo_code: promo_code || '',
      promo_id: appliedPromoId ? appliedPromoId.toString() : '',
    },
  });

  // 7. Save payment record with cart_id
  const [result] = await db.query(
    `INSERT INTO payments
    (user_id, amount, payment_method, payment_status, stripe_checkout_session_id, payment_link)
    VALUES (?, ?, 'stripe', 'pending', ?, ?)`,
    [user_id, total, session.id, session.url]
  );

  // 8. Update cart status to 'pending_payment' to prevent duplicate checkouts
  // Only update AFTER payment record is successfully created
  await db.query(
    `UPDATE carts SET status = 'pending_payment' WHERE cart_id = ?`,
    [cart_id]
  );

  // Email notification removed - customer is being redirected to payment page
  // Confirmation email will be sent after successful payment (in confirmUnifiedCheckout)

  return {
    payment_id: result.insertId,
    payment_link: session.url,
    checkout_session_id: session.id,
    points_redeemed: actualPointsRedeemed,
    loyalty_discount: loyaltyDiscount,
    promo_discount: promoDiscount,
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
  const { cart_id, salon_id, user_id, points_redeemed, subtotal, promo_id } = session.metadata;

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

    // Update appointment statuses and link payment
    for (const appointment_id of [...new Set(appointmentIds)]) {
      console.log(`[Payment] Linking payment ${payment.payment_id} to appointment ${appointment_id}`);
      
      // Update appointment status
      await db.query(
        "UPDATE appointments SET status = 'confirmed' WHERE appointment_id = ?",
        [appointment_id]
      );

      // Link payment to appointment (this is how we check if appointment is paid)
      const [updateResult] = await db.query(
        "UPDATE payments SET appointment_id = ? WHERE payment_id = ?",
        [appointment_id, payment.payment_id]
      );
      
      console.log(`[Payment] ✅ Linked payment ${payment.payment_id} to appointment ${appointment_id} (affected rows: ${updateResult.affectedRows})`);
      
      // Verify the link was created
      const [[verifyPayment]] = await db.query(
        "SELECT appointment_id FROM payments WHERE payment_id = ?",
        [payment.payment_id]
      );
      console.log(`[Payment] Verification: payment ${payment.payment_id} now has appointment_id = ${verifyPayment?.appointment_id || 'NULL'}`);
    }
  }

  // 7. Delete cart items and mark cart as checked out
  await db.query(
    `DELETE FROM cart_items WHERE cart_id = ?`,
    [cart_id]
  );
  await db.query(
    `UPDATE carts SET status = 'checked_out' WHERE cart_id = ?`,
    [cart_id]
  );

  // 8. Process loyalty points
  try {
    // Get starting balance for verification
    const startingPoints = await loyaltyService.getLoyaltyPoints(user_id, salon_id);
    console.log(`[Loyalty] ===== Starting loyalty points processing =====`);
    console.log(`[Loyalty] User ${user_id}, Salon ${salon_id}`);
    console.log(`[Loyalty] Starting balance: ${startingPoints} points`);
    console.log(`[Loyalty] Subtotal: $${subtotal}, Points to redeem: ${points_redeemed || 0}`);
    
    let pointsAfterRedemption = startingPoints;
    
    // STEP 1: Redeem points that were used for discount (DEDUCT FIRST)
    if (points_redeemed && parseInt(points_redeemed) > 0) {
      const pointsToRedeem = parseInt(points_redeemed);
      console.log(`[Loyalty] STEP 1: Redeeming ${pointsToRedeem} points...`);
      console.log(`[Loyalty] Balance before redemption: ${pointsAfterRedemption} points`);
      
      await loyaltyService.redeemLoyaltyPoints(user_id, salon_id, pointsToRedeem);
      
      pointsAfterRedemption = await loyaltyService.getLoyaltyPoints(user_id, salon_id);
      console.log(`[Loyalty] Balance after redemption: ${pointsAfterRedemption} points`);
      console.log(`[Loyalty] ✅ Verified: ${startingPoints} - ${pointsToRedeem} = ${pointsAfterRedemption} (expected: ${startingPoints - pointsToRedeem})`);
      
      if (pointsAfterRedemption !== (startingPoints - pointsToRedeem)) {
        console.error(`[Loyalty] ❌ REDEMPTION MATH ERROR! Expected ${startingPoints - pointsToRedeem}, got ${pointsAfterRedemption}`);
      }
    }

    // STEP 2: Award new points based on purchase amount (ADD AFTER REDEMPTION)
    const purchaseAmount = parseFloat(subtotal) || payment.amount;
    console.log(`[Loyalty] STEP 2: Awarding points for purchase amount: $${purchaseAmount}...`);
    console.log(`[Loyalty] Balance before awarding: ${pointsAfterRedemption} points`);
    
    const pointsEarned = await loyaltyService.awardPointsForPurchase(user_id, salon_id, purchaseAmount);
    console.log(`[Loyalty] Points earned from purchase: ${pointsEarned} points`);
    
    // Verify final balance
    const finalPoints = await loyaltyService.getLoyaltyPoints(user_id, salon_id);
    console.log(`[Loyalty] Final balance: ${finalPoints} points`);
    console.log(`[Loyalty] ✅ Verified: ${pointsAfterRedemption} + ${pointsEarned} = ${finalPoints} (expected: ${pointsAfterRedemption + pointsEarned})`);
    
    if (finalPoints !== (pointsAfterRedemption + pointsEarned)) {
      console.error(`[Loyalty] ❌ AWARD MATH ERROR! Expected ${pointsAfterRedemption + pointsEarned}, got ${finalPoints}`);
    }
    
    // Overall verification
    const expectedFinal = startingPoints - (parseInt(points_redeemed) || 0) + pointsEarned;
    console.log(`[Loyalty] ===== Summary =====`);
    console.log(`[Loyalty] Starting: ${startingPoints} points`);
    console.log(`[Loyalty] Redeemed: -${points_redeemed || 0} points`);
    console.log(`[Loyalty] Earned: +${pointsEarned} points`);
    console.log(`[Loyalty] Expected final: ${expectedFinal} points`);
    console.log(`[Loyalty] Actual final: ${finalPoints} points`);
    
    if (finalPoints !== expectedFinal) {
      console.error(`[Loyalty] ❌ OVERALL MATH ERROR! Expected ${expectedFinal}, got ${finalPoints}`);
    } else {
      console.log(`[Loyalty] ✅ All loyalty point calculations verified correctly!`);
    }
  } catch (loyaltyErr) {
    console.error('[Loyalty] Loyalty processing error (non-fatal):', loyaltyErr);
    console.error('[Loyalty] Error stack:', loyaltyErr.stack);
    // Don't fail the whole transaction if loyalty fails
  }

  // 9. Track promo code usage (so user can't use again)
  if (promo_id) {
    try {
      await loyaltyService.usePromoCode(parseInt(promo_id), parseInt(user_id));
      console.log(`[Promo] Tracked usage of promo ${promo_id} by user ${user_id}`);
    } catch (promoErr) {
      console.error('[Promo] Promo tracking error (non-fatal):', promoErr);
    }
  }
};

/**
 * Create pay-in-store payment record
 */
exports.createPayInStorePayment = async (user_id, amount, appointment_id, points_to_redeem = 0, salon_id = null, deposit_amount = null) => {
  const notificationService = require("../notifications/service");
  const loyaltyService = require("../loyalty/service");

  // Verify appointment exists and belongs to user
  const [[appointment]] = await db.query(
    `SELECT a.*, s.name as salon_name, s.owner_id, s.salon_id
     FROM appointments a
     JOIN salons s ON a.salon_id = s.salon_id
     WHERE a.appointment_id = ? AND a.user_id = ?`,
    [appointment_id, user_id]
  );

  if (!appointment) {
    throw new Error("Appointment not found");
  }

  const resolvedSalonId = salon_id || appointment.salon_id;
  let finalAmount = amount;
  let actualPointsRedeemed = 0;
  
  // Get deposit percentage from salon settings if not provided
  let depositAmount = deposit_amount;
  if (depositAmount === null || depositAmount === undefined) {
    const [[settings]] = await db.query(
      `SELECT deposit_percentage FROM salon_settings WHERE salon_id = ?`,
      [resolvedSalonId]
    );
    const depositPercentage = settings?.deposit_percentage ? parseFloat(settings.deposit_percentage) : 0;
    if (depositPercentage > 0) {
      depositAmount = (finalAmount * depositPercentage) / 100;
    } else {
      depositAmount = 0;
    }
  }
  
  let depositSessionId = null;
  let depositPaymentLink = null;

  // Handle loyalty points redemption
  if (points_to_redeem > 0) {
    try {
      // Get starting balance for verification
      const startingPoints = await loyaltyService.getLoyaltyPoints(user_id, resolvedSalonId);
      console.log(`[Loyalty] ===== Starting loyalty points redemption (pay-in-store) =====`);
      console.log(`[Loyalty] User ${user_id}, Salon ${resolvedSalonId}`);
      console.log(`[Loyalty] Starting balance: ${startingPoints} points`);
      console.log(`[Loyalty] Points to redeem: ${points_to_redeem}`);
      
      // Validate user has enough points
      if (startingPoints < points_to_redeem) {
        throw new Error(`You only have ${startingPoints} points available`);
      }

      // Calculate discount from points
      const discount = await loyaltyService.calculateDiscount(resolvedSalonId, points_to_redeem);

      // Ensure discount doesn't exceed amount
      if (discount > amount) {
        finalAmount = 0;
        // Recalculate points needed for this discount
        const config = await loyaltyService.getLoyaltyConfig(resolvedSalonId);
        actualPointsRedeemed = Math.ceil(amount / config.redeem_rate);
      } else {
        finalAmount = amount - discount;
        actualPointsRedeemed = points_to_redeem;
      }

      // Redeem points
      if (actualPointsRedeemed > 0) {
        console.log(`[Loyalty] Redeeming ${actualPointsRedeemed} points (adjusted from ${points_to_redeem})...`);
        console.log(`[Loyalty] Balance before redemption: ${startingPoints} points`);
        
        await loyaltyService.redeemLoyaltyPoints(user_id, resolvedSalonId, actualPointsRedeemed);
        
        const pointsAfter = await loyaltyService.getLoyaltyPoints(user_id, resolvedSalonId);
        console.log(`[Loyalty] Balance after redemption: ${pointsAfter} points`);
        console.log(`[Loyalty] ✅ Verified: ${startingPoints} - ${actualPointsRedeemed} = ${pointsAfter} (expected: ${startingPoints - actualPointsRedeemed})`);
        
        if (pointsAfter !== (startingPoints - actualPointsRedeemed)) {
          console.error(`[Loyalty] ❌ REDEMPTION MATH ERROR! Expected ${startingPoints - actualPointsRedeemed}, got ${pointsAfter}`);
        }
      }
    } catch (err) {
      throw new Error(`Loyalty redemption error: ${err.message}`);
    }
  }

  // If deposit is required, create Stripe checkout for deposit
  if (depositAmount > 0) {
    // Get user details for email
    const [[user]] = await db.query(
      "SELECT email, full_name FROM users WHERE user_id = ?",
      [user_id]
    );

    // Get appointment services for line items
    const [services] = await db.query(
      `SELECT asv.service_id, sv.custom_name, asv.price
       FROM appointment_services asv
       JOIN services sv ON asv.service_id = sv.service_id
       WHERE asv.appointment_id = ?`,
      [appointment_id]
    );

    // Create line item for deposit
    const depositLineItem = {
      price_data: {
        currency: "usd",
        product_data: {
          name: `Deposit for ${appointment.salon_name}`,
          description: `Deposit payment for appointment on ${new Date(appointment.scheduled_time || appointment.appointment_date).toLocaleString()}`,
        },
        unit_amount: Math.round(depositAmount * 100),
      },
      quantity: 1,
    };

    // Create Stripe checkout session for deposit
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [depositLineItem],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-canceled`,
      metadata: {
        appointment_id: appointment_id,
        user_id: user_id,
        salon_id: resolvedSalonId,
        payment_type: "deposit",
        total_amount: finalAmount.toFixed(2),
        deposit_amount: depositAmount.toFixed(2),
        points_redeemed: actualPointsRedeemed.toString(),
      },
    });

    depositSessionId = session.id;
    depositPaymentLink = session.url;

    // Send email with deposit payment link
    if (user) {
      const servicesList = services.length > 0
        ? services.map(s => `<li>${s.custom_name} - $${Number(s.price).toFixed(2)}</li>`).join('')
        : `<li>Appointment - $${finalAmount.toFixed(2)}</li>`;

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Pay Deposit to Confirm Appointment</h2>
          <p>Hi ${user.full_name},</p>
          <p>Your appointment at <strong>${appointment.salon_name}</strong> requires a deposit payment to confirm.</p>

          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Appointment Details:</strong></p>
            <ul style="margin: 10px 0; padding-left: 20px;">
              ${servicesList}
            </ul>
            <p style="margin-top: 15px;"><strong>Total Amount:</strong> $${finalAmount.toFixed(2)}</p>
            <p><strong>Deposit Required:</strong> $${depositAmount.toFixed(2)}</p>
            <p style="color: #666; font-size: 13px;">You will pay the remaining balance when you arrive at the salon.</p>
          </div>

          <a href="${session.url}"
             style="display: inline-block; background: #5469d4; color: white; padding: 14px 28px;
                    text-decoration: none; border-radius: 6px; font-weight: bold;">
            Pay Deposit - $${depositAmount.toFixed(2)}
          </a>

          <p style="color: #666; font-size: 13px; margin-top: 20px;">
            This link expires in 24 hours.
          </p>

          <p>Thank you,<br>${appointment.salon_name}</p>
        </div>
      `;

      await sendEmail(user.email, "Pay Deposit to Confirm Appointment", emailHtml);
    }
  }

  // Create payment record
  // If deposit is required, status is 'pending' until deposit is paid
  // If no deposit, status is 'pending' (will be paid in store)
  const [result] = await db.query(
    `INSERT INTO payments
    (user_id, amount, payment_method, payment_status, appointment_id, stripe_checkout_session_id, payment_link)
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      user_id,
      finalAmount,
      depositAmount > 0 ? 'stripe' : 'cash',
      depositAmount > 0 ? 'pending' : 'pending',
      appointment_id,
      depositSessionId,
      depositPaymentLink
    ]
  );

  const payment_id = result.insertId;

  // Link payment to appointment and update status
  // For no-deposit payments, mark as completed immediately
  // For deposit payments, keep status as pending until deposit is paid
  if (depositAmount === 0) {
    // No deposit required - payment is complete
    await db.query(
      "UPDATE appointments SET status = 'confirmed' WHERE appointment_id = ?",
      [appointment_id]
    );
    await db.query(
      "UPDATE payments SET payment_status = 'completed' WHERE payment_id = ?",
      [payment_id]
    );
  }
  
  // Link payment to appointment (this is how we check if appointment is paid)
  await db.query(
    "UPDATE payments SET appointment_id = ? WHERE payment_id = ?",
    [appointment_id, payment_id]
  );

  // Award loyalty points for "pay in store" payments without deposit (points awarded immediately)
  // For deposit payments, points will be awarded when full payment is completed
  if (depositAmount === 0) {
    try {
      const loyaltyService = require("../loyalty/service");
      
      // Get starting balance for verification
      const startingPoints = await loyaltyService.getLoyaltyPoints(user_id, resolvedSalonId);
      const redeemedPoints = actualPointsRedeemed || 0;
      
      console.log(`[Loyalty] ===== Starting loyalty points processing (pay-in-store, no deposit) =====`);
      console.log(`[Loyalty] User ${user_id}, Salon ${resolvedSalonId}`);
      console.log(`[Loyalty] Starting balance: ${startingPoints} points`);
      console.log(`[Loyalty] Points redeemed: ${redeemedPoints}`);
      console.log(`[Loyalty] Purchase amount: $${finalAmount}`);
      
      let pointsAfterRedemption = startingPoints;
      
      // If points were redeemed earlier, we need to account for that
      if (redeemedPoints > 0) {
        pointsAfterRedemption = startingPoints - redeemedPoints;
        console.log(`[Loyalty] Balance after redemption: ${pointsAfterRedemption} points`);
      }
      
      // Award points for purchase
      console.log(`[Loyalty] Awarding points for purchase amount: $${finalAmount}...`);
      console.log(`[Loyalty] Balance before awarding: ${pointsAfterRedemption} points`);
      
      const pointsEarned = await loyaltyService.awardPointsForPurchase(user_id, resolvedSalonId, finalAmount);
      console.log(`[Loyalty] Points earned from purchase: ${pointsEarned} points`);
      
      // Verify final balance
      const finalPoints = await loyaltyService.getLoyaltyPoints(user_id, resolvedSalonId);
      console.log(`[Loyalty] Final balance: ${finalPoints} points`);
      console.log(`[Loyalty] ✅ Verified: ${pointsAfterRedemption} + ${pointsEarned} = ${finalPoints} (expected: ${pointsAfterRedemption + pointsEarned})`);
      
      if (finalPoints !== (pointsAfterRedemption + pointsEarned)) {
        console.error(`[Loyalty] ❌ AWARD MATH ERROR! Expected ${pointsAfterRedemption + pointsEarned}, got ${finalPoints}`);
      }
      
      // Overall verification
      const expectedFinal = startingPoints - redeemedPoints + pointsEarned;
      console.log(`[Loyalty] ===== Summary (pay-in-store) =====`);
      console.log(`[Loyalty] Starting: ${startingPoints} points`);
      console.log(`[Loyalty] Redeemed: -${redeemedPoints} points`);
      console.log(`[Loyalty] Earned: +${pointsEarned} points`);
      console.log(`[Loyalty] Expected final: ${expectedFinal} points`);
      console.log(`[Loyalty] Actual final: ${finalPoints} points`);
      
      if (finalPoints !== expectedFinal) {
        console.error(`[Loyalty] ❌ OVERALL MATH ERROR! Expected ${expectedFinal}, got ${finalPoints}`);
      } else {
        console.log(`[Loyalty] ✅ All loyalty point calculations verified correctly!`);
      }
    } catch (loyaltyErr) {
      console.error("[Loyalty] Error awarding loyalty points for pay-in-store payment:", loyaltyErr);
      console.error("[Loyalty] Error stack:", loyaltyErr.stack);
      // Don't fail the transaction if loyalty fails
    }
  }

  // Send notification to customer
  try {
    const notificationMessage = depositAmount > 0
      ? `Your appointment at ${appointment.salon_name} requires a $${depositAmount.toFixed(2)} deposit. Please check your email to complete the deposit payment.`
      : `Your appointment at ${appointment.salon_name} is confirmed. Please pay when you arrive.`;
    
    await notificationService.createNotification(
      user_id,
      "appointment",
      notificationMessage
    );
  } catch (notificationError) {
    console.error("Error creating notification:", notificationError);
  }

  // Send confirmation email for pay-in-store with no deposit (immediate confirmation)
  if (depositAmount === 0) {
    try {
      const { sendEmail } = require("../../config/mailer");
      const [[userInfo]] = await db.query(
        "SELECT full_name, email FROM users WHERE user_id = ?",
        [user_id]
      );
      
      if (userInfo && userInfo.email) {
        const emailHtml = `
          <h2>Appointment Confirmed!</h2>
          <p>Dear ${userInfo.full_name || "Customer"},</p>
          <p>Your appointment at <b>${appointment.salon_name}</b> is confirmed.</p>
          <ul>
            <li><b>Date & Time:</b> ${new Date(appointment.scheduled_time).toLocaleString()}</li>
            <li><b>Total:</b> $${finalAmount.toFixed(2)}</li>
          </ul>
          <p>You will pay when you arrive at the salon.</p>
          <p>We look forward to seeing you!</p>
        `;
        await sendEmail(userInfo.email, "Your Appointment is Confirmed!", emailHtml);
        console.log(`[Payment] Confirmation email sent to ${userInfo.email} (pay-in-store)`);
      }
    } catch (emailErr) {
      console.error("[Payment] Error sending confirmation email for pay-in-store:", emailErr);
    }
  }

  // Send notification to salon owner
  try {
    if (appointment.owner_id) {
      const ownerMessage = depositAmount > 0
        ? `New appointment requires deposit payment. Customer will pay remaining balance in store.`
        : `New appointment confirmed. Customer will pay in store.`;
      
      await notificationService.createNotification(
        appointment.owner_id,
        "appointment",
        ownerMessage
      );
    }
  } catch (notificationError) {
    console.error("Error creating owner notification:", notificationError);
  }

  return { 
    payment_id,
    points_redeemed: actualPointsRedeemed,
    discount_applied: amount - finalAmount,
    deposit_required: depositAmount > 0,
    deposit_amount: depositAmount,
    payment_link: depositPaymentLink,
  };
};

/**
 * Reset cart status from pending_payment back to active (for cancelled/expired payments)
 * Also clears all items from the cart
 */
exports.resetCartStatus = async (cart_id) => {
  // Clear all items from the cart
  await db.query(
    `DELETE FROM cart_items WHERE cart_id = ?`,
    [cart_id]
  );
  // Reset cart status to active
  await db.query(
    `UPDATE carts SET status = 'active' WHERE cart_id = ? AND status = 'pending_payment'`,
    [cart_id]
  );
};

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

  // 3. Create Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/payment-canceled`,
    metadata: {
      appointment_id: appointment_id,
      user_id: user_id,
    },
  });

  // 4. Save payment record
  const [result] = await db.query(
    `INSERT INTO payments
    (user_id, amount, payment_method, payment_status, appointment_id, stripe_checkout_session_id, payment_link)
    VALUES (?, ?, 'stripe', 'pending', ?, ?, ?)`,
    [user_id, amount, appointment_id, session.id, session.url]
  );

  // 5. Send email notification with payment link
  const servicesList = services.length > 0
    ? services.map(s => `<li>${s.custom_name} - $${Number(s.price).toFixed(2)}</li>`).join('')
    : `<li>${appointment.service_name || 'Appointment'} - $${amount.toFixed(2)}</li>`;

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

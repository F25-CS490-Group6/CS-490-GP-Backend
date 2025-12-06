const Stripe = require("stripe");
const { db } = require("../../config/database");

// Lazy initialization of Stripe - only create when needed
function getStripe() {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured. Please add it to your .env file.");
  }
  return new Stripe(apiKey);
}

/**
 * Subscription plan pricing (in cents)
 */
const PLAN_PRICES = {
  free: 0,
  premium: 2999, // $29.99/month
  enterprise: 9999, // $99.99/month
};

/**
 * Create a Stripe checkout session for subscription
 */
async function createSubscriptionCheckout({ userId, userEmail, planName }) {
  if (planName === "free") {
    throw new Error("Cannot create checkout for free plan");
  }

  const stripe = getStripe();
  const priceId = process.env[`STRIPE_PRICE_ID_${planName.toUpperCase()}`];
  
  // If price ID is set in env, use it (for recurring subscriptions)
  // Otherwise, create a one-time payment checkout
  if (priceId) {
    // Recurring subscription
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: userEmail,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        userId: userId.toString(),
        planName: planName,
      },
      success_url: `${process.env.FRONTEND_URL}/account-settings?subscription=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/account-settings?subscription=cancelled`,
      subscription_data: {
        metadata: {
          userId: userId.toString(),
          planName: planName,
        },
      },
    });

    return session.url;
  } else {
    // One-time payment for monthly subscription
    const amount = PLAN_PRICES[planName];
    if (!amount) {
      throw new Error(`Invalid plan: ${planName}`);
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: userEmail,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${planName.charAt(0).toUpperCase() + planName.slice(1)} Plan Subscription`,
              description: `Monthly subscription for ${planName} plan`,
            },
            unit_amount: amount,
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: userId.toString(),
        planName: planName,
        type: "subscription",
      },
      success_url: `${process.env.FRONTEND_URL}/account-settings?subscription=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/account-settings?subscription=cancelled`,
    });

    return session.url;
  }
}

/**
 * Record subscription payment in database
 */
async function recordSubscriptionPayment({
  userId,
  planName,
  stripeSessionId,
  amount,
  currency,
  status,
  subscriptionId = null,
}) {
  const sql = `
    INSERT INTO subscription_payments (
      user_id, 
      plan_name, 
      stripe_session_id, 
      amount, 
      currency, 
      status, 
      stripe_subscription_id,
      created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
  `;
  
  await db.query(sql, [
    userId,
    planName,
    stripeSessionId,
    amount,
    currency || "usd",
    status,
    subscriptionId,
  ]);
}

/**
 * Update subscription status based on payment
 */
async function updateUserSubscription(userId, planName, isActive = true) {
  if (isActive) {
    // Update user's subscription plan
    await db.query(
      `UPDATE users SET subscription_plan = ?, updated_at = NOW() WHERE user_id = ?`,
      [planName, userId]
    );

    // Record subscription start - check if record exists first
    const [existing] = await db.query(
      `SELECT subscription_id FROM user_subscriptions WHERE user_id = ?`,
      [userId]
    );

    if (existing && existing.length > 0) {
      // Update existing
      await db.query(
        `UPDATE user_subscriptions 
         SET plan_name = ?, status = 'active', updated_at = NOW() 
         WHERE user_id = ?`,
        [planName, userId]
      );
    } else {
      // Insert new
      await db.query(
        `INSERT INTO user_subscriptions (
          user_id, 
          plan_name, 
          status, 
          started_at, 
          updated_at
        ) VALUES (?, ?, 'active', NOW(), NOW())`,
        [userId, planName]
      );
    }
  } else {
    // Downgrade to free if payment failed
    await db.query(
      `UPDATE users SET subscription_plan = 'free', updated_at = NOW() WHERE user_id = ?`,
      [userId]
    );

    await db.query(
      `UPDATE user_subscriptions 
       SET status = 'cancelled', updated_at = NOW() 
       WHERE user_id = ?`,
      [userId]
    );
  }
}

/**
 * Get user's subscription payment history
 */
async function getSubscriptionHistory(userId) {
  const [payments] = await db.query(
    `SELECT 
      payment_id,
      plan_name,
      amount,
      currency,
      status,
      stripe_session_id,
      created_at
    FROM subscription_payments
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 50`,
    [userId]
  );

  return payments || [];
}

/**
 * Get current subscription status
 */
async function getSubscriptionStatus(userId) {
  const [subscription] = await db.query(
    `SELECT 
      us.user_id,
      us.plan_name,
      us.status,
      us.started_at,
      us.updated_at,
      u.subscription_plan as current_plan
    FROM user_subscriptions us
    RIGHT JOIN users u ON u.user_id = us.user_id
    WHERE u.user_id = ?`,
    [userId]
  );

  if (!subscription || subscription.length === 0) {
    // Return default free plan
    return {
      plan: "free",
      status: "active",
      started_at: null,
    };
  }

  return {
    plan: subscription[0].current_plan || subscription[0].plan_name || "free",
    status: subscription[0].status || "active",
    started_at: subscription[0].started_at,
    updated_at: subscription[0].updated_at,
  };
}

module.exports = {
  createSubscriptionCheckout,
  recordSubscriptionPayment,
  updateUserSubscription,
  getSubscriptionHistory,
  getSubscriptionStatus,
  PLAN_PRICES,
};


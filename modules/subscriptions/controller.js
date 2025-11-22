const subscriptionService = require("./service");
const { verifyAnyToken } = require("../../middleware/verifyAnyToken");

/**
 * POST /api/subscriptions/checkout
 * Create a Stripe checkout session for subscription
 */
exports.createCheckout = async (req, res) => {
  try {
    const userId = req.user?.user_id || req.user?.id;
    const { planName } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!planName || !["premium", "enterprise"].includes(planName)) {
      return res.status(400).json({ 
        error: "Invalid plan. Must be 'premium' or 'enterprise'" 
      });
    }

    // Get user email
    const { db } = require("../../config/database");
    const [userRows] = await db.query(
      "SELECT email FROM users WHERE user_id = ?",
      [userId]
    );

    if (!userRows || userRows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userEmail = userRows[0].email;

    const checkoutUrl = await subscriptionService.createSubscriptionCheckout({
      userId,
      userEmail,
      planName,
    });

    res.json({ checkoutUrl, planName });
  } catch (error) {
    console.error("Error creating subscription checkout:", error);
    res.status(500).json({ 
      error: error.message || "Failed to create checkout session" 
    });
  }
};

/**
 * POST /api/subscriptions/webhook
 * Handle Stripe webhook events for subscriptions
 */
exports.handleWebhook = async (req, res) => {
  const Stripe = require("stripe");
  const apiKey = process.env.STRIPE_SECRET_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ error: "Stripe is not configured" });
  }
  
  const stripe = new Stripe(apiKey);
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = parseInt(session.metadata?.userId);
        const planName = session.metadata?.planName;

        if (userId && planName) {
          // Record payment
          await subscriptionService.recordSubscriptionPayment({
            userId,
            planName,
            stripeSessionId: session.id,
            amount: session.amount_total,
            currency: session.currency,
            status: session.payment_status,
            subscriptionId: session.subscription || null,
          });

          // Update user subscription if payment succeeded
          if (session.payment_status === "paid") {
            await subscriptionService.updateUserSubscription(
              userId,
              planName,
              true
            );
          }
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const userId = parseInt(subscription.metadata?.userId);
        const planName = subscription.metadata?.planName;

        if (userId && planName) {
          const isActive = subscription.status === "active";
          await subscriptionService.updateUserSubscription(
            userId,
            planName,
            isActive
          );
        }
        break;
      }

      case "customer.subscription.deleted":
      case "invoice.payment_failed": {
        const subscription = event.data.object.subscription 
          ? event.data.object 
          : event.data.object;
        const userId = parseInt(subscription.metadata?.userId);

        if (userId) {
          // Downgrade to free on cancellation or payment failure
          await subscriptionService.updateUserSubscription(
            userId,
            "free",
            false
          );
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
};

/**
 * GET /api/subscriptions/history
 * Get user's subscription payment history
 */
exports.getHistory = async (req, res) => {
  try {
    const userId = req.user?.user_id || req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const history = await subscriptionService.getSubscriptionHistory(userId);
    res.json({ payments: history });
  } catch (error) {
    console.error("Error fetching subscription history:", error);
    res.status(500).json({ error: "Failed to fetch subscription history" });
  }
};

/**
 * GET /api/subscriptions/status
 * Get current subscription status
 */
exports.getStatus = async (req, res) => {
  try {
    const userId = req.user?.user_id || req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const status = await subscriptionService.getSubscriptionStatus(userId);
    res.json(status);
  } catch (error) {
    console.error("Error fetching subscription status:", error);
    res.status(500).json({ error: "Failed to fetch subscription status" });
  }
};


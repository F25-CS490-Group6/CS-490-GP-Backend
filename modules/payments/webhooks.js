//payments/webhooks.js
const stripe = require("../../config/stripe");
const paymentService = require("./service");

exports.handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`[Webhook] Received event: ${event.type}`);

  try {
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object;
        console.log(`[Webhook] Processing checkout.session.completed for session ${session.id}`);
        console.log(`[Webhook] Session metadata:`, JSON.stringify(session.metadata, null, 2));

        // Check if this is a unified checkout (cart with products + services)
        if (session.metadata?.checkout_type === 'unified') {
          console.log(`[Webhook] Detected unified checkout, calling confirmUnifiedCheckout`);
          await paymentService.confirmUnifiedCheckout(session.id, session.payment_intent);
          console.log(`[Webhook] Unified checkout confirmed for session ${session.id}`);
        } else {
          // Legacy appointment-only checkout
          console.log(`[Webhook] Detected legacy checkout, calling confirmPayment`);
          await paymentService.confirmPayment(session.id, session.payment_intent);
          console.log(`[Webhook] Payment confirmed for session ${session.id}`);
        }
        break;

      case "checkout.session.expired":
        const expired = event.data.object;
        await paymentService.failPayment(expired.id, "Session expired");
        // Reset cart status if it was a unified checkout
        if (expired.metadata?.checkout_type === 'unified' && expired.metadata?.cart_id) {
          await paymentService.resetCartStatus(expired.metadata.cart_id);
        }
        break;
    }
  } catch (err) {
    console.error("Webhook processing error:", err);
  }

  res.json({ received: true });
};

const express = require("express");
require("dotenv").config();
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const port = process.env.PORT || 4000;
const authRoutes = require("./modules/auth/routes");
const staffRoutes = require("./modules/staff/routes");
const userRoutes = require("./modules/users/routes");
const appointmentRoutes = require("./modules/appointments/routes");
const analyticsRoutes = require("./modules/analytics/routes");
const salonRoutes = require("./modules/salons/routes");
const photoRoutes = require("./modules/photos/routes");
const accountRoutes = require("./modules/account/routes");
const historyRoutes = require("./modules/history/routes");
const serviceRoutes = require("./modules/services/routes");
const notificationRoutes = require("./modules/notifications/routes");
const messageRoutes = require("./modules/messages/routes");
const reviewRoutes = require("./modules/reviews/routes");
const staffPortalRoutes = require("./modules/staffportal/routes");
const paymentRoutes = require("./modules/payments/routes");
const adminRoutes = require("./modules/admins/routes");
const bookingRoutes = require("./modules/bookings/routes");
const webhookController = require("./modules/payments/webhooks");
const shopRoutes = require("./modules/shop/routes");
const loyaltyRoutes = require("./modules/loyalty/routes");
const subscriptionRoutes = require("./modules/subscriptions/routes");
const { db, testConnection, closePool } = require("./config/database");

const app = express();
// Support single FRONTEND_URL plus optional comma-separated FRONTEND_URLS for deployments
// For production, set FRONTEND_URL or FRONTEND_URLS environment variables
// Example: FRONTEND_URL=https://main.d9mc2v9b3gxgw.amplifyapp.com
// Or for multiple origins: FRONTEND_URLS=https://origin1.com,https://origin2.com
const additionalOrigins = (process.env.FRONTEND_URLS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = [
  process.env.FRONTEND_URL,
  ...additionalOrigins,
  // Local development origins only
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3001",
  "http://192.168.1.225:3001",
  "http://localhost:3002",
  "http://127.0.0.1:3002",
  "http://localhost:3003",
  "http://127.0.0.1:3003",
  // Production origins must be set via FRONTEND_URL or FRONTEND_URLS environment variables
].filter(Boolean);

// Log allowed origins on startup
if (process.env.NODE_ENV !== "production") {
  console.log("CORS allowed origins:", allowedOrigins);
}

// Serve uploaded files statically with proper headers for Next.js Image optimization
app.use("/uploads", express.static("public/uploads", {
  setHeaders: (res, path) => {
    // Allow Next.js Image optimization to fetch images
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    // Ensure proper content type
    if (path.endsWith(".png")) {
      res.setHeader("Content-Type", "image/png");
    } else if (path.endsWith(".jpg") || path.endsWith(".jpeg")) {
      res.setHeader("Content-Type", "image/jpeg");
    } else if (path.endsWith(".gif")) {
      res.setHeader("Content-Type", "image/gif");
    } else if (path.endsWith(".webp")) {
      res.setHeader("Content-Type", "image/webp");
    }
  }
}));

// Configure helmet to not interfere with CORS
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
  })
);

// Stripe webhooks need raw body - must be BEFORE express.json()
app.use(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  webhookController.handleWebhook
);

// Subscription webhook also needs raw body
const subscriptionController = require("./modules/subscriptions/controller");
app.use(
  "/api/subscriptions/webhook",
  express.raw({ type: "application/json" }),
  subscriptionController.handleWebhook
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("CORS blocked:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use(cookieParser());

app.use("/api/salons", salonRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/staff-portal", staffPortalRoutes);
app.use("/api/users", userRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/photos", photoRoutes);
app.use("/api/account", accountRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/shop", shopRoutes);
app.use("/api/loyalty", loyaltyRoutes);
app.use("/api/subscriptions", subscriptionRoutes);

// Handle frontend calling /reviews instead of /api/reviews (missing /api prefix)
// This must be AFTER CORS middleware so CORS headers are included
const reviewController = require("./modules/reviews/controller");
app.get("/reviews/salon/:salon_id", reviewController.getSalonReviews);
app.get("/reviews/:salon_id", reviewController.getSalonReviews);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err, req, res, next) => {
  //Error handler
  console.error("Error:", err);

  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

const startServer = async () => {
  try {
    const connected = await testConnection();
    if (!connected) {
      console.error(" Database connection failed. Exiting...");
      process.exit(1);
    }

    app.listen(port, () => {
      console.log(` Server is running on port ${port}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
      
      // Start notification queue processor
      const notificationService = require("./modules/notifications/service");
      
      // Process notification queue every minute
      setInterval(async () => {
        try {
          await notificationService.processNotificationQueue();
        } catch (err) {
          console.error("Error in notification queue processor:", err);
        }
      }, 60000); // Run every 60 seconds (1 minute)
      
      console.log(" Notification queue processor started (runs every minute)");
    });
  } catch (error) {
    console.error(" Failed to start server:", error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully...");
  await closePool();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down gracefully...");
  await closePool();
  process.exit(0);
});

startServer();

module.exports = app;

const admin = require("firebase-admin");
require("dotenv").config();

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        }),
      });
      console.log("✅ Firebase Admin initialized successfully");
    } catch (error) {
      console.error("❌ Firebase Admin initialization failed:", error.message);
      console.error("Firebase authentication will not work. Check your credentials.");
    }
  } else {
    console.warn("⚠️  Firebase credentials incomplete - Firebase authentication disabled");
    console.warn("Missing:", {
      privateKey: !process.env.FIREBASE_PRIVATE_KEY,
      projectId: !process.env.FIREBASE_PROJECT_ID,
      clientEmail: !process.env.FIREBASE_CLIENT_EMAIL,
    });
  }
}

// Helper to check if Firebase is ready
const isFirebaseInitialized = () => admin.apps.length > 0;

module.exports = admin;
module.exports.isFirebaseInitialized = isFirebaseInitialized;

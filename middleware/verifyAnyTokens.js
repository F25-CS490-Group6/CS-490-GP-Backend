const jwt = require("jsonwebtoken");
const admin = require("../config/firebaseAdmin");
const { db } = require("../config/database");
require("dotenv").config();

/**
 * Middleware that validates either:
 * - A custom manual JWT (created by backend), OR
 * - A Firebase ID token.
 *
 * It automatically attaches `req.user` with:
 *   { user_id, email, role, salon_id }
 */
exports.verifyAnyToken = async (req, res, next) => {
  try {
    // Try to get token from cookie OR Authorization header
    const cookieToken = req.cookies?.token;
    const authHeader = req.headers.authorization || "";
    const headerToken = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    const token = cookieToken || headerToken;

    if (!token) {
      return res.status(401).json({ error: "Missing or invalid token format" });
    }

    // ======================================================
    // 1️⃣ TRY MANUAL JWT FIRST
    // ======================================================
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Debug: Log decoded token for staff portal
      if (decoded.scope === "staff_portal" || decoded.staff_id) {
        console.log("[verifyAnyToken] Decoded staff portal token:", {
          user_id: decoded.user_id,
          staff_id: decoded.staff_id,
          salon_id: decoded.salon_id,
          role: decoded.role,
          scope: decoded.scope,
        });
      }

      const [rows] = await db.query(
        `
        SELECT u.user_id, u.email, u.user_role, u.salon_id, st.staff_id, st.salon_id as staff_salon_id
        FROM users u
        LEFT JOIN staff st ON st.user_id = u.user_id AND st.is_active = 1
        WHERE u.user_id = ?
        LIMIT 1
        `,
        [decoded.user_id]
      );

      const userRecord = rows[0] || {};
      
      // For staff portal tokens, staff_id MUST come from the token (it's set during login)
      // Don't fall back to database lookup for staff_id when it's a staff portal token
      let staffId = null;
      if (decoded.scope === "staff_portal" || decoded.staff_id) {
        staffId = decoded.staff_id; // Always use token's staff_id for staff portal
        if (!staffId) {
          console.error("[verifyAnyToken] Staff portal token missing staff_id:", decoded);
        }
      } else {
        // For regular tokens, try token first, then database
        staffId = decoded.staff_id || userRecord.staff_id || null;
      }
      
      // For owners: use u.salon_id, for staff: use staff_salon_id, fallback to u.salon_id
      const salonId = userRecord.staff_salon_id || userRecord.salon_id || decoded.salon_id || null;
      
      // For staff portal tokens, prioritize the role from the token (which should be "staff")
      // This ensures staff portal tokens work even if user_role in DB is different
      let finalRole = decoded.role || userRecord.user_role;
      if (decoded.scope === "staff_portal" || decoded.staff_id) {
        finalRole = "staff";
      }
      
      req.user = {
        user_id: decoded.user_id,
        email: decoded.email || userRecord.email,
        role: finalRole,
        salon_id: salonId,
        staff_id: staffId,
      };
      
      // Debug logging for staff portal
      if (decoded.scope === "staff_portal" || decoded.staff_id) {
        console.log("[verifyAnyToken] Staff portal token processed:", {
          req_user: req.user,
        });
      }

      return next();
    } catch (jwtErr) {
      // continue to Firebase if JWT fails
    }

    // ======================================================
    // 2️⃣ TRY FIREBASE TOKEN NEXT
    // ======================================================
    try {
      const decodedFirebase = await admin.auth().verifyIdToken(token);

      const [rows] = await db.query(
        `
        SELECT u.user_id, u.email, u.user_role, u.salon_id, st.staff_id, st.salon_id as staff_salon_id
        FROM users u
        LEFT JOIN staff st ON st.user_id = u.user_id AND st.is_active = 1
        WHERE u.firebase_uid = ? OR LOWER(u.email) = LOWER(?)
        LIMIT 1
        `,
        [decodedFirebase.uid, decodedFirebase.email]
      );

      if (!rows.length) {
        return res
          .status(404)
          .json({ error: "User not found for Firebase ID" });
      }

      const user = rows[0];
      // For owners: use u.salon_id, for staff: use staff_salon_id, fallback to u.salon_id
      const salonId = user.staff_salon_id || user.salon_id || null;
      
      req.user = {
        user_id: user.user_id,
        email: user.email,
        role: user.user_role,
        salon_id: salonId,
        staff_id: user.staff_id || null,
      };

      return next();
    } catch (firebaseError) {
      console.error(
        "Firebase token verification failed:",
        firebaseError.message
      );
      return res.status(401).json({
        error: "Invalid or expired token",
      });
    }
  } catch (error) {
    console.error("verifyAnyToken error:", error);
    res.status(500).json({ error: "Token verification error" });
  }
};

const jwt = require("jsonwebtoken");
const { db } = require("../config/database");

exports.verifyCustomJwt = async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) return res.status(401).json({ error: "Missing token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch current user role from database to ensure it's up-to-date
    const [rows] = await db.query(
      `
      SELECT u.user_id, u.email, u.user_role, u.salon_id, st.salon_id as staff_salon_id
      FROM users u
      LEFT JOIN staff st ON st.user_id = u.user_id AND st.is_active = 1
      WHERE u.user_id = ?
      LIMIT 1
      `,
      [decoded.user_id]
    );

    if (!rows || rows.length === 0) {
      return res.status(401).json({ error: "User not found" });
    }

    const userRecord = rows[0];
    
    // Check if user owns a salon - if so, they should be treated as "owner" regardless of user_role
    const [salonRows] = await db.query(
      "SELECT salon_id FROM salons WHERE owner_id = ? LIMIT 1",
      [decoded.user_id || userRecord.user_id]
    );
    
    const isSalonOwner = salonRows && salonRows.length > 0;
    
    // For owners: use u.salon_id, for staff: use staff_salon_id, fallback to decoded.salon_id
    const salonId = userRecord.staff_salon_id || userRecord.salon_id || decoded.salon_id || null;
    
    // Determine role: if user owns a salon, they're an owner; otherwise use token role or DB role
    let finalRole = decoded.role || userRecord.user_role;
    if (isSalonOwner && finalRole !== 'admin') {
      finalRole = 'owner';
    }
    
    req.user = {
      user_id: decoded.user_id || userRecord.user_id,
      email: decoded.email || userRecord.email,
      role: finalRole,
      user_role: userRecord.user_role, // Keep original user_role for reference
      salon_id: salonId || (isSalonOwner ? salonRows[0].salon_id : null),
    };
    
    next();
  } catch (err) {
    console.error("JWT verify error:", err);
    res.status(403).json({ error: "Invalid or expired token" });
  }
};

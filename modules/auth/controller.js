const authService = require("./service");
const userService = require("../users/service");
const { db } = require("../../config/database");
const jwt = require("jsonwebtoken");

const salonColumnCache = {};

const buildAuthCookieOptions = (maxAgeMs) => {
  const isProduction = process.env.NODE_ENV === "production";
  const options = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  };

  if (typeof maxAgeMs === "number") {
    options.maxAge = maxAgeMs;
  }

  if (isProduction) {
    options.domain =
      process.env.AUTH_COOKIE_DOMAIN ||
      process.env.COOKIE_DOMAIN ||
      ".webershub.com";
  }

  return options;
};

const slugify = (input = "", suffix = "") => {
  const base = input
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  const normalizedSuffix = suffix ? `-${suffix}` : "";
  return (base || "salon")
    .concat(normalizedSuffix)
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
};

const hasSalonColumn = async (columnName) => {
  if (salonColumnCache[columnName] !== undefined) {
    return salonColumnCache[columnName];
  }
  try {
    const [columns] = await db.query("SHOW COLUMNS FROM salons LIKE ?", [
      columnName,
    ]);
    salonColumnCache[columnName] = Array.isArray(columns) && columns.length > 0;
  } catch (err) {
    console.warn(`Unable to inspect salons.${columnName}:`, err.message);
    salonColumnCache[columnName] = false;
  }
  return salonColumnCache[columnName];
};

const createOwnerSalon = async (ownerId, payload = {}) => {
  const safeName =
    (payload.name && payload.name.trim()) ||
    (payload.salon_name && payload.salon_name.trim()) ||
    "New Salon";
  const slug = slugify(safeName, ownerId);

  const columns = ["owner_id"];
  const placeholders = ["?"];
  const values = [ownerId];

  const addColumnIfSupported = async (column, value) => {
    if (await hasSalonColumn(column)) {
      columns.push(column);
      placeholders.push("?");
      values.push(value);
    }
  };

  await addColumnIfSupported("name", safeName);
  await addColumnIfSupported("salon_name", safeName);
  await addColumnIfSupported("slug", slug);
  await addColumnIfSupported("address", payload.address || null);
  await addColumnIfSupported("city", payload.city || null);
  await addColumnIfSupported("state", payload.state || payload.region || null);
  await addColumnIfSupported("zip", payload.zip || payload.postal_code || null);
  await addColumnIfSupported(
    "postal_code",
    payload.postal_code || payload.zip || null
  );
  await addColumnIfSupported("country", payload.country || null);
  await addColumnIfSupported("phone", payload.phone || null);
  await addColumnIfSupported("email", payload.email || null);
  await addColumnIfSupported("website", payload.website || null);
  await addColumnIfSupported("description", payload.description || null);
  await addColumnIfSupported("profile_picture", payload.profile_picture || null);
  await addColumnIfSupported("status", payload.status || "pending");

  if (columns.length === 1) {
    throw new Error("Unable to create salon record: no writable columns found");
  }

  const [result] = await db.query(
    `INSERT INTO salons (${columns.join(", ")}) VALUES (${placeholders.join(
      ", "
    )})`,
    values
  );
  
  const salonId = result.insertId;
  
  // Update users table to set salon_id for the owner
  await db.query(
    "UPDATE users SET salon_id = ? WHERE user_id = ?",
    [salonId, ownerId]
  );
  
  return { salonId, slug };
};

const cleanupUserRecords = async (userId) => {
  if (!userId) return;
  try {
    await db.query("DELETE FROM auth WHERE user_id = ?", [userId]);
    await db.query("DELETE FROM users WHERE user_id = ?", [userId]);
  } catch (err) {
    console.error(
      "Failed to clean up user after signup error:",
      err.message || err
    );
  }
};

let computedSalonNameExpr = null;
const getSalonNameExpression = async () => {
  if (computedSalonNameExpr) return computedSalonNameExpr;

  const hasNameColumn = await hasSalonColumn("name");
  const hasLegacyColumn = await hasSalonColumn("salon_name");

  if (hasNameColumn && hasLegacyColumn) {
    computedSalonNameExpr = "COALESCE(s.name, s.salon_name)";
  } else if (hasNameColumn) {
    computedSalonNameExpr = "s.name";
  } else if (hasLegacyColumn) {
    computedSalonNameExpr = "s.salon_name";
  } else {
    computedSalonNameExpr = "'Salon'";
  }

  return computedSalonNameExpr;
};

// ==========================
// MANUAL SIGNUP
// ==========================
exports.signupManual = async (req, res) => {
  const {
    full_name,
    phone,
    email,
    password,
    role,
    gender,
    birth_year,
    businessName,
    businessAddress,
    businessCity,
    businessState,
    businessZip,
    businessCountry,
    businessWebsite,
  } = req.body;

  if (!full_name || !phone || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }
  try {
    const existingUser = await authService.findUserByEmail(email);
    if (existingUser)
      return res.status(409).json({ error: "Email already registered" });

    const userRole = role || "customer";
    const normalizedGender = gender || null;
    const birthYearVal = birth_year || null;
    const ownerBusinessName =
      req.body.business_name ||
      businessName ||
      req.body.salon_name ||
      req.body.name ||
      null;
    const fallbackSalonName =
      (ownerBusinessName && ownerBusinessName.trim()) ||
      `${full_name.split(" ")[0] || "New"}'s Salon`;

    const userId = await userService.createUser(
      full_name,
      phone,
      email,
      userRole,
      { gender: normalizedGender, birth_year: birthYearVal }
    );

    try {
      await authService.createAuthRecord(userId, email, password);
    } catch (err) {
      await cleanupUserRecords(userId);
      throw err;
    }

    let salonId = null;
    if (userRole === "owner") {
      try {
        const { salonId: insertedSalonId } = await createOwnerSalon(userId, {
          name: fallbackSalonName,
          address: businessAddress || null,
          city: businessCity || req.body.city || null,
          state: businessState || req.body.state || null,
          zip: businessZip || req.body.zip || null,
          country: businessCountry || req.body.country || null,
          phone,
          email,
          website: businessWebsite || req.body.website || null,
          description:
            req.body.businessDescription || req.body.description || null,
        });
        salonId = insertedSalonId;
      } catch (err) {
        await cleanupUserRecords(userId);
        throw err;
      }
    }

    res.status(201).json({
      message: "User registered successfully",
      user_id: userId,
      role: userRole,
      salon_id: salonId,
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Server error during signup" });
  }
};

// ==========================
// MANUAL LOGIN
// ==========================
exports.loginManual = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password required" });

  try {
    const user = await authService.findUserByEmail(email);
    if (!user) return res.status(404).json({ error: "User not found" });

    const valid = await authService.verifyPassword(
      password,
      user.password_hash
    );
    if (!valid) return res.status(401).json({ error: "Invalid password" });

    // Check if 2FA is enabled
    const twoFactorStatus = await authService.get2FAStatus(user.user_id);
    if (twoFactorStatus && twoFactorStatus.length > 0) {
      const tempToken = authService.generateJwtToken(
        {
          user_id: user.user_id,
          email: user.email,
          role: user.user_role,
          salon_id: user.salon_id || null,
          temp2FA: true,
        },
        "15m"
      );

      const method = twoFactorStatus[0].method;
      let sendResult;

      if (method === "sms") {
        sendResult = await authService.sendSMSCode(
          user.user_id,
          twoFactorStatus[0].phone_number || user.phone,
          user.full_name
        );
      } else if (method === "email") {
        sendResult = await authService.sendEmailCode(
          user.user_id,
          user.email,
          user.full_name
        );
      } else {
        return res.status(400).json({
          error: `2FA method '${method}' is not supported yet`,
        });
      }

      if (!sendResult?.success) {
        return res.status(500).json({
          error: "Failed to send verification code",
          details: sendResult?.error,
        });
      }

      return res.status(200).json({
        message: "2FA verification required",
        requires2FA: true,
        tempToken,
        method,
      });
    }

    // Regular login (no 2FA)
    await authService.updateLoginStats(user.user_id);
    const token = authService.generateJwtToken({
      user_id: user.user_id,
      email: user.email,
      role: user.user_role,
      salon_id: user.salon_id || null,
    });

    // Set secure HTTP-only cookie for middleware + persistence
    res.cookie("token", token, buildAuthCookieOptions(60 * 60 * 1000));

    // ✅ Also return JSON body (frontend may still use token locally)
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.user_id,
        email: user.email,
        role: user.user_role,
        full_name: user.full_name,
        phone: user.phone,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
};

// ==========================
// FORGOT PASSWORD
// ==========================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Find user by email
    const user = await authService.findUserByEmail(email);
    
    // For security, don't reveal if user exists or not
    // Always return success message
    if (!user) {
      // Still return success to prevent email enumeration
      return res.json({
        message: "If an account with that email exists, a password reset link has been sent.",
      });
    }

    // Check if user has a password set (has auth record with password_hash)
    if (!user.password_hash) {
      // User exists but no password set - still return success
      return res.json({
        message: "If an account with that email exists, a password reset link has been sent.",
      });
    }

    // Send password reset email
    const result = await authService.sendPasswordResetEmail(
      user.user_id,
      user.email,
      user.full_name
    );

    if (!result.success) {
      console.error("Failed to send password reset email:", result.error);
      // Still return success to prevent information leakage
      return res.json({
        message: "If an account with that email exists, a password reset link has been sent.",
      });
    }

    res.json({
      message: "If an account with that email exists, a password reset link has been sent.",
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    // Return generic success message even on error
    res.json({
      message: "If an account with that email exists, a password reset link has been sent.",
    });
  }
};

// ==========================
// RESET PASSWORD (reuses setCustomerPasswordFromToken pattern)
// ==========================
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res
        .status(400)
        .json({ error: "Token and new password are required" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters long" });
    }

    // Reuse same JWT verification pattern as setCustomerPasswordFromToken
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      const message =
        err.name === "TokenExpiredError"
          ? "Password reset link has expired. Please request a new one."
          : "Invalid password reset link";
      return res.status(401).json({ error: message });
    }

    if (decoded.purpose !== "password_reset") {
      return res.status(400).json({ error: "Invalid password reset token" });
    }

    const { user_id: userId, email } = decoded;
    
    // Reuse same user lookup pattern
    const [users] = await db.query(
      "SELECT user_id, email, user_role, full_name FROM users WHERE user_id = ? OR email = ? LIMIT 1",
      [userId, email]
    );

    if (!users.length) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = users[0];

    // For reset, require password to exist (opposite of setCustomerPasswordFromToken)
    const [authRows] = await db.query(
      "SELECT password_hash FROM auth WHERE user_id = ? OR email = ? LIMIT 1",
      [user.user_id, user.email]
    );

    if (!authRows.length || !authRows[0].password_hash) {
      return res.status(400).json({
        error: "Password reset is not available for this account. Please contact support.",
      });
    }

    // Reuse existing upsertPassword function
    await authService.upsertPassword(user.user_id, user.email, password);

    res.json({
      message: "Password reset successfully. You can now sign in with your new password.",
    });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: "Failed to reset password" });
  }
};

// ==========================
// CUSTOMER PASSWORD SETUP (TOKEN-BASED)
// ==========================
exports.setCustomerPasswordFromToken = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res
        .status(400)
        .json({ error: "Token and new password are required" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters long" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      const message =
        err.name === "TokenExpiredError"
          ? "Password setup link has expired"
          : "Invalid password setup link";
      return res.status(401).json({ error: message });
    }

    if (decoded.purpose !== "customer_portal_setup") {
      return res.status(400).json({ error: "Invalid password setup token" });
    }

    const { user_id: userId, email } = decoded;
    const [users] = await db.query(
      "SELECT user_id, email, user_role, full_name FROM users WHERE user_id = ? OR email = ? LIMIT 1",
      [userId, email]
    );

    if (!users.length) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = users[0];

    const [authRows] = await db.query(
      "SELECT password_hash FROM auth WHERE user_id = ? OR email = ? LIMIT 1",
      [user.user_id, user.email]
    );

    if (authRows.length && authRows[0].password_hash) {
      return res
        .status(409)
        .json({ error: "Password already set. Please sign in instead." });
    }

    await authService.upsertPassword(user.user_id, user.email, password);

    const loginToken = authService.generateJwtToken({
      user_id: user.user_id,
      email: user.email,
      role: user.user_role,
    });

    res.cookie("token", loginToken, buildAuthCookieOptions(60 * 60 * 1000));

    return res.json({
      message: "Password set successfully",
      token: loginToken,
      user: {
        id: user.user_id,
        email: user.email,
        role: user.user_role,
        full_name: user.full_name,
      },
    });
  } catch (err) {
    console.error("Customer password setup error:", err);
    res.status(500).json({ error: "Failed to set password" });
  }
};

// ==========================
// FIREBASE VERIFY
// ==========================
exports.verifyFirebase = async (req, res) => {
  try {
    const authHeader = req.headers.authorization || "";
    const idToken = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!idToken)
      return res.status(401).json({ error: "Missing Firebase token" });

    const decoded = await authService.verifyFirebaseToken(idToken);
    const { uid, email } = decoded;

    // check if already exists
    const existingUser = await authService.findFirebaseUser(uid, email);
    if (existingUser) {
      const token = authService.generateAppJwt({
        user_id: existingUser.user_id,
        email,
        role: existingUser.user_role,
        salon_id: existingUser.salon_id,
      });
      return res.json({
        existingUser: true,
        token,
        role: existingUser.user_role,
      });
    }

    // new user
    return res.json({ newUser: true, firebaseUid: uid, email });
  } catch (err) {
    console.error("Firebase verification failed:", err);
    res.status(401).json({ error: "Invalid Firebase token" });
  }
};

// ==========================
// SET ROLE
// ==========================
exports.setRole = async (req, res) => {
  try {
    const { firebaseUid, email, role } = req.body;
    if (!firebaseUid || !email || !role)
      return res.status(400).json({ error: "Missing fields" });

    const userId = await authService.createFirebaseUser(
      firebaseUid,
      email,
      role
    );
    // Get salon_id if user already has one (for existing users)
    const [userRows] = await db.query(
      "SELECT salon_id FROM users WHERE user_id = ?",
      [userId]
    );
    const salonId = userRows[0]?.salon_id || null;
    
    const token = authService.generateAppJwt({ 
      user_id: userId, 
      email, 
      role,
      salon_id: salonId 
    });
    res.status(201).json({ token, role });
  } catch (err) {
    console.error("Error setting role:", err);
    res.status(500).json({ error: "Server error while setting role" });
  }
};

// ==========================
// CURRENT USER + LOGOUT
// ==========================
exports.getCurrentUser = async (req, res) => {
  try {
    const salonNameExpr = await getSalonNameExpression();
    const baseSelect = `
        SELECT 
           u.*, 
           s.salon_id, 
           s.slug AS salon_slug, 
           ${salonNameExpr} AS salon_name
         FROM users u
         LEFT JOIN salons s ON s.owner_id = u.user_id
    `;

    if (req.firebaseUser) {
      const email = req.firebaseUser.email;
      const [rows] = await db.query(`${baseSelect} WHERE u.email = ?`, [email]);

      if (!rows.length)
        return res.status(404).json({ error: "User not found" });

      return res.json({
        firebaseUser: req.firebaseUser,
        customJWT: req.customJwt,
        user: rows[0],
      });
    } else if (req.user) {
      const [rows] = await db.query(
        `${baseSelect} WHERE u.user_id = ? OR u.email = ?`,
        [req.user?.user_id || req.user?.id, req.user?.email]
      );

      if (!rows.length)
        return res.status(404).json({ error: "User not found" });

      return res.json({ user: rows[0] });
    } else {
      return res.status(401).json({ error: "Not authenticated" });
    }
  } catch (error) {
    console.error("Error getting user:", error);
    res.status(500).json({ error: "Database error" });
  }
};

exports.logout = async (req, res) => {
  res.json({ message: "Logged out successfully" });
};

// ==========================
// 2FA CONTROLLERS
// ==========================

exports.enable2FA = async (req, res) => {
  try {
    const userId = req.user?.user_id || req.user?.id;
    const { method, phoneNumber: providedPhoneNumber } = req.body;

    if (!method || !["sms", "email"].includes(method)) {
      return res.status(400).json({ error: "Invalid 2FA method" });
    }

    const [userRows] = await db.query(
      "SELECT phone, email FROM users WHERE user_id = ?",
      [userId]
    );
    if (!userRows || userRows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = userRows[0];
    let phoneNumber = providedPhoneNumber || user.phone;

    if (providedPhoneNumber && providedPhoneNumber !== user.phone) {
      await db.query("UPDATE users SET phone = ? WHERE user_id = ?", [
        providedPhoneNumber,
        userId,
      ]);
      phoneNumber = providedPhoneNumber;
    }

    phoneNumber = method === "sms" ? phoneNumber : null;

    const [existing] = await db.query(
      "SELECT * FROM user_2fa_settings WHERE user_id = ? AND is_enabled = true",
      [userId]
    );

    if (existing && existing.length > 0) {
      return res.status(400).json({ error: "2FA is already enabled" });
    }

    await db.query(
      "INSERT INTO user_2fa_settings (user_id, method, is_enabled, phone_number) VALUES (?, ?, ?, ?)",
      [userId, method, true, phoneNumber]
    );

    res.status(200).json({ message: "2FA enabled successfully" });
  } catch (error) {
    console.error("Enable 2FA error:", error);
    return res.status(500).json({ error: error.message });
  }
};

exports.disable2FA = async (req, res) => {
  try {
    const userId = req.user?.user_id || req.user?.id;

    await db.query(
      "UPDATE user_2fa_settings SET is_enabled = false WHERE user_id = ?",
      [userId]
    );

    res.status(200).json({ message: "2FA disabled successfully" });
  } catch (error) {
    console.error("Disable 2FA error:", error);
    return res.status(500).json({ error: error.message });
  }
};

exports.get2FAStatusController = async (req, res) => {
  try {
    const userId = req.user?.user_id || req.user?.id;
    const status = await authService.get2FAStatus(userId);

    res
      .status(200)
      .json({ twoFactorEnabled: status && status.length > 0, methods: status });
  } catch (error) {
    console.error("Get 2FA status error:", error);
    return res.status(500).json({ error: error.message });
  }
};

exports.verify2FA = async (req, res) => {
  try {
    const { code, tempToken } = req.body;

    if (!code || !tempToken) {
      return res
        .status(400)
        .json({ error: "Code and temporary token are required" });
    }

    // Verify the temporary token
    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    } catch (err) {
      return res
        .status(401)
        .json({ error: "Invalid or expired temporary token" });
    }

    if (!decoded.temp2FA) {
      return res
        .status(400)
        .json({ error: "Invalid token for 2FA verification" });
    }

    const userId = decoded.user_id;

    // Verify the 2FA code
    const isValid = await authService.verify2FACode(userId, code);

    if (!isValid) {
      return res.status(401).json({ error: "Invalid verification code" });
    }

    // Generate final token
    await authService.updateLoginStats(userId);
    
    // Get user details including salon_id
    const [rows] = await db.query(
      "SELECT user_id, email, user_role, full_name, salon_id FROM users WHERE user_id = ?",
      [userId]
    );
    
    const user = rows[0];
    const finalToken = authService.generateJwtToken({
      user_id: userId,
      email: decoded.email,
      role: decoded.role,
      salon_id: user?.salon_id || null,
    });

    res.cookie("token", finalToken, buildAuthCookieOptions(60 * 60 * 1000));

    res.status(200).json({
      message: "2FA verification successful",
      token: finalToken,
      user: rows[0],
    });
  } catch (error) {
    console.error("Verify 2FA error:", error);
    return res.status(500).json({ error: error.message });
  }
};

exports.refreshToken = async (req, res) => {
  const cookieToken = req.cookies?.token;
  const authHeader = req.headers.authorization || "";
  const headerToken = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  const oldToken = cookieToken || headerToken;
  if (!oldToken) return res.status(401).json({ error: "Missing token" });

  try {
    const decoded = jwt.verify(oldToken, process.env.JWT_SECRET, {
      ignoreExpiration: true,
    });
    
    // Get current user's salon_id from database
    const [userRows] = await db.query(
      "SELECT salon_id FROM users WHERE user_id = ?",
      [decoded.user_id]
    );
    
    const salonId = userRows[0]?.salon_id || decoded.salon_id || null;
    
    const newToken = jwt.sign(
      {
        user_id: decoded.user_id,
        email: decoded.email,
        role: decoded.role,
        salon_id: salonId,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", newToken, buildAuthCookieOptions(3600 * 1000));

    return res.json({ message: "Token refreshed", token: newToken });
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

// Delete Account
exports.deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.user?.user_id;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }

    // Get user's email to verify password
    const [users] = await db.query(
      "SELECT u.email FROM users u WHERE u.user_id = ?",
      [userId]
    );

    if (!users || users.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userEmail = users[0].email;

    // Verify password
    const [authRecords] = await db.query(
      "SELECT password_hash FROM auth WHERE email = ?",
      [userEmail]
    );

    if (authRecords && authRecords.length > 0) {
      const isValid = await authService.verifyPassword(
        password,
        authRecords[0].password_hash
      );

      if (!isValid) {
        return res.status(401).json({ error: "Invalid password" });
      }
    }

    // Delete user (cascade will handle related records)
    try {
      const affected = await userService.deleteUser(userId);

      if (affected === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ message: "Account deleted successfully" });
    } catch (deleteError) {
      console.error("Error deleting user:", deleteError);
      // Return specific error message if available
      if (deleteError.message) {
        return res.status(400).json({ 
          error: deleteError.message || "Failed to delete account" 
        });
      }
      throw deleteError; // Re-throw to be caught by outer catch
    }
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({ 
      error: error.message || "Failed to delete account",
      details: process.env.NODE_ENV === "development" ? error.stack : undefined
    });
  }
};

/**
 * SETUP ADMIN (First-time admin creation)
 * POST /api/auth/setup-admin
 * Allows creating the first admin user or upgrading existing user to admin
 * Optional: Requires ADMIN_SETUP_TOKEN in env for security
 */
exports.setupAdmin = async (req, res) => {
  try {
    const { email, password, full_name, phone, setup_token } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({ 
        error: "Email, password, and full name are required" 
      });
    }

    // Check if setup token is required and valid (if ADMIN_SETUP_TOKEN is set in env)
    if (process.env.ADMIN_SETUP_TOKEN) {
      if (!setup_token || setup_token !== process.env.ADMIN_SETUP_TOKEN) {
        return res.status(403).json({ 
          error: "Invalid setup token. Admin setup requires a valid token." 
        });
      }
    }

    // Check if any admin already exists
    const [existingAdmins] = await db.query(
      "SELECT user_id FROM users WHERE user_role = 'admin' LIMIT 1"
    );

    // If ADMIN_SETUP_TOKEN is not set, only allow setup if no admins exist
    if (!process.env.ADMIN_SETUP_TOKEN && existingAdmins.length > 0) {
      return res.status(403).json({ 
        error: "Admin already exists. Please use the admin login or contact support." 
      });
    }

    // Check if user with this email already exists
    const [existingUser] = await db.query(
      "SELECT user_id, user_role, full_name FROM users WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      // If user exists and is not admin, update to admin
      if (existingUser[0].user_role !== 'admin') {
        await db.query(
          "UPDATE users SET user_role = 'admin' WHERE user_id = ?",
          [existingUser[0].user_id]
        );
        
        // Update password if provided
        if (password) {
          await authService.upsertPassword(existingUser[0].user_id, email, password);
        }

        const token = authService.generateAppJwt({
          user_id: existingUser[0].user_id,
          email,
          role: 'admin'
        });

        return res.status(200).json({
          message: "User upgraded to admin successfully",
          token,
          user: {
            user_id: existingUser[0].user_id,
            email,
            full_name: existingUser[0].full_name || full_name,
            role: 'admin'
          }
        });
      } else {
        return res.status(400).json({ 
          error: "User with this email is already an admin" 
        });
      }
    }

    // Create new admin user
    const phoneToSave = phone || "0000000000";
    const userId = await authService.createUser(full_name, phoneToSave, email, 'admin');
    
    // Set password
    await authService.upsertPassword(userId, email, password);

    const token = authService.generateAppJwt({
      user_id: userId,
      email,
      role: 'admin'
    });

    res.status(201).json({
      message: "Admin account created successfully",
      token,
      user: {
        user_id: userId,
        email,
        full_name,
        role: 'admin'
      }
    });
  } catch (err) {
    console.error("Error setting up admin:", err);
    
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: "Email already exists" });
    }
    
    res.status(500).json({ 
      error: "Server error while setting up admin",
      message: err.message 
    });
  }
};

// Update user profile (demographics, contact info)
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user?.user_id || req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { full_name, phone, email, gender, date_of_birth } = req.body;

    // Build update query dynamically based on provided fields
    const updates = [];
    const values = [];

    if (full_name) {
      updates.push("full_name = ?");
      values.push(full_name);
    }
    if (phone !== undefined) {
      updates.push("phone = ?");
      values.push(phone);
    }
    if (email) {
      updates.push("email = ?");
      values.push(email);
    }
    if (gender !== undefined) {
      updates.push("gender = ?");
      values.push(gender || null);
    }
    if (date_of_birth !== undefined) {
      updates.push("date_of_birth = ?");
      values.push(date_of_birth || null);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    values.push(userId);

    const { db } = require("../../config/database");
    await db.query(
      `UPDATE users SET ${updates.join(", ")} WHERE user_id = ?`,
      values
    );

    // Fetch updated user data
    const [userRows] = await db.query(
      "SELECT user_id, full_name, email, phone, gender, date_of_birth, user_role FROM users WHERE user_id = ?",
      [userId]
    );

    res.json({
      message: "Profile updated successfully",
      user: userRows[0] || null,
    });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

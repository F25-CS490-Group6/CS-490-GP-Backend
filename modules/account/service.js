const { db } = require("../../config/database");
const bcrypt = require("bcrypt");
const userService = require("../users/service");

/**
 * Validate phone number format
 * Accepts various formats: +1234567890, (123) 456-7890, 123-456-7890, etc.
 */
function validatePhone(phone) {
  if (!phone) return true; // Phone is optional

  // Remove common formatting characters
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');

  // Check if it's a valid international format (E.164)
  // Should be 10-15 digits, optionally starting with +
  const phoneRegex = /^\+?[1-9]\d{9,14}$/;

  return phoneRegex.test(cleaned);
}

/**
 * Get account settings for a user
 */
async function getAccountSettings(userId) {
  const [rows] = await db.query(
    `SELECT 
      user_id,
      full_name,
      email,
      phone,
      profile_pic,
      subscription_plan,
      created_at,
      updated_at
    FROM users
    WHERE user_id = ?`,
    [userId]
  );

  if (!rows || rows.length === 0) {
    return null;
  }

  const user = rows[0];
  return {
    user_id: user.user_id,
    full_name: user.full_name,
    email: user.email,
    phone: user.phone,
    profile_pic: user.profile_pic,
    subscription_plan: user.subscription_plan || 'free',
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}

/**
 * Update account profile (name, email, phone, profile_pic)
 */
async function updateAccountProfile(userId, updates) {
  const allowedFields = ["full_name", "email", "phone", "profile_pic"];
  const fields = [];
  const values = [];

  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key) && value !== undefined) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }

  if (fields.length === 0) {
    return { updated: false, message: "No valid fields to update" };
  }

  // Check if email is being changed and if it's already taken
  if (updates.email) {
    const [existing] = await db.query(
      "SELECT user_id FROM users WHERE email = ? AND user_id != ?",
      [updates.email, userId]
    );
    if (existing.length > 0) {
      throw new Error("Email already in use");
    }
  }

  // Validate phone number format if being updated
  if (updates.phone && !validatePhone(updates.phone)) {
    throw new Error("Invalid phone number format. Please use a valid format (e.g., +1234567890 or (123) 456-7890)");
  }

  fields.push("updated_at = CURRENT_TIMESTAMP");
  values.push(userId);

  const [result] = await db.query(
    `UPDATE users SET ${fields.join(", ")} WHERE user_id = ?`,
    values
  );

  return {
    updated: result.affectedRows > 0,
    affectedRows: result.affectedRows,
  };
}

/**
 * Change user password
 */
async function changePassword(userId, currentPassword, newPassword) {
  // Get current password hash
  const [authRows] = await db.query(
    "SELECT password_hash FROM auth WHERE user_id = ?",
    [userId]
  );

  if (!authRows || authRows.length === 0) {
    throw new Error("Password authentication not set up for this account");
  }

  // Verify current password
  const isValid = await bcrypt.compare(
    currentPassword,
    authRows[0].password_hash
  );

  if (!isValid) {
    throw new Error("Current password is incorrect");
  }

  // Hash new password
  const newHash = await bcrypt.hash(newPassword, 10);

  // Update password
  const [result] = await db.query(
    "UPDATE auth SET password_hash = ? WHERE user_id = ?",
    [newHash, userId]
  );

  return {
    updated: result.affectedRows > 0,
  };
}

/**
 * Get available subscription plans
 */
function getAvailablePlans() {
  return [
    {
      plan_id: "free",
      plan_name: "Free",
      price: 0,
      features: [
        "Basic appointment management",
        "Up to 2 staff members",
        "Up to 50 appointments/month",
        "Basic analytics",
        "Email support",
      ],
    },
    {
      plan_id: "premium",
      plan_name: "Premium",
      price: 29.99,
      features: [
        "Unlimited appointments",
        "Up to 10 staff members",
        "Advanced analytics & reports",
        "Customer loyalty program",
        "SMS notifications",
        "Priority email support",
        "Custom branding",
      ],
    },
    {
      plan_id: "enterprise",
      plan_name: "Enterprise",
      price: 79.99,
      features: [
        "Unlimited everything",
        "Unlimited staff members",
        "Advanced analytics & custom reports",
        "Full loyalty program features",
        "SMS & Email notifications",
        "24/7 priority support",
        "Custom branding & white-label",
        "API access",
        "Dedicated account manager",
      ],
    },
  ];
}

/**
 * Get current subscription for user
 */
async function getCurrentSubscription(userId) {
  const [rows] = await db.query(
    `SELECT subscription_plan FROM users WHERE user_id = ?`,
    [userId]
  );

  if (!rows || rows.length === 0) {
    return { plan: "free" };
  }

  return {
    plan: rows[0].subscription_plan || "free",
  };
}

/**
 * Update subscription plan
 */
async function updateSubscription(userId, planName) {
  const availablePlans = getAvailablePlans();
  const plan = availablePlans.find((p) => p.plan_id === planName);

  if (!plan) {
    throw new Error(`Invalid plan: ${planName}`);
  }

  await db.query(
    "UPDATE users SET subscription_plan = ? WHERE user_id = ?",
    [planName, userId]
  );

  return {
    plan: planName,
    message: `Switched to ${plan.plan_name} plan`,
  };
}

/**
 * Delete account
 * Actually deletes the user from the database (not just deactivate)
 */
async function deleteAccount(userId) {
  try {
    // Use the userService.deleteUser which handles all related records
    const affected = await userService.deleteUser(userId);
    
    return {
      deleted: affected > 0,
    };
  } catch (error) {
    console.error("Error in deleteAccount service:", error);
    throw error;
  }
}

module.exports = {
  getAccountSettings,
  updateAccountProfile,
  changePassword,
  getAvailablePlans,
  getCurrentSubscription,
  updateSubscription,
  deleteAccount,
};


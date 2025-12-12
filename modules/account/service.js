const { db } = require("../../config/database");
const bcrypt = require("bcrypt");
const userService = require("../users/service");

/**
 * Get account settings for a user
 */
async function getAccountSettings(userId) {
  // Some deployments may not have optional columns; build a safe select list
  const [columns] = await db.query("SHOW COLUMNS FROM users");
  const columnNames = new Set(columns.map((c) => c.Field));

  const baseFields = ["user_id", "full_name", "email", "phone"];
  const optionalFields = [
    "gender",
    "birth_year",
    "profile_pic",
    "subscription_plan",
    "created_at",
    "updated_at",
  ];

  const selectFields = [
    ...baseFields,
    ...optionalFields.filter((f) => columnNames.has(f)),
  ].join(", ");

  const [rows] = await db.query(
    `SELECT ${selectFields} FROM users WHERE user_id = ?`,
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
    gender: "gender" in user ? user.gender || null : null,
    birth_year: "birth_year" in user ? user.birth_year || null : null,
    profile_pic: "profile_pic" in user ? user.profile_pic : null,
    subscription_plan:
      "subscription_plan" in user ? user.subscription_plan || "free" : "free",
    created_at: "created_at" in user ? user.created_at : null,
    updated_at: "updated_at" in user ? user.updated_at : null,
  };
}

/**
 * Update account profile (name, email, phone, profile_pic)
 */
async function updateAccountProfile(userId, updates) {
  const [columns] = await db.query("SHOW COLUMNS FROM users");
  const columnNames = new Set(columns.map((c) => c.Field));
  const allowedFields = [
    "full_name",
    "email",
    "phone",
    "profile_pic",
    "gender",
    "birth_year",
  ].filter((field) => columnNames.has(field));
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

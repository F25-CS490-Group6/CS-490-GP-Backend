const accountService = require("./service");

/**
 * GET /api/account/settings
 * Get current account settings
 */
const getAccountSettings = async (req, res) => {
  try {
    const userId = req.user?.user_id;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const settings = await accountService.getAccountSettings(userId);

    if (!settings) {
      return res.status(404).json({ error: "Account not found" });
    }

    // Return the account settings (data from signup stored in users table)
    res.json(settings);
  } catch (error) {
    console.error("Error fetching account settings:", error);
    res.status(500).json({ error: "Failed to fetch account settings" });
  }
};

/**
 * PUT /api/account/settings
 * Update account profile (name, email, phone)
 */
const updateAccountSettings = async (req, res) => {
  try {
    const userId = req.user?.user_id;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { full_name, email, phone } = req.body;

    const updates = {};
    if (full_name !== undefined) updates.full_name = full_name;
    if (email !== undefined) updates.email = email;
    if (phone !== undefined) updates.phone = phone;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    const result = await accountService.updateAccountProfile(userId, updates);

    if (!result.updated) {
      return res.status(400).json({ error: result.message || "Failed to update account" });
    }

    // Fetch updated settings
    const updatedSettings = await accountService.getAccountSettings(userId);

    res.json({
      message: "Account settings updated successfully",
      account: updatedSettings,
    });
  } catch (error) {
    console.error("Error updating account settings:", error);
    if (error.message === "Email already in use") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to update account settings" });
  }
};

/**
 * PUT /api/account/password
 * Change password
 */
const changePassword = async (req, res) => {
  try {
    const userId = req.user?.user_id;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({
        error: "Current password and new password are required",
      });
    }

    if (new_password.length < 8) {
      return res.status(400).json({
        error: "New password must be at least 8 characters long",
      });
    }

    const result = await accountService.changePassword(
      userId,
      current_password,
      new_password
    );

    if (!result.updated) {
      return res.status(400).json({ error: "Failed to change password" });
    }

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    if (
      error.message === "Current password is incorrect" ||
      error.message === "Password authentication not set up for this account"
    ) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to change password" });
  }
};

/**
 * GET /api/account/subscription/plans
 * Get available subscription plans
 */
const getSubscriptionPlans = async (req, res) => {
  try {
    const plans = accountService.getAvailablePlans();
    res.json({ plans });
  } catch (error) {
    console.error("Error fetching subscription plans:", error);
    res.status(500).json({ error: "Failed to fetch subscription plans" });
  }
};

/**
 * GET /api/account/subscription
 * Get current subscription
 */
const getCurrentSubscription = async (req, res) => {
  try {
    const userId = req.user?.user_id;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const subscription = await accountService.getCurrentSubscription(userId);
    res.json(subscription);
  } catch (error) {
    console.error("Error fetching subscription:", error);
    res.status(500).json({ error: "Failed to fetch subscription" });
  }
};

/**
 * PUT /api/account/subscription
 * Update subscription plan
 * Note: Payment processing is disabled - allows direct plan changes for now
 */
const updateSubscription = async (req, res) => {
  try {
    const userId = req.user?.user_id;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { plan } = req.body;

    if (!plan) {
      return res.status(400).json({ error: "Plan name is required" });
    }

    // Payment implementation disabled - allow direct plan changes
    // TODO: Re-enable payment checkout when payment system is implemented
    const result = await accountService.updateSubscription(userId, plan);

    res.json({
      message: result.message || "Subscription updated successfully",
      subscription: result,
    });
  } catch (error) {
    console.error("Error updating subscription:", error);
    if (error.message.startsWith("Invalid plan:")) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to update subscription" });
  }
};

/**
 * DELETE /api/account
 * Delete/deactivate account
 */
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user?.user_id;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { confirm, password } = req.body;

    if (confirm !== true) {
      return res.status(400).json({
        error: "Account deletion must be confirmed",
        message: "Send { confirm: true } in request body to confirm deletion",
      });
    }

    // Verify password if provided (optional for account deletion endpoint)
    if (password) {
      const { db } = require("../../config/database");
      const [users] = await db.query(
        "SELECT email FROM users WHERE user_id = ?",
        [userId]
      );

      if (users && users.length > 0) {
        const userEmail = users[0].email;
        const [authRecords] = await db.query(
          "SELECT password_hash FROM auth WHERE email = ?",
          [userEmail]
        );

        if (authRecords && authRecords.length > 0) {
          const authService = require("../auth/service");
          const isValid = await authService.verifyPassword(
            password,
            authRecords[0].password_hash
          );

          if (!isValid) {
            return res.status(401).json({ error: "Invalid password" });
          }
        }
      }
    }

    const result = await accountService.deleteAccount(userId);

    if (!result.deleted) {
      return res.status(400).json({ error: "Failed to delete account" });
    }

    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error deleting account:", error);
    // Return specific error message if available
    if (error.message) {
      return res.status(400).json({ 
        error: error.message || "Failed to delete account" 
      });
    }
    res.status(500).json({ 
      error: "Failed to delete account",
      details: process.env.NODE_ENV === "development" ? error.stack : undefined
    });
  }
};

module.exports = {
  getAccountSettings,
  updateAccountSettings,
  changePassword,
  getSubscriptionPlans,
  getCurrentSubscription,
  updateSubscription,
  deleteAccount,
};


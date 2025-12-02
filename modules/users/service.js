const { db } = require("../../config/database");

/**
 * Create a new user, optionally linking staff to a salon
 */
async function createUser(
  full_name,
  phone,
  email,
  role = "customer",
  salon_id = null
) {
  const [userResult] = await db.query(
    "INSERT INTO users (full_name, phone, email, user_role) VALUES (?, ?, ?, ?)",
    [full_name, phone, email, role]
  );

  const userId = userResult.insertId;

  if (role === "staff" && salon_id) {
    await db.query(
      "INSERT INTO staff (user_id, salon_id, active) VALUES (?, ?, 1)",
      [userId, salon_id]
    );
  }

  return userId;
}

/**
 * Get all users
 */
async function getAllUsers() {
  const [rows] = await db.query(
    "SELECT user_id, full_name, email, phone, user_role, created_at, updated_at FROM users ORDER BY created_at DESC"
  );
  return rows;
}

/**
 * Get all customers
 */
async function getCustomers() {
  const [rows] = await db.query(
    "SELECT user_id, full_name, email FROM users WHERE user_role = 'customer' ORDER BY full_name ASC"
  );
  return rows;
}

/**
 * Get all customers linked to a specific salon
 */
async function getSalonCustomers(salonId) {
  const [rows] = await db.query(
    `SELECT DISTINCT u.user_id, u.full_name, u.email, u.phone, sc.joined_at
     FROM salon_customers sc
     JOIN users u ON sc.user_id = u.user_id
     WHERE sc.salon_id = ?
     ORDER BY sc.joined_at DESC`,
    [salonId]
  );
  return rows;
}

/**
 * Get a single user by ID
 */
async function getUserById(id) {
  const [rows] = await db.query("SELECT * FROM users WHERE user_id = ?", [id]);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Update user details
 */
async function updateUser(id, updates) {
  const fields = [];
  const values = [];

  for (const [key, value] of Object.entries(updates)) {
    fields.push(`${key} = ?`);
    values.push(value);
  }

  if (fields.length === 0) return 0;

  const sql = `UPDATE users SET ${fields.join(
    ", "
  )}, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`;
  values.push(id);

  const [result] = await db.query(sql, values);
  return result.affectedRows;
}

/**
 * Delete a user
 * Handles related records and foreign key constraints
 * Most foreign keys are CASCADE, but we handle some edge cases manually
 */
async function deleteUser(id) {
  try {
    // Check if user owns a salon - warn but allow deletion (CASCADE will delete salon)
    const [salonRows] = await db.query(
      "SELECT salon_id, name FROM salons WHERE owner_id = ?",
      [id]
    );

    if (salonRows && salonRows.length > 0) {
      // User owns a salon - CASCADE will delete the salon automatically
      // This is intentional - deleting user account deletes their business
      console.log(`Warning: User ${id} owns salon(s). Salon(s) will be deleted via CASCADE.`);
    }

    // Check if user is staff - need to delete staff record first
    const [staffRows] = await db.query(
      "SELECT staff_id FROM staff WHERE user_id = ?",
      [id]
    );

    if (staffRows && staffRows.length > 0) {
      // Delete staff records first (some foreign keys might reference staff_id)
      await db.query("DELETE FROM staff WHERE user_id = ?", [id]);
    }

    // Delete records that might have constraints preventing CASCADE
    // Most will be handled by CASCADE, but we handle a few manually for safety
    
    // Delete 2FA settings and codes (might not have CASCADE)
    try {
      await db.query("DELETE FROM user_2fa_settings WHERE user_id = ?", [id]);
      await db.query("DELETE FROM two_factor_codes WHERE user_id = ?", [id]);
    } catch (err) {
      // Table might not exist, ignore
      console.log("Note: 2FA tables may not exist, continuing...");
    }
    
    // Delete user roles (might not have CASCADE)
    try {
      await db.query("DELETE FROM user_roles WHERE user_id = ?", [id]);
    } catch (err) {
      // Table might not exist, ignore
      console.log("Note: user_roles table may not exist, continuing...");
    }

    // Finally, delete the user (CASCADE will handle most related records)
    const [result] = await db.query("DELETE FROM users WHERE user_id = ?", [id]);
    return result.affectedRows;
  } catch (error) {
    console.error("Error in deleteUser:", error);
    // Provide more specific error message
    if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.code === 'ER_NO_REFERENCED_ROW_2') {
      throw new Error("Cannot delete user due to database constraints. Please contact support.");
    }
    throw error;
  }
}

module.exports = {
  createUser,
  getAllUsers,
  getCustomers,
  getSalonCustomers,
  getUserById,
  updateUser,
  deleteUser,
};

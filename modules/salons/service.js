const { db } = require("../../config/database");

async function createSalon({ ownerId, name, address, description, phone, city, email, website, profile_picture }) {
  const [result] = await db.query(
    `INSERT INTO salons (owner_id, name, address, description, phone, email, website, profile_picture, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
    [ownerId, name, address, description, phone || null, email || null, website || null, profile_picture || null]
  );
  // create salon_settings default row
  await db.query("INSERT INTO salon_settings (salon_id) VALUES (?)", [
    result.insertId,
  ]);
  // add salon_audit
  await db.query(
    "INSERT INTO salon_audit (salon_id, event_type, event_note, performed_by) VALUES (?, ?, ?, ?)",
    [result.insertId, "CREATED", "Salon registered by owner", ownerId]
  );
  
  // Auto-seed default staff roles for new salon
  const defaultRoles = [
    { role_name: "Manager", permissions: JSON.stringify({ canManageStaff: true, canViewReports: true, canManageServices: true }) },
    { role_name: "Stylist", permissions: JSON.stringify({ canViewSchedule: true, canManageOwnAppointments: true }) },
    { role_name: "Receptionist", permissions: JSON.stringify({ canViewSchedule: true, canManageAppointments: true }) },
  ];
  
  for (const role of defaultRoles) {
    await db.query(
      "INSERT INTO staff_roles (salon_id, role_name, permissions) VALUES (?, ?, ?)",
      [result.insertId, role.role_name, role.permissions]
    );
  }
  
  const [rows] = await db.query("SELECT * FROM salons WHERE salon_id = ?", [
    result.insertId,
  ]);
  return rows[0];
}

async function getSalons({ q, page = 1, limit = 10 }) {
  const offset = (page - 1) * limit;
  let sql =
    'SELECT s.*, u.full_name as owner_name FROM salons s JOIN users u ON u.user_id = s.owner_id WHERE s.status = "active"';
  const params = [];
  if (q) {
    sql += " AND (s.name LIKE ? OR s.description LIKE ?)";
    params.push(`%${q}%`, `%${q}%`);
  }
  sql += " ORDER BY s.created_at DESC LIMIT ? OFFSET ?";
  params.push(parseInt(limit, 10), parseInt(offset, 10));
  const [rows] = await db.query(sql, params);
  return rows;
}

/**
 * Get salon business hours
 */
async function getSalonBusinessHours(salonId) {
  const [rows] = await db.query(
    `SELECT business_hours FROM salon_settings WHERE salon_id = ?`,
    [salonId]
  );

  if (!rows || rows.length === 0) {
    // Return default hours if no settings exist
    return getDefaultBusinessHours();
  }

  const businessHours = rows[0].business_hours;
  
  // Handle null, undefined, or empty string
  if (!businessHours || businessHours === '' || businessHours === 'null') {
    return getDefaultBusinessHours();
  }

  // If it's already an object, return it directly
  if (typeof businessHours === 'object') {
    return businessHours;
  }

  // If it's a string, try to parse it
  if (typeof businessHours === 'string') {
    try {
      const parsed = JSON.parse(businessHours);
      return parsed;
    } catch (error) {
      console.error("Error parsing business hours:", error);
      console.error("Business hours value:", businessHours);
      return getDefaultBusinessHours();
    }
  }

  // Fallback to default
  return getDefaultBusinessHours();
}

/**
 * Update salon business hours
 */
async function updateSalonBusinessHours(salonId, businessHours) {
  const businessHoursJson = JSON.stringify(businessHours);

  // Use INSERT ... ON DUPLICATE KEY UPDATE to handle race conditions
  await db.query(
    `INSERT INTO salon_settings (salon_id, business_hours) 
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE business_hours = VALUES(business_hours)`,
    [salonId, businessHoursJson]
  );

  return { success: true };
}

/**
 * Get default business hours structure
 */
function getDefaultBusinessHours() {
  return {
    Monday: { enabled: true, start: "09:00", end: "18:00" },
    Tuesday: { enabled: true, start: "09:00", end: "18:00" },
    Wednesday: { enabled: true, start: "09:00", end: "18:00" },
    Thursday: { enabled: true, start: "09:00", end: "20:00" },
    Friday: { enabled: true, start: "09:00", end: "20:00" },
    Saturday: { enabled: true, start: "08:00", end: "17:00" },
    Sunday: { enabled: true, start: "10:00", end: "15:00" },
  };
}

/**
 * Get salon notification settings
 */
async function getSalonNotificationSettings(salonId) {
  const [rows] = await db.query(
    `SELECT notification_settings FROM salon_settings WHERE salon_id = ?`,
    [salonId]
  );

  if (!rows || rows.length === 0) {
    return getDefaultNotificationSettings();
  }

  const notificationSettings = rows[0].notification_settings;
  if (!notificationSettings) {
    return getDefaultNotificationSettings();
  }

  try {
    return JSON.parse(notificationSettings);
  } catch (error) {
    console.error("Error parsing notification settings:", error);
    return getDefaultNotificationSettings();
  }
}

/**
 * Update salon notification settings
 */
async function updateSalonNotificationSettings(salonId, notificationSettings) {
  const notificationSettingsJson = JSON.stringify(notificationSettings);

  // Use INSERT ... ON DUPLICATE KEY UPDATE to handle race conditions
  await db.query(
    `INSERT INTO salon_settings (salon_id, notification_settings) 
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE notification_settings = VALUES(notification_settings)`,
    [salonId, notificationSettingsJson]
  );

  return { success: true };
}

/**
 * Get default notification settings structure
 */
function getDefaultNotificationSettings() {
  return {
    emailReminders: true,
    inAppReminders: true,
    reminderHoursBefore: 24,
  };
}

/**
 * Get salon amenities
 */
async function getSalonAmenities(salonId) {
  const [rows] = await db.query(
    `SELECT amenities FROM salon_settings WHERE salon_id = ?`,
    [salonId]
  );

  if (!rows || rows.length === 0 || !rows[0].amenities) {
    return [];
  }

  try {
    return JSON.parse(rows[0].amenities);
  } catch (error) {
    console.error("Error parsing amenities:", error);
    return [];
  }
}

/**
 * Update salon amenities
 */
async function updateSalonAmenities(salonId, amenities) {
  const amenitiesJson = JSON.stringify(amenities);

  // Use INSERT ... ON DUPLICATE KEY UPDATE to handle race conditions
  await db.query(
    `INSERT INTO salon_settings (salon_id, amenities) 
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE amenities = VALUES(amenities)`,
    [salonId, amenitiesJson]
  );

  return { success: true };
}

/**
 * Get salon booking settings
 */
async function getSalonBookingSettings(salonId) {
  // Check which columns exist in the salon_settings table
  const [columns] = await db.query("SHOW COLUMNS FROM salon_settings");
  const columnNames = columns.map(col => col.Field);
  const hasColumn = (colName) => columnNames.includes(colName);

  // Build SELECT query dynamically based on available columns
  const selectFields = ['cancellation_policy', 'auto_complete_after'];
  if (hasColumn('deposit_percentage')) {
    selectFields.push('deposit_percentage');
  }

  const [rows] = await db.query(
    `SELECT ${selectFields.join(', ')} FROM salon_settings WHERE salon_id = ?`,
    [salonId]
  );

  if (!rows || rows.length === 0) {
    return {
      cancellationPolicy: "",
      advanceBookingDays: 30,
      depositPercentage: 0,
    };
  }

  return {
    cancellationPolicy: rows[0].cancellation_policy || "",
    advanceBookingDays: rows[0].auto_complete_after || 30,
    depositPercentage: hasColumn('deposit_percentage') ? (parseFloat(rows[0].deposit_percentage) || 0) : 0,
  };
}

/**
 * Update salon booking settings
 */
async function updateSalonBookingSettings(salonId, bookingSettings) {
  const { cancellationPolicy, advanceBookingDays, depositPercentage } = bookingSettings;

  const policy = cancellationPolicy || null;
  const days = advanceBookingDays || 30;
  const deposit = depositPercentage !== undefined ? Math.max(0, Math.min(100, parseFloat(depositPercentage) || 0)) : 0;

  // Check which columns exist in the salon_settings table
  const [columns] = await db.query("SHOW COLUMNS FROM salon_settings");
  const columnNames = columns.map(col => col.Field);
  const hasColumn = (colName) => columnNames.includes(colName);

  // Build the INSERT/UPDATE query dynamically based on available columns
  const fieldsToUpdate = ['salon_id', 'cancellation_policy', 'auto_complete_after'];
  const values = [salonId, policy, days];
  
  // Only include deposit_percentage if the column exists
  if (hasColumn('deposit_percentage')) {
    fieldsToUpdate.push('deposit_percentage');
    values.push(deposit);
  }

  const fieldsPlaceholder = fieldsToUpdate.map(() => '?').join(', ');
  const updateClause = fieldsToUpdate
    .filter(field => field !== 'salon_id') // Don't update salon_id
    .map(field => `${field} = VALUES(${field})`)
    .join(', ');

  // Use INSERT ... ON DUPLICATE KEY UPDATE to handle race conditions
  await db.query(
    `INSERT INTO salon_settings (${fieldsToUpdate.join(', ')}) 
     VALUES (${fieldsPlaceholder})
     ON DUPLICATE KEY UPDATE 
       ${updateClause}`,
    values
  );

  return { success: true };
}

/**
 * Get salon loyalty settings
 */
async function getSalonLoyaltySettings(salonId) {
  const [rows] = await db.query(
    `SELECT loyalty_enabled, points_per_visit, redeem_rate FROM salon_settings WHERE salon_id = ?`,
    [salonId]
  );

  if (!rows || rows.length === 0) {
    return {
      loyaltyEnabled: false,
      pointsPerVisit: 10,
      redeemRate: 100,
    };
  }

  return {
    loyaltyEnabled: rows[0].loyalty_enabled === 1 || rows[0].loyalty_enabled === true || false,
    pointsPerVisit: rows[0].points_per_visit || 10,
    redeemRate: parseFloat(rows[0].redeem_rate) || 100,
  };
}

/**
 * Update salon loyalty settings
 */
async function updateSalonLoyaltySettings(salonId, loyaltySettings) {
  const { loyaltyEnabled, pointsPerVisit, redeemRate } = loyaltySettings;

  const enabled = loyaltyEnabled === true || loyaltyEnabled === 1 ? 1 : 0;
  const points = pointsPerVisit || 10;
  const rate = redeemRate || 100;

  // Use INSERT ... ON DUPLICATE KEY UPDATE to handle race conditions
  await db.query(
    `INSERT INTO salon_settings (salon_id, loyalty_enabled, points_per_visit, redeem_rate) 
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE 
       loyalty_enabled = VALUES(loyalty_enabled),
       points_per_visit = VALUES(points_per_visit),
       redeem_rate = VALUES(redeem_rate)`,
    [salonId, enabled, points, rate]
  );

  return { success: true };
}

/**
 * Get salon appointment slot settings
 * Note: These columns don't exist in salon_settings table, so we return defaults
 * If you need to store these settings, add the columns to salon_settings table
 */
async function getSalonSlotSettings(salonId) {
  // The salon_settings table doesn't have slot_duration, buffer_time, or min_advance_booking_hours columns
  // Return default values for now
  // TODO: If these settings are needed, add columns to salon_settings table or store in a different table
  return {
    slotDuration: 30, // Default 30 minutes
    bufferTime: 0, // Default 0 minutes buffer
    minAdvanceBookingHours: 2, // Default 2 hours advance booking
  };
}

/**
 * Update salon appointment slot settings
 * Note: These columns don't exist in salon_settings table, so this is a no-op for now
 * If you need to store these settings, add the columns to salon_settings table
 */
async function updateSalonSlotSettings(salonId, slotSettings) {
  // The salon_settings table doesn't have slot_duration, buffer_time, or min_advance_booking_hours columns
  // This function is a no-op for now
  // TODO: If these settings are needed, add columns to salon_settings table or store in a different table
  console.warn(`[updateSalonSlotSettings] Slot settings update requested for salon ${salonId}, but columns don't exist in salon_settings table. Settings:`, slotSettings);
  return { success: true, message: "Slot settings columns not available in database" };
}

/**
 * Get salon review settings
 */
async function getSalonReviewSettings(salonId) {
  const [rows] = await db.query(
    `SELECT auto_request_reviews, review_request_timing, public_reviews_enabled FROM salon_settings WHERE salon_id = ?`,
    [salonId]
  );

  if (!rows || rows.length === 0) {
    return {
      autoRequestReviews: true,
      reviewRequestTiming: 24,
      publicReviewsEnabled: true,
    };
  }

  return {
    autoRequestReviews: rows[0].auto_request_reviews === 1 || rows[0].auto_request_reviews === true || false,
    reviewRequestTiming: rows[0].review_request_timing || 24,
    publicReviewsEnabled: rows[0].public_reviews_enabled === 1 || rows[0].public_reviews_enabled === true || false,
  };
}

/**
 * Update salon review settings
 */
async function updateSalonReviewSettings(salonId, reviewSettings) {
  const { autoRequestReviews, reviewRequestTiming, publicReviewsEnabled } = reviewSettings;

  const autoRequest = autoRequestReviews === true || autoRequestReviews === 1 ? 1 : 0;
  const timing = reviewRequestTiming || 24;
  const publicEnabled = publicReviewsEnabled === true || publicReviewsEnabled === 1 ? 1 : 0;

  // Use INSERT ... ON DUPLICATE KEY UPDATE to handle race conditions
  await db.query(
    `INSERT INTO salon_settings (salon_id, auto_request_reviews, review_request_timing, public_reviews_enabled) 
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE 
       auto_request_reviews = VALUES(auto_request_reviews),
       review_request_timing = VALUES(review_request_timing),
       public_reviews_enabled = VALUES(public_reviews_enabled)`,
    [salonId, autoRequest, timing, publicEnabled]
  );

  return { success: true };
}

/**
 * Get salon operating policies
 */
async function getSalonOperatingPolicies(salonId) {
  const [rows] = await db.query(
    `SELECT refund_policy, late_arrival_policy, no_show_policy FROM salon_settings WHERE salon_id = ?`,
    [salonId]
  );

  if (!rows || rows.length === 0) {
    return {
      refundPolicy: "",
      lateArrivalPolicy: "",
      noShowPolicy: "",
    };
  }

  return {
    refundPolicy: rows[0].refund_policy || "",
    lateArrivalPolicy: rows[0].late_arrival_policy || "",
    noShowPolicy: rows[0].no_show_policy || "",
  };
}

/**
 * Update salon operating policies
 */
async function updateSalonOperatingPolicies(salonId, policies) {
  const { refundPolicy, lateArrivalPolicy, noShowPolicy } = policies;

  // Use INSERT ... ON DUPLICATE KEY UPDATE to handle race conditions
  await db.query(
    `INSERT INTO salon_settings (salon_id, refund_policy, late_arrival_policy, no_show_policy) 
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE 
       refund_policy = VALUES(refund_policy),
       late_arrival_policy = VALUES(late_arrival_policy),
       no_show_policy = VALUES(no_show_policy)`,
    [salonId, refundPolicy || null, lateArrivalPolicy || null, noShowPolicy || null]
  );

  return { success: true };
}

module.exports = {
  createSalon,
  getSalons,
  getSalonBusinessHours,
  updateSalonBusinessHours,
  getSalonNotificationSettings,
  updateSalonNotificationSettings,
  getSalonAmenities,
  updateSalonAmenities,
  getSalonBookingSettings,
  updateSalonBookingSettings,
  getSalonLoyaltySettings,
  updateSalonLoyaltySettings,
  getSalonSlotSettings,
  updateSalonSlotSettings,
  getSalonReviewSettings,
  updateSalonReviewSettings,
  getSalonOperatingPolicies,
  updateSalonOperatingPolicies,
  updateSalonBusinessHours,
  getSalonNotificationSettings,
  updateSalonNotificationSettings,
  getSalonAmenities,
  updateSalonAmenities,
  getSalonBookingSettings,
  updateSalonBookingSettings,
};

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
  if (!businessHours) {
    return getDefaultBusinessHours();
  }

  try {
    return JSON.parse(businessHours);
  } catch (error) {
    console.error("Error parsing business hours:", error);
    return getDefaultBusinessHours();
  }
}

/**
 * Update salon business hours
 */
async function updateSalonBusinessHours(salonId, businessHours) {
  const businessHoursJson = JSON.stringify(businessHours);

  // Check if salon_settings exists
  const [existing] = await db.query(
    `SELECT salon_id FROM salon_settings WHERE salon_id = ?`,
    [salonId]
  );

  if (existing && existing.length > 0) {
    // Update existing
    await db.query(
      `UPDATE salon_settings SET business_hours = ? WHERE salon_id = ?`,
      [businessHoursJson, salonId]
    );
  } else {
    // Create new
    await db.query(
      `INSERT INTO salon_settings (salon_id, business_hours) VALUES (?, ?)`,
      [salonId, businessHoursJson]
    );
  }

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

  // Check if salon_settings exists
  const [existing] = await db.query(
    `SELECT salon_id FROM salon_settings WHERE salon_id = ?`,
    [salonId]
  );

  if (existing && existing.length > 0) {
    // Update existing
    await db.query(
      `UPDATE salon_settings SET notification_settings = ? WHERE salon_id = ?`,
      [notificationSettingsJson, salonId]
    );
  } else {
    // Create new
    await db.query(
      `INSERT INTO salon_settings (salon_id, notification_settings) VALUES (?, ?)`,
      [salonId, notificationSettingsJson]
    );
  }

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

  // Check if salon_settings exists
  const [existing] = await db.query(
    `SELECT salon_id FROM salon_settings WHERE salon_id = ?`,
    [salonId]
  );

  if (existing && existing.length > 0) {
    // Update existing
    await db.query(
      `UPDATE salon_settings SET amenities = ? WHERE salon_id = ?`,
      [amenitiesJson, salonId]
    );
  } else {
    // Create new
    await db.query(
      `INSERT INTO salon_settings (salon_id, amenities) VALUES (?, ?)`,
      [salonId, amenitiesJson]
    );
  }

  return { success: true };
}

/**
 * Get salon booking settings
 */
async function getSalonBookingSettings(salonId) {
  const [rows] = await db.query(
    `SELECT cancellation_policy, auto_complete_after, require_deposit, deposit_amount FROM salon_settings WHERE salon_id = ?`,
    [salonId]
  );

  if (!rows || rows.length === 0) {
    return {
      cancellationPolicy: "",
      advanceBookingDays: 30,
      requireDeposit: false,
      depositAmount: 0,
    };
  }

  return {
    cancellationPolicy: rows[0].cancellation_policy || "",
    advanceBookingDays: rows[0].auto_complete_after || 30,
    requireDeposit: rows[0].require_deposit === 1 || rows[0].require_deposit === true || false,
    depositAmount: parseFloat(rows[0].deposit_amount) || 0,
  };
}

/**
 * Update salon booking settings
 */
async function updateSalonBookingSettings(salonId, bookingSettings) {
  const { cancellationPolicy, advanceBookingDays, requireDeposit, depositAmount } = bookingSettings;

  // Check if salon_settings exists
  const [existing] = await db.query(
    `SELECT salon_id FROM salon_settings WHERE salon_id = ?`,
    [salonId]
  );

  if (existing && existing.length > 0) {
    // Update existing
    await db.query(
      `UPDATE salon_settings SET cancellation_policy = ?, auto_complete_after = ?, require_deposit = ?, deposit_amount = ? WHERE salon_id = ?`,
      [
        cancellationPolicy || null,
        advanceBookingDays || 30,
        requireDeposit === true || requireDeposit === 1 ? 1 : 0,
        depositAmount || 0,
        salonId
      ]
    );
  } else {
    // Create new
    await db.query(
      `INSERT INTO salon_settings (salon_id, cancellation_policy, auto_complete_after, require_deposit, deposit_amount) VALUES (?, ?, ?, ?, ?)`,
      [
        salonId,
        cancellationPolicy || null,
        advanceBookingDays || 30,
        requireDeposit === true || requireDeposit === 1 ? 1 : 0,
        depositAmount || 0
      ]
    );
  }

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

  const [existing] = await db.query(
    `SELECT salon_id FROM salon_settings WHERE salon_id = ?`,
    [salonId]
  );

  if (existing && existing.length > 0) {
    await db.query(
      `UPDATE salon_settings SET loyalty_enabled = ?, points_per_visit = ?, redeem_rate = ? WHERE salon_id = ?`,
      [
        loyaltyEnabled === true || loyaltyEnabled === 1 ? 1 : 0,
        pointsPerVisit || 10,
        redeemRate || 100,
        salonId
      ]
    );
  } else {
    await db.query(
      `INSERT INTO salon_settings (salon_id, loyalty_enabled, points_per_visit, redeem_rate) VALUES (?, ?, ?, ?)`,
      [
        salonId,
        loyaltyEnabled === true || loyaltyEnabled === 1 ? 1 : 0,
        pointsPerVisit || 10,
        redeemRate || 100
      ]
    );
  }

  return { success: true };
}

/**
 * Get salon appointment slot settings
 */
async function getSalonSlotSettings(salonId) {
  const [rows] = await db.query(
    `SELECT slot_duration, buffer_time, min_advance_booking_hours FROM salon_settings WHERE salon_id = ?`,
    [salonId]
  );

  if (!rows || rows.length === 0) {
    return {
      slotDuration: 30,
      bufferTime: 0,
      minAdvanceBookingHours: 2,
    };
  }

  return {
    slotDuration: rows[0].slot_duration || 30,
    bufferTime: rows[0].buffer_time || 0,
    minAdvanceBookingHours: rows[0].min_advance_booking_hours || 2,
  };
}

/**
 * Update salon appointment slot settings
 */
async function updateSalonSlotSettings(salonId, slotSettings) {
  const { slotDuration, bufferTime, minAdvanceBookingHours } = slotSettings;

  const [existing] = await db.query(
    `SELECT salon_id FROM salon_settings WHERE salon_id = ?`,
    [salonId]
  );

  if (existing && existing.length > 0) {
    await db.query(
      `UPDATE salon_settings SET slot_duration = ?, buffer_time = ?, min_advance_booking_hours = ? WHERE salon_id = ?`,
      [
        slotDuration || 30,
        bufferTime || 0,
        minAdvanceBookingHours || 2,
        salonId
      ]
    );
  } else {
    await db.query(
      `INSERT INTO salon_settings (salon_id, slot_duration, buffer_time, min_advance_booking_hours) VALUES (?, ?, ?, ?)`,
      [
        salonId,
        slotDuration || 30,
        bufferTime || 0,
        minAdvanceBookingHours || 2
      ]
    );
  }

  return { success: true };
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

  const [existing] = await db.query(
    `SELECT salon_id FROM salon_settings WHERE salon_id = ?`,
    [salonId]
  );

  if (existing && existing.length > 0) {
    await db.query(
      `UPDATE salon_settings SET auto_request_reviews = ?, review_request_timing = ?, public_reviews_enabled = ? WHERE salon_id = ?`,
      [
        autoRequestReviews === true || autoRequestReviews === 1 ? 1 : 0,
        reviewRequestTiming || 24,
        publicReviewsEnabled === true || publicReviewsEnabled === 1 ? 1 : 0,
        salonId
      ]
    );
  } else {
    await db.query(
      `INSERT INTO salon_settings (salon_id, auto_request_reviews, review_request_timing, public_reviews_enabled) VALUES (?, ?, ?, ?)`,
      [
        salonId,
        autoRequestReviews === true || autoRequestReviews === 1 ? 1 : 0,
        reviewRequestTiming || 24,
        publicReviewsEnabled === true || publicReviewsEnabled === 1 ? 1 : 0
      ]
    );
  }

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

  const [existing] = await db.query(
    `SELECT salon_id FROM salon_settings WHERE salon_id = ?`,
    [salonId]
  );

  if (existing && existing.length > 0) {
    await db.query(
      `UPDATE salon_settings SET refund_policy = ?, late_arrival_policy = ?, no_show_policy = ? WHERE salon_id = ?`,
      [
        refundPolicy || null,
        lateArrivalPolicy || null,
        noShowPolicy || null,
        salonId
      ]
    );
  } else {
    await db.query(
      `INSERT INTO salon_settings (salon_id, refund_policy, late_arrival_policy, no_show_policy) VALUES (?, ?, ?, ?)`,
      [
        salonId,
        refundPolicy || null,
        lateArrivalPolicy || null,
        noShowPolicy || null
      ]
    );
  }

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

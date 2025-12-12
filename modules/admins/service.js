//admins/service.js
const { db } = require("../../config/database");
const systemHealth = require("../../services/systemHealth");

exports.getUserEngagement = async () => {
  // Count users who have logged in within the last 30 days
  // Join with auth table to check last_login timestamp
  const [activeUsers] = await db.query(
    `SELECT COUNT(DISTINCT u.user_id) AS active_user_count 
     FROM users u
     LEFT JOIN auth a ON u.user_id = a.user_id
     WHERE a.last_login >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        OR (a.last_login IS NULL AND u.updated_at >= DATE_SUB(NOW(), INTERVAL 30 DAY))`
  );
  const [totalUsers] = await db.query(
    `SELECT COUNT(*) AS total_user_count FROM users`
  );
  return {
    activeUsers: activeUsers[0],
    totalUsers: totalUsers[0]
  };
};

exports.getAppointmentTrends = async (startDate = null, endDate = null) => {
  let sql = `SELECT HOUR(scheduled_time) AS hour, COUNT(*) AS appointments
     FROM appointments
     WHERE 1=1`;
  const params = [];

  if (startDate) {
    sql += ` AND scheduled_time >= ?`;
    params.push(startDate);
  } else {
    sql += ` AND scheduled_time >= DATE_SUB(NOW(), INTERVAL 30 DAY)`;
  }

  if (endDate) {
    sql += ` AND scheduled_time <= ?`;
    params.push(endDate);
  }

  sql += ` GROUP BY hour ORDER BY hour`;

  const [trends] = await db.query(sql, params);
  return trends;
};

exports.getSalonRevenues = async (startDate = null, endDate = null) => {
  let sql = `SELECT s.salon_id, s.name AS salon_name, SUM(p.amount) AS total_revenue
     FROM payments p
     JOIN appointments a ON p.appointment_id = a.appointment_id
     JOIN salons s ON a.salon_id = s.salon_id
     WHERE p.payment_status = 'completed'`;
  const params = [];

  if (startDate) {
    sql += ` AND p.created_at >= ?`;
    params.push(startDate);
  }

  if (endDate) {
    sql += ` AND p.created_at <= ?`;
    params.push(endDate);
  }

  sql += ` GROUP BY s.salon_id, s.name`;

  const [revenues] = await db.query(sql, params);
  return revenues;
};

exports.getLoyaltyUsage = async () => {
  const [usage] = await db.query(
    `SELECT salon_id, SUM(points) AS total_points
     FROM loyalty
     WHERE last_earned >= DATE_SUB(NOW(), INTERVAL 30 DAY)
     GROUP BY salon_id`
  );
  return usage;
};

exports.getUserDemographics = async () => {
  const [demographics] = await db.query(
    `SELECT user_role, COUNT(*) AS count FROM users GROUP BY user_role`
  );
  return demographics;
};

exports.getCustomerRetention = async () => {
  const [retention] = await db.query(
    `SELECT user_id FROM appointments
     WHERE scheduled_time >= DATE_SUB(NOW(), INTERVAL 90 DAY)
     GROUP BY user_id
     HAVING COUNT(appointment_id) > 1`
  );
  let count = 0;
  if (retention) {
    count = retention.length;
  }
  return { retained_customers: count };
};

exports.getReports = async (startDate = null, endDate = null) => {
  let sql = `SELECT s.salon_id, s.name AS salon_name, SUM(p.amount) AS total_sales
     FROM payments p
     JOIN appointments a ON p.appointment_id = a.appointment_id
     JOIN salons s ON a.salon_id = s.salon_id
     WHERE p.payment_status = 'completed'`;
  const params = [];

  if (startDate) {
    sql += ` AND p.created_at >= ?`;
    params.push(startDate);
  }

  if (endDate) {
    sql += ` AND p.created_at <= ?`;
    params.push(endDate);
  }

  sql += ` GROUP BY s.salon_id, s.name`;

  const [reports] = await db.query(sql, params);
  return reports;
};

/**
 * Convert reports data to CSV format
 */
exports.convertReportsToCSV = (reports) => {
  if (!reports || reports.length === 0) {
    return 'No data found';
  }

  const headers = ['Salon ID', 'Salon Name', 'Total Sales'];
  const csvRows = [headers.join(',')];

  reports.forEach(report => {
    const row = [
      report.salon_id || '',
      `"${(report.salon_name || '').replace(/"/g, '""')}"`,
      report.total_sales || '0'
    ];
    csvRows.push(row.join(','));
  });

  return csvRows.join('\n');
};

exports.getSystemLogs = async () => {
  const [logs] = await db.query(
    `SELECT event_type, COUNT(*) AS count
     FROM salon_audit
     WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
     GROUP BY event_type
     ORDER BY count DESC
     LIMIT 50`
  );
  return logs;
};

/**
 * Get pending salon registrations for admin review
 */
exports.getPendingSalons = async () => {
  const [salons] = await db.query(
    `SELECT 
      s.salon_id,
      s.name,
      s.name AS salon_name,
      s.address,
      s.city,
      s.phone,
      s.email,
      s.description,
      s.approved,
      s.status,
      s.created_at,
      u.full_name AS owner_name,
      u.email AS owner_email
    FROM salons s
    JOIN users u ON s.owner_id = u.user_id
    WHERE s.approved = 'pending' OR s.status = 'pending'
    ORDER BY s.created_at DESC`
  );
  return salons;
};

/**
 * Update salon registration status (approve/reject)
 * As an admin, I want to verify salon registrations so that only legitimate businesses are listed.
 */
exports.updateSalonRegistration = async (salonId, approvalStatus, adminUserId) => {
  // Validate salon exists
  const [salons] = await db.query(
    `SELECT salon_id, approved, status FROM salons WHERE salon_id = ?`,
    [salonId]
  );

  if (!salons || salons.length === 0) {
    throw new Error("Salon not found");
  }

  const salon = salons[0];

  // Validate approval status
  const validStatuses = ['approved', 'rejected', 'pending'];
  const normalizedStatus = approvalStatus.toLowerCase();
  
  if (!validStatuses.includes(normalizedStatus)) {
    throw new Error(`Invalid approval status. Must be one of: ${validStatuses.join(', ')}`);
  }

  // Update approved status
  const [result] = await db.query(
    `UPDATE salons SET approved = ? WHERE salon_id = ?`,
    [normalizedStatus, salonId]
  );

  // If approved, also set status to 'active' (if it's currently 'pending')
  if (normalizedStatus === 'approved' && salon.status === 'pending') {
    await db.query(
      `UPDATE salons SET status = 'active' WHERE salon_id = ?`,
      [salonId]
    );
  }

  // If rejected, set status to 'blocked'
  if (normalizedStatus === 'rejected') {
    await db.query(
      `UPDATE salons SET status = 'blocked' WHERE salon_id = ?`,
      [salonId]
    );
  }

  // Log the action in salon_audit
  // Map approval status to correct event_type enum values: 'CREATED','APPROVED','REJECTED','BLOCKED','UPDATED','AUTO_ARCHIVED'
  let eventType;
  let eventNote;
  
  if (normalizedStatus === 'approved') {
    eventType = 'APPROVED';
    eventNote = `Salon registration approved by admin`;
  } else if (normalizedStatus === 'rejected') {
    eventType = 'REJECTED';
    eventNote = `Salon registration rejected by admin`;
  } else {
    // For pending or other statuses, use UPDATED
    eventType = 'UPDATED';
    eventNote = `Salon registration status changed to ${normalizedStatus} by admin`;
  }

  await db.query(
    `INSERT INTO salon_audit (salon_id, event_type, event_note, performed_by) 
     VALUES (?, ?, ?, ?)`,
    [salonId, eventType, eventNote, adminUserId || null]
  );

  // Return updated salon info
  const [updated] = await db.query(
    `SELECT salon_id, name, approved, status FROM salons WHERE salon_id = ?`,
    [salonId]
  );

  return {
    success: true,
    salon: updated[0],
    message: `Salon registration ${normalizedStatus} successfully`
  };
};

// Get platform health (derived from audit activity and DB reachability)
exports.getSystemHealth = async () => {
  // DB/uptime checks with rolling tracker
  const dbCheck = await systemHealth.checkDatabase();
  const uptimePercent = systemHealth.getUptimePercent();

  // Error trend: use salon_audit activity as a proxy over the last hour
  const [trendRows] = await db.query(
    `SELECT DATE_FORMAT(created_at, '%H:%i') AS minute, COUNT(*) AS count
     FROM salon_audit
     WHERE created_at >= DATE_SUB(NOW(), INTERVAL 60 MINUTE)
     GROUP BY minute
     ORDER BY minute ASC`
  );

  // Error counts in last 24h
  const [errorCountRows] = await db.query(
    `SELECT COUNT(*) AS count
     FROM salon_audit
     WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)`
  );
  const totalErrors24h = Number(errorCountRows?.[0]?.count || 0);

  const totalEventsLastHour = trendRows.reduce((sum, row) => sum + Number(row.count || 0), 0);
  const errorRatePerMin = totalEventsLastHour / 60;

  return {
    uptime_percent: uptimePercent,
    avg_latency_ms: dbCheck.latencyMs,
    last_up: dbCheck.lastUp,
    last_down: dbCheck.lastDown,
    error_rate_per_min: Number(errorRatePerMin.toFixed(2)),
    total_errors_24h: totalErrors24h,
    sentry_enabled: Boolean(process.env.SENTRY_DSN),
    incidents: systemHealth.getIncidents(),
    recent_errors: await systemHealth.getRecentErrors(10),
    error_trend: trendRows.map((row) => ({
      minute: row.minute,
      count: Number(row.count || 0),
    })),
  };
};

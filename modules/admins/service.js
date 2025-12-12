//admins/service.js
const { db } = require("../../config/database");
const systemHealth = require("../../services/systemHealth");

exports.getUserEngagement = async () => {
  // Helpers for counts
  const getScalar = (rows, key) => {
    if (!rows || rows.length === 0) return 0;
    const val = rows[0][key];
    return val === null || val === undefined ? 0 : Number(val);
  };

  // Customers: active by window
  const [dauRows] = await db.query(
    `SELECT COUNT(DISTINCT u.user_id) AS count
     FROM users u
     LEFT JOIN auth a ON u.user_id = a.user_id
     WHERE (a.last_login >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        OR u.updated_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        OR u.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY))`
  );
  const [mauRows] = await db.query(
    `SELECT COUNT(DISTINCT u.user_id) AS count
     FROM users u
     LEFT JOIN auth a ON u.user_id = a.user_id
     LEFT JOIN appointments ap ON ap.user_id = u.user_id
     WHERE (a.last_login >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        OR u.updated_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        OR u.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        OR ap.scheduled_time >= DATE_SUB(NOW(), INTERVAL 30 DAY))`
  );
  const [totalUsersRows] = await db.query(
    `SELECT COUNT(*) AS total_user_count FROM users`
  );

  // Bookings / completion / repeat
  const [bookings7d] = await db.query(
    `SELECT COUNT(*) AS count FROM appointments WHERE scheduled_time >= DATE_SUB(NOW(), INTERVAL 7 DAY)`
  );
  const [bookings30d] = await db.query(
    `SELECT COUNT(*) AS count FROM appointments WHERE scheduled_time >= DATE_SUB(NOW(), INTERVAL 30 DAY)`
  );
  const [completed30d] = await db.query(
    `SELECT COUNT(*) AS count FROM appointments 
     WHERE scheduled_time >= DATE_SUB(NOW(), INTERVAL 30 DAY) 
       AND status IN ('completed','confirmed','done')`
  );
  const [cancelled30d] = await db.query(
    `SELECT COUNT(*) AS count FROM appointments 
     WHERE scheduled_time >= DATE_SUB(NOW(), INTERVAL 30 DAY) 
       AND status IN ('cancelled','canceled','no-show','noshow')`
  );
  const [repeat90d] = await db.query(
    `SELECT COUNT(*) AS count FROM (
        SELECT user_id
        FROM appointments
        WHERE scheduled_time >= DATE_SUB(NOW(), INTERVAL 90 DAY)
        GROUP BY user_id
        HAVING COUNT(appointment_id) > 1
      ) t`
  );

  // Reviews/messages (best-effort if tables exist)
  let reviews30dCount = 0;
  try {
    const [reviews30d] = await db.query(
      `SELECT COUNT(*) AS count FROM reviews WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`
    );
    reviews30dCount = getScalar(reviews30d, "count");
  } catch (err) {
    reviews30dCount = 0;
  }

  let messages30dCount = 0;
  try {
    const [messages30d] = await db.query(
      `SELECT COUNT(*) AS count FROM messages WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`
    );
    messages30dCount = getScalar(messages30d, "count");
  } catch (err) {
    messages30dCount = 0;
  }

  // Inactive customers
  const [inactive60d] = await db.query(
    `SELECT COUNT(*) AS count FROM users u
     LEFT JOIN auth a ON u.user_id = a.user_id
     WHERE u.user_role = 'customer'
       AND (a.last_login IS NULL OR a.last_login < DATE_SUB(NOW(), INTERVAL 60 DAY))
       AND u.updated_at < DATE_SUB(NOW(), INTERVAL 60 DAY)`
  );

  // Owner/staff engagement
  const [activeOwners30d] = await db.query(
    `SELECT COUNT(DISTINCT u.user_id) AS count
     FROM users u
     LEFT JOIN auth a ON u.user_id = a.user_id
     WHERE u.user_role IN ('owner','salon_owner','staff')
       AND (a.last_login >= DATE_SUB(NOW(), INTERVAL 30 DAY)
         OR u.updated_at >= DATE_SUB(NOW(), INTERVAL 30 DAY))`
  );

  const [activeSalons30d] = await db.query(
    `SELECT COUNT(DISTINCT s.salon_id) AS count
     FROM salons s
     LEFT JOIN appointments ap ON ap.salon_id = s.salon_id
     WHERE (ap.scheduled_time >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        OR s.updated_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        OR s.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY))`
  );
  const [totalSalons] = await db.query(
    `SELECT COUNT(*) AS count FROM salons`
  );

  const [ownerAppointments30d] = await db.query(
    `SELECT COUNT(*) AS count
     FROM appointments ap
     WHERE ap.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`
  );

  // Staff logins 30d (owners + staff roles)
  const [staffLogins30d] = await db.query(
    `SELECT COUNT(DISTINCT a.user_id) AS count
     FROM auth a
     JOIN users u ON u.user_id = a.user_id
     WHERE a.last_login >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       AND u.user_role IN ('owner','salon_owner','staff')`
  );

  return {
    customers: {
      dau_7d: getScalar(dauRows, "count"),
      mau_30d: getScalar(mauRows, "count"),
      total_users: getScalar(totalUsersRows, "total_user_count"),
      bookings_7d: getScalar(bookings7d, "count"),
      bookings_30d: getScalar(bookings30d, "count"),
      completion_rate_30d: (() => {
        const completed = getScalar(completed30d, "count");
        const cancelled = getScalar(cancelled30d, "count");
        const total = completed + cancelled;
        if (total === 0) return 0;
        return Number(((completed / total) * 100).toFixed(2));
      })(),
      repeat_customers_90d: getScalar(repeat90d, "count"),
      reviews_30d: reviews30dCount,
      messages_30d: messages30dCount,
      inactive_60d: getScalar(inactive60d, "count"),
    },
    owners: {
      active_owners_30d: getScalar(activeOwners30d, "count"),
      active_salons_30d: getScalar(activeSalons30d, "count"),
      total_salons: getScalar(totalSalons, "count"),
      owner_created_appointments_30d: getScalar(ownerAppointments30d, "count"),
      staff_logins_30d: getScalar(staffLogins30d, "count"),
    },
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
    `SELECT l.salon_id, s.name AS salon_name, SUM(l.points) AS total_points
     FROM loyalty l
     JOIN salons s ON l.salon_id = s.salon_id
     WHERE l.last_earned >= DATE_SUB(NOW(), INTERVAL 30 DAY)
     GROUP BY l.salon_id, s.name
     ORDER BY total_points DESC`
  );
  return usage;
};

exports.getLoyaltySummary = async () => {
  // Points and member counts per salon (last 30d)
  const [bySalon] = await db.query(
    `SELECT 
        l.salon_id,
        s.name AS salon_name,
        SUM(l.points) AS total_points,
        COUNT(DISTINCT l.user_id) AS member_count
     FROM loyalty l
     JOIN salons s ON l.salon_id = s.salon_id
     WHERE l.last_earned >= DATE_SUB(NOW(), INTERVAL 30 DAY)
     GROUP BY l.salon_id, s.name
     ORDER BY total_points DESC`
  );

  // Active members (customers with any points last 30d)
  const [[membersRow]] = await db.query(
    `SELECT COUNT(DISTINCT user_id) AS active_members
     FROM loyalty
     WHERE last_earned >= DATE_SUB(NOW(), INTERVAL 30 DAY)`
  );

  const total_points = bySalon.reduce(
    (sum, row) => sum + Number(row.total_points || 0),
    0
  );
  const active_salons = bySalon.length;
  const active_members = membersRow?.active_members || 0;
  const top_salon = bySalon[0] || null;

  return {
    total_points,
    active_salons,
    active_members,
    by_salon: bySalon,
    top_salon,
  };
};

exports.getRetentionSummary = async () => {
  // Active customers last 90d
  const [[active90]] = await db.query(
    `SELECT COUNT(DISTINCT user_id) AS active_customers_90d
     FROM appointments
     WHERE scheduled_time >= DATE_SUB(NOW(), INTERVAL 90 DAY)`
  );

  // Returning customers (>=2 appts last 90d)
  const [[returning90]] = await db.query(
    `SELECT COUNT(*) AS returning_customers_90d
     FROM (
       SELECT user_id
       FROM appointments
       WHERE scheduled_time >= DATE_SUB(NOW(), INTERVAL 90 DAY)
       GROUP BY user_id
       HAVING COUNT(*) >= 2
     ) t`
  );

  // New customers (first visit in last 30d and 90d)
  const [[new30]] = await db.query(
    `SELECT COUNT(*) AS new_customers_30d
     FROM (
       SELECT user_id, MIN(scheduled_time) AS first_visit
       FROM appointments
       GROUP BY user_id
       HAVING first_visit >= DATE_SUB(NOW(), INTERVAL 30 DAY)
     ) t`
  );
  const [[new90]] = await db.query(
    `SELECT COUNT(*) AS new_customers_90d
     FROM (
       SELECT user_id, MIN(scheduled_time) AS first_visit
       FROM appointments
       GROUP BY user_id
       HAVING first_visit >= DATE_SUB(NOW(), INTERVAL 90 DAY)
     ) t`
  );

  // Total and repeat bookings (30d)
  const [[totalBookings30]] = await db.query(
    `SELECT COUNT(*) AS total_bookings_30d
     FROM appointments
     WHERE scheduled_time >= DATE_SUB(NOW(), INTERVAL 30 DAY)`
  );
  const [[repeatBookings30]] = await db.query(
    `SELECT COUNT(*) AS repeat_bookings_30d
     FROM appointments a
     WHERE a.scheduled_time >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       AND EXISTS (
         SELECT 1 FROM appointments p
         WHERE p.user_id = a.user_id
           AND p.scheduled_time < a.scheduled_time
       )`
  );

  // Churn risk: last visit >60d ago
  const [[churnRisk]] = await db.query(
    `SELECT COUNT(*) AS churn_risk_60d
     FROM (
       SELECT user_id, MAX(scheduled_time) AS last_visit
       FROM appointments
       GROUP BY user_id
       HAVING last_visit < DATE_SUB(NOW(), INTERVAL 60 DAY)
     ) t`
  );

  // Weekly trend (last 12 weeks): new vs returning users
  const [trendRows] = await db.query(
    `WITH firsts AS (
       SELECT user_id, MIN(scheduled_time) AS first_visit
       FROM appointments
       GROUP BY user_id
     )
     SELECT
       YEARWEEK(a.scheduled_time, 1) AS yw,
       DATE_FORMAT(DATE_SUB(a.scheduled_time, INTERVAL WEEKDAY(a.scheduled_time) DAY), '%Y-%m-%d') AS week_start,
       COUNT(DISTINCT CASE WHEN f.first_visit >= DATE_SUB(a.scheduled_time, INTERVAL WEEKDAY(a.scheduled_time) DAY)
                            AND f.first_visit < DATE_ADD(DATE_SUB(a.scheduled_time, INTERVAL WEEKDAY(a.scheduled_time) DAY), INTERVAL 7 DAY)
                       THEN a.user_id END) AS new_users,
       COUNT(DISTINCT CASE WHEN f.first_visit < DATE_SUB(a.scheduled_time, INTERVAL WEEKDAY(a.scheduled_time) DAY)
                       THEN a.user_id END) AS returning_users
     FROM appointments a
     JOIN firsts f ON f.user_id = a.user_id
     WHERE a.scheduled_time >= DATE_SUB(NOW(), INTERVAL 12 WEEK)
     GROUP BY yw, week_start
     ORDER BY yw DESC
     LIMIT 12`
  );
  const trend = trendRows
    .map((row) => ({
      week_start: row.week_start,
      new_users: Number(row.new_users || 0),
      returning_users: Number(row.returning_users || 0),
    }))
    .reverse();

  return {
    active_customers_90d: Number(active90?.active_customers_90d || 0),
    returning_customers_90d: Number(returning90?.returning_customers_90d || 0),
    new_customers_30d: Number(new30?.new_customers_30d || 0),
    new_customers_90d: Number(new90?.new_customers_90d || 0),
    total_bookings_30d: Number(totalBookings30?.total_bookings_30d || 0),
    repeat_bookings_30d: Number(repeatBookings30?.repeat_bookings_30d || 0),
    churn_risk_60d: Number(churnRisk?.churn_risk_60d || 0),
    trend,
  };
};

exports.getDailyActivity = async () => {
  const [rows] = await db.query(
    `SELECT DATE(scheduled_time) AS day, COUNT(*) AS sessions
     FROM appointments
     WHERE scheduled_time >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
     GROUP BY day
     ORDER BY day`
  );
  return rows.map((r) => ({
    day: r.day,
    sessions: Number(r.sessions || 0),
  }));
};

exports.getUserDemographics = async () => {
  let gender = [];
  let age = [];

  try {
    [gender] = await db.query(
      `SELECT COALESCE(gender, 'unknown') AS bucket, COUNT(*) AS count
       FROM users
       WHERE user_role = 'customer'
       GROUP BY bucket`
    );
  } catch (err) {
    console.warn("Gender demographics query failed, falling back:", err?.message);
    [gender] = await db.query(
      `SELECT 'unknown' AS bucket, COUNT(*) AS count
       FROM users
       WHERE user_role = 'customer'`
    );
  }

  try {
    [age] = await db.query(
      `SELECT
          CASE
            WHEN birth_year IS NULL THEN 'unknown'
            WHEN TIMESTAMPDIFF(YEAR, STR_TO_DATE(CONCAT(birth_year,'-01-01'), '%Y-%m-%d'), CURDATE()) < 18 THEN '<18'
            WHEN TIMESTAMPDIFF(YEAR, STR_TO_DATE(CONCAT(birth_year,'-01-01'), '%Y-%m-%d'), CURDATE()) BETWEEN 18 AND 24 THEN '18-24'
            WHEN TIMESTAMPDIFF(YEAR, STR_TO_DATE(CONCAT(birth_year,'-01-01'), '%Y-%m-%d'), CURDATE()) BETWEEN 25 AND 34 THEN '25-34'
            WHEN TIMESTAMPDIFF(YEAR, STR_TO_DATE(CONCAT(birth_year,'-01-01'), '%Y-%m-%d'), CURDATE()) BETWEEN 35 AND 44 THEN '35-44'
            WHEN TIMESTAMPDIFF(YEAR, STR_TO_DATE(CONCAT(birth_year,'-01-01'), '%Y-%m-%d'), CURDATE()) BETWEEN 45 AND 54 THEN '45-54'
            WHEN TIMESTAMPDIFF(YEAR, STR_TO_DATE(CONCAT(birth_year,'-01-01'), '%Y-%m-%d'), CURDATE()) BETWEEN 55 AND 64 THEN '55-64'
            ELSE '65+'
          END AS bucket,
          COUNT(*) AS count
       FROM users
       WHERE user_role = 'customer'
       GROUP BY bucket`
    );
  } catch (err) {
    console.warn("Age demographics query failed, falling back:", err?.message);
    [age] = await db.query(
      `SELECT 'unknown' AS bucket, COUNT(*) AS count
       FROM users
       WHERE user_role = 'customer'`
    );
  }

  return { gender, age };
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
  const params = [];
  const dateFilter = [];
  if (startDate) {
    dateFilter.push("p.created_at >= ?");
    params.push(startDate);
  }
  if (endDate) {
    dateFilter.push("p.created_at <= ?");
    params.push(endDate);
  }

  const dateClause = dateFilter.length ? ` AND ${dateFilter.join(" AND ")}` : "";

  const [reports] = await db.query(
    `SELECT s.salon_id, s.name AS salon_name, SUM(p.amount) AS total_sales
     FROM payments p
     JOIN appointments a ON p.appointment_id = a.appointment_id
     JOIN salons s ON a.salon_id = s.salon_id
     WHERE p.payment_status = 'completed' ${dateClause}
     GROUP BY s.salon_id, s.name`,
    params
  );

  // KPI summary
  const [[summary]] = await db.query(
    `SELECT 
        SUM(p.amount) AS total_revenue,
        COUNT(*) AS total_payments
     FROM payments p
     WHERE p.payment_status = 'completed' ${dateClause}`,
    params
  );

  // Bookings/completion
  const [[bookings]] = await db.query(
    `SELECT 
        COUNT(*) AS total_bookings,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed_bookings,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled_bookings
     FROM appointments
     WHERE 1=1 ${dateClause.replace(/p\.created_at/g, "scheduled_time")}`,
    params
  );

  return {
    reports,
    summary: {
      total_revenue: Number(summary?.total_revenue || 0),
      total_payments: Number(summary?.total_payments || 0),
      total_bookings: Number(bookings?.total_bookings || 0),
      completed_bookings: Number(bookings?.completed_bookings || 0),
      cancelled_bookings: Number(bookings?.cancelled_bookings || 0),
    },
  };
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

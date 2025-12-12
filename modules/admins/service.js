//admins/service.js
const { db } = require("../../config/database");
const { s3Client, BUCKET_NAME, isS3Configured } = require("../../middleware/s3Upload");
const { HeadBucketCommand } = require("@aws-sdk/client-s3");

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
  // Get total enrolled users across all salons
  const [totalEnrolled] = await db.query(
    `SELECT COUNT(DISTINCT user_id) AS total_enrolled_users FROM loyalty`
  );

  // Get active users (earned or redeemed in last 30 days)
  const [activeUsers] = await db.query(
    `SELECT COUNT(DISTINCT user_id) AS active_users
     FROM loyalty
     WHERE last_earned >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        OR last_redeemed >= DATE_SUB(NOW(), INTERVAL 30 DAY)`
  );

  // Get total points statistics
  const [pointsStats] = await db.query(
    `SELECT
      SUM(points) AS total_points_outstanding,
      AVG(points) AS avg_points_per_user,
      MAX(points) AS max_points
     FROM loyalty`
  );

  // Get salon-specific breakdown
  const [salonBreakdown] = await db.query(
    `SELECT
      s.salon_id,
      s.name AS salon_name,
      COUNT(DISTINCT l.user_id) AS enrolled_users,
      SUM(l.points) AS total_points,
      AVG(l.points) AS avg_points_per_user,
      COUNT(DISTINCT CASE
        WHEN l.last_earned >= DATE_SUB(NOW(), INTERVAL 30 DAY)
          OR l.last_redeemed >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        THEN l.user_id
      END) AS active_users_30d
     FROM loyalty l
     JOIN salons s ON l.salon_id = s.salon_id
     GROUP BY s.salon_id, s.name
     ORDER BY total_points DESC`
  );

  // Get points earned vs redeemed trends (last 30 days)
  const [pointsTrends] = await db.query(
    `SELECT
      DATE(last_earned) AS date,
      SUM(points) AS points_activity
     FROM loyalty
     WHERE last_earned >= DATE_SUB(NOW(), INTERVAL 30 DAY)
     GROUP BY DATE(last_earned)
     ORDER BY date DESC
     LIMIT 30`
  );

  // Get redemption activity
  const [redemptionStats] = await db.query(
    `SELECT
      COUNT(DISTINCT user_id) AS users_who_redeemed,
      COUNT(DISTINCT CASE
        WHEN last_redeemed >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        THEN user_id
      END) AS recent_redeemers
     FROM loyalty
     WHERE last_redeemed IS NOT NULL`
  );

  return {
    overview: {
      total_enrolled_users: totalEnrolled[0]?.total_enrolled_users || 0,
      active_users_30d: activeUsers[0]?.active_users || 0,
      total_points_outstanding: pointsStats[0]?.total_points_outstanding || 0,
      avg_points_per_user: Math.round(pointsStats[0]?.avg_points_per_user || 0),
      max_points: pointsStats[0]?.max_points || 0,
      users_who_redeemed: redemptionStats[0]?.users_who_redeemed || 0,
      recent_redeemers_30d: redemptionStats[0]?.recent_redeemers || 0
    },
    salon_breakdown: salonBreakdown,
    trends: pointsTrends
  };
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
  // Get event type summary
  const [logs] = await db.query(
    `SELECT event_type, COUNT(*) AS count
     FROM salon_audit
     WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
     GROUP BY event_type
     ORDER BY count DESC
     LIMIT 50`
  );

  // Get recent detailed logs
  const [recentLogs] = await db.query(
    `SELECT
      audit_id,
      salon_id,
      event_type,
      event_note,
      performed_by,
      created_at
     FROM salon_audit
     ORDER BY created_at DESC
     LIMIT 100`
  );

  // Get error statistics (rejected/blocked events)
  const [errorStats] = await db.query(
    `SELECT
      DATE(created_at) AS date,
      COUNT(*) AS error_count
     FROM salon_audit
     WHERE event_type IN ('REJECTED', 'BLOCKED')
       AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
     GROUP BY DATE(created_at)
     ORDER BY date DESC`
  );

  return {
    event_summary: logs,
    recent_logs: recentLogs,
    error_trends: errorStats
  };
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
  await db.query(
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

/**
 * Get comprehensive system health metrics
 * Returns data formatted for the frontend reliability dashboard
 */
exports.getSystemHealth = async () => {
  const healthData = {
    uptime_percent: 99.9,
    avg_latency_ms: 0,
    error_rate_per_min: 0,
    total_errors_24h: 0,
    last_up: new Date().toISOString(),
    last_down: null,
    sentry_enabled: !!process.env.SENTRY_DSN,
    incidents: [],
    recent_errors: [],
    error_trend: []
  };

  try {
    // Database connectivity check with latency monitoring
    const dbStart = Date.now();
    await db.query('SELECT 1');
    healthData.avg_latency_ms = Date.now() - dbStart;

    // Get error statistics from last 24 hours
    const [errorStats] = await db.query(`
      SELECT
        COUNT(*) AS total_errors,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR) THEN 1 END) AS errors_1h
      FROM salon_audit
      WHERE event_type IN ('REJECTED', 'BLOCKED')
        AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
    `);

    healthData.total_errors_24h = errorStats[0]?.total_errors || 0;
    healthData.error_rate_per_min = ((errorStats[0]?.errors_1h || 0) / 60).toFixed(2);

    // Calculate uptime percentage based on error rate
    const [uptimeData] = await db.query(`
      SELECT
        COUNT(*) AS total_events,
        SUM(CASE WHEN event_type IN ('REJECTED', 'BLOCKED') THEN 1 ELSE 0 END) AS failed_events
      FROM salon_audit
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);

    const totalEvents = uptimeData[0]?.total_events || 0;
    const failedEvents = uptimeData[0]?.failed_events || 0;
    healthData.uptime_percent = totalEvents > 0
      ? parseFloat((((totalEvents - failedEvents) / totalEvents) * 100).toFixed(3))
      : 99.999;

    // Get recent errors (last 10)
    const [recentErrors] = await db.query(`
      SELECT
        audit_id AS id,
        event_type AS service,
        event_note AS message,
        created_at AS timestamp,
        CASE
          WHEN event_type = 'BLOCKED' THEN 'critical'
          WHEN event_type = 'REJECTED' THEN 'warn'
          ELSE 'error'
        END AS severity
      FROM salon_audit
      WHERE event_type IN ('REJECTED', 'BLOCKED')
      ORDER BY created_at DESC
      LIMIT 10
    `);

    healthData.recent_errors = recentErrors.map(err => ({
      id: err.id,
      service: err.service.toLowerCase(),
      message: err.message || 'Error occurred',
      timestamp: err.timestamp,
      severity: err.severity
    }));

    // Get error trend for last hour (grouped by minute)
    const [errorTrend] = await db.query(`
      SELECT
        DATE_FORMAT(created_at, '%H:%i') AS minute,
        COUNT(*) AS count
      FROM salon_audit
      WHERE event_type IN ('REJECTED', 'BLOCKED')
        AND created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
      GROUP BY DATE_FORMAT(created_at, '%H:%i')
      ORDER BY minute DESC
      LIMIT 60
    `);

    healthData.error_trend = errorTrend.map(trend => ({
      minute: trend.minute,
      count: trend.count
    }));

    // Get active incidents (critical errors in last hour)
    const [incidents] = await db.query(`
      SELECT
        audit_id AS id,
        event_type AS title,
        event_note AS summary,
        created_at AS started_at,
        NULL AS resolved_at,
        'open' AS status,
        CASE
          WHEN event_type = 'BLOCKED' THEN 'critical'
          ELSE 'high'
        END AS severity
      FROM salon_audit
      WHERE event_type IN ('BLOCKED')
        AND created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
      ORDER BY created_at DESC
      LIMIT 5
    `);

    healthData.incidents = incidents.map(inc => ({
      id: inc.id,
      title: inc.title,
      summary: inc.summary || 'System incident detected',
      started_at: inc.started_at,
      resolved_at: inc.resolved_at,
      status: inc.status,
      severity: inc.severity
    }));

    // AWS S3 health check
    if (isS3Configured()) {
      try {
        const s3Start = Date.now();
        const command = new HeadBucketCommand({ Bucket: BUCKET_NAME });
        await s3Client.send(command);
        const s3Latency = Date.now() - s3Start;

        // Add S3 info to healthData (optional, for extended monitoring)
        healthData.s3_status = {
          accessible: true,
          latency_ms: s3Latency,
          bucket: BUCKET_NAME
        };
      } catch (s3Err) {
        console.error('S3 health check error:', s3Err);
        healthData.recent_errors.push({
          id: Date.now(),
          service: 's3',
          message: `S3 bucket ${BUCKET_NAME} not accessible: ${s3Err.message}`,
          timestamp: new Date().toISOString(),
          severity: 'warn'
        });
      }
    }

  } catch (err) {
    console.error('System health check error:', err);
    healthData.last_down = new Date().toISOString();
    healthData.uptime_percent = 0;

    // Add critical error to recent errors
    healthData.recent_errors.unshift({
      id: Date.now(),
      service: 'database',
      message: err.message,
      timestamp: new Date().toISOString(),
      severity: 'critical'
    });
  }

  return healthData;
};

/**
 * Get platform uptime and performance metrics
 */
exports.getPlatformReliability = async () => {
  try {
    // Calculate database uptime by checking oldest connection
    const [uptimeData] = await db.query(`
      SELECT
        MIN(created_at) AS oldest_record,
        MAX(created_at) AS latest_record,
        TIMESTAMPDIFF(SECOND, MIN(created_at), NOW()) AS uptime_seconds
      FROM salon_audit
    `);

    // Get success vs failure rates
    const [activityMetrics] = await db.query(`
      SELECT
        DATE(created_at) AS date,
        COUNT(*) AS total_events,
        SUM(CASE WHEN event_type = 'APPROVED' THEN 1 ELSE 0 END) AS successful_events,
        SUM(CASE WHEN event_type IN ('REJECTED', 'BLOCKED') THEN 1 ELSE 0 END) AS failed_events
      FROM salon_audit
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    // Get API performance indicators
    const [performanceMetrics] = await db.query(`
      SELECT
        COUNT(*) AS total_appointments,
        AVG(TIMESTAMPDIFF(SECOND, created_at, updated_at)) AS avg_processing_time_sec,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) AS cancelled
      FROM appointments
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);

    // Calculate success rate
    const [overallMetrics] = await db.query(`
      SELECT
        COUNT(*) AS total_events,
        SUM(CASE WHEN event_type = 'APPROVED' THEN 1 ELSE 0 END) AS success_count,
        SUM(CASE WHEN event_type IN ('REJECTED', 'BLOCKED') THEN 1 ELSE 0 END) AS failure_count
      FROM salon_audit
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);

    const totalEvents = overallMetrics[0]?.total_events || 0;
    const successCount = overallMetrics[0]?.success_count || 0;
    const successRate = totalEvents > 0 ? ((successCount / totalEvents) * 100).toFixed(2) : 100;

    // Calculate uptime percentage (assume 99.9% if no failures)
    const failureCount = overallMetrics[0]?.failure_count || 0;
    const uptimePercentage = totalEvents > 0
      ? (((totalEvents - failureCount) / totalEvents) * 100).toFixed(3)
      : '99.999';

    return {
      uptime: {
        uptime_percentage: parseFloat(uptimePercentage),
        uptime_seconds: uptimeData[0]?.uptime_seconds || 0,
        uptime_days: Math.floor((uptimeData[0]?.uptime_seconds || 0) / 86400),
        oldest_record: uptimeData[0]?.oldest_record,
        latest_record: uptimeData[0]?.latest_record
      },
      reliability: {
        success_rate_30d: parseFloat(successRate),
        total_events_30d: totalEvents,
        successful_events: successCount,
        failed_events: failureCount
      },
      performance: {
        avg_appointment_processing_time_sec: Math.round(performanceMetrics[0]?.avg_processing_time_sec || 0),
        total_appointments_7d: performanceMetrics[0]?.total_appointments || 0,
        completed_appointments_7d: performanceMetrics[0]?.completed || 0,
        cancelled_appointments_7d: performanceMetrics[0]?.cancelled || 0,
        completion_rate_7d: performanceMetrics[0]?.total_appointments > 0
          ? ((performanceMetrics[0]?.completed / performanceMetrics[0]?.total_appointments) * 100).toFixed(2)
          : 0
      },
      daily_activity: activityMetrics
    };
  } catch (err) {
    console.error('Platform reliability error:', err);
    throw new Error(`Failed to get platform reliability metrics: ${err.message}`);
  }
};

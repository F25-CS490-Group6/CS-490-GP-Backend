//admins/controller.js
const adminService = require("./service");

exports.getUserEngagement = async (req, res) => {
  try {
    const stats = await adminService.getUserEngagement();
    res.json(stats);
  } catch (err) {
    console.error("Engagement error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getAppointmentTrends = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const trends = await adminService.getAppointmentTrends(start_date || null, end_date || null);
    res.json(trends);
  } catch (err) {
    console.error("Trends error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getSalonRevenues = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const revenues = await adminService.getSalonRevenues(start_date || null, end_date || null);
    res.json(revenues);
  } catch (err) {
    console.error("Revenues error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getLoyaltyUsage = async (req, res) => {
  try {
    const usage = await adminService.getLoyaltyUsage();
    res.json(usage);
  } catch (err) {
    console.error("Loyalty error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getUserDemographics = async (req, res) => {
  try {
    const demographics = await adminService.getUserDemographics();
    res.json(demographics);
  } catch (err) {
    console.error("Demographics error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getCustomerRetention = async (req, res) => {
  try {
    const retention = await adminService.getCustomerRetention();
    res.json(retention);
  } catch (err) {
    console.error("Retention error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getReports = async (req, res) => {
  try {
    const { start_date, end_date, format } = req.query;
    const reports = await adminService.getReports(start_date || null, end_date || null);
    
    if (format === 'csv') {
      const csv = adminService.convertReportsToCSV(reports);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="reports-${Date.now()}.csv"`);
      res.send(csv);
    } else {
      res.json(reports);
    }
  } catch (err) {
    console.error("Reports error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getSystemLogs = async (req, res) => {
  try {
    const logs = await adminService.getSystemLogs();
    res.json(logs);
  } catch (err) {
    console.error("Logs error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get pending salon registrations
 * GET /api/admins/pending-salons
 */
exports.getPendingSalons = async (req, res) => {
  try {
    const salons = await adminService.getPendingSalons();
    res.json({ salons, count: salons.length });
  } catch (err) {
    console.error("Get pending salons error:", err);
    res.status(500).json({ error: err.message || "Failed to get pending salons" });
  }
};

/**
 * Verify salon registration (approve/reject)
 * POST /api/admins/verify/:salon_id
 * Body: { approved: 'approved' | 'rejected' | 'pending' }
 * 
 * As an admin, I want to verify salon registrations so that only legitimate businesses are listed.
 */
exports.verifySalonRegistration = async (req, res) => {
  try {
    const salonId = req.params.salon_id || req.params.sid;
    const { approved } = req.body;
    const adminUserId = req.user?.user_id || req.user?.id;

    if (!salonId) {
      return res.status(400).json({ error: "Salon ID is required" });
    }

    // Default to 'approved' if not specified
    const approvalStatus = approved?.toLowerCase() || 'approved';

    const result = await adminService.updateSalonRegistration(
      parseInt(salonId, 10),
      approvalStatus,
      adminUserId
    );

    res.status(200).json(result);
  } catch (err) {
    console.error("Verify salon registration error:", err);

    if (err.message === "Salon not found") {
      return res.status(404).json({ error: err.message });
    }

    if (err.message.includes("Invalid approval status")) {
      return res.status(400).json({ error: err.message });
    }

    res.status(500).json({ error: err.message || "Failed to verify salon registration" });
  }
};

/**
 * Get comprehensive system health metrics
 * GET /api/admins/health
 */
exports.getSystemHealth = async (req, res) => {
  try {
    const health = await adminService.getSystemHealth();

    // Set HTTP status based on health status
    const statusCode = health.status === 'healthy' ? 200 :
                       health.status === 'degraded' ? 200 :
                       503;

    res.status(statusCode).json(health);
  } catch (err) {
    console.error("System health error:", err);
    res.status(500).json({
      status: 'error',
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Get platform uptime and reliability metrics
 * GET /api/admins/platform-reliability
 */
exports.getPlatformReliability = async (req, res) => {
  try {
    const metrics = await adminService.getPlatformReliability();
    res.json(metrics);
  } catch (err) {
    console.error("Platform reliability error:", err);
    res.status(500).json({ error: err.message });
  }
};


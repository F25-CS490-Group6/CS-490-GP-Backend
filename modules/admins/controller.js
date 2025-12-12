const adminService = require("./service");

exports.getUserEngagement = async (req, res) => {
  try {
    const engagement = await adminService.getUserEngagement();
    res.json({ engagement });
  } catch (err) {
    console.error("Get user engagement error:", err);
    res.status(500).json({ error: "Failed to get engagement" });
  }
};

exports.getAppointmentTrends = async (req, res) => {
  try {
    const trends = await adminService.getAppointmentTrends();
    res.json({ trends });
  } catch (err) {
    console.error("Get appointment trends error:", err);
    res.status(500).json({ error: "Failed to get trends" });
  }
};

exports.getSalonRevenues = async (req, res) => {
  try {
    const revenues = await adminService.getSalonRevenues();
    res.json({ revenues });
  } catch (err) {
    console.error("Get salon revenues error:", err);
    res.status(500).json({ error: "Failed to get revenues" });
  }
};

exports.getLoyaltyUsage = async (req, res) => {
  try {
    const loyalty = await adminService.getLoyaltyUsage();
    res.json({ loyalty });
  } catch (err) {
    console.error("Get loyalty usage error:", err);
    res.status(500).json({ error: "Failed to get loyalty usage" });
  }
};

exports.getUserDemographics = async (req, res) => {
  try {
    const demographics = await adminService.getUserDemographics();
    res.json({ demographics });
  } catch (err) {
    console.error("Get user demographics error:", err);
    res.status(500).json({ error: "Failed to get demographics" });
  }
};

exports.getCustomerRetention = async (req, res) => {
  try {
    const retention = await adminService.getCustomerRetention();
    res.json({ retention });
  } catch (err) {
    console.error("Get customer retention error:", err);
    res.status(500).json({ error: "Failed to get retention" });
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
      res.json({ reports });
    }
  } catch (err) {
    console.error("Get reports error:", err);
    res.status(500).json({ error: "Failed to get reports" });
  }
};

exports.getSystemLogs = async (req, res) => {
  try {
    const logs = await adminService.getSystemLogs();
    res.json({ logs });
  } catch (err) {
    console.error("Get system logs error:", err);
    res.status(500).json({ error: "Failed to get logs" });
  }
};

exports.getPendingSalons = async (req, res) => {
  try {
    const { salons, count } = await adminService.getPendingSalons();
    res.json({ salons, count });
  } catch (err) {
    console.error("Get pending salons error:", err);
    res.status(500).json({ error: "Failed to get pending salons" });
  }
};

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

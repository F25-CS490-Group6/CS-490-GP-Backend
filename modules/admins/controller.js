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
    const reports = await adminService.getReports();
    res.json({ reports });
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
    const adminUserId = req.user?.user_id;
    const result = await adminService.updateSalonRegistration(salonId, approved, adminUserId);
    res.json(result);
  } catch (err) {
    console.error("Verify salon error:", err);
    res.status(500).json({ error: err.message || "Failed to verify salon" });
  }
};

// System health (uptime/errors) - mock for now
exports.getSystemHealth = async (req, res) => {
  try {
    const data = await adminService.getSystemHealth();
    res.json(data);
  } catch (err) {
    console.error("Get system health error:", err);
    res.status(500).json({ error: err.message || "Failed to fetch system health" });
  }
};

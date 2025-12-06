//history/controller.js
const historyService = require("./service");

exports.getUserHistory = async (req, res) => {
  try {
    const user_id = req.user?.user_id;

    if (!user_id) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const appointments = await historyService.getUserHistory(user_id);
    res.json(appointments);
  } catch (err) {
    console.error("History error:", err);
    res.status(500).json({ error: err.message || "Failed to get user history" });
  }
};

exports.getSalonVisitHistory = async (req, res) => {
  try {
    const salon_id = req.params.salon_id;
    const visits = await historyService.getSalonVisitHistory(salon_id);
    res.json({ visits });
  } catch (err) {
    console.error("Visit history error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Export user visit history to CSV
 * GET /api/history/user/export?format=csv
 */
exports.exportUserHistory = async (req, res) => {
  try {
    const user_id = req.user?.user_id;
    const format = req.query.format || 'csv';

    if (!user_id) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const appointments = await historyService.getUserHistory(user_id);
    
    if (format === 'csv') {
      // Convert to CSV
      const csv = historyService.convertToCSV(appointments);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="visit-history-${Date.now()}.csv"`);
      res.send(csv);
    } else {
      res.json(appointments);
    }
  } catch (err) {
    console.error("Export history error:", err);
    res.status(500).json({ error: err.message || "Failed to export history" });
  }
};


//notifications/controller.js
const notificationService = require("./service");

exports.sendAppointmentReminder = async (req, res) => {
  try {
    const { user_id, message, scheduled_for } = req.body;
    await notificationService.sendAppointmentReminder(user_id, message, scheduled_for);
    res.json({ message: "Reminder scheduled" });
  } catch (err) {
    console.error("Reminder error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Manually process the notification queue
 * Useful for testing and manual triggers
 */
exports.processQueue = async (req, res) => {
  try {
    const processed = await notificationService.processNotificationQueue();
    res.json({ 
      message: "Queue processed successfully", 
      processed_count: processed 
    });
  } catch (err) {
    console.error("Queue processing error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.sendPromotionalOffer = async (req, res) => {
  try {
    const { user_ids, message, scheduled_for } = req.body;
    await notificationService.sendPromotionalOffer(user_ids, message, scheduled_for);
    res.json({ message: "Offers queued" });
  } catch (err) {
    console.error("Promo error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.notifyClientDelay = async (req, res) => {
  try {
    const { user_id, message } = req.body;
    await notificationService.notifyClientDelay(user_id, message);
    res.json({ message: "Client notified" });
  } catch (err) {
    console.error("Delay error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.notifyUserDiscount = async (req, res) => {
  try {
    const { user_id, message } = req.body;
    await notificationService.notifyUserDiscount(user_id, message);
    res.json({ message: "Discount sent" });
  } catch (err) {
    console.error("Discount error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getUserNotifications = async (req, res) => {
  try {
    const user_id = req.user?.user_id || req.user?.id;
    
    if (!user_id) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    
    console.log('Fetching notifications for user_id:', user_id);
    const notifications = await notificationService.getUserNotifications(user_id);
    console.log('Found notifications:', notifications.length);
    res.json(notifications);
  } catch (err) {
    console.error("Get notifications error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    const notification_id = req.params.id;
    const user_id = req.user?.user_id || req.user?.id;
    
    if (!user_id) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    
    await notificationService.markNotificationRead(notification_id, user_id);
    res.json({ message: "Notification marked as read" });
  } catch (err) {
    console.error("Mark notification read error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.markAllNotificationsRead = async (req, res) => {
  try {
    const user_id = req.user?.user_id || req.user?.id;
    
    if (!user_id) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    
    await notificationService.markAllNotificationsRead(user_id);
    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    console.error("Mark all read error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get loyal customers for a salon
 * POST /api/notifications/loyal-customers
 * Body: { salon_id, min_visits?, min_spent? }
 */
exports.getLoyalCustomers = async (req, res) => {
  try {
    const userId = req.user?.user_id || req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { salon_id, min_visits, min_spent } = req.body;
    if (!salon_id) {
      return res.status(400).json({ error: "Salon ID is required" });
    }

    // Verify ownership
    const { db } = require("../../config/database");
    const [salons] = await db.query(
      "SELECT owner_id FROM salons WHERE salon_id = ?",
      [salon_id]
    );

    if (!salons || salons.length === 0) {
      return res.status(404).json({ error: "Salon not found" });
    }

    if (salons[0].owner_id !== userId && req.user?.user_role !== 'admin') {
      return res.status(403).json({ error: "Not authorized to view customers for this salon" });
    }

    const customers = await notificationService.getLoyalCustomers(
      salon_id,
      min_visits || 2,
      min_spent || 100
    );

    res.json({ customers });
  } catch (err) {
    console.error("Get loyal customers error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Send promotional offer to selected customers
 * POST /api/notifications/send-promotion
 * Body: { salon_id, user_ids[], message }
 */
exports.sendPromotionToCustomers = async (req, res) => {
  try {
    const userId = req.user?.user_id || req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { salon_id, user_ids, message } = req.body;
    
    if (!salon_id || !user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
      return res.status(400).json({ error: "Salon ID, user_ids array, and message are required" });
    }

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: "Message cannot be empty" });
    }

    // Verify ownership and get salon name
    const { db } = require("../../config/database");
    const [salons] = await db.query(
      "SELECT owner_id, name FROM salons WHERE salon_id = ?",
      [salon_id]
    );

    if (!salons || salons.length === 0) {
      return res.status(404).json({ error: "Salon not found" });
    }

    if (salons[0].owner_id !== userId && req.user?.user_role !== 'admin') {
      return res.status(403).json({ error: "Not authorized to send promotions for this salon" });
    }

    // Prepend salon name to message so customers know who sent it
    const salonName = salons[0].name;
    const fullMessage = `[${salonName}] ${message}`;

    // Send notifications
    const notificationIds = await notificationService.sendPromotionalOfferNotification(
      user_ids,
      fullMessage
    );

    res.json({ 
      message: `Promotional offer sent to ${user_ids.length} customer(s)`,
      notification_count: notificationIds.length
    });
  } catch (err) {
    console.error("Send promotion error:", err);
    res.status(500).json({ error: err.message });
  }
};


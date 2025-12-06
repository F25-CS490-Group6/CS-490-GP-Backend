//notifications/service.js
const { db } = require("../../config/database");

exports.sendAppointmentReminder = async (user_id, message, scheduled_for) => {
  const [result] = await db.query(
    `INSERT INTO notification_queue (user_id, message, delivery_method, scheduled_for, sent)
     VALUES (?, ?, 'email', ?, FALSE)`,
    [user_id, message, scheduled_for]
  );
  return result.insertId;
};

exports.sendPromotionalOffer = async (user_ids, message, scheduled_for) => {
  const results = [];
  for (let i = 0; i < user_ids.length; i++) {
    const user_id = user_ids[i];
    const [result] = await db.query(
      `INSERT INTO notification_queue (user_id, message, delivery_method, scheduled_for, sent)
       VALUES (?, ?, 'push', ?, FALSE)`,
      [user_id, message, scheduled_for]
    );
    results.push(result.insertId);
  }
  return results;
};

exports.notifyClientDelay = async (user_id, message) => {
  const [result] = await db.query(
    `INSERT INTO notification_queue (user_id, message, delivery_method, scheduled_for, sent)
     VALUES (?, ?, 'sms', NOW(), FALSE)`,
    [user_id, message]
  );
  return result.insertId;
};

exports.notifyUserDiscount = async (user_id, message) => {
  const [result] = await db.query(
    `INSERT INTO notification_queue (user_id, message, delivery_method, scheduled_for, sent)
     VALUES (?, ?, 'email', NOW(), FALSE)`,
    [user_id, message]
  );
  return result.insertId;
};

exports.getUserNotifications = async (user_id) => {
  const [notifications] = await db.query(
    `SELECT 
      notification_id,
      user_id,
      type,
      message,
      read_status,
      created_at
    FROM notifications 
    WHERE user_id = ? 
    ORDER BY created_at DESC
    LIMIT 50`,
    [user_id]
  );
  
  // Convert read_status from 0/1 to boolean
  return notifications.map(notif => ({
    ...notif,
    read_status: Boolean(notif.read_status)
  }));
};

exports.markNotificationRead = async (notification_id, user_id) => {
  const [result] = await db.query(
    `UPDATE notifications SET read_status = 1 WHERE notification_id = ? AND user_id = ?`,
    [notification_id, user_id]
  );
  return result.affectedRows > 0;
};

exports.markAllNotificationsRead = async (user_id) => {
  const [result] = await db.query(
    `UPDATE notifications SET read_status = 1 WHERE user_id = ?`,
    [user_id]
  );
  return result.affectedRows;
};

/**
 * Create an in-app notification
 * @param {number} user_id - The user to notify
 * @param {string} type - Notification type (e.g., 'appointment', 'reminder', 'update', 'promotion')
 * @param {string} message - The notification message
 * @returns {Promise<number>} The notification_id of the created notification
 */
exports.createNotification = async (user_id, type, message) => {
  const [result] = await db.query(
    `INSERT INTO notifications (user_id, type, message, read_status, created_at)
     VALUES (?, ?, ?, 0, NOW())`,
    [user_id, type, message]
  );
  return result.insertId;
};

/**
 * Create notifications for multiple users
 * @param {number[]} user_ids - Array of user IDs to notify
 * @param {string} type - Notification type
 * @param {string} message - The notification message
 * @returns {Promise<number[]>} Array of notification_ids
 */
exports.createNotificationsForUsers = async (user_ids, type, message) => {
  if (!Array.isArray(user_ids) || user_ids.length === 0) {
    return [];
  }
  
  const values = user_ids.map(user_id => [user_id, type, message, 0]);
  const placeholders = values.map(() => '(?, ?, ?, 0, NOW())').join(', ');
  const flatValues = values.flat();
  
  const [result] = await db.query(
    `INSERT INTO notifications (user_id, type, message, read_status, created_at)
     VALUES ${placeholders}`,
    flatValues
  );
  
  // Return array of inserted IDs
  const notificationIds = [];
  for (let i = 0; i < user_ids.length; i++) {
    notificationIds.push(result.insertId + i);
  }
  return notificationIds;
};

/**
 * Schedule an in-app notification reminder
 * @param {number} user_id - The user to notify
 * @param {string} message - The notification message
 * @param {Date} scheduled_for - When to send the notification
 * @returns {Promise<number>} The queue_id of the scheduled notification
 */
exports.scheduleInAppReminder = async (user_id, message, scheduled_for) => {
  const [result] = await db.query(
    `INSERT INTO notification_queue (user_id, message, delivery_method, scheduled_for, sent)
     VALUES (?, ?, 'in-app', ?, FALSE)`,
    [user_id, message, scheduled_for]
  );
  return result.insertId;
};

/**
 * Cancel scheduled reminders for a user that match a message pattern
 * Used when appointments are updated or cancelled
 * @param {number} user_id - The user ID
 * @param {string} messagePattern - Pattern to match in the message (e.g., appointment ID or salon name)
 * @returns {Promise<number>} Number of cancelled reminders
 */
exports.cancelScheduledReminders = async (user_id, messagePattern) => {
  const [result] = await db.query(
    `UPDATE notification_queue 
     SET sent = TRUE 
     WHERE user_id = ? 
     AND message LIKE ? 
     AND sent = FALSE 
     AND scheduled_for > NOW()`,
    [user_id, `%${messagePattern}%`]
  );
  return result.affectedRows;
};


//messages/service.js
const { db } = require("../../config/database");

/**
 * Send a message from salon owner to customer
 */
exports.sendMessage = async (salonId, fromUserId, toUserId, message) => {
  const [result] = await db.query(
    `INSERT INTO messages (salon_id, from_user_id, to_user_id, message, read_status, created_at)
     VALUES (?, ?, ?, ?, FALSE, NOW())`,
    [salonId, fromUserId, toUserId, message]
  );
  return result.insertId;
};

/**
 * Get messages for a salon owner (all conversations)
 */
exports.getSalonMessages = async (salonId, userId) => {
  const [messages] = await db.query(
    `SELECT 
      m.message_id,
      m.salon_id,
      m.from_user_id,
      m.to_user_id,
      m.message,
      m.read_status,
      m.created_at,
      u1.full_name as from_user_name,
      u2.full_name as to_user_name
    FROM messages m
    JOIN users u1 ON m.from_user_id = u1.user_id
    JOIN users u2 ON m.to_user_id = u2.user_id
    WHERE m.salon_id = ? AND (m.from_user_id = ? OR m.to_user_id = ?)
    ORDER BY m.created_at DESC`,
    [salonId, userId, userId]
  );
  
  return messages.map(msg => ({
    ...msg,
    read_status: Boolean(msg.read_status)
  }));
};

/**
 * Get conversation between salon owner and a specific customer
 */
exports.getConversation = async (salonId, ownerId, customerId) => {
  const [messages] = await db.query(
    `SELECT 
      m.message_id,
      m.salon_id,
      m.from_user_id,
      m.to_user_id,
      m.message,
      m.read_status,
      m.created_at,
      u1.full_name as from_user_name,
      u2.full_name as to_user_name
    FROM messages m
    JOIN users u1 ON m.from_user_id = u1.user_id
    JOIN users u2 ON m.to_user_id = u2.user_id
    WHERE m.salon_id = ? 
      AND ((m.from_user_id = ? AND m.to_user_id = ?) 
        OR (m.from_user_id = ? AND m.to_user_id = ?))
    ORDER BY m.created_at ASC`,
    [salonId, ownerId, customerId, customerId, ownerId]
  );
  
  return messages.map(msg => ({
    ...msg,
    read_status: Boolean(msg.read_status)
  }));
};

/**
 * Get list of customers that salon owner has messaged
 */
exports.getSalonCustomers = async (salonId, ownerId) => {
  const [customers] = await db.query(
    `SELECT DISTINCT
      CASE 
        WHEN m.from_user_id = ? THEN m.to_user_id
        ELSE m.from_user_id
      END as user_id,
      u.full_name,
      u.email,
      u.phone,
      (SELECT message FROM messages m2 
       WHERE (m2.from_user_id = ? AND m2.to_user_id = CASE WHEN m.from_user_id = ? THEN m.to_user_id ELSE m.from_user_id END)
          OR (m2.to_user_id = ? AND m2.from_user_id = CASE WHEN m.from_user_id = ? THEN m.to_user_id ELSE m.from_user_id END)
       ORDER BY m2.created_at DESC LIMIT 1) as last_message,
      (SELECT created_at FROM messages m2 
       WHERE (m2.from_user_id = ? AND m2.to_user_id = CASE WHEN m.from_user_id = ? THEN m.to_user_id ELSE m.from_user_id END)
          OR (m2.to_user_id = ? AND m2.from_user_id = CASE WHEN m.from_user_id = ? THEN m.to_user_id ELSE m.from_user_id END)
       ORDER BY m2.created_at DESC LIMIT 1) as last_message_time,
      (SELECT COUNT(*) FROM messages m3 
       WHERE m3.to_user_id = ? 
         AND m3.from_user_id = CASE WHEN m.from_user_id = ? THEN m.to_user_id ELSE m.from_user_id END
         AND m3.read_status = FALSE) as unread_count
    FROM messages m
    JOIN users u ON (CASE WHEN m.from_user_id = ? THEN m.to_user_id ELSE m.from_user_id END = u.user_id)
    WHERE m.salon_id = ? AND (m.from_user_id = ? OR m.to_user_id = ?)
    GROUP BY user_id, u.full_name, u.email, u.phone
    ORDER BY last_message_time DESC`,
    [ownerId, ownerId, ownerId, ownerId, ownerId, ownerId, ownerId, ownerId, ownerId, ownerId, salonId, ownerId, ownerId]
  );
  
  return customers;
};

/**
 * Mark messages as read
 */
exports.markMessagesAsRead = async (salonId, fromUserId, toUserId) => {
  const [result] = await db.query(
    `UPDATE messages 
     SET read_status = TRUE 
     WHERE salon_id = ? AND from_user_id = ? AND to_user_id = ? AND read_status = FALSE`,
    [salonId, fromUserId, toUserId]
  );
  return result.affectedRows;
};


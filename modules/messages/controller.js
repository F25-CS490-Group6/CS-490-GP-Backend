//messages/controller.js
const messageService = require("./service");
const { db } = require("../../config/database");

/**
 * POST /api/messages
 * Send a message - can be from salon owner to customer OR customer to salon owner
 */
exports.sendMessage = async (req, res) => {
  try {
    const { salon_id, to_user_id, message } = req.body;
    const from_user_id = req.user?.user_id;

    if (!from_user_id) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (!salon_id || !to_user_id || !message) {
      return res.status(400).json({ error: "Salon ID, recipient ID, and message are required" });
    }

    // Verify salon exists
    const [salons] = await db.query(
      "SELECT owner_id FROM salons WHERE salon_id = ?",
      [salon_id]
    );

    if (!salons || salons.length === 0) {
      return res.status(404).json({ error: "Salon not found" });
    }

    const salonOwnerId = salons[0].owner_id;

    // Allow messages if:
    // 1. User is the salon owner messaging a customer
    // 2. User is a customer messaging the salon owner
    // 3. User is an admin
    const isSalonOwner = salonOwnerId === from_user_id;
    const isCustomerMessagingOwner = to_user_id === salonOwnerId && from_user_id !== salonOwnerId;
    const isAdmin = req.user?.user_role === 'admin';

    if (!isSalonOwner && !isCustomerMessagingOwner && !isAdmin) {
      return res.status(403).json({ error: "Not authorized to send messages for this salon" });
    }

    const messageId = await messageService.sendMessage(salon_id, from_user_id, to_user_id, message);
    res.json({ message: "Message sent successfully", message_id: messageId });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
};

/**
 * GET /api/messages/salon/:salon_id
 * Get all messages for a salon
 */
exports.getSalonMessages = async (req, res) => {
  try {
    const { salon_id } = req.params;
    const userId = req.user?.user_id;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Verify ownership
    const [salons] = await db.query(
      "SELECT owner_id FROM salons WHERE salon_id = ?",
      [salon_id]
    );

    if (!salons || salons.length === 0) {
      return res.status(404).json({ error: "Salon not found" });
    }

    if (salons[0].owner_id !== userId && req.user?.user_role !== 'admin') {
      return res.status(403).json({ error: "Not authorized to view messages for this salon" });
    }

    const messages = await messageService.getSalonMessages(salon_id, userId);
    res.json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

/**
 * GET /api/messages/salon/:salon_id/customers
 * Get list of customers that salon owner has messaged
 */
exports.getSalonCustomers = async (req, res) => {
  try {
    const { salon_id } = req.params;
    const userId = req.user?.user_id;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Verify ownership
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

    const customers = await messageService.getSalonCustomers(salon_id, userId);
    res.json({ customers });
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ error: "Failed to fetch customers" });
  }
};

/**
 * GET /api/messages/salon/:salon_id/conversation/:customer_id
 * Get conversation between salon owner and a specific customer
 */
exports.getConversation = async (req, res) => {
  try {
    const { salon_id, customer_id } = req.params;
    const userId = req.user?.user_id;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Verify ownership
    const [salons] = await db.query(
      "SELECT owner_id FROM salons WHERE salon_id = ?",
      [salon_id]
    );

    if (!salons || salons.length === 0) {
      return res.status(404).json({ error: "Salon not found" });
    }

    if (salons[0].owner_id !== userId && req.user?.user_role !== 'admin') {
      return res.status(403).json({ error: "Not authorized to view conversations for this salon" });
    }

    const messages = await messageService.getConversation(salon_id, userId, customer_id);
    
    // Mark messages as read
    await messageService.markMessagesAsRead(salon_id, customer_id, userId);
    
    res.json({ messages });
  } catch (error) {
    console.error("Error fetching conversation:", error);
    res.status(500).json({ error: "Failed to fetch conversation" });
  }
};


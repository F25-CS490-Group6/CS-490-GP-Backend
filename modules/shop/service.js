//shop/service.js
const { db } = require("../../config/database");

exports.addProduct = async (salon_id, name, category, description, price, stock) => {
  const [result] = await db.query(
    `INSERT INTO products (salon_id, name, category, description, price, stock, is_active)
     VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
    [salon_id, name, category, description, price, stock]
  );
  return result.insertId;
};

exports.updateProduct = async (product_id, name, category, description, price, stock, is_active) => {
  await db.query(
    `UPDATE products SET name=?, category=?, description=?, price=?, stock=?, is_active=? WHERE product_id=?`,
    [name, category, description, price, stock, is_active, product_id]
  );
};

exports.getSalonProducts = async (salon_id) => {
  const [rows] = await db.query(
    `SELECT * FROM products WHERE salon_id=? AND is_active=TRUE`,
    [salon_id]
  );
  return rows;
};

exports.getProductById = async (product_id) => {
  const [rows] = await db.query(
    `SELECT * FROM products WHERE product_id=? AND is_active=TRUE`,
    [product_id]
  );
  return rows.length > 0 ? rows[0] : null;
};

exports.getOrCreateCart = async (user_id, salon_id) => {
  // First, check for any pending_payment carts and reset them (clear items and set to active)
  const [pendingCarts] = await db.query(
    `SELECT cart_id FROM carts WHERE user_id=? AND salon_id=? AND status='pending_payment'`,
    [user_id, salon_id]
  );
  
  for (const cart of pendingCarts) {
    // Clear items from cancelled checkout carts
    await db.query(`DELETE FROM cart_items WHERE cart_id = ?`, [cart.cart_id]);
    // Reset status to active
    await db.query(`UPDATE carts SET status = 'active' WHERE cart_id = ?`, [cart.cart_id]);
  }

  // Clean up any active carts that have old/invalid items before getting or creating
  const [activeCarts] = await db.query(
    `SELECT cart_id FROM carts WHERE user_id=? AND salon_id=? AND status='active'`,
    [user_id, salon_id]
  );
  
  for (const cart of activeCarts) {
    // Delete cart items for past/completed appointments
    await db.query(
      `DELETE ci FROM cart_items ci
       WHERE ci.cart_id = ? AND ci.type = 'service' AND ci.notes LIKE 'Appointment #%'
       AND (
         NOT EXISTS (
           SELECT 1 FROM appointments a 
           WHERE a.appointment_id = CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(ci.notes, 'Appointment #', -1), ' ', 1) AS UNSIGNED)
           AND a.status IN ('confirmed', 'pending')
           AND a.scheduled_time > NOW()
         )
       )`,
      [cart.cart_id]
    );
  }

  // Now get or create an active cart (prefer the most recent one if multiple exist)
  const [rows] = await db.query(
    `SELECT * FROM carts WHERE user_id=? AND salon_id=? AND status='active' ORDER BY created_at DESC LIMIT 1`,
    [user_id, salon_id]
  );
  let cart_id;
  if (rows.length > 0) {
    cart_id = rows[0].cart_id;
    // If there are multiple active carts, close the older ones
    if (activeCarts.length > 1) {
      const otherCartIds = activeCarts.filter(c => c.cart_id !== cart_id).map(c => c.cart_id);
      if (otherCartIds.length > 0) {
        await db.query(
          `UPDATE carts SET status='checked_out' WHERE cart_id IN (?)`,
          [otherCartIds]
        );
        await db.query(
          `DELETE FROM cart_items WHERE cart_id IN (?)`,
          [otherCartIds]
        );
      }
    }
  } else {
    const [result] = await db.query(
      `INSERT INTO carts (user_id, salon_id, status) VALUES (?, ?, 'active')`,
      [user_id, salon_id]
    );
    cart_id = result.insertId;
  }
  return cart_id;
};

exports.addToCart = async (cart_id, product_id, quantity, price) => {
  // Check if product already exists in cart
  const [existing] = await db.query(
    `SELECT item_id, quantity FROM cart_items WHERE cart_id=? AND product_id=?`,
    [cart_id, product_id]
  );
  
  if (existing && existing.length > 0) {
    // Update quantity if product already in cart
    const newQuantity = existing[0].quantity + quantity;
    await db.query(
      `UPDATE cart_items SET quantity=?, price=? WHERE item_id=?`,
      [newQuantity, price, existing[0].item_id]
    );
  } else {
    // Add new item to cart
    await db.query(
      `INSERT INTO cart_items (cart_id, product_id, quantity, price, type) VALUES (?, ?, ?, ?, 'product')`,
      [cart_id, product_id, quantity, price]
    );
  }
};

exports.getCart = async (user_id, salon_id) => {
  const [rows] = await db.query(
    `SELECT c.cart_id, ci.item_id, ci.product_id, p.name, ci.quantity, ci.price
     FROM carts c
     JOIN cart_items ci ON c.cart_id=ci.cart_id
     JOIN products p ON ci.product_id=p.product_id
     WHERE c.user_id=? AND c.salon_id=? AND c.status='active'`,
    [user_id, salon_id]
  );
  return rows;
};

// Get product suggestions for cart (all available products in salon)
exports.getProductSuggestions = async (user_id, salon_id, limit = 6) => {
  // Get all available products from the salon (don't exclude products already in cart)
  const query = `
    SELECT 
      product_id,
      name,
      category,
      description,
      price,
      stock
    FROM products
    WHERE salon_id=? AND is_active=1 AND stock > 0
    ORDER BY RAND()
    LIMIT ?
  `;
  
  const [suggestions] = await db.query(query, [salon_id, limit]);
  return suggestions;
};

exports.getCartTotal = async (cart_id) => {
  const [items] = await db.query(
    `SELECT SUM(price*quantity) as total FROM cart_items WHERE cart_id=?`,
    [cart_id]
  );
  if (items[0] && items[0].total) {
    return items[0].total;
  }
  return 0;
};

exports.getCartItems = async (cart_id) => {
  const [cartItems] = await db.query(
    `SELECT * FROM cart_items WHERE cart_id=?`,
    [cart_id]
  );
  return cartItems;
};

exports.createPayment = async (user_id, total, payment_method) => {
  const [result] = await db.query(
    `INSERT INTO payments (user_id, amount, payment_method, payment_status) VALUES (?, ?, ?, 'completed')`,
    [user_id, total, payment_method]
  );
  return result.insertId;
};

exports.createOrder = async (user_id, salon_id, total_amount, payment_id) => {
  const [result] = await db.query(
    `INSERT INTO orders (user_id, salon_id, total_amount, payment_id, payment_status, order_status) VALUES (?, ?, ?, ?, 'paid', 'completed')`,
    [user_id, salon_id, total_amount, payment_id]
  );
  return result.insertId;
};

exports.addOrderItems = async (order_id, cartItems) => {
  for (let i = 0; i < cartItems.length; i++) {
    const item = cartItems[i];
    await db.query(
      `INSERT INTO order_items (order_id, product_id, quantity, price, type) VALUES (?, ?, ?, ?, 'product')`,
      [order_id, item.product_id, item.quantity, item.price]
    );
  }
};

exports.closeCart = async (cart_id) => {
  await db.query(`UPDATE carts SET status='checked_out' WHERE cart_id=?`, [cart_id]);
};

/**
 * Add appointment/service to cart
 */
exports.addAppointmentToCart = async (cart_id, appointment_id, price) => {
  // Check if this appointment is already in the cart
  const [existing] = await db.query(
    `SELECT item_id FROM cart_items 
     WHERE cart_id = ? AND type = 'service' AND notes = ?`,
    [cart_id, `Appointment #${appointment_id}`]
  );

  if (existing && existing.length > 0) {
    // Appointment already in cart, don't add again
    return;
  }

  // Get appointment services
  const [services] = await db.query(
    `SELECT asv.service_id, sv.custom_name, asv.price
     FROM appointment_services asv
     JOIN services sv ON asv.service_id = sv.service_id
     WHERE asv.appointment_id = ?`,
    [appointment_id]
  );

  // Add each service to cart
  for (const service of services) {
    await db.query(
      `INSERT INTO cart_items (cart_id, service_id, quantity, price, type, notes)
       VALUES (?, ?, 1, ?, 'service', ?)`,
      [cart_id, service.service_id, service.price, `Appointment #${appointment_id}`]
    );
  }
};

/**
 * Get unified cart with both products and services
 */
exports.getUnifiedCart = async (user_id, salon_id) => {
  // First, clean up any orphaned cart items (services for appointments that don't exist, are past, completed, or paid for)
  // Extract appointment_id from notes field (format: "Appointment #123")
  // This is an AGGRESSIVE cleanup that checks multiple conditions
  const [deleteResult] = await db.query(
    `DELETE ci FROM cart_items ci
     JOIN carts c ON ci.cart_id = c.cart_id
     WHERE c.user_id = ? AND c.salon_id = ? AND c.status = 'active'
     AND ci.type = 'service'
     AND ci.notes LIKE 'Appointment #%'
     AND (
       -- Appointment doesn't exist or is invalid
       NOT EXISTS (
         SELECT 1 FROM appointments a 
         WHERE a.appointment_id = CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(ci.notes, 'Appointment #', -1), ' ', 1) AS UNSIGNED)
       )
       OR
       -- Appointment is in the past (with 1 minute buffer)
       EXISTS (
         SELECT 1 FROM appointments a 
         WHERE a.appointment_id = CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(ci.notes, 'Appointment #', -1), ' ', 1) AS UNSIGNED)
         AND a.scheduled_time <= DATE_SUB(NOW(), INTERVAL 1 MINUTE)
       )
       OR
       -- Appointment is completed or cancelled
       EXISTS (
         SELECT 1 FROM appointments a 
         WHERE a.appointment_id = CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(ci.notes, 'Appointment #', -1), ' ', 1) AS UNSIGNED)
         AND a.status NOT IN ('confirmed', 'pending')
       )
       OR
       -- Appointment has been paid for (check payments table directly)
       EXISTS (
         SELECT 1 FROM payments p
         WHERE p.appointment_id = CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(ci.notes, 'Appointment #', -1), ' ', 1) AS UNSIGNED)
         AND p.payment_status = 'completed'
       )
     )`,
    [user_id, salon_id]
  );
  console.log(`[Backend Cart] Cleaned up ${deleteResult.affectedRows || 0} invalid/paid/past cart items for user ${user_id}, salon ${salon_id}`);

  // Now get only valid cart items
  // Also exclude appointments that have already been paid for
  const [items] = await db.query(
    `SELECT
      ci.item_id,
      ci.cart_id,
      ci.type,
      ci.quantity,
      ci.price,
      ci.notes,
      CASE
        WHEN ci.type = 'product' THEN p.name
        WHEN ci.type = 'service' THEN s.custom_name
      END as item_name,
      CASE
        WHEN ci.type = 'product' THEN p.description
        WHEN ci.type = 'service' THEN s.description
      END as item_description,
      ci.product_id,
      ci.service_id,
      a.appointment_id,
      a.status as appointment_status,
      a.scheduled_time,
      pay.payment_id as has_payment
     FROM carts c
     JOIN cart_items ci ON c.cart_id = ci.cart_id
     LEFT JOIN products p ON ci.product_id = p.product_id
     LEFT JOIN services s ON ci.service_id = s.service_id
     LEFT JOIN appointments a ON a.appointment_id = CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(ci.notes, 'Appointment #', -1), ' ', 1) AS UNSIGNED)
     LEFT JOIN payments pay ON pay.appointment_id = a.appointment_id AND pay.payment_status = 'completed'
     WHERE c.user_id = ? AND c.salon_id = ? AND c.status = 'active'
     AND (
       ci.type = 'product' 
       OR 
       (ci.type = 'service' 
        AND ci.notes LIKE 'Appointment #%'
        AND a.appointment_id IS NOT NULL 
        AND a.status IN ('confirmed', 'pending') 
        AND a.scheduled_time > NOW()
        AND NOT EXISTS (
          -- Exclude appointments that have been paid for (completed payments linked via payments.appointment_id)
          SELECT 1 FROM payments p 
          WHERE p.appointment_id = a.appointment_id
          AND p.payment_status = 'completed'
        ))  -- Exclude appointments that have been paid for
     )`,
    [user_id, salon_id]
  );
  
  // Log for debugging
  const serviceItems = items.filter(item => item.type === 'service');
  if (serviceItems.length > 0) {
    console.log(`[Backend Cart] getUnifiedCart: Returning ${items.length} items (${serviceItems.length} services, ${items.length - serviceItems.length} products) for user ${user_id}, salon ${salon_id}`);
    // Only log first 5 to avoid spam
    serviceItems.slice(0, 5).forEach(item => {
      console.log(`[Backend Cart] Service item: appointment_id=${item.appointment_id}, status=${item.appointment_status}, scheduled=${item.scheduled_time}, has_payment=${item.has_payment ? 'YES' : 'NO'}`);
    });
    if (serviceItems.length > 5) {
      console.log(`[Backend Cart] ... and ${serviceItems.length - 5} more services`);
    }
  }
  
  return items;
};

/**
 * Remove item from cart
 */
exports.removeFromCart = async (item_id) => {
  await db.query(`DELETE FROM cart_items WHERE item_id = ?`, [item_id]);
};

/**
 * Delete all service items from cart (for fresh start)
 */
exports.deleteAllServiceItems = async (user_id, salon_id) => {
  const [result] = await db.query(
    `DELETE ci FROM cart_items ci
     JOIN carts c ON ci.cart_id = c.cart_id
     WHERE c.user_id = ? AND c.salon_id = ? AND c.status = 'active'
     AND ci.type = 'service'`,
    [user_id, salon_id]
  );
  console.log(`[Backend] Deleted ${result.affectedRows || 0} service items from cart for user ${user_id}, salon ${salon_id}`);
  return result.affectedRows || 0;
};


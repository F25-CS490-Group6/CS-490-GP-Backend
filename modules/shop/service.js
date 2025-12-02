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
  const [rows] = await db.query(
    `SELECT * FROM carts WHERE user_id=? AND salon_id=? AND status='active'`,
    [user_id, salon_id]
  );
  let cart_id;
  if (rows.length > 0) {
    cart_id = rows[0].cart_id;
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

// Get product suggestions for cart (products not already in cart)
exports.getProductSuggestions = async (user_id, salon_id, limit = 6) => {
  // Get products already in cart
  const [cartItems] = await db.query(
    `SELECT ci.product_id
     FROM carts c
     JOIN cart_items ci ON c.cart_id=ci.cart_id
     WHERE c.user_id=? AND c.salon_id=? AND c.status='active'`,
    [user_id, salon_id]
  );
  
  const cartProductIds = cartItems.map(item => item.product_id);
  
  // Build query to exclude products already in cart
  let query = `
    SELECT 
      product_id,
      name,
      category,
      description,
      price,
      stock
    FROM products
    WHERE salon_id=? AND is_active=1 AND stock > 0
  `;
  
  const params = [salon_id];
  
  if (cartProductIds.length > 0) {
    query += ` AND product_id NOT IN (${cartProductIds.map(() => '?').join(',')})`;
    params.push(...cartProductIds);
  }
  
  query += ` ORDER BY RAND() LIMIT ?`;
  params.push(limit);
  
  const [suggestions] = await db.query(query, params);
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


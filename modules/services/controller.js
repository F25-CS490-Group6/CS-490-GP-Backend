const { query, db } = require("../../config/database");

// Create a new service
exports.createService = async (req, res) => {
  try {
    const { salon_id, custom_name, category, duration, price } = req.body;
    const userId = req.user?.user_id || req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Validate required fields (price can be 0, so check for undefined/null)
    if (!salon_id || !custom_name || !category || duration === undefined || duration === null || price === undefined || price === null) {
      return res.status(400).json({ 
        error: "All fields are required",
        received: { salon_id, custom_name, category, duration, price }
      });
    }

    // Validate price is not negative
    if (price < 0) {
      return res.status(400).json({ error: "Price cannot be negative" });
    }

    // Validate duration is positive
    if (duration <= 0) {
      return res.status(400).json({ error: "Duration must be greater than 0" });
    }

    // Verify user has access to this salon (owner or staff)
    const [salonCheck] = await db.query(
      `SELECT owner_id FROM salons WHERE salon_id = ?`,
      [salon_id]
    );

    if (!salonCheck || salonCheck.length === 0) {
      return res.status(404).json({ error: "Salon not found" });
    }

    // Check if user is owner
    const isOwner = salonCheck[0].owner_id === userId;

    // Check if user is staff member of this salon
    let isStaff = false;
    if (!isOwner) {
      const [staffCheck] = await db.query(
        `SELECT staff_id FROM staff WHERE salon_id = ? AND user_id = ? AND is_active = 1`,
        [salon_id, userId]
      );
      isStaff = staffCheck && staffCheck.length > 0;
    }

    if (!isOwner && !isStaff && req.user?.user_role !== 'admin') {
      return res.status(403).json({ error: "Not authorized to add services to this salon" });
    }

    // Get or create category
    const categories = await query(
      'SELECT category_id FROM service_categories WHERE name = ?',
      [category]
    );
    
    let categoryId;
    if (!categories || categories.length === 0) {
      // Find matching main category or use default
      let mainCategoryId = null;
      
      // Try to find a matching main category by name (case-insensitive)
      const [mainCategoryMatch] = await db.query(
        'SELECT main_category_id FROM main_categories WHERE LOWER(name) = LOWER(?) OR LOWER(name) LIKE LOWER(?)',
        [category, `%${category}%`]
      );
      
      if (mainCategoryMatch && mainCategoryMatch.length > 0) {
        mainCategoryId = mainCategoryMatch[0].main_category_id;
      } else {
        // Use "Hair" as default main category (ID 1) if no match found
        const [defaultMain] = await db.query(
          'SELECT main_category_id FROM main_categories WHERE name = "Hair" LIMIT 1'
        );
        mainCategoryId = defaultMain && defaultMain.length > 0 ? defaultMain[0].main_category_id : 1;
      }
      
      const [catResult] = await db.query(
        'INSERT INTO service_categories (name, description, main_category_id) VALUES (?, ?, ?)',
        [category, category, mainCategoryId]
      );
      categoryId = catResult.insertId;
    } else {
      categoryId = categories[0].category_id;
    }

    // Create service
    const [result] = await db.query(
      `INSERT INTO services (salon_id, category_id, custom_name, duration, price, is_active) 
       VALUES (?, ?, ?, ?, ?, TRUE)`,
      [salon_id, categoryId, custom_name, duration, price]
    );

    res.status(201).json({ 
      message: "Service created successfully", 
      service_id: result.insertId 
    });
  } catch (error) {
    console.error("Create service error:", error);
    res.status(500).json({ 
      error: error.message || "Failed to create service",
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Update a service
exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { custom_name, category, duration, price } = req.body;
    const userId = req.user?.user_id;

    // Validate required fields (price can be 0, so check for undefined/null)
    if (!custom_name || !category || duration === undefined || duration === null || price === undefined || price === null) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Validate price is not negative
    if (price < 0) {
      return res.status(400).json({ error: "Price cannot be negative" });
    }

    // Validate duration is positive
    if (duration <= 0) {
      return res.status(400).json({ error: "Duration must be greater than 0" });
    }

    // Get service's salon_id
    const service = await query(
      `SELECT salon_id FROM services WHERE service_id = ?`,
      [id]
    );

    if (!service || service.length === 0) {
      return res.status(404).json({ error: "Service not found" });
    }

    const salon_id = service[0].salon_id;

    // Verify user has access to this salon (owner or staff)
    const [salonCheck] = await db.query(
      `SELECT owner_id FROM salons WHERE salon_id = ?`,
      [salon_id]
    );

    if (!salonCheck || salonCheck.length === 0) {
      return res.status(404).json({ error: "Salon not found" });
    }

    // Check if user is owner
    const isOwner = salonCheck[0].owner_id === userId;

    // Check if user is staff member of this salon
    let isStaff = false;
    if (!isOwner) {
      const [staffCheck] = await db.query(
        `SELECT staff_id FROM staff WHERE salon_id = ? AND user_id = ? AND is_active = 1`,
        [salon_id, userId]
      );
      isStaff = staffCheck && staffCheck.length > 0;
    }

    if (!isOwner && !isStaff && req.user?.user_role !== 'admin') {
      return res.status(403).json({ error: "Not authorized to update services for this salon" });
    }

    // Get or create category
    const categories = await query(
      'SELECT category_id FROM service_categories WHERE name = ?',
      [category]
    );
    
    let categoryId;
    if (!categories || categories.length === 0 || !categories[0]) {
      // Category doesn't exist, create it
      // Find matching main category or use default
      let mainCategoryId = null;
      
      // Try to find a matching main category by name (case-insensitive)
      const [mainCategoryMatch] = await db.query(
        'SELECT main_category_id FROM main_categories WHERE LOWER(name) = LOWER(?) OR LOWER(name) LIKE LOWER(?)',
        [category, `%${category}%`]
      );
      
      if (mainCategoryMatch && mainCategoryMatch.length > 0) {
        mainCategoryId = mainCategoryMatch[0].main_category_id;
      } else {
        // Use "Hair" as default main category (ID 1) if no match found
        const [defaultMain] = await db.query(
          'SELECT main_category_id FROM main_categories WHERE name = "Hair" LIMIT 1'
        );
        mainCategoryId = defaultMain && defaultMain.length > 0 ? defaultMain[0].main_category_id : 1;
      }
      
      const [catResult] = await db.query(
        'INSERT INTO service_categories (name, description, main_category_id) VALUES (?, ?, ?)',
        [category, category, mainCategoryId]
      );
      if (!catResult || !catResult.insertId) {
        throw new Error('Failed to create category: insertId not returned');
      }
      categoryId = catResult.insertId;
    } else {
      // Category exists, use its ID
      if (!categories[0].category_id) {
        throw new Error('Category found but category_id is missing');
      }
      categoryId = categories[0].category_id;
    }

    // Update service
    await query(
      `UPDATE services 
       SET custom_name = ?, category_id = ?, duration = ?, price = ?
       WHERE service_id = ?`,
      [custom_name, categoryId, duration, price, id]
    );

    res.json({ message: "Service updated successfully" });
  } catch (error) {
    console.error("Update service error:", error);
    res.status(500).json({ error: "Failed to update service" });
  }
};

// Delete a service
exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.user_id;

    // Get service's salon_id
    const service = await query(
      `SELECT salon_id FROM services WHERE service_id = ?`,
      [id]
    );

    if (!service || service.length === 0) {
      return res.status(404).json({ error: "Service not found" });
    }

    const salon_id = service[0].salon_id;

    // Verify user has access to this salon (owner or staff)
    const [salonCheck] = await db.query(
      `SELECT owner_id FROM salons WHERE salon_id = ?`,
      [salon_id]
    );

    if (!salonCheck || salonCheck.length === 0) {
      return res.status(404).json({ error: "Salon not found" });
    }

    // Check if user is owner
    const isOwner = salonCheck[0].owner_id === userId;

    // Check if user is staff member of this salon
    let isStaff = false;
    if (!isOwner) {
      const [staffCheck] = await db.query(
        `SELECT staff_id FROM staff WHERE salon_id = ? AND user_id = ? AND is_active = 1`,
        [salon_id, userId]
      );
      isStaff = staffCheck && staffCheck.length > 0;
    }

    if (!isOwner && !isStaff && req.user?.user_role !== 'admin') {
      return res.status(403).json({ error: "Not authorized to delete services for this salon" });
    }

    // Soft delete by setting is_active to false
    await query(
      'UPDATE services SET is_active = FALSE WHERE service_id = ?',
      [id]
    );

    res.json({ message: "Service deleted successfully" });
  } catch (error) {
    console.error("Delete service error:", error);
    res.status(500).json({ error: "Failed to delete service" });
  }
};


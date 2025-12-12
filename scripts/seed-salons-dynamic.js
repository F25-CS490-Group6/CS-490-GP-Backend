const bcrypt = require("bcrypt");
const { db } = require("../config/database");
const fs = require("fs");
const path = require("path");

// ============================================================================
// DYNAMIC SALON SEEDING SCRIPT
// ============================================================================
// Reads salon data from: data/salons-seed-data.json
// To add/modify salons, just edit the JSON file!
// ============================================================================

// Load salon data from JSON
function loadSalonData() {
  const dataPath = path.join(__dirname, "../data/salons-seed-data.json");
  
  if (!fs.existsSync(dataPath)) {
    throw new Error(`Data file not found: ${dataPath}`);
  }
  
  const rawData = fs.readFileSync(dataPath, "utf8");
  const data = JSON.parse(rawData);
  
  if (!data.salons || !Array.isArray(data.salons)) {
    throw new Error("Invalid data format: expected 'salons' array");
  }
  
  console.log(`✅ Loaded ${data.salons.length} salons from data file\n`);
  return data.salons;
}

// ============================================================================
// DATABASE SETUP
// ============================================================================

async function setupDatabaseSchema() {
  console.log("🔧 Setting up database schema...\n");

  try {
    // Setup main_categories
    console.log("📝 Setting up main_categories...");
    await db.query(`
      CREATE TABLE IF NOT EXISTS main_categories (
        main_category_id INT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT
      )
    `);
    
    await db.query(`
      INSERT INTO main_categories (main_category_id, name, description) VALUES
      (1, 'Hair', 'Hair services including cuts, color, and treatments'),
      (2, 'Nails', 'Nail services including manicures and pedicures'),
      (3, 'Makeup & Beauty', 'Makeup, skincare, and beauty services'),
      (4, 'Spa & Wellness', 'Spa treatments and wellness services'),
      (5, 'Barber & Grooming', 'Barbering and mens grooming services')
      ON DUPLICATE KEY UPDATE name = VALUES(name)
    `);
    console.log("✅ Main categories ready");

    // Setup service_categories
    console.log("📝 Setting up service_categories...");
    const categories = [
      { name: "Haircuts", desc: "Haircuts and styling", main: 1 },
      { name: "Hair Color", desc: "Hair coloring and highlights", main: 1 },
      { name: "Hair Treatments", desc: "Hair treatments and conditioning", main: 1 },
      { name: "Manicure", desc: "Manicure services", main: 2 },
      { name: "Pedicure", desc: "Pedicure services", main: 2 },
      { name: "Nails", desc: "General nail services", main: 2 },
      { name: "Basic Facials", desc: "Facial treatments", main: 3 },
      { name: "Makeup", desc: "Makeup application", main: 3 },
      { name: "Eyebrows", desc: "Eyebrow services", main: 3 },
      { name: "Beard Trim", desc: "Beard trimming and grooming", main: 5 },
      { name: "Beard & Grooming", desc: "Beard and grooming services", main: 5 },
    ];

    for (const cat of categories) {
      await db.query(
        `INSERT INTO service_categories (name, description, main_category_id) 
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE description = VALUES(description)`,
        [cat.name, cat.desc, cat.main]
      );
    }
    console.log("✅ Service categories ready\n");

    return true;
  } catch (error) {
    console.error("❌ Error setting up schema:", error.message);
    return false;
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function createOwner(ownerData) {
  const { full_name, email, password, phone } = ownerData;

  // Check if user already exists
  const [existing] = await db.query("SELECT user_id FROM users WHERE email = ?", [email]);
  if (existing.length > 0) {
    console.log(`   ⚠️  Owner ${email} already exists (ID: ${existing[0].user_id})`);
    return existing[0].user_id;
  }

  const [userResult] = await db.query(
    "INSERT INTO users (full_name, phone, email, user_role) VALUES (?, ?, ?, ?)",
    [full_name, phone, email, "owner"]
  );
  const userId = userResult.insertId;

  const hash = await bcrypt.hash(password, 10);
  await db.query(
    "INSERT INTO auth (user_id, email, password_hash) VALUES (?, ?, ?)",
    [userId, email, hash]
  );

  return userId;
}

async function createSalon(ownerId, salonData) {
  const { salon_name, address, city, state, zip, country, phone, email, description, website, profile_picture } = salonData;

  // Check if salon already exists
  const [existing] = await db.query(
    "SELECT salon_id FROM salons WHERE owner_id = ? AND salon_name = ?",
    [ownerId, salon_name]
  );
  if (existing.length > 0) {
    console.log(`   ⚠️  Salon "${salon_name}" already exists (ID: ${existing[0].salon_id})`);
    return existing[0].salon_id;
  }

  const [result] = await db.query(
    `INSERT INTO salons (owner_id, name, salon_name, address, city, state, zip, country, phone, email, description, website, profile_picture, status, approved)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', 'approved')`,
    [ownerId, salon_name, salon_name, address, city, state, zip, country, phone, email, description, website, profile_picture]
  );
  const salonId = result.insertId;

  await db.query(
    "INSERT INTO salon_audit (salon_id, event_type, event_note, performed_by) VALUES (?, ?, ?, ?)",
    [salonId, "CREATED", "Salon seeded dynamically", ownerId]
  );

  return salonId;
}

async function configureSalonSettings(salonId, settings) {
  const { businessHours, amenities, cancellationPolicy, depositPercentage, loyaltyEnabled, pointsPerVisit, pointsPerDollar, redeemRate, minPointsRedeem } = settings;

  await db.query(
    `INSERT INTO salon_settings (
      salon_id, business_hours, amenities, cancellation_policy, deposit_percentage,
      loyalty_enabled, points_per_visit, points_per_dollar, redeem_rate, min_points_redeem,
      timezone, tax_rate
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      business_hours = VALUES(business_hours),
      amenities = VALUES(amenities),
      cancellation_policy = VALUES(cancellation_policy),
      deposit_percentage = VALUES(deposit_percentage),
      loyalty_enabled = VALUES(loyalty_enabled),
      points_per_visit = VALUES(points_per_visit),
      points_per_dollar = VALUES(points_per_dollar),
      redeem_rate = VALUES(redeem_rate),
      min_points_redeem = VALUES(min_points_redeem)`,
    [
      salonId,
      JSON.stringify(businessHours),
      JSON.stringify(amenities),
      cancellationPolicy,
      depositPercentage,
      loyaltyEnabled ? 1 : 0,
      pointsPerVisit,
      pointsPerDollar,
      redeemRate,
      minPointsRedeem,
      "America/New_York",
      7.00,
    ]
  );
}

async function createServices(salonId, services) {
  let created = 0;
  
  for (const service of services) {
    const [categories] = await db.query(
      "SELECT category_id FROM service_categories WHERE name = ?",
      [service.category]
    );

    if (categories.length === 0) {
      console.log(`   ⚠️  Category "${service.category}" not found, skipping "${service.name}"`);
      continue;
    }

    const categoryId = categories[0].category_id;

    await db.query(
      `INSERT INTO services (salon_id, category_id, custom_name, duration, price, description, is_active)
       VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
      [salonId, categoryId, service.name, service.duration, service.price, service.description || null]
    );
    created++;
  }
  
  return created;
}

async function createProducts(salonId, products) {
  let created = 0;
  
  for (const product of products) {
    await db.query(
      `INSERT INTO products (salon_id, name, category, description, price, stock, is_active)
       VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
      [salonId, product.name, product.category, product.description, product.price, product.stock]
    );
    created++;
  }
  
  return created;
}

async function createStaff(salonId, staffMembers) {
  let created = 0;
  
  for (const staff of staffMembers) {
    // Check if user exists
    const [existingUser] = await db.query("SELECT user_id FROM users WHERE email = ?", [staff.email]);
    let userId;

    if (existingUser.length > 0) {
      userId = existingUser[0].user_id;
      console.log(`   ⚠️  Staff ${staff.email} already exists`);
    } else {
      const [userResult] = await db.query(
        "INSERT INTO users (full_name, phone, email, user_role) VALUES (?, ?, ?, ?)",
        [staff.name, staff.phone, staff.email, "staff"]
      );
      userId = userResult.insertId;

      const defaultPassword = "Staff2024!";
      const hash = await bcrypt.hash(defaultPassword, 10);
      await db.query(
        "INSERT INTO auth (user_id, email, password_hash) VALUES (?, ?, ?)",
        [userId, staff.email, hash]
      );
    }

    // Get or create staff role
    const [roleResult] = await db.query(
      "SELECT staff_role_id FROM staff_roles WHERE staff_role_name = ? LIMIT 1",
      [staff.role]
    );

    let staffRoleId;
    if (roleResult.length > 0) {
      staffRoleId = roleResult[0].staff_role_id;
    } else {
      const [newRole] = await db.query(
        "INSERT INTO staff_roles (salon_id, staff_role_name) VALUES (?, ?)",
        [salonId, staff.role]
      );
      staffRoleId = newRole.insertId;
    }

    // Check if staff already linked to salon
    const [existingStaff] = await db.query(
      "SELECT staff_id FROM staff WHERE salon_id = ? AND user_id = ?",
      [salonId, userId]
    );

    if (existingStaff.length === 0) {
      await db.query(
        `INSERT INTO staff (salon_id, user_id, staff_role, staff_role_id, specialization, is_active)
         VALUES (?, ?, ?, ?, ?, TRUE)`,
        [salonId, userId, staff.role, staffRoleId, staff.specialization]
      );
      created++;
    }
  }
  
  return created;
}

async function addPhotos(salonId, photos) {
  let added = 0;
  
  for (const photo of photos) {
    await db.query(
      `INSERT INTO salon_photos (salon_id, photo_url, photo_type, caption, is_primary)
       VALUES (?, ?, ?, ?, ?)`,
      [salonId, photo.url, photo.type, photo.caption, photo.is_primary ? 1 : 0]
    );
    added++;
  }
  
  return added;
}

// ============================================================================
// MAIN SEEDING FUNCTION
// ============================================================================

async function seedSalons() {
  console.log("\n" + "=".repeat(70));
  console.log("🌱 DYNAMIC SALON PLATFORM SEEDING");
  console.log("=".repeat(70) + "\n");

  try {
    // Load salon data from JSON
    const salonsData = loadSalonData();

    // Setup database schema
    const schemaReady = await setupDatabaseSchema();
    if (!schemaReady) {
      throw new Error("Failed to setup database schema");
    }

    // Seed each salon
    const results = [];
    
    for (let i = 0; i < salonsData.length; i++) {
      const salonData = salonsData[i];
      console.log("─".repeat(70));
      console.log(`📍 SALON ${i + 1}/${salonsData.length}: ${salonData.salon.salon_name}`);
      console.log("─".repeat(70));

      try {
        // Create owner
        console.log(`   👤 Creating owner: ${salonData.owner.full_name} (${salonData.owner.email})`);
        const ownerId = await createOwner(salonData.owner);
        console.log(`   ✅ Owner ID: ${ownerId}`);

        // Create salon
        console.log(`   🏢 Creating salon...`);
        const salonId = await createSalon(ownerId, salonData.salon);
        console.log(`   ✅ Salon ID: ${salonId}`);

        // Configure settings
        console.log(`   ⚙️  Configuring settings...`);
        await configureSalonSettings(salonId, salonData.settings);
        console.log(`   ✅ Settings configured`);

        // Create services
        console.log(`   💇 Creating services...`);
        const servicesCount = await createServices(salonId, salonData.services);
        console.log(`   ✅ ${servicesCount}/${salonData.services.length} services created`);

        // Create products
        console.log(`   🛍️  Creating products...`);
        const productsCount = await createProducts(salonId, salonData.products);
        console.log(`   ✅ ${productsCount}/${salonData.products.length} products created`);

        // Create staff
        console.log(`   👥 Creating staff...`);
        const staffCount = await createStaff(salonId, salonData.staff);
        console.log(`   ✅ ${staffCount}/${salonData.staff.length} staff members created`);

        // Add photos
        console.log(`   📸 Adding photos...`);
        const photosCount = await addPhotos(salonId, salonData.photos);
        console.log(`   ✅ ${photosCount}/${salonData.photos.length} photos added`);

        console.log(`\n   ✨ ${salonData.salon.salon_name} complete!`);
        
        results.push({
          name: salonData.salon.salon_name,
          salonId,
          success: true,
        });
      } catch (error) {
        console.error(`\n   ❌ Error creating ${salonData.salon.salon_name}:`, error.message);
        results.push({
          name: salonData.salon.salon_name,
          success: false,
          error: error.message,
        });
      }
      
      console.log("");
    }

    // Print summary
    console.log("\n" + "=".repeat(70));
    console.log("📊 SEEDING SUMMARY");
    console.log("=".repeat(70) + "\n");
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`✅ Successful: ${successful}/${results.length}`);
    if (failed > 0) {
      console.log(`❌ Failed: ${failed}/${results.length}`);
      results.filter(r => !r.success).forEach(r => {
        console.log(`   - ${r.name}: ${r.error}`);
      });
    }

    // Print credentials
    if (successful > 0) {
      console.log("\n" + "=".repeat(70));
      console.log("🔐 LOGIN CREDENTIALS");
      console.log("=".repeat(70) + "\n");

      salonsData.forEach((salon, i) => {
        const result = results[i];
        if (result.success) {
          console.log(`${i + 1}. ${salon.salon.salon_name} (${salon.salon.city}, ${salon.salon.state})`);
          console.log(`   Owner: ${salon.owner.email} / ${salon.owner.password}`);
          console.log(`   Staff (all use password: Staff2024!):`);
          salon.staff.forEach((staff) => {
            console.log(`     • ${staff.email}`);
          });
          console.log("");
        }
      });
    }

    console.log("=".repeat(70));
    console.log(`✅ Seeding complete! ${successful} salons ready.`);
    console.log("=".repeat(70) + "\n");
    
  } catch (error) {
    console.error("\n❌ FATAL ERROR:", error.message);
    console.error(error);
    throw error;
  } finally {
    await db.end();
  }
}

// Run the seeding
seedSalons();


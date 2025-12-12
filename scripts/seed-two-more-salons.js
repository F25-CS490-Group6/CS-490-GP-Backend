const bcrypt = require("bcrypt");
const { db } = require("../config/database");

// Two NEW professional salons
const SALONS_DATA = [
  {
    owner: {
      full_name: "Elena Rodriguez",
      email: "elena@elegancestudio.com",
      password: "Elegance2024!",
      phone: "3125556789",
    },
    salon: {
      salon_name: "Elegance Hair Studio",
      address: "321 Michigan Avenue",
      city: "Chicago",
      state: "IL",
      zip: "60611",
      country: "United States",
      phone: "3125556789",
      email: "contact@elegancestudio.com",
      description: "Chicago's premier destination for sophisticated hair design and color artistry. Our award-winning stylists bring European techniques and cutting-edge trends to create stunning, personalized looks.",
      website: "https://elegancestudio.com",
    },
    settings: {
      businessHours: {
        Monday: { enabled: true, start: "10:00", end: "19:00" },
        Tuesday: { enabled: true, start: "09:00", end: "20:00" },
        Wednesday: { enabled: true, start: "09:00", end: "20:00" },
        Thursday: { enabled: true, start: "09:00", end: "21:00" },
        Friday: { enabled: true, start: "09:00", end: "21:00" },
        Saturday: { enabled: true, start: "08:00", end: "18:00" },
        Sunday: { enabled: true, start: "11:00", end: "17:00" },
      },
      amenities: ["Complimentary Wine & Coffee", "WiFi", "Valet Parking", "Designer Products", "Scalp Massage"],
      cancellationPolicy: "48-hour cancellation notice required for color services. 24-hour notice for cuts. Cancellation fees may apply.",
      depositPercentage: 25,
      loyaltyEnabled: true,
      pointsPerVisit: 75,
      pointsPerDollar: 3,
      redeemRate: 0.01,
      minPointsRedeem: 750,
    },
    services: [
      { name: "Precision Cut", category: "Haircuts", duration: 50, price: 95.00, description: "Expert precision cutting with styling" },
      { name: "Color Transformation", category: "Hair Color", duration: 210, price: 285.00, description: "Full color change with toner and treatment" },
      { name: "Balayage Artistry", category: "Hair Color", duration: 180, price: 265.00, description: "Hand-painted dimensional color" },
      { name: "Brazilian Blowout", category: "Hair Treatments", duration: 150, price: 350.00, description: "Smoothing treatment for up to 12 weeks" },
      { name: "Olaplex Restoration", category: "Hair Treatments", duration: 60, price: 85.00, description: "Bond-building repair treatment" },
      { name: "Luxury Blowout", category: "Hair Treatments", duration: 45, price: 65.00, description: "Professional styling with premium products" },
      { name: "Special Event Styling", category: "Haircuts", duration: 90, price: 125.00, description: "Updo or special occasion styling" },
      { name: "Men's Executive Cut", category: "Haircuts", duration: 40, price: 75.00, description: "Professional men's cut with hot towel treatment" },
    ],
    products: [
      { name: "Kerastase Resistance Set", category: "Hair", description: "Professional strengthening shampoo and conditioner", price: 98.00, stock: 20 },
      { name: "Brazilian Blowout Acai Treatment", category: "Hair", description: "At-home smoothing treatment", price: 145.00, stock: 15 },
      { name: "Oribe Gold Lust Collection", category: "Hair", description: "Luxury hair care set", price: 125.00, stock: 12 },
      { name: "Bumble and Bumble Styling Suite", category: "Hair", description: "Complete styling product collection", price: 78.00, stock: 25 },
      { name: "GHD Professional Styling Tool", category: "Other", description: "Professional flat iron", price: 229.00, stock: 8 },
    ],
    staff: [
      { name: "Sofia Valentina", role: "Hair Stylist", phone: "3125556801", email: "sofia@elegancestudio.com", specialization: "Precision Cuts, European Techniques, Styling" },
      { name: "Marco Bellini", role: "Colorist", phone: "3125556802", email: "marco@elegancestudio.com", specialization: "Balayage, Color Correction, Dimensional Color" },
      { name: "Jasmine Wu", role: "Hair Stylist", phone: "3125556803", email: "jasmine@elegancestudio.com", specialization: "Keratin Treatments, Asian Hair, Bridal Styling" },
    ],
  },
  {
    owner: {
      full_name: "Michael Chen",
      email: "michael@trendsettersalon.com",
      password: "Trend2024!",
      phone: "4155559012",
    },
    salon: {
      salon_name: "Trendsetter Salon & Spa",
      address: "567 Market Street",
      city: "San Francisco",
      state: "CA",
      zip: "94102",
      country: "United States",
      phone: "4155559012",
      email: "hello@trendsettersalon.com",
      description: "San Francisco's innovative salon combining cutting-edge hair design with holistic spa treatments. Experience the perfect blend of beauty, wellness, and sustainability in our eco-friendly studio.",
      website: "https://trendsettersalon.com",
    },
    settings: {
      businessHours: {
        Monday: { enabled: false, start: "09:00", end: "18:00" },
        Tuesday: { enabled: true, start: "09:00", end: "20:00" },
        Wednesday: { enabled: true, start: "09:00", end: "20:00" },
        Thursday: { enabled: true, start: "09:00", end: "21:00" },
        Friday: { enabled: true, start: "09:00", end: "21:00" },
        Saturday: { enabled: true, start: "08:00", end: "19:00" },
        Sunday: { enabled: true, start: "10:00", end: "18:00" },
      },
      amenities: ["Organic Tea & Coffee", "WiFi", "Eco-Friendly Products", "Complimentary Consultations", "Relaxation Lounge"],
      cancellationPolicy: "24-hour advance notice required. No-show fee of 50% may apply to repeated offenders.",
      depositPercentage: 15,
      loyaltyEnabled: true,
      pointsPerVisit: 40,
      pointsPerDollar: 1.5,
      redeemRate: 0.01,
      minPointsRedeem: 400,
    },
    services: [
      { name: "Sustainable Haircut", category: "Haircuts", duration: 55, price: 78.00, description: "Eco-friendly cut with organic products" },
      { name: "Vivid Color Experience", category: "Hair Color", duration: 165, price: 215.00, description: "Bold fashion colors with organic dye" },
      { name: "Natural Balayage", category: "Hair Color", duration: 150, price: 195.00, description: "Sun-kissed highlights using sustainable techniques" },
      { name: "Organic Deep Treatment", category: "Hair Treatments", duration: 50, price: 68.00, description: "Deep conditioning with organic oils" },
      { name: "Detox Scalp Treatment", category: "Hair Treatments", duration: 45, price: 58.00, description: "Purifying scalp detox and massage" },
      { name: "Wellness Facial", category: "Basic Facials", duration: 60, price: 95.00, description: "Organic facial with aromatherapy" },
      { name: "Zen Massage", category: "Massages", duration: 60, price: 110.00, description: "Relaxing massage with essential oils" },
      { name: "Express Style", category: "Hair Treatments", duration: 30, price: 42.00, description: "Quick blow-dry and style" },
    ],
    products: [
      { name: "Aveda Botanical Repair Set", category: "Hair", description: "Plant-powered bond-building system", price: 72.00, stock: 30 },
      { name: "Davines Love Smoothing Collection", category: "Hair", description: "Sustainable smoothing hair care", price: 64.00, stock: 28 },
      { name: "Organic Argan Oil", category: "Hair", description: "Pure organic Moroccan argan oil", price: 45.00, stock: 40 },
      { name: "Eco-Friendly Styling Cream", category: "Hair", description: "Natural hold styling cream", price: 32.00, stock: 35 },
      { name: "Bamboo Hair Brush", category: "Other", description: "Sustainable bamboo paddle brush", price: 28.00, stock: 20 },
      { name: "Organic Scalp Serum", category: "Hair", description: "Nourishing scalp treatment serum", price: 52.00, stock: 22 },
    ],
    staff: [
      { name: "Kai Anderson", role: "Stylist", phone: "4155559101", email: "kai@trendsettersalon.com", specialization: "Fashion Colors, Pixie Cuts, Sustainable Styling" },
      { name: "Luna Martinez", role: "Colorist", phone: "4155559102", email: "luna@trendsettersalon.com", specialization: "Vivid Colors, Color Melting, Organic Dyes" },
      { name: "River Thompson", role: "Technician", phone: "4155559103", email: "river@trendsettersalon.com", specialization: "Spa Treatments, Facials, Wellness Massage" },
    ],
  },
];

async function createOwner(ownerData) {
  const { full_name, email, password, phone } = ownerData;
  
  // Create user
  const [userResult] = await db.query(
    "INSERT INTO users (full_name, phone, email, user_role) VALUES (?, ?, ?, ?)",
    [full_name, phone, email, "owner"]
  );
  const userId = userResult.insertId;
  
  // Create auth record
  const hash = await bcrypt.hash(password, 10);
  await db.query(
    "INSERT INTO auth (user_id, email, password_hash) VALUES (?, ?, ?)",
    [userId, email, hash]
  );
  
  return userId;
}

async function createSalon(ownerId, salonData) {
  const { salon_name, address, city, state, zip, country, phone, email, description, website } = salonData;
  
  const [result] = await db.query(
    `INSERT INTO salons (owner_id, name, salon_name, address, city, state, zip, country, phone, email, description, website, status, approved)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', 'approved')`,
    [ownerId, salon_name, salon_name, address, city, state, zip, country, phone, email, description, website]
  );
  const salonId = result.insertId;
  
  // Create salon_audit entry
  await db.query(
    "INSERT INTO salon_audit (salon_id, event_type, event_note, performed_by) VALUES (?, ?, ?, ?)",
    [salonId, "CREATED", "Professional salon seeded by admin", ownerId]
  );
  
  return salonId;
}

async function configureSalonSettings(salonId, settings) {
  const { businessHours, amenities, cancellationPolicy, depositPercentage, loyaltyEnabled, pointsPerVisit, pointsPerDollar, redeemRate, minPointsRedeem } = settings;
  
  // Create or update salon_settings
  await db.query(
    `INSERT INTO salon_settings (
      salon_id, 
      business_hours, 
      amenities, 
      cancellation_policy, 
      deposit_percentage,
      loyalty_enabled,
      points_per_visit,
      points_per_dollar,
      redeem_rate,
      min_points_redeem,
      timezone,
      tax_rate
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
      "America/Chicago",
      8.25
    ]
  );
}

async function createServices(salonId, services) {
  for (const service of services) {
    // Get or create category
    const [categories] = await db.query(
      'SELECT category_id FROM service_categories WHERE name = ?',
      [service.category]
    );
    
    let categoryId;
    if (!categories || categories.length === 0) {
      // Create category with a default main_category_id (1 for Hair)
      const [catResult] = await db.query(
        'INSERT INTO service_categories (name, description, main_category_id) VALUES (?, ?, ?)',
        [service.category, service.category, 1]
      );
      categoryId = catResult.insertId;
    } else {
      categoryId = categories[0].category_id;
    }
    
    // Create service
    await db.query(
      `INSERT INTO services (salon_id, category_id, custom_name, duration, price, description, is_active)
       VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
      [salonId, categoryId, service.name, service.duration, service.price, service.description || null]
    );
  }
}

async function createProducts(salonId, products) {
  for (const product of products) {
    await db.query(
      `INSERT INTO products (salon_id, name, category, description, price, stock, is_active)
       VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
      [salonId, product.name, product.category, product.description, product.price, product.stock]
    );
  }
}

async function createStaff(salonId, staffMembers) {
  for (const staff of staffMembers) {
    // Create user for staff member
    const [userResult] = await db.query(
      "INSERT INTO users (full_name, phone, email, user_role) VALUES (?, ?, ?, ?)",
      [staff.name, staff.phone, staff.email, "staff"]
    );
    const userId = userResult.insertId;
    
    // Create auth record with default password
    const defaultPassword = "Staff2024!";
    const hash = await bcrypt.hash(defaultPassword, 10);
    await db.query(
      "INSERT INTO auth (user_id, email, password_hash) VALUES (?, ?, ?)",
      [userId, staff.email, hash]
    );
    
    // Get or create staff role ID
    const [roleResult] = await db.query(
      "SELECT staff_role_id FROM staff_roles WHERE salon_id = ? AND staff_role_name = ?",
      [salonId, staff.role]
    );
    
    let staffRoleId = null;
    if (roleResult && roleResult.length > 0) {
      staffRoleId = roleResult[0].staff_role_id;
    } else {
      // Check if role exists globally (due to unique constraint)
      const [globalRole] = await db.query(
        "SELECT staff_role_id FROM staff_roles WHERE staff_role_name = ?",
        [staff.role]
      );
      
      if (globalRole && globalRole.length > 0) {
        staffRoleId = globalRole[0].staff_role_id;
      } else {
        // Create the role if it doesn't exist at all
        const [newRole] = await db.query(
          "INSERT INTO staff_roles (salon_id, staff_role_name) VALUES (?, ?)",
          [salonId, staff.role]
        );
        staffRoleId = newRole.insertId;
      }
    }
    
    // Create staff record
    await db.query(
      `INSERT INTO staff (salon_id, user_id, staff_role, staff_role_id, specialization, is_active)
       VALUES (?, ?, ?, ?, ?, TRUE)`,
      [salonId, userId, staff.role, staffRoleId, staff.specialization]
    );
  }
}

async function seedSalons() {
  console.log("\n🌱 Starting professional salon seeding (2 new salons)...\n");
  
  try {
    for (let i = 0; i < SALONS_DATA.length; i++) {
      const salonData = SALONS_DATA[i];
      console.log(`\n📍 Creating Salon ${i + 1}: ${salonData.salon.salon_name}`);
      
      // Create owner
      console.log(`   👤 Creating owner: ${salonData.owner.full_name} (${salonData.owner.email})`);
      const ownerId = await createOwner(salonData.owner);
      console.log(`   ✅ Owner created with ID: ${ownerId}`);
      
      // Create salon
      console.log(`   🏢 Creating salon...`);
      const salonId = await createSalon(ownerId, salonData.salon);
      console.log(`   ✅ Salon created with ID: ${salonId}`);
      
      // Configure settings
      console.log(`   ⚙️  Configuring salon settings...`);
      await configureSalonSettings(salonId, salonData.settings);
      console.log(`   ✅ Settings configured`);
      
      // Create services
      console.log(`   💇 Creating ${salonData.services.length} services...`);
      await createServices(salonId, salonData.services);
      console.log(`   ✅ Services created`);
      
      // Create products
      console.log(`   🛍️  Creating ${salonData.products.length} products...`);
      await createProducts(salonId, salonData.products);
      console.log(`   ✅ Products created`);
      
      // Create staff
      console.log(`   👥 Creating ${salonData.staff.length} staff members...`);
      await createStaff(salonId, salonData.staff);
      console.log(`   ✅ Staff created`);
      
      console.log(`\n✨ ${salonData.salon.salon_name} setup complete!`);
    }
    
    console.log("\n\n🎉 ALL NEW SALONS CREATED SUCCESSFULLY!\n");
    console.log("=".repeat(60));
    console.log("📋 NEW SALON LOGIN CREDENTIALS:\n");
    
    for (let i = 0; i < SALONS_DATA.length; i++) {
      const salon = SALONS_DATA[i];
      console.log(`\n${i + 1}. ${salon.salon.salon_name}`);
      console.log(`   Owner: ${salon.owner.full_name}`);
      console.log(`   Email: ${salon.owner.email}`);
      console.log(`   Password: ${salon.owner.password}`);
      console.log(`   Location: ${salon.salon.city}, ${salon.salon.state}`);
      console.log(`\n   Staff Accounts (all use password: Staff2024!):`);
      salon.staff.forEach((staff, idx) => {
        console.log(`   ${idx + 1}. ${staff.name} - ${staff.email}`);
      });
    }
    
    console.log("\n" + "=".repeat(60));
    console.log("✅ You can now log in with these credentials!\n");
    
  } catch (error) {
    console.error("\n❌ Error seeding salons:", error);
    throw error;
  } finally {
    await db.end();
  }
}

// Run the seeding
seedSalons();


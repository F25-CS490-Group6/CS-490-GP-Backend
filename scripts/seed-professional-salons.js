const bcrypt = require("bcrypt");
const { db } = require("../config/database");

// Professional salon data
const SALONS_DATA = [
  {
    owner: {
      full_name: "Sophia Martinez",
      email: "sophia@luxebeauty.com",
      password: "Luxe2024!",
      phone: "2015551234",
    },
    salon: {
      salon_name: "Luxe Beauty Studio",
      address: "456 Madison Avenue",
      city: "New York",
      state: "NY",
      zip: "10022",
      country: "United States",
      phone: "2015551234",
      email: "info@luxebeauty.com",
      description: "Experience luxury beauty services in the heart of Manhattan. Our expert stylists and aestheticians provide premium hair, nail, and skincare treatments in an elegant, modern setting.",
      website: "https://luxebeauty.com",
    },
    settings: {
      businessHours: {
        Monday: { enabled: true, start: "09:00", end: "20:00" },
        Tuesday: { enabled: true, start: "09:00", end: "20:00" },
        Wednesday: { enabled: true, start: "09:00", end: "20:00" },
        Thursday: { enabled: true, start: "09:00", end: "21:00" },
        Friday: { enabled: true, start: "09:00", end: "21:00" },
        Saturday: { enabled: true, start: "08:00", end: "19:00" },
        Sunday: { enabled: true, start: "10:00", end: "18:00" },
      },
      amenities: ["WiFi", "Complimentary Beverages", "Magazines", "Luxury Products", "Private Rooms"],
      cancellationPolicy: "24-hour cancellation notice required. Late cancellations may incur a 50% fee.",
      depositPercentage: 20,
      loyaltyEnabled: true,
      pointsPerVisit: 50,
      pointsPerDollar: 2,
      redeemRate: 0.01,
      minPointsRedeem: 500,
    },
    services: [
      { name: "Signature Haircut & Style", category: "Haircuts", duration: 60, price: 85.00, description: "Precision cut with personalized styling consultation" },
      { name: "Balayage Highlights", category: "Hair Color", duration: 180, price: 245.00, description: "Hand-painted natural-looking highlights" },
      { name: "Keratin Smoothing Treatment", category: "Hair Treatments", duration: 120, price: 295.00, description: "Professional smoothing treatment for frizz-free hair" },
      { name: "Luxury Facial", category: "Basic Facials", duration: 75, price: 135.00, description: "Deep cleansing and rejuvenating facial treatment" },
      { name: "Gel Manicure", category: "Manicure", duration: 45, price: 55.00, description: "Long-lasting gel polish manicure" },
      { name: "Deluxe Pedicure", category: "Pedicure", duration: 60, price: 75.00, description: "Spa pedicure with massage and premium products" },
      { name: "Bridal Package", category: "Makeup", duration: 180, price: 450.00, description: "Complete bridal hair and makeup package" },
      { name: "Eyebrow Shaping & Tint", category: "Eyebrows", duration: 30, price: 45.00, description: "Professional brow shaping and tinting" },
    ],
    products: [
      { name: "Olaplex Hair Treatment Set", category: "Hair", description: "Professional bond-building treatment system", price: 85.00, stock: 25 },
      { name: "Moroccanoil Intense Hydrating Mask", category: "Hair", description: "Deep conditioning treatment for all hair types", price: 48.00, stock: 30 },
      { name: "Luxury Face Serum", category: "Skin", description: "Anti-aging vitamin C serum", price: 95.00, stock: 20 },
      { name: "Premium Hand Cream", category: "Skin", description: "Intensive moisture therapy hand cream", price: 32.00, stock: 40 },
      { name: "OPI Nail Polish Collection", category: "Nails", description: "Professional nail lacquer in various shades", price: 12.00, stock: 100 },
    ],
    staff: [
      { name: "Isabella Chen", role: "Hair Stylist", phone: "2015552001", email: "isabella@luxebeauty.com", specialization: "Hair Coloring, Balayage, Updos" },
      { name: "Marcus Johnson", role: "Colorist", phone: "2015552002", email: "marcus@luxebeauty.com", specialization: "Color Correction, Highlights, Fashion Colors" },
      { name: "Amara Thompson", role: "Nail Artist", phone: "2015552003", email: "amara@luxebeauty.com", specialization: "Gel Manicures, Nail Art, Spa Pedicures" },
    ],
  },
  {
    owner: {
      full_name: "Alexander Brooks",
      email: "alex@urbansalon.com",
      password: "Urban2024!",
      phone: "3105554567",
    },
    salon: {
      salon_name: "Urban Edge Salon",
      address: "789 Sunset Boulevard",
      city: "Los Angeles",
      state: "CA",
      zip: "90028",
      country: "United States",
      phone: "3105554567",
      email: "hello@urbansalon.com",
      description: "Contemporary salon specializing in cutting-edge styles and modern techniques. From trendy cuts to vibrant color, we bring your hair vision to life with expert precision and creativity.",
      website: "https://urbanedgesalon.com",
    },
    settings: {
      businessHours: {
        Monday: { enabled: false, start: "09:00", end: "18:00" },
        Tuesday: { enabled: true, start: "10:00", end: "20:00" },
        Wednesday: { enabled: true, start: "10:00", end: "20:00" },
        Thursday: { enabled: true, start: "10:00", end: "20:00" },
        Friday: { enabled: true, start: "10:00", end: "21:00" },
        Saturday: { enabled: true, start: "09:00", end: "19:00" },
        Sunday: { enabled: true, start: "10:00", end: "17:00" },
      },
      amenities: ["WiFi", "Complimentary Coffee & Tea", "Charging Stations", "Music Playlist", "Street Parking"],
      cancellationPolicy: "Please cancel at least 12 hours in advance. Same-day cancellations will be charged 25% of service cost.",
      depositPercentage: 0,
      loyaltyEnabled: true,
      pointsPerVisit: 25,
      pointsPerDollar: 1,
      redeemRate: 0.01,
      minPointsRedeem: 250,
    },
    services: [
      { name: "Modern Cut & Style", category: "Haircuts", duration: 45, price: 65.00, description: "Contemporary haircut with styling" },
      { name: "Creative Color", category: "Hair Color", duration: 150, price: 195.00, description: "Fashion colors and creative coloring techniques" },
      { name: "Hair Gloss Treatment", category: "Hair Treatments", duration: 45, price: 75.00, description: "Shine-enhancing glossing treatment" },
      { name: "Men's Grooming Package", category: "Haircuts", duration: 60, price: 80.00, description: "Cut, beard trim, and styling" },
      { name: "Beard Sculpting", category: "Beard Trim", duration: 30, price: 35.00, description: "Professional beard shaping and grooming" },
      { name: "Express Blowout", category: "Hair Treatments", duration: 30, price: 45.00, description: "Quick styling blowout" },
      { name: "Root Touch-Up", category: "Hair Color", duration: 90, price: 95.00, description: "Root color refresh" },
      { name: "Teen Cut", category: "Haircuts", duration: 30, price: 45.00, description: "Haircut for ages 13-17" },
    ],
    products: [
      { name: "Redken Extreme Shampoo & Conditioner", category: "Hair", description: "Strengthening hair care duo", price: 55.00, stock: 35 },
      { name: "Texturizing Spray", category: "Hair", description: "Beach waves styling spray", price: 28.00, stock: 45 },
      { name: "Heat Protection Spray", category: "Hair", description: "Thermal protection for styling", price: 32.00, stock: 40 },
      { name: "Beard Oil", category: "Other", description: "Premium conditioning beard oil", price: 25.00, stock: 30 },
      { name: "Styling Pomade", category: "Hair", description: "Strong hold styling pomade", price: 22.00, stock: 50 },
      { name: "Hair Serum", category: "Hair", description: "Smoothing and shine serum", price: 38.00, stock: 25 },
    ],
    staff: [
      { name: "Dylan Martinez", role: "Stylist", phone: "3105554501", email: "dylan@urbansalon.com", specialization: "Modern Cuts, Men's Grooming, Fades" },
      { name: "Jade Williams", role: "Colorist", phone: "3105554502", email: "jade@urbansalon.com", specialization: "Creative Colors, Balayage, Vivid Colors" },
      { name: "Cameron Lee", role: "Barber", phone: "3105554503", email: "cameron@urbansalon.com", specialization: "Beard Grooming, Classic Cuts, Hot Towel Shaves" },
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
      "America/New_York",
      7.00
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
    // First check if role exists for this salon
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
  console.log("\n🌱 Starting professional salon seeding...\n");
  
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
    
    console.log("\n\n🎉 ALL SALONS CREATED SUCCESSFULLY!\n");
    console.log("=" .repeat(60));
    console.log("📋 LOGIN CREDENTIALS:\n");
    
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


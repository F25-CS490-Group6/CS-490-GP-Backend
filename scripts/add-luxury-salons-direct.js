require('dotenv').config();
const { db } = require('../config/database');
const bcrypt = require('bcrypt');

// 10 NEW luxury salons with unique photos
const NEW_SALONS = [
  {
    owner: { full_name: "Isabella Whitmore", email: "isabella@thecourtyardspa.com", phone: "+13055557799", password: "Courtyard2024!" },
    salon: {
      name: "The Courtyard Spa & Salon",
      address: "1120 Ocean Drive",
      city: "Miami Beach",
      state: "FL",
      zip: "33139",
      country: "United States",
      phone: "+13055557799",
      email: "reservations@thecourtyardspa.com",
      description: "Miami Beach's exclusive oceanfront beauty sanctuary. Mediterranean-inspired elegance with tropical luxury.",
      website: "https://thecourtyardspa.com",
      profile_picture: "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=1200&q=85"
    }
  },
  {
    owner: { full_name: "Alexandre Beaumont", email: "alex@aureliastudio.com", phone: "+14155556633", password: "Aurelia2024!" },
    salon: {
      name: "Aurelia Beauty Studio",
      address: "1790 Union Street",
      city: "San Francisco",
      state: "CA",
      zip: "94123",
      country: "United States",
      phone: "+14155556633",
      email: "hello@aureliastudio.com",
      description: "San Francisco's avant-garde beauty destination in Cow Hollow. Modern artistry meets golden age glamour.",
      website: "https://aureliastudio.com",
      profile_picture: "https://images.unsplash.com/photo-1633681926035-ec1ac984418a?w=1200&q=85"
    }
  },
  {
    owner: { full_name: "Valentina Rossi", email: "valentina@bellamiabeauty.com", phone: "+12125554488", password: "BellaMia2024!" },
    salon: {
      name: "Bella Mia Beauty Lounge",
      address: "425 Broome Street",
      city: "New York",
      state: "NY",
      zip: "10013",
      country: "United States",
      phone: "+12125554488",
      email: "info@bellamiabeauty.com",
      description: "SoHo's Italian-inspired beauty haven. Old World charm meets New York sophistication.",
      website: "https://bellamiabeauty.com",
      profile_picture: "https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=1200&q=85"
    }
  },
  {
    owner: { full_name: "Sebastian York", email: "sebastian@thesanctuarysalon.com", phone: "+13235559922", password: "Sanctuary2024!" },
    salon: {
      name: "The Sanctuary Salon & Spa",
      address: "8500 Melrose Avenue",
      city: "Los Angeles",
      state: "CA",
      zip: "90069",
      country: "United States",
      phone: "+13235559922",
      email: "concierge@thesanctuarysalon.com",
      description: "West Hollywood's premier celebrity beauty destination. Where Hollywood's elite come to unwind.",
      website: "https://thesanctuarysalon.com",
      profile_picture: "https://images.unsplash.com/photo-1600948836098-34a66c50b169?w=1200&q=85"
    }
  },
  {
    owner: { full_name: "Amara Thompson", email: "amara@regalreflexions.com", phone: "+14045558866", password: "Regal2024!" },
    salon: {
      name: "Regal Reflexions Spa",
      address: "3393 Peachtree Road NE",
      city: "Atlanta",
      state: "GA",
      zip: "30326",
      country: "United States",
      phone: "+14045558866",
      email: "reservations@regalreflexions.com",
      description: "Atlanta's crown jewel in Buckhead. Southern hospitality meets modern luxury.",
      website: "https://regalreflexions.com",
      profile_picture: "https://images.unsplash.com/photo-1591343395082-e120087004b4?w=1200&q=85"
    }
  },
  {
    owner: { full_name: "Julian Pierce", email: "julian@cobaltbeauty.com", phone: "+12065557744", password: "Cobalt2024!" },
    salon: {
      name: "Cobalt Beauty Collective",
      address: "1515 15th Avenue",
      city: "Seattle",
      state: "WA",
      zip: "98122",
      country: "United States",
      phone: "+12065557744",
      email: "hello@cobaltbeauty.com",
      description: "Seattle's contemporary beauty hub in Capitol Hill. Pacific Northwest modern meets artistic edge.",
      website: "https://cobaltbeauty.com",
      profile_picture: "https://images.unsplash.com/photo-1560869713-bf165a7c2a04?w=1200&q=85"
    }
  },
  {
    owner: { full_name: "Eloise Fontaine", email: "eloise@lejardinbeauty.com", phone: "+15125556655", password: "LeJardin2024!" },
    salon: {
      name: "Le Jardin Beauty House",
      address: "1209 West 6th Street",
      city: "Austin",
      state: "TX",
      zip: "78703",
      country: "United States",
      phone: "+15125556655",
      email: "contact@lejardinbeauty.com",
      description: "Austin's French-inspired beauty garden in downtown. Parisian chic meets Texas warmth.",
      website: "https://lejardinbeauty.com",
      profile_picture: "https://images.unsplash.com/photo-1610992015708-3e9f004f7dc0?w=1200&q=85"
    }
  },
  {
    owner: { full_name: "Marcus Wellington", email: "marcus@themarquesalon.com", phone: "+16175559933", password: "Marque2024!" },
    salon: {
      name: "The Marque Salon & Spa",
      address: "285 Newbury Street",
      city: "Boston",
      state: "MA",
      zip: "02116",
      country: "United States",
      phone: "+16175559933",
      email: "reservations@themarquesalon.com",
      description: "Boston's distinguished salon on iconic Newbury Street. Classic New England refinement with contemporary flair.",
      website: "https://themarquesalon.com",
      profile_picture: "https://images.unsplash.com/photo-1507120410856-1f35574c3b45?w=1200&q=85"
    }
  },
  {
    owner: { full_name: "Aurora Sinclair", email: "aurora@crystalluxespa.com", phone: "+17025556622", password: "Crystal2024!" },
    salon: {
      name: "Crystal Luxe Spa & Salon",
      address: "3570 Las Vegas Boulevard South",
      city: "Las Vegas",
      state: "NV",
      zip: "89109",
      country: "United States",
      phone: "+17025556622",
      email: "vip@crystalluxespa.com",
      description: "Las Vegas Strip's most opulent beauty destination. Crystal chandeliers, champagne towers, and world-class service.",
      website: "https://crystalluxespa.com",
      profile_picture: "https://images.unsplash.com/photo-1629140727571-9b5c6f6267b4?w=1200&q=85"
    }
  },
  {
    owner: { full_name: "Natasha Ivanova", email: "natasha@grandecouture.com", phone: "+13125558811", password: "Grande2024!" },
    salon: {
      name: "Grande Couture Salon",
      address: "900 North Michigan Avenue",
      city: "Chicago",
      state: "IL",
      zip: "60611",
      country: "United States",
      phone: "+13125558811",
      email: "hello@grandecouture.com",
      description: "Chicago's haute couture beauty destination. Where fashion and beauty converge in spectacular elegance.",
      website: "https://grandecouture.com",
      profile_picture: "https://images.unsplash.com/photo-1566068418668-95d8f8d80e88?w=1200&q=85"
    }
  }
];

function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function createSalonDirect(ownerData, salonData) {
  try {
    // Check if email already exists
    const [existingUser] = await db.query("SELECT user_id FROM users WHERE email = ?", [ownerData.email]);
    if (existingUser.length > 0) {
      console.log(`   ⚠️  Owner email already exists, skipping...`);
      return null;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(ownerData.password, 10);

    // Insert user
    const [userResult] = await db.query(
      "INSERT INTO users (full_name, email, phone, user_role, created_at) VALUES (?, ?, ?, 'owner', NOW())",
      [ownerData.full_name, ownerData.email, ownerData.phone]
    );
    const ownerId = userResult.insertId;

    // Insert auth
    await db.query(
      "INSERT INTO auth (user_id, email, password_hash) VALUES (?, ?, ?)",
      [ownerId, ownerData.email, hashedPassword]
    );

    // Generate slug
    const slug = generateSlug(salonData.name);

    // Insert salon
    const [salonResult] = await db.query(
      `INSERT INTO salons (
        owner_id, name, slug, address, city, state, zip, country, 
        phone, email, description, website, profile_picture, 
        status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW())`,
      [
        ownerId,
        salonData.name,
        slug,
        salonData.address,
        salonData.city,
        salonData.state,
        salonData.zip,
        salonData.country,
        salonData.phone,
        salonData.email,
        salonData.description,
        salonData.website,
        salonData.profile_picture
      ]
    );
    const salonId = salonResult.insertId;

    // Update user with salon_id
    await db.query("UPDATE users SET salon_id = ? WHERE user_id = ?", [salonId, ownerId]);

    // Insert default business hours
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    for (const day of days) {
      await db.query(
        "INSERT INTO business_hours (salon_id, day_of_week, start_time, end_time) VALUES (?, ?, '09:00', '18:00')",
        [salonId, day]
      );
    }

    return salonId;
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log("\n" + "=".repeat(70));
  console.log("🎨 ADDING 10 NEW LUXURY SALONS (DIRECT DATABASE)");
  console.log("=".repeat(70) + "\n");

  let created = 0;
  let skipped = 0;

  for (let i = 0; i < NEW_SALONS.length; i++) {
    const { owner, salon } = NEW_SALONS[i];
    console.log(`\n📍 SALON ${i + 1}/${NEW_SALONS.length}: ${salon.name}`);
    console.log("─".repeat(70));
    console.log(`   👤 Owner: ${owner.full_name}`);
    console.log(`   📧 Email: ${owner.email}`);
    console.log(`   📸 Photo: ${salon.profile_picture.substring(0, 60)}...`);

    const salonId = await createSalonDirect(owner, salon);
    
    if (salonId) {
      console.log(`   ✅ Created! Salon ID: ${salonId}`);
      created++;
    } else {
      skipped++;
    }
  }

  console.log("\n" + "=".repeat(70));
  console.log(`🎉 COMPLETE!`);
  console.log(`   ✅ Created: ${created} new salons`);
  console.log(`   ⚠️  Skipped: ${skipped} salons`);
  console.log("=".repeat(70) + "\n");

  await db.end();
  process.exit(0);
}

main();


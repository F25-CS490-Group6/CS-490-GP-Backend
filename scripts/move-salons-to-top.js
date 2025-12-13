require('dotenv').config();
const { db } = require('../config/database');

// Salons to feature at the top (will get most recent timestamps)
const FEATURED_SALONS = [
  { name: "Karen's Salon", salonId: 11 },
  { name: "Ken & Company", salonId: 10 },
  { name: "Metro Cuts Boston", salonId: 6 },
  { name: "Glamour Studio", salonId: 5 },
  { name: "Trendsetter Salon & Spa", salonId: 4 }
];

async function moveToTop() {
  console.log("\n" + "=".repeat(70));
  console.log("⬆️  MOVING SALONS TO TOP OF LISTING");
  console.log("=".repeat(70) + "\n");
  
  let moved = 0;
  
  // Update timestamps to make them appear at the top (most recent)
  // We'll set them to now, with small intervals between them
  const baseTime = new Date();
  
  for (let i = 0; i < FEATURED_SALONS.length; i++) {
    const salon = FEATURED_SALONS[i];
    // Each salon gets a timestamp a few seconds apart to maintain order
    const timestamp = new Date(baseTime.getTime() - (i * 5000));
    
    try {
      const [result] = await db.query(
        "UPDATE salons SET created_at = ? WHERE salon_id = ?",
        [timestamp, salon.salonId]
      );
      
      if (result.affectedRows > 0) {
        console.log(`✅ ID ${salon.salonId}: ${salon.name}`);
        console.log(`   New timestamp: ${timestamp.toISOString()}\n`);
        moved++;
      } else {
        console.log(`⚠️  ID ${salon.salonId}: ${salon.name} - Not found\n`);
      }
    } catch (error) {
      console.error(`❌ ID ${salon.salonId}: ${error.message}\n`);
    }
  }
  
  console.log("=".repeat(70));
  console.log(`🎉 Complete! Moved ${moved}/${FEATURED_SALONS.length} salons to top`);
  console.log("=".repeat(70));
  console.log("\n📋 These salons will now appear first in the listing:\n");
  FEATURED_SALONS.forEach((s, i) => {
    console.log(`   ${i + 1}. ${s.name}`);
  });
  console.log("\n");
  
  await db.end();
  process.exit(0);
}

moveToTop();


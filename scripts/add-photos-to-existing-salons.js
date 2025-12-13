require('dotenv').config();
const { db } = require('../config/database');

// Beautiful luxury salon photos - each one unique! (correct IDs from production database)
const SALON_PHOTOS = [
  { salonId: 19, photo: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=85", name: "Éclat Elite Spa & Salon" },
  { salonId: 20, photo: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=1200&q=85", name: "Opalessence Spa Boutique" },
  { salonId: 21, photo: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=1200&q=85", name: "Pearl Esthetics & Atelier" },
  { salonId: 22, photo: "https://images.unsplash.com/photo-1583557537644-bc0ec58e9a14?w=1200&q=85", name: "The Atelier Salon & Spa" },
  { salonId: 23, photo: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&q=85", name: "Luxe Noir Beauty Lounge" },
  { salonId: 24, photo: "https://images.unsplash.com/photo-1620331311520-246422fd82f9?w=1200&q=85", name: "Serenity Suites Spa & Salon" },
  { salonId: 25, photo: "https://images.unsplash.com/photo-1522337094846-8a818192de1f?w=1200&q=85", name: "Imperial Beauty Gallery" },
  { salonId: 26, photo: "https://images.unsplash.com/photo-1562004760-aceed7bb0fe3?w=1200&q=85", name: "Velvet & Co. Salon" },
  { salonId: 27, photo: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1200&q=85", name: "Maison de Beauté" },
  { salonId: 28, photo: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200&q=85", name: "Diamond Lux Salon & Spa" }
];

async function updatePhotos() {
  console.log("\n" + "=".repeat(70));
  console.log("📸 ADDING PHOTOS TO EXISTING LUXURY SALONS");
  console.log("=".repeat(70) + "\n");
  
  let updated = 0;
  
  for (const salon of SALON_PHOTOS) {
    try {
      const [result] = await db.query(
        "UPDATE salons SET profile_picture = ? WHERE salon_id = ?",
        [salon.photo, salon.salonId]
      );
      
      if (result.affectedRows > 0) {
        console.log(`✅ ${salon.salonId}: ${salon.name}`);
        updated++;
      } else {
        console.log(`⚠️  ${salon.salonId}: ${salon.name} - Not found in database`);
      }
    } catch (error) {
      console.error(`❌ ${salon.salonId}: ${error.message}`);
    }
  }
  
  console.log("\n" + "=".repeat(70));
  console.log(`🎉 Complete! Updated ${updated}/${SALON_PHOTOS.length} salons`);
  console.log("=".repeat(70) + "\n");
  
  await db.end();
  process.exit(0);
}

updatePhotos();


require('dotenv').config();
const { db } = require('../config/database');

// Beautiful luxury salon photos (correct IDs from production database)
const SALON_PHOTOS = [
  { salonId: 19, photo: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=85", name: "Éclat Elite Spa & Salon" },
  { salonId: 20, photo: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&q=85", name: "Opalessence Spa Boutique" },
  { salonId: 21, photo: "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=1200&q=85", name: "Pearl Esthetics & Atelier" },
  { salonId: 22, photo: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=1200&q=85", name: "The Atelier Salon & Spa" },
  { salonId: 23, photo: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=1200&q=85", name: "Luxe Noir Beauty Lounge" },
  { salonId: 24, photo: "https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=1200&q=85", name: "Serenity Suites Spa & Salon" },
  { salonId: 25, photo: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=1200&q=85", name: "Imperial Beauty Gallery" },
  { salonId: 26, photo: "https://images.unsplash.com/photo-1596704017254-9b121068ec31?w=1200&q=85", name: "Velvet & Co. Salon" },
  { salonId: 27, photo: "https://images.unsplash.com/photo-1559599238-1c999946dd90?w=1200&q=85", name: "Maison de Beauté" },
  { salonId: 28, photo: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=1200&q=85", name: "Diamond Lux Salon & Spa" }
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


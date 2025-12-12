require('dotenv').config();
const { db } = require('../config/database');

// High-quality luxury salon photos from Unsplash
const LUXURY_SALON_PHOTOS = [
  { 
    salonId: 33, 
    name: "Éclat Elite Spa & Salon",
    photo: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=80" // Luxury pedicure spa - gray elegant
  },
  { 
    salonId: 34, 
    name: "Opalessence Spa Boutique",
    photo: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&q=80" // Warm brown hair salon
  },
  { 
    salonId: 35, 
    name: "Pearl Esthetics & Atelier",
    photo: "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=1200&q=80" // Modern with curtain dividers
  },
  { 
    salonId: 36, 
    name: "The Atelier Salon & Spa",
    photo: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=1200&q=80" // Natural wood minimalist
  },
  { 
    salonId: 37, 
    name: "Luxe Noir Beauty Lounge",
    photo: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=1200&q=80" // Modern with arched mirrors
  },
  { 
    salonId: 38, 
    name: "Serenity Suites Spa & Salon",
    photo: "https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=1200&q=80" // Nature-inspired with plants
  },
  { 
    salonId: 39, 
    name: "Imperial Beauty Gallery",
    photo: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=1200&q=80" // Grand pedicure spa room
  },
  { 
    salonId: 40, 
    name: "Velvet & Co. Salon",
    photo: "https://images.unsplash.com/photo-1596704017254-9b121068ec31?w=1200&q=80" // Modern industrial black ceiling
  },
  { 
    salonId: 41, 
    name: "Maison de Beauté",
    photo: "https://images.unsplash.com/photo-1559599238-1c999946dd90?w=1200&q=80" // Minimalist with orchids
  },
  { 
    salonId: 42, 
    name: "Diamond Lux Salon & Spa",
    photo: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=1200&q=80" // Modern black and white luxury
  }
];

async function updatePhotos() {
  console.log("\n" + "=".repeat(70));
  console.log("📸 UPDATING LUXURY SALON PHOTOS");
  console.log("=".repeat(70) + "\n");
  
  let updated = 0;
  
  for (const salon of LUXURY_SALON_PHOTOS) {
    try {
      await db.query(
        "UPDATE salons SET profile_picture = ? WHERE salon_id = ?",
        [salon.photo, salon.salonId]
      );
      console.log(`✅ ${salon.salonId}: ${salon.name}`);
      console.log(`   ${salon.photo}\n`);
      updated++;
    } catch (error) {
      console.error(`❌ Salon ID ${salon.salonId}: ${error.message}`);
    }
  }
  
  console.log("=".repeat(70));
  console.log(`🎉 Complete! Updated ${updated}/${LUXURY_SALON_PHOTOS.length} salons`);
  console.log("=".repeat(70) + "\n");
  process.exit(0);
}

updatePhotos();


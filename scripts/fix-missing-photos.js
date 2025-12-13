require('dotenv').config();
const { db } = require('../config/database');

// Unique photos for the 8 salons missing images
const PHOTO_FIXES = [
  { salonId: 1, name: "Luxe Beauty Studio", photo: "https://images.unsplash.com/photo-1634449571010-02389ed0f9b0?w=1200&q=85" },
  { salonId: 9, name: "Fresher cuts", photo: "https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?w=1200&q=85" },
  { salonId: 12, name: "Mystique Beauty Salon", photo: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=1200&q=85" },
  { salonId: 13, name: "Primary Hair", photo: "https://images.unsplash.com/photo-1600003014755-ba9e9498b2f6?w=1200&q=85" },
  { salonId: 14, name: "Haven Hair Studio", photo: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=1200&q=85" },
  { salonId: 16, name: "Zoilas Hair Design & Spa", photo: "https://images.unsplash.com/photo-1559599238-1c999946dd90?w=1200&q=85" },
  { salonId: 18, name: "Everything but Nails", photo: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1200&q=85" },
  { salonId: 32, name: "Perfection Nails", photo: "https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=1200&q=85" }
];

async function fixPhotos() {
  console.log("\n" + "=".repeat(70));
  console.log("🔧 FIXING MISSING SALON PHOTOS");
  console.log("=".repeat(70) + "\n");
  
  let fixed = 0;
  
  for (const salon of PHOTO_FIXES) {
    try {
      const [result] = await db.query(
        "UPDATE salons SET profile_picture = ? WHERE salon_id = ?",
        [salon.photo, salon.salonId]
      );
      
      if (result.affectedRows > 0) {
        console.log(`✅ ID ${salon.salonId}: ${salon.name}`);
        console.log(`   ${salon.photo}\n`);
        fixed++;
      } else {
        console.log(`⚠️  ID ${salon.salonId}: ${salon.name} - Not found\n`);
      }
    } catch (error) {
      console.error(`❌ ID ${salon.salonId}: ${error.message}\n`);
    }
  }
  
  console.log("=".repeat(70));
  console.log(`🎉 Complete! Fixed ${fixed}/${PHOTO_FIXES.length} salons`);
  console.log("=".repeat(70) + "\n");
  
  await db.end();
  process.exit(0);
}

fixPhotos();


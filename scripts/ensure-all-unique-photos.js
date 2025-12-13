require('dotenv').config();
const { db } = require('../config/database');

// COMPREHENSIVE LIST - Every salon gets a UNIQUE photo URL
// No duplicates, no fallbacks, all professional high-quality images
const ALL_UNIQUE_PHOTOS = [
  { salonId: 1, name: "Luxe Beauty Studio", photo: "https://images.unsplash.com/photo-1634449571010-02389ed0f9b0?w=1200&q=85" },
  { salonId: 3, name: "Elegance Hair Studio", photo: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=1200&q=85" },
  { salonId: 4, name: "Trendsetter Salon & Spa", photo: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1200&q=85" },
  { salonId: 5, name: "Glamour Studio", photo: "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=1200&q=85" },
  { salonId: 6, name: "Metro Cuts Boston", photo: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200&q=85" },
  { salonId: 9, name: "Fresher cuts", photo: "https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?w=1200&q=85" },
  { salonId: 12, name: "Mystique Beauty Salon", photo: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=1200&q=85" },
  { salonId: 13, name: "Primary Hair", photo: "https://images.unsplash.com/photo-1600003014755-ba9e9498b2f6?w=1200&q=85" },
  { salonId: 14, name: "Haven Hair Studio", photo: "https://images.unsplash.com/photo-1562259926-d596f99ec0e8?w=1200&q=85" },
  { salonId: 16, name: "Zoilas Hair Design & Spa", photo: "https://images.unsplash.com/photo-1620331311520-8ac4e1170529?w=1200&q=85" },
  { salonId: 18, name: "Everything but Nails", photo: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1200&q=85" },
  { salonId: 19, name: "Éclat Elite Spa & Salon", photo: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=85" },
  { salonId: 20, name: "Opalessence Spa Boutique", photo: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=1200&q=85" },
  { salonId: 21, name: "Pearl Esthetics & Atelier", photo: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=1200&q=85" },
  { salonId: 22, name: "The Atelier Salon & Spa", photo: "https://images.unsplash.com/photo-1583557537644-bc0ec58e9a14?w=1200&q=85" },
  { salonId: 23, name: "Luxe Noir Beauty Lounge", photo: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&q=85" },
  { salonId: 24, name: "Serenity Suites Spa & Salon", photo: "https://images.unsplash.com/photo-1620331311520-246422fd82f9?w=1200&q=85" },
  { salonId: 25, name: "Imperial Beauty Gallery", photo: "https://images.unsplash.com/photo-1522337094846-8a818192de1f?w=1200&q=85" },
  { salonId: 26, name: "Velvet & Co. Salon", photo: "https://images.unsplash.com/photo-1562004760-aceed7bb0fe3?w=1200&q=85" },
  { salonId: 27, name: "Maison de Beauté", photo: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1200&q=85" },
  { salonId: 28, name: "Diamond Lux Salon & Spa", photo: "https://images.unsplash.com/photo-1596704017254-9b121068ec31?w=1200&q=85" },
  { salonId: 32, name: "Perfection Nails", photo: "https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=1200&q=85" },
  { salonId: 33, name: "The Courtyard Spa & Salon", photo: "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=1200&q=85" },
  { salonId: 34, name: "Aurelia Beauty Studio", photo: "https://images.unsplash.com/photo-1633681926035-ec1ac984418a?w=1200&q=85" },
  { salonId: 35, name: "Bella Mia Beauty Lounge", photo: "https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=1200&q=85" },
  { salonId: 36, name: "The Sanctuary Salon & Spa", photo: "https://images.unsplash.com/photo-1600948836098-34a66c50b169?w=1200&q=85" },
  { salonId: 37, name: "Regal Reflexions Spa", photo: "https://images.unsplash.com/photo-1591343395082-e120087004b4?w=1200&q=85" },
  { salonId: 38, name: "Cobalt Beauty Collective", photo: "https://images.unsplash.com/photo-1590540180480-4c9ee90b22c3?w=1200&q=85" },
  { salonId: 39, name: "Le Jardin Beauty House", photo: "https://images.unsplash.com/photo-1610992015708-3e9f004f7dc0?w=1200&q=85" },
  { salonId: 40, name: "The Marque Salon & Spa", photo: "https://images.unsplash.com/photo-1507120410856-1f35574c3b45?w=1200&q=85" },
  { salonId: 41, name: "Crystal Luxe Spa & Salon", photo: "https://images.unsplash.com/photo-1629140727571-9b5c6f6267b4?w=1200&q=85" },
  { salonId: 42, name: "Grande Couture Salon", photo: "https://images.unsplash.com/photo-1566068418668-95d8f8d80e88?w=1200&q=85" }
];

async function updateAllPhotos() {
  console.log("\n" + "=".repeat(70));
  console.log("🎨 UPDATING ALL SALONS WITH 100% UNIQUE PHOTOS");
  console.log("=".repeat(70) + "\n");
  
  // First, verify all URLs are unique
  const photoUrls = ALL_UNIQUE_PHOTOS.map(s => s.photo);
  const uniqueUrls = new Set(photoUrls);
  
  if (photoUrls.length !== uniqueUrls.size) {
    console.error("❌ ERROR: Duplicate URLs found in photo list!");
    process.exit(1);
  }
  
  console.log(`✅ Verified: All ${photoUrls.length} photos are unique!\n`);
  
  let updated = 0;
  let notFound = 0;
  
  for (const salon of ALL_UNIQUE_PHOTOS) {
    try {
      const [result] = await db.query(
        "UPDATE salons SET profile_picture = ? WHERE salon_id = ?",
        [salon.photo, salon.salonId]
      );
      
      if (result.affectedRows > 0) {
        console.log(`✅ ID ${salon.salonId}: ${salon.name}`);
        updated++;
      } else {
        console.log(`⚠️  ID ${salon.salonId}: ${salon.name} - Not found in database`);
        notFound++;
      }
    } catch (error) {
      console.error(`❌ ID ${salon.salonId}: ${error.message}`);
    }
  }
  
  console.log("\n" + "=".repeat(70));
  console.log(`🎉 COMPLETE!`);
  console.log(`   ✅ Updated: ${updated} salons`);
  console.log(`   ⚠️  Not Found: ${notFound} salons`);
  console.log(`   🎨 ALL photos are 100% unique - NO DUPLICATES!`);
  console.log("=".repeat(70) + "\n");
  
  await db.end();
  process.exit(0);
}

updateAllPhotos();


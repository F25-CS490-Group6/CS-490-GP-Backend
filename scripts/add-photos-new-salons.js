const { db } = require("../config/database");

// Professional high-end salon photos for the new salons
const SALON_PHOTOS = {
  eleganceStudio: {
    salon_id: 31,
    photos: [
      {
        url: "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?q=80&w=2070",
        type: "cover",
        caption: "Elegance Hair Studio - Sophisticated Hair Design",
        is_primary: 1
      },
      {
        url: "https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?q=80&w=2070",
        type: "interior",
        caption: "Elegant styling stations",
        is_primary: 0
      },
      {
        url: "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=2074",
        type: "interior",
        caption: "Modern luxury interior",
        is_primary: 0
      },
      {
        url: "https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=2069",
        type: "interior",
        caption: "Premium treatment area",
        is_primary: 0
      },
      {
        url: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?q=80&w=2087",
        type: "gallery",
        caption: "Expert color artistry",
        is_primary: 0
      },
      {
        url: "https://images.unsplash.com/photo-1595475207225-428b7f6f30b8?q=80&w=2080",
        type: "gallery",
        caption: "Professional styling services",
        is_primary: 0
      },
      {
        url: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?q=80&w=2071",
        type: "gallery",
        caption: "Luxury treatments",
        is_primary: 0
      },
      {
        url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=2069",
        type: "gallery",
        caption: "Premium hair care",
        is_primary: 0
      }
    ]
  },
  trendsetterSalon: {
    salon_id: 32,
    photos: [
      {
        url: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=2070",
        type: "cover",
        caption: "Trendsetter Salon & Spa - Innovation Meets Wellness",
        is_primary: 1
      },
      {
        url: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074",
        type: "interior",
        caption: "Eco-friendly modern space",
        is_primary: 0
      },
      {
        url: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=80&w=2070",
        type: "interior",
        caption: "Sustainable styling stations",
        is_primary: 0
      },
      {
        url: "https://images.unsplash.com/photo-1634449571010-02389ed0f9b0?q=80&w=2071",
        type: "interior",
        caption: "Wellness spa area",
        is_primary: 0
      },
      {
        url: "https://images.unsplash.com/photo-1562004760-aceed3ccc67d?q=80&w=2035",
        type: "gallery",
        caption: "Creative color transformations",
        is_primary: 0
      },
      {
        url: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?q=80&w=2080",
        type: "gallery",
        caption: "Precision cutting",
        is_primary: 0
      },
      {
        url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2070",
        type: "gallery",
        caption: "Organic treatments",
        is_primary: 0
      },
      {
        url: "https://images.unsplash.com/photo-1600185365873-cdbdb18a3fce?q=80&w=2069",
        type: "gallery",
        caption: "Spa relaxation",
        is_primary: 0
      }
    ]
  }
};

async function addSalonPhotos() {
  console.log("\n📸 Adding professional salon photos...\n");
  
  try {
    // Add photos for Elegance Hair Studio
    console.log("🏢 Elegance Hair Studio (Salon ID: 31)");
    for (const photo of SALON_PHOTOS.eleganceStudio.photos) {
      await db.query(
        `INSERT INTO salon_photos (salon_id, photo_url, photo_type, caption, is_primary)
         VALUES (?, ?, ?, ?, ?)`,
        [SALON_PHOTOS.eleganceStudio.salon_id, photo.url, photo.type, photo.caption, photo.is_primary]
      );
      console.log(`   ✅ Added ${photo.type}: ${photo.caption}`);
    }
    
    // Add photos for Trendsetter Salon & Spa
    console.log("\n🏢 Trendsetter Salon & Spa (Salon ID: 32)");
    for (const photo of SALON_PHOTOS.trendsetterSalon.photos) {
      await db.query(
        `INSERT INTO salon_photos (salon_id, photo_url, photo_type, caption, is_primary)
         VALUES (?, ?, ?, ?, ?)`,
        [SALON_PHOTOS.trendsetterSalon.salon_id, photo.url, photo.type, photo.caption, photo.is_primary]
      );
      console.log(`   ✅ Added ${photo.type}: ${photo.caption}`);
    }
    
    // Update salon profile pictures
    console.log("\n🎨 Updating salon profile pictures...");
    await db.query(
      'UPDATE salons SET profile_picture = ? WHERE salon_id = ?',
      ['https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=2069', 31]
    );
    console.log('   ✅ Elegance Hair Studio profile picture updated');
    
    await db.query(
      'UPDATE salons SET profile_picture = ? WHERE salon_id = ?',
      ['https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=2070', 32]
    );
    console.log('   ✅ Trendsetter Salon & Spa profile picture updated');
    
    console.log("\n\n🎉 All photos added successfully!");
    console.log("\n📊 Summary:");
    console.log(`   Elegance Hair Studio: ${SALON_PHOTOS.eleganceStudio.photos.length} photos`);
    console.log(`   Trendsetter Salon & Spa: ${SALON_PHOTOS.trendsetterSalon.photos.length} photos`);
    console.log("\n✨ Photos include: cover images, interior shots, and gallery images");
    
  } catch (error) {
    console.error("\n❌ Error adding photos:", error);
    throw error;
  } finally {
    await db.end();
  }
}

// Run the script
addSalonPhotos();


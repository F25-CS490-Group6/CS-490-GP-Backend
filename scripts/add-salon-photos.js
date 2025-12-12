const { db } = require("../config/database");

// Professional high-end salon photos from stock photo sites
const SALON_PHOTOS = {
  luxeBeauty: {
    salon_id: 29,
    photos: [
      {
        url: "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=2074",
        type: "cover",
        caption: "Luxe Beauty Studio - Your Premier Beauty Destination",
        is_primary: 1
      },
      {
        url: "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?q=80&w=2070",
        type: "interior",
        caption: "Modern and elegant styling stations",
        is_primary: 0
      },
      {
        url: "https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=2069",
        type: "interior",
        caption: "Luxurious waiting area with premium amenities",
        is_primary: 0
      },
      {
        url: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=2070",
        type: "interior",
        caption: "State-of-the-art treatment rooms",
        is_primary: 0
      },
      {
        url: "https://images.unsplash.com/photo-1595475207225-428b7f6f30b8?q=80&w=2080",
        type: "gallery",
        caption: "Expert colorists at work",
        is_primary: 0
      },
      {
        url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=2069",
        type: "gallery",
        caption: "Premium hair care products",
        is_primary: 0
      },
      {
        url: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?q=80&w=2071",
        type: "gallery",
        caption: "Relaxing spa environment",
        is_primary: 0
      },
      {
        url: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?q=80&w=2070",
        type: "gallery",
        caption: "Professional nail care services",
        is_primary: 0
      }
    ]
  },
  urbanEdge: {
    salon_id: 30,
    photos: [
      {
        url: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074",
        type: "cover",
        caption: "Urban Edge Salon - Where Style Meets Innovation",
        is_primary: 1
      },
      {
        url: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=80&w=2070",
        type: "interior",
        caption: "Contemporary styling area with natural light",
        is_primary: 0
      },
      {
        url: "https://images.unsplash.com/photo-1634449571010-02389ed0f9b0?q=80&w=2071",
        type: "interior",
        caption: "Modern barber stations",
        is_primary: 0
      },
      {
        url: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?q=80&w=2070",
        type: "interior",
        caption: "Trendy reception area",
        is_primary: 0
      },
      {
        url: "https://images.unsplash.com/photo-1562004760-aceed3ccc67d?q=80&w=2035",
        type: "gallery",
        caption: "Creative color transformations",
        is_primary: 0
      },
      {
        url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2070",
        type: "gallery",
        caption: "Men's grooming specialists",
        is_primary: 0
      },
      {
        url: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?q=80&w=2080",
        type: "gallery",
        caption: "Precision cutting techniques",
        is_primary: 0
      },
      {
        url: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?q=80&w=2087",
        type: "gallery",
        caption: "Professional styling services",
        is_primary: 0
      }
    ]
  }
};

async function addSalonPhotos() {
  console.log("\n📸 Adding professional salon photos...\n");
  
  try {
    // Add photos for Luxe Beauty Studio
    console.log("🏢 Luxe Beauty Studio (Salon ID: 29)");
    for (const photo of SALON_PHOTOS.luxeBeauty.photos) {
      await db.query(
        `INSERT INTO salon_photos (salon_id, photo_url, photo_type, caption, is_primary)
         VALUES (?, ?, ?, ?, ?)`,
        [SALON_PHOTOS.luxeBeauty.salon_id, photo.url, photo.type, photo.caption, photo.is_primary]
      );
      console.log(`   ✅ Added ${photo.type}: ${photo.caption}`);
    }
    
    // Add photos for Urban Edge Salon
    console.log("\n🏢 Urban Edge Salon (Salon ID: 30)");
    for (const photo of SALON_PHOTOS.urbanEdge.photos) {
      await db.query(
        `INSERT INTO salon_photos (salon_id, photo_url, photo_type, caption, is_primary)
         VALUES (?, ?, ?, ?, ?)`,
        [SALON_PHOTOS.urbanEdge.salon_id, photo.url, photo.type, photo.caption, photo.is_primary]
      );
      console.log(`   ✅ Added ${photo.type}: ${photo.caption}`);
    }
    
    console.log("\n\n🎉 All photos added successfully!");
    console.log("\n📊 Summary:");
    console.log(`   Luxe Beauty Studio: ${SALON_PHOTOS.luxeBeauty.photos.length} photos`);
    console.log(`   Urban Edge Salon: ${SALON_PHOTOS.urbanEdge.photos.length} photos`);
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


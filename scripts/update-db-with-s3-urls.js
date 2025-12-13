require('dotenv').config();
const { db } = require('../config/database');

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'stygo-salon-photos';
const REGION = process.env.AWS_REGION || 'us-east-1';
const BASE_URL = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/salons`;

const SALON_PHOTOS = [
  { salonId: 33, file: 'salon1.jpg', name: "Éclat Elite Spa & Salon" },
  { salonId: 34, file: 'salon2.jpg', name: "Opalessence Spa Boutique" },
  { salonId: 35, file: 'salon3.jpg', name: "Pearl Esthetics & Atelier" },
  { salonId: 36, file: 'salon4.jpg', name: "The Atelier Salon & Spa" },
  { salonId: 37, file: 'salon5.jpg', name: "Luxe Noir Beauty Lounge" },
  { salonId: 38, file: 'salon6.jpg', name: "Serenity Suites Spa & Salon" },
  { salonId: 39, file: 'salon7.jpg', name: "Imperial Beauty Gallery" },
  { salonId: 40, file: 'salon8.jpg', name: "Velvet & Co. Salon" },
  { salonId: 41, file: 'salon9.jpg', name: "Maison de Beauté" },
  { salonId: 42, file: 'salon10.jpg', name: "Diamond Lux Salon & Spa" }
];

async function updateDatabase() {
  console.log("\n" + "=".repeat(70));
  console.log("🔄 UPDATE DATABASE WITH S3 PHOTO URLS");
  console.log("=".repeat(70) + "\n");
  console.log(`📦 S3 Base URL: ${BASE_URL}\n`);
  
  let updated = 0;
  
  for (const salon of SALON_PHOTOS) {
    const url = `${BASE_URL}/${salon.file}`;
    
    try {
      await db.query(
        "UPDATE salons SET profile_picture = ? WHERE salon_id = ?",
        [url, salon.salonId]
      );
      console.log(`✅ ${salon.salonId}: ${salon.name}`);
      console.log(`   ${url}\n`);
      updated++;
    } catch (error) {
      console.error(`❌ Salon ID ${salon.salonId}: ${error.message}\n`);
    }
  }
  
  console.log("=".repeat(70));
  console.log(`🎉 Complete! Updated ${updated}/${SALON_PHOTOS.length} salons`);
  console.log("=".repeat(70) + "\n");
  
  await db.end();
  process.exit(0);
}

updateDatabase();


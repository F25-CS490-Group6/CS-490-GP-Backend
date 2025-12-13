require('dotenv').config();
const { db } = require('../config/database');

// Your S3 bucket info from the console
const BUCKET_NAME = 'stygo-uploads';
const REGION = 'us-east-2';
const BASE_URL = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com`;

const SALON_PHOTOS = [
  { salonId: 33, file: 'salon1.png', name: "Éclat Elite Spa & Salon" },
  { salonId: 34, file: 'salon2.png', name: "Opalessence Spa Boutique" },
  { salonId: 35, file: 'salon3.png', name: "Pearl Esthetics & Atelier" },
  { salonId: 36, file: 'salon4.png', name: "The Atelier Salon & Spa" },
  { salonId: 37, file: 'salon5.png', name: "Luxe Noir Beauty Lounge" },
  { salonId: 38, file: 'salon6.png', name: "Serenity Suites Spa & Salon" },
  { salonId: 39, file: 'salon7.png', name: "Imperial Beauty Gallery" },
  { salonId: 40, file: 'salon8.png', name: "Velvet & Co. Salon" },
  { salonId: 41, file: 'salon9.png', name: "Maison de Beauté" },
  { salonId: 42, file: 'salon10.png', name: "Diamond Lux Salon & Spa" }
];

async function updateDatabase() {
  console.log("\n" + "=".repeat(70));
  console.log("🔄 UPDATING DATABASE WITH YOUR S3 PHOTOS");
  console.log("=".repeat(70) + "\n");
  console.log(`📦 Bucket: ${BUCKET_NAME}`);
  console.log(`🌍 Region: ${REGION}`);
  console.log(`🔗 Base URL: ${BASE_URL}\n`);
  
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
  console.log(`🎉 Complete! Updated ${updated}/${SALON_PHOTOS.length} salons with YOUR photos!`);
  console.log("=".repeat(70) + "\n");
  
  console.log("📋 Your photos are now live at:");
  SALON_PHOTOS.forEach(s => {
    console.log(`   ${BASE_URL}/${s.file}`);
  });
  console.log("\n");
  
  await db.end();
  process.exit(0);
}

updateDatabase();


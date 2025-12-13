require('dotenv').config();
const { db } = require('../config/database');

async function checkPhotos() {
  console.log("\n" + "=".repeat(80));
  console.log("📸 CHECKING ALL SALON PHOTOS");
  console.log("=".repeat(80) + "\n");
  
  const [salons] = await db.query(`
    SELECT salon_id, name, profile_picture 
    FROM salons 
    ORDER BY salon_id DESC
  `);
  
  console.log(`Found ${salons.length} total salons\n`);
  
  const photoMap = new Map();
  const noPhoto = [];
  const duplicates = [];
  
  salons.forEach(salon => {
    const photo = salon.profile_picture;
    
    if (!photo || photo === 'NONE') {
      noPhoto.push(salon);
    } else {
      if (photoMap.has(photo)) {
        duplicates.push({ salon, duplicateOf: photoMap.get(photo) });
      } else {
        photoMap.set(photo, salon);
      }
    }
  });
  
  console.log("📊 SUMMARY:\n");
  console.log(`✅ Salons with unique photos: ${photoMap.size}`);
  console.log(`❌ Salons missing photos: ${noPhoto.length}`);
  console.log(`⚠️  Duplicate photos: ${duplicates.length}\n`);
  
  if (noPhoto.length > 0) {
    console.log("=" .repeat(80));
    console.log("❌ SALONS MISSING PHOTOS:");
    console.log("=".repeat(80));
    noPhoto.forEach(s => {
      console.log(`  ID ${s.salon_id}: ${s.name}`);
    });
    console.log();
  }
  
  if (duplicates.length > 0) {
    console.log("=".repeat(80));
    console.log("⚠️  DUPLICATE PHOTOS:");
    console.log("=".repeat(80));
    duplicates.forEach(d => {
      console.log(`  ID ${d.salon.salon_id}: ${d.salon.name}`);
      console.log(`     Same as ID ${d.duplicateOf.salon_id}: ${d.duplicateOf.name}`);
      console.log(`     Photo: ${d.salon.profile_picture}\n`);
    });
  }
  
  console.log("=".repeat(80));
  console.log("📋 ALL SALONS:");
  console.log("=".repeat(80));
  salons.forEach(s => {
    const status = !s.profile_picture || s.profile_picture === 'NONE' ? '❌ NO PHOTO' : '✅';
    console.log(`  ${status} ID ${s.salon_id}: ${s.name}`);
    if (s.profile_picture && s.profile_picture !== 'NONE') {
      console.log(`     ${s.profile_picture.substring(0, 70)}...`);
    }
    console.log();
  });
  
  await db.end();
  process.exit(0);
}

checkPhotos();


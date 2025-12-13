require('dotenv').config();
const { db } = require('../config/database');

async function checkSalons() {
  console.log("\n📋 Checking existing salons in database...\n");
  
  const [salons] = await db.query(`
    SELECT salon_id, name, profile_picture 
    FROM salons 
    ORDER BY salon_id DESC 
    LIMIT 20
  `);
  
  console.log(`Found ${salons.length} salons:\n`);
  salons.forEach(s => {
    console.log(`  ${s.salon_id}: ${s.name}`);
    console.log(`     Photo: ${s.profile_picture || 'NONE'}\n`);
  });
  
  await db.end();
  process.exit(0);
}

checkSalons();


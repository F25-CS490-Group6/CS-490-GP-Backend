require('dotenv').config();
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const { db } = require('../config/database');

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'stygo-salon-photos';

// Mapping of photo files to salon IDs
const SALON_MAPPING = [
  { file: 'salon1.png', salonId: 33, name: "Éclat Elite Spa & Salon" },
  { file: 'salon2.png', salonId: 34, name: "Opalessence Spa Boutique" },
  { file: 'salon3.png', salonId: 35, name: "Pearl Esthetics & Atelier" },
  { file: 'salon4.png', salonId: 36, name: "The Atelier Salon & Spa" },
  { file: 'salon5.png', salonId: 37, name: "Luxe Noir Beauty Lounge" },
  { file: 'salon6.png', salonId: 38, name: "Serenity Suites Spa & Salon" },
  { file: 'salon7.png', salonId: 39, name: "Imperial Beauty Gallery" },
  { file: 'salon8.png', salonId: 40, name: "Velvet & Co. Salon" },
  { file: 'salon9.png', salonId: 41, name: "Maison de Beauté" },
  { file: 'salon10.png', salonId: 42, name: "Diamond Lux Salon & Spa" }
];

async function uploadToS3(filePath, fileName) {
  const fileContent = fs.readFileSync(filePath);
  const ext = path.extname(fileName).toLowerCase();
  
  const contentTypeMap = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp'
  };
  
  const params = {
    Bucket: BUCKET_NAME,
    Key: `salons/${fileName}`,
    Body: fileContent,
    ContentType: contentTypeMap[ext] || 'image/jpeg',
    ACL: 'public-read'
  };

  const result = await s3.upload(params).promise();
  return result.Location;
}

async function updateSalonPhoto(salonId, photoUrl) {
  await db.query(
    "UPDATE salons SET profile_picture = ? WHERE salon_id = ?",
    [photoUrl, salonId]
  );
}

async function uploadAndUpdate() {
  const photosDir = process.argv[2] || path.join(__dirname, '../photos');
  
  console.log("\n" + "=".repeat(70));
  console.log("📸 UPLOAD SALON PHOTOS TO S3 & UPDATE DATABASE");
  console.log("=".repeat(70) + "\n");
  
  // Check if directory exists
  if (!fs.existsSync(photosDir)) {
    console.log("❌ Photos directory not found!");
    console.log(`\nPlease create the directory and add your photos:`);
    console.log(`   mkdir ${photosDir}`);
    console.log(`\nThen add photos named: salon1.jpg, salon2.jpg, ... salon10.jpg\n`);
    process.exit(1);
  }
  
  console.log(`📁 Photos directory: ${photosDir}\n`);
  
  let uploaded = 0;
  let failed = 0;
  const uploadedUrls = [];
  
  for (const mapping of SALON_MAPPING) {
    const filePath = path.join(photosDir, mapping.file);
    
    // Check for different extensions
    let actualFilePath = filePath;
    if (!fs.existsSync(filePath)) {
      const alternatives = ['.jpeg', '.png', '.webp', '.JPG', '.JPEG', '.PNG'];
      const baseName = path.basename(filePath, path.extname(filePath));
      let found = false;
      
      for (const ext of alternatives) {
        const altPath = path.join(photosDir, baseName + ext);
        if (fs.existsSync(altPath)) {
          actualFilePath = altPath;
          found = true;
          break;
        }
      }
      
      if (!found) {
        console.log(`⏭️  Skipping ${mapping.file} - file not found`);
        failed++;
        continue;
      }
    }
    
    try {
      console.log(`📤 Uploading ${mapping.name}...`);
      
      // Upload to S3
      const url = await uploadToS3(actualFilePath, mapping.file);
      console.log(`   ✅ S3: ${url}`);
      
      // Update database
      await updateSalonPhoto(mapping.salonId, url);
      console.log(`   ✅ Database updated for Salon ID ${mapping.salonId}\n`);
      
      uploadedUrls.push({ salon: mapping.name, url });
      uploaded++;
      
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}\n`);
      failed++;
    }
  }
  
  console.log("=".repeat(70));
  console.log(`🎉 COMPLETE!`);
  console.log(`   ✅ Uploaded: ${uploaded} photos`);
  console.log(`   ❌ Failed: ${failed} photos`);
  console.log("=".repeat(70) + "\n");
  
  if (uploadedUrls.length > 0) {
    console.log("📋 UPLOADED PHOTO URLS:\n");
    uploadedUrls.forEach(({ salon, url }) => {
      console.log(`${salon}:`);
      console.log(`  ${url}\n`);
    });
  }
  
  await db.end();
  process.exit(0);
}

// Check if AWS credentials are configured
if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  console.log("\n❌ AWS credentials not found!");
  console.log("\nAdd these to your .env file:");
  console.log("AWS_ACCESS_KEY_ID=your_access_key");
  console.log("AWS_SECRET_ACCESS_KEY=your_secret_key");
  console.log("AWS_REGION=us-east-1");
  console.log("S3_BUCKET_NAME=stygo-salon-photos\n");
  process.exit(1);
}

uploadAndUpdate();


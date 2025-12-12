const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const multer = require("multer");
const multerS3 = require("multer-s3");
const path = require("path");

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || "stygo-uploads";

// File filter - only accept images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"));
  }
};

// Create S3 upload for salon images
// Note: We don't use ACL here - public access is granted via bucket policy
const salonUpload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const filename = "salons/salon-" + uniqueSuffix + path.extname(file.originalname);
      cb(null, filename);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter,
});

// Create S3 upload for service photos (before/after)
const serviceUpload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const filename = "services/service-" + uniqueSuffix + path.extname(file.originalname);
      cb(null, filename);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter,
});

// Create S3 upload for gallery photos
const galleryUpload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const filename = "gallery/gallery-" + uniqueSuffix + path.extname(file.originalname);
      cb(null, filename);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter,
});

// Delete file from S3
const deleteFromS3 = async (fileUrl) => {
  try {
    // Extract key from URL
    // URL format: https://bucket.s3.region.amazonaws.com/key or just the key
    let key = fileUrl;
    
    if (fileUrl.includes("amazonaws.com")) {
      const url = new URL(fileUrl);
      key = url.pathname.substring(1); // Remove leading slash
    } else if (fileUrl.startsWith("/")) {
      key = fileUrl.substring(1); // Remove leading slash
    }

    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
    console.log(`Deleted from S3: ${key}`);
    return true;
  } catch (error) {
    console.error("Error deleting from S3:", error);
    return false;
  }
};

// Get full S3 URL from key
const getS3Url = (key) => {
  if (!key) return null;
  if (key.startsWith("http")) return key;
  return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || "us-east-2"}.amazonaws.com/${key}`;
};

// Check if S3 is configured
const isS3Configured = () => {
  return !!(
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_S3_BUCKET
  );
};

module.exports = {
  salonUpload,
  serviceUpload,
  galleryUpload,
  deleteFromS3,
  getS3Url,
  isS3Configured,
  s3Client,
  BUCKET_NAME,
};


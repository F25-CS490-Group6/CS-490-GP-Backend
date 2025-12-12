const multer = require('multer');
const path = require('path');
const { serviceUpload, galleryUpload, isS3Configured } = require('./s3Upload');

// Configure local storage as fallback
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Use 'service-' prefix for service photos (before/after photos)
    cb(null, 'service-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter - only accept images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

// Configure local upload as fallback
const localUpload = multer({
  storage: localStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit (matches frontend)
  fileFilter: fileFilter
});

// Use S3 upload if configured, otherwise fall back to local storage
const upload = isS3Configured() ? serviceUpload : localUpload;

module.exports = upload;


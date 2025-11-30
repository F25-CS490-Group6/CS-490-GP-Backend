-- =====================================================
-- CREATE SALON_PHOTOS TABLE FOR GALLERY
-- =====================================================

USE salon_platform;

CREATE TABLE IF NOT EXISTS salon_photos (
  photo_id INT AUTO_INCREMENT PRIMARY KEY,
  salon_id INT NOT NULL,
  photo_url VARCHAR(500) NOT NULL,
  caption VARCHAR(500) NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (salon_id) REFERENCES salons(salon_id) ON DELETE CASCADE,
  INDEX idx_salon (salon_id),
  INDEX idx_uploaded (uploaded_at)
);


-- Migrations applied on Dec 11, 2025
-- Run these AFTER importing backup_20251211.sql

-- 1. Add salon_id column to service_photos (if not exists)
SET @dbname = DATABASE();
SET @tablename = 'service_photos';
SET @columnname = 'salon_id';

SET @preparedStatement = (
  SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = @dbname 
     AND TABLE_NAME = @tablename 
     AND COLUMN_NAME = @columnname) > 0,
    'SELECT "salon_id column already exists"',
    'ALTER TABLE service_photos ADD COLUMN salon_id INT NULL AFTER appointment_id, ADD INDEX idx_service_photos_salon (salon_id)'
  )
);
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 2. Allow NULL for appointment_id in service_photos
ALTER TABLE service_photos MODIFY COLUMN appointment_id INT NULL;

-- Verify the changes
SELECT 'service_photos table structure:' as info;
DESCRIBE service_photos;


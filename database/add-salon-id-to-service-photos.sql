-- Migration: Add salon_id column to service_photos table
-- This makes the deployed database match the local database

-- Check if column exists, if not add it
SET @dbname = DATABASE();
SET @tablename = 'service_photos';
SET @columnname = 'salon_id';

SET @preparedStatement = (
  SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = @dbname 
     AND TABLE_NAME = @tablename 
     AND COLUMN_NAME = @columnname) > 0,
    'SELECT "Column already exists"',
    'ALTER TABLE service_photos ADD COLUMN salon_id INT NULL AFTER appointment_id, ADD INDEX idx_service_photos_salon (salon_id)'
  )
);

PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

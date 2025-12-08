-- Add deposit_percentage column to salon_settings table
-- This allows salons to set a deposit percentage for "pay in store" appointments

-- Check if column exists before adding (MySQL 5.7 compatible)
SET @col_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'salon_settings' 
    AND COLUMN_NAME = 'deposit_percentage'
);

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE salon_settings ADD COLUMN deposit_percentage DECIMAL(5,2) DEFAULT 0.00 COMMENT "Deposit percentage required for pay-in-store appointments (0-100)"',
  'SELECT "Column deposit_percentage already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


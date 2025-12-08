-- ADD MISSING COLUMNS TO PAYMENTS TABLE
-- =====================================================
-- This script adds the missing columns to the existing payments table
-- Run this if you already have a payments table but it's missing these columns

USE salon_platform;

-- Check and add stripe_checkout_session_id
SET @col_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'salon_platform' 
    AND TABLE_NAME = 'payments' 
    AND COLUMN_NAME = 'stripe_checkout_session_id'
);

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE payments ADD COLUMN stripe_checkout_session_id VARCHAR(255) AFTER payment_status',
  'SELECT "Column stripe_checkout_session_id already exists" AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add payment_link
SET @col_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'salon_platform' 
    AND TABLE_NAME = 'payments' 
    AND COLUMN_NAME = 'payment_link'
);

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE payments ADD COLUMN payment_link TEXT AFTER stripe_checkout_session_id',
  'SELECT "Column payment_link already exists" AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add stripe_payment_intent_id
SET @col_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'salon_platform' 
    AND TABLE_NAME = 'payments' 
    AND COLUMN_NAME = 'stripe_payment_intent_id'
);

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE payments ADD COLUMN stripe_payment_intent_id VARCHAR(255) AFTER payment_link',
  'SELECT "Column stripe_payment_intent_id already exists" AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add failure_reason
SET @col_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'salon_platform' 
    AND TABLE_NAME = 'payments' 
    AND COLUMN_NAME = 'failure_reason'
);

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE payments ADD COLUMN failure_reason TEXT AFTER stripe_payment_intent_id',
  'SELECT "Column failure_reason already exists" AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add index if it doesn't exist (check first)
SET @index_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = 'salon_platform' 
    AND TABLE_NAME = 'payments' 
    AND INDEX_NAME = 'idx_stripe_session'
);

SET @sql = IF(@index_exists = 0,
  'CREATE INDEX idx_stripe_session ON payments(stripe_checkout_session_id)',
  'SELECT "Index idx_stripe_session already exists" AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verify columns were added
DESCRIBE payments;

SELECT 'Payment columns migration completed!' AS status;

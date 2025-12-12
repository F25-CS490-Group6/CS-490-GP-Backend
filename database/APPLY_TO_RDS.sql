-- =====================================================
-- LOYALTY SYSTEM DATABASE MIGRATION FOR RDS
-- Apply these changes to production database
-- =====================================================

-- 1. Add loyalty configuration columns to salon_settings
-- -------------------------------------------------------
-- Check if columns exist first, then add if missing

-- Add loyalty_enabled column if it doesn't exist
SET @col_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'salon_platform' 
  AND TABLE_NAME = 'salon_settings' 
  AND COLUMN_NAME = 'loyalty_enabled'
);

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE salon_settings ADD COLUMN loyalty_enabled BOOLEAN DEFAULT TRUE COMMENT "Whether loyalty program is active for this salon"',
  'SELECT "loyalty_enabled already exists" AS status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add points_per_dollar column if it doesn't exist
SET @col_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'salon_platform' 
  AND TABLE_NAME = 'salon_settings' 
  AND COLUMN_NAME = 'points_per_dollar'
);

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE salon_settings ADD COLUMN points_per_dollar DECIMAL(5,2) DEFAULT 1.00 COMMENT "Points earned per dollar spent"',
  'SELECT "points_per_dollar already exists" AS status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add points_per_visit column if it doesn't exist
SET @col_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'salon_platform' 
  AND TABLE_NAME = 'salon_settings' 
  AND COLUMN_NAME = 'points_per_visit'
);

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE salon_settings ADD COLUMN points_per_visit INT DEFAULT 10 COMMENT "Bonus points per completed visit"',
  'SELECT "points_per_visit already exists" AS status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add redeem_rate column if it doesn't exist
SET @col_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'salon_platform' 
  AND TABLE_NAME = 'salon_settings' 
  AND COLUMN_NAME = 'redeem_rate'
);

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE salon_settings ADD COLUMN redeem_rate DECIMAL(5,2) DEFAULT 100.00 COMMENT "Points per dollar discount (e.g., 100 = 100 points = $1)"',
  'SELECT "redeem_rate already exists" AS status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add min_points_redeem column if it doesn't exist
SET @col_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'salon_platform' 
  AND TABLE_NAME = 'salon_settings' 
  AND COLUMN_NAME = 'min_points_redeem'
);

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE salon_settings ADD COLUMN min_points_redeem INT DEFAULT 100 COMMENT "Minimum points required to redeem"',
  'SELECT "min_points_redeem already exists" AS status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2. Add index for faster lookups (if not exists)
-- -------------------------------------------------
SET @index_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = 'salon_platform' 
  AND TABLE_NAME = 'salon_settings' 
  AND INDEX_NAME = 'idx_salon_loyalty'
);

SET @sql = IF(@index_exists = 0,
  'CREATE INDEX idx_salon_loyalty ON salon_settings(salon_id, loyalty_enabled)',
  'SELECT "idx_salon_loyalty already exists" AS status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3. Update existing salons to have default loyalty settings
-- -----------------------------------------------------------
UPDATE salon_settings 
SET 
  loyalty_enabled = COALESCE(loyalty_enabled, TRUE),
  points_per_dollar = COALESCE(points_per_dollar, 1.00),
  points_per_visit = COALESCE(points_per_visit, 10),
  redeem_rate = COALESCE(redeem_rate, 100.00),
  min_points_redeem = COALESCE(min_points_redeem, 100)
WHERE salon_id IS NOT NULL;

-- Verify the changes
SELECT 'Migration complete!' AS status;
SELECT COUNT(*) as total_salons, 
       SUM(loyalty_enabled) as loyalty_enabled_count
FROM salon_settings;


-- Add loyalty configuration columns to salon_settings table
-- Run this migration to enable proper loyalty rewards configuration

-- Check and add loyalty_enabled
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'salon_settings' AND COLUMN_NAME = 'loyalty_enabled');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE salon_settings ADD COLUMN loyalty_enabled BOOLEAN DEFAULT TRUE COMMENT "Whether loyalty program is active for this salon"', 'SELECT "Column loyalty_enabled already exists" AS message');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Check and add points_per_dollar
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'salon_settings' AND COLUMN_NAME = 'points_per_dollar');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE salon_settings ADD COLUMN points_per_dollar DECIMAL(5,2) DEFAULT 1.00 COMMENT "Points earned per dollar spent"', 'SELECT "Column points_per_dollar already exists" AS message');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Check and add points_per_visit
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'salon_settings' AND COLUMN_NAME = 'points_per_visit');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE salon_settings ADD COLUMN points_per_visit INT DEFAULT 10 COMMENT "Bonus points per completed visit"', 'SELECT "Column points_per_visit already exists" AS message');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Check and add redeem_rate
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'salon_settings' AND COLUMN_NAME = 'redeem_rate');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE salon_settings ADD COLUMN redeem_rate DECIMAL(5,2) DEFAULT 0.01 COMMENT "Dollar value per point (e.g., 0.01 = 100 points = $1)"', 'SELECT "Column redeem_rate already exists" AS message');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Check and add min_points_redeem
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'salon_settings' AND COLUMN_NAME = 'min_points_redeem');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE salon_settings ADD COLUMN min_points_redeem INT DEFAULT 100 COMMENT "Minimum points required to redeem"', 'SELECT "Column min_points_redeem already exists" AS message');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add index for faster lookups (check if exists first)
SET @index_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'salon_settings' AND INDEX_NAME = 'idx_salon_loyalty');
SET @sql = IF(@index_exists = 0, 'CREATE INDEX idx_salon_loyalty ON salon_settings(salon_id, loyalty_enabled)', 'SELECT "Index idx_salon_loyalty already exists" AS message');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

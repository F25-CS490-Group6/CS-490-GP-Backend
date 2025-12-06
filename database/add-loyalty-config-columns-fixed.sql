-- Add loyalty configuration columns to salon_settings table
-- Run this migration to enable proper loyalty rewards configuration

-- Check and add columns (MySQL 9.5 compatible)
ALTER TABLE salon_settings
ADD COLUMN loyalty_enabled BOOLEAN DEFAULT TRUE COMMENT 'Whether loyalty program is active for this salon',
ADD COLUMN points_per_dollar DECIMAL(5,2) DEFAULT 1.00 COMMENT 'Points earned per dollar spent',
ADD COLUMN points_per_visit INT DEFAULT 10 COMMENT 'Bonus points per completed visit',
ADD COLUMN redeem_rate DECIMAL(5,2) DEFAULT 0.01 COMMENT 'Dollar value per point (e.g., 0.01 = 100 points = $1)',
ADD COLUMN min_points_redeem INT DEFAULT 100 COMMENT 'Minimum points required to redeem';

-- Add index for faster lookups
CREATE INDEX idx_salon_loyalty ON salon_settings(salon_id, loyalty_enabled);

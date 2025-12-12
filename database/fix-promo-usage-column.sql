-- Fix promo_code_usage table to use 'id' instead of 'usage_id'
-- This aligns production database with local database schema

ALTER TABLE promo_code_usage 
CHANGE COLUMN usage_id id INT AUTO_INCREMENT;

-- Verify the change
DESCRIBE promo_code_usage;


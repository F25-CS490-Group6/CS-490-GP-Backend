-- =====================================================
-- ADD SUBSCRIPTION_PLAN COLUMN TO USERS TABLE
-- =====================================================

USE salon_platform;

-- Add subscription_plan column (run this only if column doesn't exist)
ALTER TABLE users 
ADD COLUMN subscription_plan VARCHAR(50) DEFAULT 'free';


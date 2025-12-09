-- Fix redeem_rate column type and values
-- The column is INT which rounds 0.01 to 0, so we need to change it to DECIMAL

-- Step 1: Alter column to DECIMAL (this will convert existing values)
ALTER TABLE salon_settings 
MODIFY COLUMN redeem_rate DECIMAL(5,2) DEFAULT 0.01 COMMENT 'Dollar value per point (e.g., 0.01 = 100 points = $1)';

-- Step 2: Update all 0 values to 0.01 (now that column is DECIMAL, this will work)
UPDATE salon_settings 
SET redeem_rate = 0.01 
WHERE redeem_rate = 0 OR redeem_rate = 100 OR redeem_rate IS NULL;

-- Step 3: Verify the fix
SELECT salon_id, redeem_rate, loyalty_enabled 
FROM salon_settings 
ORDER BY salon_id;


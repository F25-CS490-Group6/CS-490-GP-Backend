-- Fix incorrect redeem_rate values in database
-- Set all 0 values and values > 1 to the correct default of 0.01

UPDATE salon_settings 
SET redeem_rate = 0.01 
WHERE redeem_rate = 0 OR redeem_rate > 1 OR redeem_rate IS NULL;

-- Also set default for any salons that don't have a redeem_rate configured
INSERT INTO salon_settings (salon_id, redeem_rate)
SELECT salon_id, 0.01
FROM salons
WHERE salon_id NOT IN (SELECT salon_id FROM salon_settings WHERE redeem_rate IS NOT NULL)
ON DUPLICATE KEY UPDATE redeem_rate = 0.01;

-- Verify the fix
SELECT salon_id, redeem_rate, loyalty_enabled 
FROM salon_settings 
WHERE redeem_rate IS NOT NULL
ORDER BY salon_id;


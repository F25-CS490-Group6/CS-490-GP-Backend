-- Fix incorrect redeem_rate values in salon_settings
-- Should be 0.01 (1 cent per point), not 100 (100 dollars per point!)

UPDATE salon_settings 
SET redeem_rate = 0.01 
WHERE redeem_rate >= 1 OR redeem_rate IS NULL;

-- Verify the fix
SELECT salon_id, loyalty_enabled, points_per_dollar, points_per_visit, redeem_rate, min_points_redeem 
FROM salon_settings 
WHERE salon_id = 21;


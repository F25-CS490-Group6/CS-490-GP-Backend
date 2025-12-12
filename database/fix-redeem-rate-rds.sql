-- Fix redeem_rate to use "points per dollar" system
-- redeem_rate = 100 means "100 points = $1 discount"
-- redeem_rate = 50 means "50 points = $1 discount", etc.

UPDATE salon_settings 
SET redeem_rate = 100
WHERE redeem_rate < 1 OR redeem_rate IS NULL;

-- Verify the fix
SELECT salon_id, loyalty_enabled, points_per_dollar, points_per_visit, redeem_rate, min_points_redeem 
FROM salon_settings 
WHERE salon_id = 21;


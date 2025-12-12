-- Fix loyalty settings for all existing salons
-- This ensures all salons have proper default values for loyalty points

-- Update existing salon_settings with proper defaults
UPDATE salon_settings 
SET 
  loyalty_enabled = COALESCE(loyalty_enabled, 1),
  points_per_dollar = CASE 
    WHEN points_per_dollar IS NULL OR points_per_dollar = 0 OR points_per_dollar > 10 THEN 1.00
    ELSE points_per_dollar 
  END,
  points_per_visit = COALESCE(points_per_visit, 10),
  redeem_rate = CASE 
    WHEN redeem_rate IS NULL OR redeem_rate = 0 OR redeem_rate > 1 THEN 0.01
    ELSE redeem_rate 
  END,
  min_points_redeem = COALESCE(min_points_redeem, 100);

-- Insert default settings for any salons that don't have settings yet
INSERT INTO salon_settings (salon_id, loyalty_enabled, points_per_dollar, points_per_visit, redeem_rate, min_points_redeem)
SELECT s.salon_id, 1, 1.00, 10, 0.01, 100
FROM salons s
LEFT JOIN salon_settings ss ON s.salon_id = ss.salon_id
WHERE ss.salon_id IS NULL;

-- Verify the fix
SELECT 
  s.salon_id, 
  s.name, 
  ss.loyalty_enabled, 
  ss.points_per_dollar, 
  ss.points_per_visit,
  ss.redeem_rate,
  ss.min_points_redeem
FROM salons s 
LEFT JOIN salon_settings ss ON s.salon_id = ss.salon_id
ORDER BY s.salon_id;


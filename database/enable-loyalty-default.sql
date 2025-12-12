-- Enable loyalty for all salons that have it disabled or not configured
UPDATE salon_settings 
SET loyalty_enabled = 1, 
    points_per_dollar = COALESCE(points_per_dollar, 1.00),
    points_per_visit = COALESCE(points_per_visit, 10),
    redeem_rate = COALESCE(redeem_rate, 0.01),
    min_points_redeem = COALESCE(min_points_redeem, 100)
WHERE loyalty_enabled = 0 OR loyalty_enabled IS NULL;

-- Insert default loyalty settings for salons that don't have settings yet
INSERT INTO salon_settings (salon_id, loyalty_enabled, points_per_dollar, points_per_visit, redeem_rate, min_points_redeem)
SELECT s.salon_id, 1, 1.00, 10, 0.01, 100
FROM salons s
LEFT JOIN salon_settings ss ON s.salon_id = ss.salon_id
WHERE ss.salon_id IS NULL;

-- Verify
SELECT s.salon_id, s.name, ss.loyalty_enabled, ss.points_per_dollar, ss.points_per_visit 
FROM salons s 
LEFT JOIN salon_settings ss ON s.salon_id = ss.salon_id
LIMIT 10;

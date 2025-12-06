-- =====================================================
-- ALTER REVIEWS TABLE TO ALLOW NULL appointment_id
-- =====================================================

USE salon_platform;

-- Make appointment_id nullable to allow salon-only reviews
ALTER TABLE reviews MODIFY COLUMN appointment_id INT NULL;


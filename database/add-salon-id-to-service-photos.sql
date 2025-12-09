-- Add salon_id to service_photos table to track which salon the photos belong to
-- This allows photos to be associated with a customer's visit to a specific salon

ALTER TABLE service_photos 
  ADD COLUMN salon_id INT NULL AFTER appointment_id;

-- Add index for salon_id lookups
ALTER TABLE service_photos
  ADD INDEX idx_salon_id (salon_id);

-- Add foreign key constraint
ALTER TABLE service_photos
  ADD CONSTRAINT service_photos_ibfk_salon 
  FOREIGN KEY (salon_id) REFERENCES salons(salon_id) ON DELETE CASCADE;

-- For existing photos, try to populate salon_id from appointments
UPDATE service_photos sp
INNER JOIN appointments a ON sp.appointment_id = a.appointment_id
SET sp.salon_id = a.salon_id
WHERE sp.appointment_id IS NOT NULL;

-- For photos without appointments, we'll need to set salon_id when adding new ones
-- Existing photos without appointments will have NULL salon_id (can be cleaned up later if needed)


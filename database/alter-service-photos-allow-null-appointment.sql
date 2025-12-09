-- Allow appointment_id to be NULL in service_photos table
-- This enables photos to be added directly to customer profiles without an appointment
ALTER TABLE service_photos 
  MODIFY COLUMN appointment_id INT NULL,
  DROP FOREIGN KEY service_photos_ibfk_1;

-- Re-add foreign key with ON DELETE SET NULL to handle appointment deletions gracefully
ALTER TABLE service_photos
  ADD CONSTRAINT service_photos_ibfk_1 
  FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id) ON DELETE SET NULL;


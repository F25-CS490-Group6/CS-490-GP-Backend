-- Add salon_id column to users table for owners
-- This allows owners to have salon_id directly accessible, matching the staff flow
-- This helps with testing and simplifies the codebase

ALTER TABLE users 
ADD COLUMN salon_id INT NULL,
ADD INDEX idx_users_salon_id (salon_id),
ADD FOREIGN KEY (salon_id) REFERENCES salons(salon_id) ON DELETE SET NULL;

-- Update existing owners to have salon_id set
UPDATE users u
INNER JOIN salons s ON s.owner_id = u.user_id
SET u.salon_id = s.salon_id
WHERE u.user_role = 'owner';


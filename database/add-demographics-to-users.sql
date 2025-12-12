-- Add gender and date_of_birth columns to users table for demographic purposes
-- Run this migration on the deployed RDS database

ALTER TABLE users 
ADD COLUMN gender ENUM('male', 'female', 'other', 'prefer_not_to_say') NULL AFTER profile_pic,
ADD COLUMN date_of_birth DATE NULL AFTER gender;

-- Verify the changes
DESCRIBE users;


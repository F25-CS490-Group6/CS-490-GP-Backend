-- Add gender and birth_year columns to users table if they don't exist

-- Check if columns exist and add them if missing
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS gender ENUM('male', 'female', 'nonbinary', 'prefer_not_say') DEFAULT NULL COMMENT 'User gender',
ADD COLUMN IF NOT EXISTS birth_year INT DEFAULT NULL COMMENT 'User birth year';

-- Show the updated table structure
DESCRIBE users;


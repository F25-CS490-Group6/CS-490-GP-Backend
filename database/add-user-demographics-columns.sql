-- Adds demographic fields to users for gender/age analysis
ALTER TABLE users
  ADD COLUMN gender ENUM('male','female','nonbinary','prefer_not_say','unknown') DEFAULT NULL AFTER user_role,
  ADD COLUMN birth_year SMALLINT NULL AFTER gender;

-- Optional: backfill demo data for customers (comment out if not desired)
-- UPDATE users
-- SET gender = (
--   CASE FLOOR(RAND() * 4)
--     WHEN 0 THEN 'male'
--     WHEN 1 THEN 'female'
--     WHEN 2 THEN 'nonbinary'
--     ELSE 'prefer_not_say'
--   END
-- )
-- WHERE user_role = 'customer' AND gender IS NULL;
--
-- UPDATE users
-- SET birth_year = 1960 + FLOOR(RAND() * 45) -- between 1960 and 2004
-- WHERE user_role = 'customer' AND birth_year IS NULL;

-- Check for existing admin users
SELECT user_id, email, full_name, user_role 
FROM salon_platform.users 
WHERE user_role = 'admin';

-- If you want to remove all admin users (uncomment the line below):
-- DELETE FROM salon_platform.users WHERE user_role = 'admin';

-- Or remove a specific admin by email (replace with actual email):
-- DELETE FROM salon_platform.users WHERE user_role = 'admin' AND email = 'admin@example.com';


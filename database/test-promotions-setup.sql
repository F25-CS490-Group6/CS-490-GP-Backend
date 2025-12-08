-- TEST PROMOTIONS FEATURE SETUP
-- =====================================================
-- This script helps you set up test data to test the promotions feature
-- Run this to create test customers with appointments and payments

USE salon_platform;

-- 1. Check if you have a salon (replace with your salon_id)
SELECT salon_id, name, owner_id FROM salons LIMIT 5;

-- 2. Check existing loyal customers (customers with 2+ visits or $100+ spent)
-- Replace SALON_ID with your actual salon_id
SELECT 
  u.user_id,
  u.full_name as name,
  u.email,
  COUNT(a.appointment_id) as visits,
  COALESCE(SUM(p.amount), 0) as total_spent
FROM users u
LEFT JOIN appointments a ON a.user_id = u.user_id AND a.salon_id = ? -- Replace ? with your salon_id
LEFT JOIN payments p ON p.user_id = u.user_id 
  AND p.appointment_id = a.appointment_id 
  AND p.payment_status = 'completed'
WHERE a.salon_id = ? -- Replace ? with your salon_id
GROUP BY u.user_id, u.full_name, u.email
HAVING visits >= 2 OR total_spent >= 100
ORDER BY total_spent DESC, visits DESC;

-- 3. Create test appointments for a customer (to make them "loyal")
-- Replace USER_ID and SALON_ID with actual values
-- First, get a user_id and salon_id:
-- SELECT user_id, full_name FROM users WHERE user_role = 'customer' LIMIT 5;
-- SELECT salon_id, name FROM salons LIMIT 5;

-- Example: Create 3 appointments for a customer (makes them loyal with 3 visits)
-- INSERT INTO appointments (user_id, salon_id, staff_id, scheduled_time, price, status)
-- VALUES 
--   (USER_ID, SALON_ID, (SELECT staff_id FROM staff WHERE salon_id = SALON_ID LIMIT 1), NOW() - INTERVAL 30 DAY, 50.00, 'completed'),
--   (USER_ID, SALON_ID, (SELECT staff_id FROM staff WHERE salon_id = SALON_ID LIMIT 1), NOW() - INTERVAL 15 DAY, 75.00, 'completed'),
--   (USER_ID, SALON_ID, (SELECT staff_id FROM staff WHERE salon_id = SALON_ID LIMIT 1), NOW() - INTERVAL 5 DAY, 100.00, 'completed');

-- 4. Create test payments for those appointments
-- INSERT INTO payments (user_id, appointment_id, amount, payment_method, payment_status)
-- SELECT 
--   a.user_id,
--   a.appointment_id,
--   a.price,
--   'stripe',
--   'completed'
-- FROM appointments a
-- WHERE a.user_id = USER_ID AND a.salon_id = SALON_ID AND a.status = 'completed'
--   AND NOT EXISTS (SELECT 1 FROM payments p WHERE p.appointment_id = a.appointment_id);

-- 5. Verify notifications were created
-- SELECT * FROM notifications 
-- WHERE notification_type = 'promotion' 
-- ORDER BY created_at DESC 
-- LIMIT 10;


-- Update roles for manually created admin users
-- Run this script in your Supabase SQL Editor after creating the users

-- Update admin role
UPDATE profiles 
SET role = 'admin'
WHERE email = 'admin@citypulse.com';

-- Update moderator role
UPDATE profiles 
SET role = 'moderator'
WHERE email = 'moderator@citypulse.com';

-- Verify the updates
SELECT id, email, role, full_name 
FROM profiles 
WHERE email IN ('admin@citypulse.com', 'moderator@citypulse.com');

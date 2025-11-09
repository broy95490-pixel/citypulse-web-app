-- Manual Admin Setup Script
-- Run this directly in Supabase SQL Editor if the API route doesn't work

-- Step 1: First, you need to create the auth users manually in Supabase Dashboard
-- Go to Authentication > Users > Add User
-- Create these two users:
--   1. Email: admin@citypulse.com, Password: Ssj@6900fu, Auto Confirm User: Yes
--   2. Email: moderator@citypulse.com, Password: Moderator123!, Auto Confirm User: Yes

-- Step 2: After creating users in the Auth dashboard, run this SQL to set their roles
-- Replace the UUIDs below with the actual user IDs from the auth.users table

-- Get the user IDs first:
SELECT id, email FROM auth.users WHERE email IN ('admin@citypulse.com', 'moderator@citypulse.com');

-- Then update profiles with the correct IDs:
-- (Replace 'YOUR_ADMIN_UUID' and 'YOUR_MOD_UUID' with actual IDs from above query)

-- Insert/Update admin profile
INSERT INTO profiles (id, email, full_name, role, created_at, updated_at)
SELECT 
  id,
  email,
  'System Administrator' as full_name,
  'admin' as role,
  NOW() as created_at,
  NOW() as updated_at
FROM auth.users 
WHERE email = 'admin@citypulse.com'
ON CONFLICT (id) 
DO UPDATE SET 
  role = 'admin',
  full_name = 'System Administrator',
  updated_at = NOW();

-- Insert/Update moderator profile
INSERT INTO profiles (id, email, full_name, role, created_at, updated_at)
SELECT 
  id,
  email,
  'Municipal Moderator' as full_name,
  'moderator' as role,
  NOW() as created_at,
  NOW() as updated_at
FROM auth.users 
WHERE email = 'moderator@citypulse.com'
ON CONFLICT (id) 
DO UPDATE SET 
  role = 'moderator',
  full_name = 'Municipal Moderator',
  updated_at = NOW();

-- Verify the setup
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.role,
  u.email_confirmed_at
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.email IN ('admin@citypulse.com', 'moderator@citypulse.com');

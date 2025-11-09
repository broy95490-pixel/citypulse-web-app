-- This script creates the admin and moderator accounts
-- You must run this script, then the users can log in with the specified credentials

-- First, ensure the set_user_role function exists
CREATE OR REPLACE FUNCTION set_user_role(user_email text, new_role text)
RETURNS void AS $$
BEGIN
  UPDATE profiles 
  SET role = new_role::user_role, updated_at = now()
  WHERE email = user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: The actual user creation happens through the Supabase Auth API
-- After running this script, click the "Create Admin Users" button on the admin login page
-- Or call the /api/create-admin-users endpoint

-- This will create:
-- 1. admin@citypulse.com with password Ssj@6900fu (role: admin)
-- 2. moderator@citypulse.com with password Moderator123! (role: moderator)

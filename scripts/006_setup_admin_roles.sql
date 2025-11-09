-- New approach: Create a function to set user roles after they sign up
-- This works with Supabase Auth instead of trying to create fake users

-- Drop existing policies and recreate them properly
DROP POLICY IF EXISTS "Admins can manage everything" ON issues;
DROP POLICY IF EXISTS "Admins can manage all comments" ON issue_comments;

-- Admin policies for issues
CREATE POLICY "Admins can manage everything" ON issues
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'moderator')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'moderator')
    )
  );

-- Admin policies for comments
CREATE POLICY "Admins can manage all comments" ON issue_comments
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'moderator')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'moderator')
    )
  );

-- Create a function to promote users to admin/moderator by email
CREATE OR REPLACE FUNCTION set_user_role(user_email text, new_role text)
RETURNS void AS $$
BEGIN
  UPDATE profiles 
  SET role = new_role::user_role, updated_at = now()
  WHERE email = user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comment: After running this script, you need to:
-- 1. Sign up as admin@citypulse.com through Supabase Auth
-- 2. Sign up as moderator@citypulse.com through Supabase Auth  
-- 3. Then run: SELECT set_user_role('admin@citypulse.com', 'admin');
-- 4. Then run: SELECT set_user_role('moderator@citypulse.com', 'moderator');

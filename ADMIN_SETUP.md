# Admin Setup Guide

## Setting Up Admin Access

This guide explains how to set up admin and moderator accounts for CityPulse.

### Option 1: Using the Setup API (Recommended)

Send a POST request to `/api/setup-admin` with your desired credentials:

\`\`\`bash
curl -X POST https://your-domain.com/api/setup-admin \
  -H "Content-Type: application/json" \
  -d '{
    "adminEmail": "admin@citypulse.com",
    "adminPassword": "YourSecurePassword123!",
    "moderatorEmail": "moderator@citypulse.com",
    "moderatorPassword": "YourSecurePassword456!"
  }'
\`\`\`

**Note**: Replace the passwords with your own secure passwords.

### Option 2: Manual Setup via Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Users**
3. Click **Add user** and create:
   - **Admin user**: Choose an email and secure password
   - **Moderator user**: Choose an email and secure password
4. Note the User IDs for both users
5. Navigate to **Table Editor** → **profiles**
6. Insert/update rows for both users:
   - Set `role` to `admin` for the admin user
   - Set `role` to `moderator` for the moderator user
   - Fill in `email` and `full_name` fields

### Option 3: Using SQL Script

First, create the users via Supabase Auth, then run this SQL in the Supabase SQL Editor:

\`\`\`sql
-- Set admin role (replace 'admin@example.com' with your admin email)
UPDATE profiles 
SET role = 'admin', 
    full_name = 'System Administrator',
    updated_at = now()
WHERE email = 'admin@example.com';

-- Set moderator role (replace 'moderator@example.com' with your moderator email)
UPDATE profiles 
SET role = 'moderator',
    full_name = 'Municipal Authority',
    updated_at = now()
WHERE email = 'moderator@example.com';
\`\`\`

### Accessing the Admin Dashboard

Once setup is complete:

1. Go to `/auth/admin` on your site
2. Sign in with either the admin or moderator credentials
3. You'll be redirected to `/admin/dashboard`

### Admin vs Moderator Permissions

**Admin:**
- Full access to all issues
- Can verify, categorize, and update any issue
- Access to analytics dashboard with visual trends and hotspots
- Can manage all comments
- User management capabilities

**Moderator (Municipal Authorities):**
- Role-based access to verify, categorize, and update issue statuses
- Dashboard with visual analytics showing issue trends, hotspots, and resolution rates
- Can manage issue lifecycles
- Access to performance metrics

### Security Best Practices

- Always use strong, unique passwords for admin accounts
- Change any default credentials immediately in production
- Consider enabling 2FA for admin accounts in Supabase Auth settings
- Regularly audit admin access logs
- Limit the number of admin/moderator accounts

### Troubleshooting

If you see "Access denied" after signing in:
1. Check that the user's role is set correctly in the profiles table
2. Verify the user exists in both Supabase Auth and the profiles table
3. Ensure RLS policies are enabled on all tables
4. Check browser console for any error messages

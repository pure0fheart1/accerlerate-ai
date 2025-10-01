# Database Migration Guide

This guide will help you fix the streak function and tool usage tracking by updating your Supabase database schema.

## Issues Fixed

1. **Missing streak columns** in `user_profiles` table
   - `login_streak`, `last_login_date`, `longest_streak`, `total_logins`
2. **Missing profile columns** in `user_profiles` table
   - `bio`, `location`, `website`, `email_notifications`, `weekly_reports`, `marketing_emails`
3. **Incorrect schema** for `usage_tracking` table

## Migration Steps

### Step 1: Update user_profiles Table

Run this SQL in your Supabase SQL Editor:

```sql
-- Add missing columns to user_profiles table
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS login_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_login_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_logins INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS weekly_reports BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS marketing_emails BOOLEAN DEFAULT false;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_last_login_date ON user_profiles(last_login_date);
```

### Step 2: Update usage_tracking Table

**WARNING**: This will delete existing usage tracking data. If you need to preserve data, export it first.

Run this SQL in your Supabase SQL Editor:

```sql
-- Drop the old table
DROP TABLE IF EXISTS usage_tracking CASCADE;

-- Recreate with new schema
CREATE TABLE usage_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tool_name TEXT NOT NULL,
  tool_category TEXT,
  session_id TEXT NOT NULL,
  duration_seconds INTEGER,
  tokens_used INTEGER,
  api_calls INTEGER DEFAULT 1,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_usage_tracking_user_id ON usage_tracking(user_id);
CREATE INDEX idx_usage_tracking_created_at ON usage_tracking(created_at);
CREATE INDEX idx_usage_tracking_tool_name ON usage_tracking(tool_name);
CREATE INDEX idx_usage_tracking_session_id ON usage_tracking(session_id);

-- Enable RLS
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own usage" ON usage_tracking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage" ON usage_tracking
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### Step 3: Verify the Migration

After running the migrations, verify everything is working:

1. Refresh your app
2. Log in and check if the streak counter works
3. Use any tool and verify usage tracking works
4. Check the console for any database errors

## Alternative: Use Migration Files

You can also run the migration files directly:

1. `database/add-streak-and-profile-columns.sql` - Adds missing user_profiles columns
2. `database/update-usage-tracking-table.sql` - Updates usage_tracking table

## Troubleshooting

### Issue: "column already exists"
This is safe to ignore - it means the column was added in a previous migration attempt.

### Issue: Still getting errors about missing columns
1. Check the exact column name in the error message
2. Verify it was added with: `SELECT column_name FROM information_schema.columns WHERE table_name = 'user_profiles';`
3. Make sure you're connected to the correct Supabase project

### Issue: RLS policies blocking inserts
If you get permission errors, check that the RLS policies are correctly set up for the tables.

## Post-Migration

After successful migration:
- The streak feature will start tracking login streaks
- Tool usage will be properly logged
- User profiles will support additional fields like bio, location, etc.

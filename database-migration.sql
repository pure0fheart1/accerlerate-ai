-- Database Migration Script for Supabase
-- Run this in your Supabase SQL Editor to create all necessary tables

-- Step 1: Create the tables (run in order)

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'Free' CHECK (tier IN ('Free', 'Member', 'VIP', 'God-Tier')),
  smechals_balance INTEGER NOT NULL DEFAULT 0 CHECK (smechals_balance >= 0),
  profile_picture_url TEXT,
  trial_days_left INTEGER,
  trial_start_date TIMESTAMPTZ,
  subscription_status TEXT NOT NULL DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'trial', 'cancelled')),
  subscription_end_date TIMESTAMPTZ,
  last_daily_bonus_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Smechals Transactions Table
CREATE TABLE IF NOT EXISTS smechals_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('earned', 'spent', 'bonus', 'trial', 'purchase')),
  amount INTEGER NOT NULL,
  description TEXT NOT NULL,
  balance_after INTEGER NOT NULL CHECK (balance_after >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tool Requests Table
CREATE TABLE IF NOT EXISTS tool_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  tool_name TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected')),
  smechals_cost INTEGER NOT NULL,
  estimated_delivery TIMESTAMPTZ NOT NULL,
  admin_notes TEXT,
  completion_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Usage Tracking Table
CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  tool_name TEXT NOT NULL,
  tool_category TEXT,
  session_id TEXT,
  duration_seconds INTEGER,
  tokens_used INTEGER,
  api_calls INTEGER DEFAULT 1,
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Step 2: Create indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_tier ON user_profiles(tier);
CREATE INDEX IF NOT EXISTS idx_smechals_transactions_user_id ON smechals_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_smechals_transactions_created_at ON smechals_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tool_requests_user_id ON tool_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_tool_requests_status ON tool_requests(status);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_created_at ON usage_tracking(created_at DESC);

-- Step 3: Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 4: Add triggers
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tool_requests_updated_at ON tool_requests;
CREATE TRIGGER update_tool_requests_updated_at
  BEFORE UPDATE ON tool_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 5: Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE smechals_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS Policies
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view their own transactions" ON smechals_transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON smechals_transactions;
DROP POLICY IF EXISTS "Users can view their own tool requests" ON tool_requests;
DROP POLICY IF EXISTS "Users can insert their own tool requests" ON tool_requests;
DROP POLICY IF EXISTS "Users can update their own tool requests" ON tool_requests;
DROP POLICY IF EXISTS "Users can view their own usage data" ON usage_tracking;
DROP POLICY IF EXISTS "Users can insert their own usage data" ON usage_tracking;

-- Create new policies
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own transactions" ON smechals_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" ON smechals_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own tool requests" ON tool_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tool requests" ON tool_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tool requests" ON tool_requests
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own usage data" ON usage_tracking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage data" ON usage_tracking
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Step 7: Create useful views
CREATE OR REPLACE VIEW user_dashboard_stats AS
SELECT
  up.user_id,
  up.display_name,
  up.tier,
  up.smechals_balance,
  up.subscription_status,
  COALESCE(today_usage.tools_used_today, 0) as tools_used_today,
  COALESCE(month_usage.tools_used_this_month, 0) as tools_used_this_month,
  COALESCE(pending_requests.pending_tool_requests, 0) as pending_tool_requests,
  up.trial_days_left
FROM user_profiles up
LEFT JOIN (
  SELECT user_id, COUNT(*) as tools_used_today
  FROM usage_tracking
  WHERE created_at >= CURRENT_DATE
  GROUP BY user_id
) today_usage ON up.user_id = today_usage.user_id
LEFT JOIN (
  SELECT user_id, COUNT(*) as tools_used_this_month
  FROM usage_tracking
  WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
  GROUP BY user_id
) month_usage ON up.user_id = month_usage.user_id
LEFT JOIN (
  SELECT user_id, COUNT(*) as pending_tool_requests
  FROM tool_requests
  WHERE status IN ('pending', 'in_progress')
  GROUP BY user_id
) pending_requests ON up.user_id = pending_requests.user_id;
-- Update usage_tracking table to match the new schema

-- Drop the old table (WARNING: This will delete existing data)
-- If you want to preserve data, you'll need to migrate it first
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

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_created_at ON usage_tracking(created_at);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_tool_name ON usage_tracking(tool_name);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_session_id ON usage_tracking(session_id);

-- Enable RLS
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- Recreate RLS policies
DROP POLICY IF EXISTS "Users can view own usage" ON usage_tracking;
DROP POLICY IF EXISTS "Users can insert own usage" ON usage_tracking;

CREATE POLICY "Users can view own usage" ON usage_tracking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage" ON usage_tracking
  FOR INSERT WITH CHECK (auth.uid() = user_id);

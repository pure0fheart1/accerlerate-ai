-- Creative Studio AI - Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor to set up the required tables

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  interval TEXT NOT NULL DEFAULT 'month',
  features JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default subscription plans
INSERT INTO subscription_plans (id, name, price, currency, interval, features) VALUES
('free', 'Free', 0.00, 'usd', 'month', '{
  "imageGenerations": 5,
  "videoGenerations": 1,
  "aiChatMessages": 10,
  "storageGB": 1,
  "prioritySupport": false,
  "advancedFeatures": false
}'),
('pro', 'Pro', 19.99, 'usd', 'month', '{
  "imageGenerations": 100,
  "videoGenerations": 20,
  "aiChatMessages": 500,
  "storageGB": 10,
  "prioritySupport": true,
  "advancedFeatures": true
}'),
('premium', 'Premium', 49.99, 'usd', 'month', '{
  "imageGenerations": -1,
  "videoGenerations": -1,
  "aiChatMessages": -1,
  "storageGB": 100,
  "prioritySupport": true,
  "advancedFeatures": true
}')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  features = EXCLUDED.features;

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  plan_id TEXT REFERENCES subscription_plans(id) DEFAULT 'free',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create usage stats table
CREATE TABLE IF NOT EXISTS usage_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  period TEXT NOT NULL, -- YYYY-MM format
  image_generations INTEGER DEFAULT 0,
  video_generations INTEGER DEFAULT 0,
  ai_chat_messages INTEGER DEFAULT 0,
  storage_used_mb INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, period)
);

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, plan_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    'free'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create function to increment usage
CREATE OR REPLACE FUNCTION public.increment_usage(
  p_user_id UUID,
  p_period TEXT,
  p_feature TEXT,
  p_amount INTEGER DEFAULT 1
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO usage_stats (user_id, period, image_generations, video_generations, ai_chat_messages, storage_used_mb)
  VALUES (
    p_user_id,
    p_period,
    CASE WHEN p_feature = 'image_generations' THEN p_amount ELSE 0 END,
    CASE WHEN p_feature = 'video_generations' THEN p_amount ELSE 0 END,
    CASE WHEN p_feature = 'ai_chat_messages' THEN p_amount ELSE 0 END,
    CASE WHEN p_feature = 'storage_used_mb' THEN p_amount ELSE 0 END
  )
  ON CONFLICT (user_id, period) DO UPDATE SET
    image_generations = usage_stats.image_generations + CASE WHEN p_feature = 'image_generations' THEN p_amount ELSE 0 END,
    video_generations = usage_stats.video_generations + CASE WHEN p_feature = 'video_generations' THEN p_amount ELSE 0 END,
    ai_chat_messages = usage_stats.ai_chat_messages + CASE WHEN p_feature = 'ai_chat_messages' THEN p_amount ELSE 0 END,
    storage_used_mb = usage_stats.storage_used_mb + CASE WHEN p_feature = 'storage_used_mb' THEN p_amount ELSE 0 END,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update profile updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_usage_stats_updated_at
  BEFORE UPDATE ON usage_stats
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Set up Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_stats ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Usage stats policies
CREATE POLICY "Users can view own usage stats" ON usage_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage stats" ON usage_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own usage stats" ON usage_stats
  FOR UPDATE USING (auth.uid() = user_id);

-- Subscription plans policies (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view subscription plans" ON subscription_plans
  FOR SELECT TO authenticated USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_plan_id ON profiles(plan_id);
CREATE INDEX IF NOT EXISTS idx_usage_stats_user_period ON usage_stats(user_id, period);
CREATE INDEX IF NOT EXISTS idx_usage_stats_period ON usage_stats(period);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

COMMENT ON TABLE profiles IS 'User profiles with subscription information';
COMMENT ON TABLE usage_stats IS 'Monthly usage statistics for each user';
COMMENT ON TABLE subscription_plans IS 'Available subscription plans and their features';
COMMENT ON FUNCTION increment_usage IS 'Safely increment usage counters for a user';
# Supabase Database Setup

This guide walks you through setting up the database schema for the user profile, tier system, and Smechals currency features.

## Prerequisites

1. You should have a Supabase project created
2. Your environment variables should be configured in `.env`
3. Authentication should be set up in your Supabase project

## Database Setup

### Step 1: Run the Migration Script

1. Open your Supabase dashboard
2. Go to the SQL Editor
3. Copy the contents of `database-migration.sql` and paste it into the SQL Editor
4. Click "Run" to execute the migration

This will create all necessary tables:
- `user_profiles` - Stores user profile data, tier information, and Smechals balance
- `smechals_transactions` - Records all Smechals transactions (earned, spent, bonuses)
- `tool_requests` - Stores custom tool requests from users
- `usage_tracking` - Tracks user tool usage for analytics

### Step 2: Verify Tables

After running the migration, verify that the following tables exist:

```sql
-- Check if tables were created
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('user_profiles', 'smechals_transactions', 'tool_requests', 'usage_tracking');
```

### Step 3: Test Row Level Security

The migration automatically sets up Row Level Security (RLS) policies. Users can only access their own data. Test this by:

1. Creating a test user through your authentication system
2. Verifying they can only see their own profile data

## Environment Variables

Make sure your `.env` file contains:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Schema Overview

### User Profiles Table
- Stores user information, tier status, and Smechals balance
- Linked to Supabase auth.users table
- Includes trial information and subscription status

### Smechals Transactions Table
- Records all Smechals activity
- Transaction types: earned, spent, bonus, trial, purchase
- Maintains balance_after for audit trail

### Tool Requests Table
- Stores custom tool requests from users
- Includes priority levels and estimated delivery
- Costs 25 Smechals per request

### Usage Tracking Table
- Tracks tool usage for analytics
- Stores session data, duration, and success rates
- Used for dashboard statistics

## Default Values

When a new user is created:
- Tier: "Free"
- Smechals Balance: 0 (will receive welcome bonus)
- Subscription Status: "inactive"

## Smechals Economy

### Earning Smechals
- Daily login bonus: 1 Smechal
- Welcome bonus: 1 Smechal (new users)
- Tier bonuses:
  - Member: 10 Smechals/month
  - VIP: 25 Smechals/month
  - God-Tier: 100 Smechals/month
- VIP trial bonus: 10 Smechals

### Spending Smechals
- Custom tool requests: 25 Smechals
- Future premium features

## Testing the Setup

1. Create a new user account
2. Check that a user profile is automatically created
3. Verify the welcome bonus is applied
4. Test the daily bonus system
5. Try submitting a tool request (if you have enough Smechals)

## Troubleshooting

### Common Issues

1. **"relation does not exist" errors**
   - Make sure you ran the migration script in the correct database
   - Check that you're connected to the right Supabase project

2. **Permission denied errors**
   - Verify RLS policies are correctly set up
   - Make sure the user is authenticated properly

3. **Environment variable errors**
   - Double-check your `.env` file
   - Restart your development server after changing environment variables

### Checking Data

```sql
-- View all user profiles
SELECT * FROM user_profiles;

-- Check recent transactions
SELECT * FROM smechals_transactions ORDER BY created_at DESC LIMIT 10;

-- View pending tool requests
SELECT * FROM tool_requests WHERE status = 'pending';
```

## Next Steps

After setting up the database:

1. Test the user profile system in your application
2. Verify Smechals transactions are working
3. Test the tool request functionality
4. Set up usage tracking for your tools
5. Configure any payment integration for tier upgrades
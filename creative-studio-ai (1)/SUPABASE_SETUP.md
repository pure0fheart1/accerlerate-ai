# Supabase Setup Guide for Creative Studio AI

This guide will help you set up Supabase authentication and database for the Creative Studio AI application.

## Prerequisites

1. A Supabase account (free tier is sufficient for development)
2. A new Supabase project

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization and enter project details
4. Wait for the project to be created (this takes a few minutes)

## Step 2: Configure Authentication

1. In your Supabase dashboard, go to **Authentication > Settings**
2. Configure the following settings:

### Email Confirmation
- **Disable email confirmation** for development (you can enable it later for production)
- Set **Email confirmation** to "Disabled" in the Email Auth section

### Site URL
- Set your **Site URL** to your application URL:
  - Development: `http://localhost:5173`
  - Production: Your deployed app URL

### Additional URLs (Optional)
- Add additional redirect URLs if needed

## Step 3: Set Up Database Schema

1. Go to **SQL Editor** in your Supabase dashboard
2. Create a new query
3. Copy and paste the contents of `supabase-schema.sql` from your project root
4. Run the query to create all necessary tables, functions, and policies

This will create:
- `profiles` table for user information
- `usage_stats` table for tracking feature usage
- `subscription_plans` table with default plans
- Proper Row Level Security (RLS) policies
- Helpful database functions

## Step 4: Get Your Supabase Credentials

1. Go to **Settings > API** in your Supabase dashboard
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **Public anon key** (starts with `eyJ`)
   - **Service role key** (starts with `eyJ`) - Keep this secret!

## Step 5: Configure Environment Variables

1. Update your `.env.local` file with your Supabase credentials:

```env
# Supabase Configuration - Frontend
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Supabase Configuration - Backend
SUPABASE_URL=your_project_url_here
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_role_key_here
```

**Important**:
- The `VITE_` prefixed variables are used by the frontend
- The non-prefixed variables are used by the backend API
- Never commit the service role key to version control

## Step 6: Test the Integration

1. Start your development server: `npm run dev`
2. Try creating a new account
3. Check your Supabase dashboard under **Authentication > Users** to see if the user was created
4. Check the **Table Editor** to see if a profile was automatically created

## Database Structure

### Tables Created

1. **profiles**
   - Stores user profile information
   - Links to Supabase auth users
   - Includes subscription plan information

2. **usage_stats**
   - Tracks monthly usage for each user
   - Includes image generations, video generations, AI chat messages, and storage
   - Has a unique constraint on user_id + period

3. **subscription_plans**
   - Stores available subscription plans and their features
   - Pre-populated with Free, Pro, and Premium plans

### Security

- Row Level Security (RLS) is enabled on all tables
- Users can only access their own data
- Subscription plans are readable by all authenticated users

## Troubleshooting

### Common Issues

1. **Environment variables not working**
   - Make sure frontend variables start with `VITE_`
   - Restart your development server after changing environment variables

2. **Authentication not working**
   - Check that your Site URL is correctly configured
   - Verify that email confirmation is disabled for development

3. **Database errors**
   - Check that the schema was properly created
   - Verify RLS policies are in place
   - Check the Supabase logs for detailed error messages

4. **CORS errors**
   - Make sure your Site URL includes the correct protocol (http/https)
   - Add your domain to the allowed origins in Supabase settings

### Useful Supabase Dashboard Sections

- **Authentication > Users**: See all registered users
- **Table Editor**: View and edit database records
- **SQL Editor**: Run custom queries
- **Logs**: View real-time logs and errors
- **API**: Test your API endpoints

## Production Considerations

When deploying to production:

1. **Enable email confirmation** in Authentication settings
2. **Update Site URL** to your production domain
3. **Set up proper email templates** in Authentication > Email Templates
4. **Review RLS policies** to ensure they meet your security requirements
5. **Set up database backups** (automatic in Supabase Pro)
6. **Monitor usage** and upgrade your Supabase plan if needed

## Next Steps

After setting up Supabase:

1. Test user registration and login
2. Verify usage tracking is working
3. Test the subscription plan features
4. Set up Stripe integration for payments (if needed)
5. Configure email templates for better user experience

## Support

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Community](https://github.com/supabase/supabase/discussions)
- Check the application logs for debugging information
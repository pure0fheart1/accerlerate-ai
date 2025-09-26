# Vercel Environment Variables Setup

## Quick Setup Guide

Your Creative Studio AI app is now deployed with demo mode fallback, but to enable full functionality, you need to configure Supabase environment variables in Vercel.

### 1. Get Your Supabase Credentials

1. Go to your Supabase dashboard: https://app.supabase.com
2. Select your project
3. Go to Settings → API
4. Copy these values:
   - Project URL
   - Anon/Public key

### 2. Add Environment Variables to Vercel

#### Option A: Using Vercel CLI (Recommended)
```bash
cd "C:\Users\jamie\Desktop\creative-studio-ai (1)"

# Add Supabase URL
npx vercel env add VITE_SUPABASE_URL
# Paste your Supabase project URL when prompted

# Add Supabase Anon Key
npx vercel env add VITE_SUPABASE_ANON_KEY
# Paste your Supabase anon key when prompted

# Add Gemini API Key (if not already added)
npx vercel env add GEMINI_API_KEY
# Paste your Google Gemini API key when prompted

# Redeploy to apply changes
npx vercel --prod
```

#### Option B: Using Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Select your creative-studio-ai project
3. Go to Settings → Environment Variables
4. Add these variables:
   - `VITE_SUPABASE_URL` = your_supabase_project_url
   - `VITE_SUPABASE_ANON_KEY` = your_supabase_anon_key
   - `GEMINI_API_KEY` = your_gemini_api_key
5. Redeploy from the Deployments tab

### 3. Current Status

**✅ Working Now (Demo Mode):**
- App loads and displays properly
- Authentication works with demo user
- All modules are functional
- Usage tracking works locally

**🔧 After Supabase Configuration:**
- Real user authentication
- Database-backed usage tracking
- Multi-user support
- Persistent data storage

### 4. Current Deployment URL

**Latest:** https://creative-studio-pwdnrx3c6-jamie-lees-projects-f8b674ea.vercel.app

The app now loads properly and shows a demo mode notice until Supabase is configured.

### 5. Next Steps

1. Configure environment variables (see above)
2. Set up Supabase database using `supabase-schema.sql`
3. Test authentication with real users
4. Remove demo mode fallbacks (optional)

## Troubleshooting

**If the app still shows a blank page:**
1. Check browser console for errors
2. Verify the deployment completed successfully
3. Clear browser cache and try again

**Need help?**
- Check `SUPABASE_SETUP.md` for detailed database setup
- Check `CLAUDE_CONTEXT.md` for full project documentation
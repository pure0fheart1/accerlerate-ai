# Creative Studio AI - Backend API

A robust backend API for the Creative Studio AI application with real user authentication and usage tracking.

## Features

- 🔐 JWT-based authentication (signup, login, refresh)
- 👤 User profile management
- 📊 Usage tracking and limits
- 🔒 Security middleware (CORS, Helmet, Rate limiting)
- 🗄️ PostgreSQL database with Supabase
- 📈 Subscription plan management

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: JWT tokens
- **Validation**: Zod schemas
- **Security**: bcryptjs, helmet, cors, rate-limit

## Setup

### 1. Install Dependencies

```bash
cd api
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy your project URL and API keys
3. Run the migration script in Supabase SQL Editor:

```sql
-- Copy and paste the contents of database/migrations/001_initial_schema.sql
```

### 3. Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required variables:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anon/public key
- `SUPABASE_SERVICE_KEY`: Your Supabase service role key
- `JWT_SECRET`: A secure random string for signing JWTs
- `NODE_ENV`: `development` or `production`

### 4. Run Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/refresh` - Refresh JWT token

### Users
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update user profile
- `GET /api/users/subscription-plans` - Get available plans

### Usage Tracking
- `GET /api/usage/current` - Get current period usage stats
- `POST /api/usage/track` - Track feature usage
- `GET /api/usage/history` - Get usage history

### Health Check
- `GET /health` - API health status

## Database Schema

### Tables
- `subscription_plans` - Available subscription tiers
- `users` - User accounts and profiles
- `usage_stats` - Monthly usage tracking per user

## Deployment

### Vercel (Recommended)

1. Install Vercel CLI: `npm i -g vercel`
2. Deploy: `vercel --prod`
3. Set environment variables in Vercel dashboard

### Other Platforms

The API can be deployed to any Node.js hosting platform:
- Railway
- Render
- Heroku
- DigitalOcean App Platform

## Security Features

- Password hashing with bcryptjs
- JWT token authentication
- CORS protection
- Rate limiting (100 requests/15min per IP)
- Input validation with Zod schemas
- Row Level Security (RLS) in database
- Helmet security headers

## Usage Limits

| Plan | Images | Videos | AI Messages | Storage |
|------|--------|--------|-------------|---------|
| Free | 5/month | 1/month | 10/month | 1 GB |
| Pro | 100/month | 20/month | 500/month | 10 GB |
| Premium | Unlimited | Unlimited | Unlimited | 100 GB |
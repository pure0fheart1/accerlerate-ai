# Creative Studio AI - Claude Code Context

## Project Overview

Creative Studio AI is a comprehensive web application that provides an AI-powered creative workspace with 12 integrated modules for content creation, collaboration, and productivity. The application combines modern web technologies with cutting-edge AI services to deliver a seamless creative experience.

### Main Features & Capabilities
- **AI Content Generation**: Image and video generation using Google's Gemini AI models
- **Interactive Whiteboard**: Collaborative drawing and brainstorming canvas
- **AI Chat Interface**: Powered by Gemini 2.5 Flash for creative assistance
- **Image Editing**: AI-powered image modification tools
- **Photo Booth**: AI-enhanced photo capture and editing
- **Note-taking System**: Handwritten notes, AI notes, and wiki documentation
- **Task Management**: Organized prompt and task tracking
- **Gallery**: Centralized view of all generated content
- **User Authentication**: Secure user management with subscription plans
- **Usage Tracking**: Monitor feature usage against subscription limits

### Technology Stack
- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Express.js API (Serverless functions)
- **Database**: Supabase (PostgreSQL with real-time features)
- **AI Services**: Google Gemini AI (Imagen, Veo, Flash models)
- **Payments**: Stripe (configured but not fully implemented)
- **Deployment**: Vercel (optimized for serverless deployment)
- **Styling**: CSS modules with responsive design
- **State Management**: React Context API

## Architecture Overview

### Frontend Architecture
```
App.tsx (Main component with lazy loading)
├── contexts/
│   ├── AppContext.tsx (Global app state)
│   └── AuthContext.tsx (Authentication state)
├── components/
│   ├── auth/ (Authentication forms)
│   ├── Icons.tsx (Custom icon components)
│   └── UserDashboard.tsx (User profile and stats)
├── modules/ (12 AI-powered modules)
├── services/
│   ├── geminiService.ts (AI API integration)
│   ├── supabase.ts (Database client)
│   └── api.ts (API utilities)
└── hooks/ (Custom React hooks)
```

### Backend Architecture
```
api/
├── auth/
│   ├── login.js (User authentication)
│   └── signup.js (User registration)
├── config/
│   └── supabase.js (Database configuration)
├── middleware/
│   └── auth.js (Authentication middleware)
└── index.js (Main API router)
```

### Database Schema (Supabase)
- **profiles**: User information and subscription data
- **usage_stats**: Monthly usage tracking per user
- **subscription_plans**: Available plans and feature limits
- **Row Level Security**: Enforced data isolation per user

## Module Structure

### Complete Module List (12 modules)
1. **Whiteboard** (`whiteboard/`) - Interactive drawing canvas with real-time collaboration
2. **Task Manager** (`taskManager/`) - Organized prompt and task management
3. **Image Generator** (`imageGenerator/`) - AI-powered image creation using Gemini Imagen
4. **Video Generator** (`videoGenerator/`) - AI video generation using Gemini Veo
5. **Gallery** (`gallery/`) - Centralized content viewing and management
6. **Image Editor** (`imageEditor/`) - AI-powered image editing tools
7. **Photo Booth** (`photobooth/`) - AI-enhanced photo capture and effects
8. **Handwritten Notes** (`handwrittenNotes/`) - Digital handwriting interface
9. **Gemini Chat** (`geminiChat/`) - AI conversation interface
10. **Wiki** (`wiki/`) - Documentation and knowledge base
11. **AI Notes** (`aiNotes/`) - AI-assisted note-taking
12. **Settings** (`settings/`) - User preferences and configuration

### Module Architecture Pattern
Each module follows a consistent structure:
```typescript
// Standard module interface
interface ModuleProps {
  // Module-specific props
}

const ModuleName: React.FC<ModuleProps> = () => {
  // State management
  // AI service integration
  // User interaction handlers
  // Render UI
};

export default ModuleName;
```

### Removed Modules (Cleanup completed)
- `promptCreator/` - Functionality merged into taskManager
- `gateway/` - Removed as redundant with direct AI service calls

## Authentication & Security

### Supabase Authentication Implementation
- **User Registration**: Email/password with profile creation
- **Authentication Context**: React context for auth state management
- **Row Level Security**: Database-level data isolation
- **JWT Tokens**: Secure session management
- **Password Security**: bcrypt hashing for stored passwords

### Usage Tracking System
```typescript
interface UsageStats {
  userId: string;
  period: string; // YYYY-MM format
  imageGenerations: number;
  videoGenerations: number;
  aiChatMessages: number;
  storageUsedMB: number;
}
```

### Subscription Management
- **Free Plan**: Limited usage for all features
- **Pro Plan**: Increased limits and priority support
- **Premium Plan**: Unlimited usage and advanced features
- **Stripe Integration**: Ready for payment processing (requires configuration)

## Development Information

### Key Files & Purposes

#### Core Application Files
- `App.tsx` - Main application component with module routing
- `index.tsx` - Application entry point
- `types.ts` - TypeScript type definitions
- `vite.config.ts` - Build configuration with optimizations

#### Configuration Files
- `.env.example` - Environment variables template
- `.env.local` - Local development environment
- `.env.production` - Production environment settings
- `vercel.json` - Vercel deployment configuration
- `tsconfig.json` - TypeScript compiler configuration

#### Documentation Files
- `README.md` - Basic project information
- `DEPLOYMENT.md` - Comprehensive deployment guide
- `SUPABASE_SETUP.md` - Database setup instructions
- `supabase-schema.sql` - Complete database schema

#### API Files
- `api/index.js` - Main API router for serverless functions
- `api/auth/` - Authentication endpoints
- `api/config/supabase.js` - Backend database configuration

### Development Workflows

#### Local Development Setup
```bash
# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Start development server
npm run dev
```

#### Build Process
```bash
# Production build
npm run build

# Preview production build
npm run preview
```

### Build and Deployment Processes

#### Vercel Deployment (Recommended)
1. **Automatic**: Connect GitHub repository to Vercel
2. **Manual**: Use Vercel CLI from project directory
3. **Environment Variables**: Configure in Vercel dashboard
4. **API Routes**: Automatically deployed as serverless functions

#### Build Optimizations
- **Code Splitting**: Lazy loading for all modules
- **Chunk Optimization**: Manual chunk splitting in vite.config.ts
- **Asset Optimization**: Minification and compression
- **Caching**: Proper cache headers configured

## Configuration

### Environment Variables Required

#### Frontend Variables (VITE_ prefix)
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

#### Backend Variables (API routes)
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
```

### Supabase Setup Requirements
1. **Project Creation**: New Supabase project
2. **Schema Deployment**: Run `supabase-schema.sql`
3. **Authentication Config**: Disable email confirmation for development
4. **RLS Policies**: Automatic user data isolation
5. **Site URL Configuration**: Match your deployment URL

### API Keys and Services

#### Google Gemini AI
- **API Key**: Required for all AI features
- **Models Used**: Imagen (images), Veo (videos), Flash (chat)
- **Quota**: Monitor usage in Google AI Studio

#### Supabase
- **Project URL**: Database endpoint
- **Anonymous Key**: Public API access
- **Service Key**: Admin access (backend only)

## Common Tasks

### Adding New Modules
1. **Create Module Directory**: `modules/newModule/`
2. **Implement Component**: Follow existing module patterns
3. **Add to App.tsx**: Import and register in MODULES config
4. **Update Types**: Add module name to Module type union
5. **Add Icon**: Create icon component in Icons.tsx
6. **Test Integration**: Verify lazy loading and navigation

### Modifying Authentication
1. **Update AuthContext**: Modify authentication logic
2. **Database Changes**: Update profiles table schema if needed
3. **API Updates**: Modify auth endpoints in `api/auth/`
4. **Test Flow**: Verify login/signup/logout functionality

### Updating Subscription Plans
1. **Database**: Modify subscription_plans table
2. **Types**: Update PlanFeatures interface
3. **Usage Tracking**: Adjust limits in usage validation
4. **UI Updates**: Update pricing display components

### Deployment Procedures

#### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Login and deploy
vercel login
vercel

# Production deployment
vercel --prod
```

#### Environment Setup
1. **Vercel Dashboard**: Configure environment variables
2. **Domain Configuration**: Set up custom domain if needed
3. **API Integration**: Verify serverless functions work
4. **Database Connection**: Test Supabase integration

## Troubleshooting

### Common Issues and Solutions

#### Build Issues
- **TypeScript Errors**: Check type definitions in types.ts
- **Missing Dependencies**: Run `npm install` to ensure all packages
- **Vite Configuration**: Verify vite.config.ts settings
- **Environment Variables**: Ensure all required variables are set

#### Authentication Issues
- **Supabase Connection**: Verify URL and keys in environment
- **CORS Errors**: Check Site URL configuration in Supabase
- **RLS Policies**: Ensure proper database policies are active
- **Session Management**: Clear browser storage if auth state is stuck

#### AI Service Issues
- **Gemini API**: Verify API key and quota limits
- **Rate Limiting**: Implement proper error handling for API limits
- **Model Availability**: Check if specific models are accessible
- **Response Handling**: Ensure proper error parsing from AI services

#### Deployment Issues
- **Vercel Build**: Check build logs for specific errors
- **Environment Variables**: Verify all variables are set in Vercel
- **API Routes**: Ensure serverless functions deploy correctly
- **Database Access**: Test Supabase connection from deployed app

### Development Tips
1. **Hot Reloading**: Use development server for fast iteration
2. **Component Testing**: Test modules individually before integration
3. **Database Queries**: Use Supabase dashboard for query testing
4. **API Testing**: Test endpoints using Supabase API documentation
5. **Performance**: Monitor bundle size and loading times

## Recent Changes & Current State

### Recent Cleanup Work
- **Demo Authentication Removed**: Replaced with proper Supabase auth
- **Unused Modules Cleaned**: Removed promptCreator and gateway modules
- **Database Integration**: Proper user profiles and usage tracking
- **Build Optimization**: Enhanced Vite configuration for production
- **Documentation Updated**: Comprehensive setup and deployment guides

### Current Project State
- **Authentication**: Fully integrated with Supabase
- **AI Services**: Google Gemini integration complete
- **Database**: Schema deployed with proper RLS policies
- **Deployment**: Vercel-ready with optimized build process
- **Documentation**: Complete setup and troubleshooting guides
- **Security**: Row-level security and user data isolation

### Known Limitations
- **Stripe Integration**: Configured but requires completion for payments
- **Email Templates**: Default Supabase templates (customization needed)
- **Error Handling**: Basic implementation (could be enhanced)
- **Testing**: No automated tests implemented
- **Monitoring**: Basic logging (production monitoring needed)

## File Paths Reference

### Key Directories
- **Root**: `C:\Users\jamie\Desktop\creative-studio-ai (1)\`
- **Modules**: `C:\Users\jamie\Desktop\creative-studio-ai (1)\modules\`
- **API**: `C:\Users\jamie\Desktop\creative-studio-ai (1)\api\`
- **Components**: `C:\Users\jamie\Desktop\creative-studio-ai (1)\components\`
- **Services**: `C:\Users\jamie\Desktop\creative-studio-ai (1)\services\`

### Critical Files
- **Main App**: `C:\Users\jamie\Desktop\creative-studio-ai (1)\App.tsx`
- **Types**: `C:\Users\jamie\Desktop\creative-studio-ai (1)\types.ts`
- **Environment**: `C:\Users\jamie\Desktop\creative-studio-ai (1)\.env.local`
- **Database Schema**: `C:\Users\jamie\Desktop\creative-studio-ai (1)\supabase-schema.sql`
- **Deployment Config**: `C:\Users\jamie\Desktop\creative-studio-ai (1)\vercel.json`

---

*This context file provides comprehensive information for Claude Code to assist with any aspect of the Creative Studio AI project. Last updated: September 15, 2025*
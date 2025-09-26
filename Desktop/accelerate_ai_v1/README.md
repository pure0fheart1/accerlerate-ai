# Accelerate.ai - AI-Powered Productivity Suite

A comprehensive suite of AI-powered tools including image generation, prompt library, and various productivity features designed to accelerate your creative workflow.

## Features

- 🎨 AI Image Generation using Google's Imagen model
- 📝 Comprehensive prompt library and polishing tools
- 🧠 Various AI-powered productivity tools
- 💬 Interactive AI assistants for different domains
- 🔧 Task management and organization tools

## Deployment to Vercel

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager
- Google AI Studio API key

### Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory:
   ```
   VITE_API_KEY=your_google_ai_studio_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Vercel Deployment

#### Option 1: Deploy via Vercel CLI
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project directory
3. Follow the prompts to deploy

#### Option 2: Deploy via Vercel Dashboard
1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Connect your repository to Vercel
3. Add the environment variable `VITE_API_KEY` in your Vercel project settings
4. Deploy automatically on every push

### Environment Variables
Make sure to set the following environment variable in your Vercel project:
- `VITE_API_KEY`: Your Google AI Studio API key

### Build Configuration
The project is configured with:
- **Framework**: Vite
- **Build Command**: `npm run build`  
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## API Configuration

This application uses Google AI Studio (Gemini) for:
- Text generation and processing
- Image generation via Imagen model
- Structured JSON responses for complex tasks

Make sure your API key has access to:
- Gemini 2.5 Flash model
- Imagen 4.0 Generate model

## Project Structure

```
├── components/          # Reusable React components
├── contexts/           # React context providers
├── pages/              # Individual tool pages/components
├── services/           # API services (Google AI integration)
├── types.ts           # TypeScript type definitions
├── App.tsx            # Main application component
├── index.tsx          # Application entry point
├── index.html         # HTML template
└── vite.config.ts     # Vite configuration
```

## Troubleshooting

### Build Issues
- Ensure all dependencies are installed: `npm install`
- Check that environment variables are properly set
- Verify API key has necessary permissions

### Runtime Issues  
- Check browser console for API errors
- Ensure API key is valid and has quota
- Verify network connectivity for API calls

## Development

The application is built with:
- **React 19** with TypeScript
- **Vite** for build tooling
- **Google GenAI SDK** for AI integration
- **CSS** for styling

To add new tools:
1. Create a new component in the `pages/` directory
2. Add the import and route in `App.tsx`
3. Create corresponding service functions in `services/geminiService.ts`
4. Add type definitions in `types.ts` if needed

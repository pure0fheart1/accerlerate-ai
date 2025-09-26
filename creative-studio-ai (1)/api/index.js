import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://creative-studio-ai.vercel.app', 'https://creative-studio-g4go6stj9-jamie-lees-projects-f8b674ea.vercel.app', 'https://creative-studio-a8cxzd4al-jamie-lees-projects-f8b674ea.vercel.app', 'https://creative-studio-9aaxbq0gi-jamie-lees-projects-f8b674ea.vercel.app', 'https://creative-studio-d4mjaslwl-jamie-lees-projects-f8b674ea.vercel.app', 'https://creative-studio-9acjy3c6q-jamie-lees-projects-f8b674ea.vercel.app', 'https://creative-studio-aj25y6tzn-jamie-lees-projects-f8b674ea.vercel.app', 'https://creative-studio-m80jzsr4f-jamie-lees-projects-f8b674ea.vercel.app', 'https://creative-studio-9xauhmt3d-jamie-lees-projects-f8b674ea.vercel.app', 'https://creative-studio-nd3mb5roc-jamie-lees-projects-f8b674ea.vercel.app', 'https://creative-studio-n8u6g90sb-jamie-lees-projects-f8b674ea.vercel.app', 'https://creative-studio-h3sbuegco-jamie-lees-projects-f8b674ea.vercel.app']
    : ['http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Creative Studio AI API'
  });
});

// Simple test routes to isolate import issues
app.get('/api/test', (req, res) => {
  res.json({ message: 'Test route works' });
});

app.post('/api/auth/test', (req, res) => {
  res.json({ message: 'Auth test route works' });
});


// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

async function startServer() {
  // Import routes
  console.log('Importing routes...');
  let authRoutes, userRoutes, usageRoutes;

  try {
    const authModule = await import('./routes/auth.js');
    authRoutes = authModule.default;
    console.log('Auth routes imported successfully');
  } catch (error) {
    console.error('Failed to import auth routes:', error);
  }

  try {
    const userModule = await import('./routes/users.js');
    userRoutes = userModule.default;
    console.log('User routes imported successfully');
  } catch (error) {
    console.error('Failed to import user routes:', error);
  }

  try {
    const usageModule = await import('./routes/usage.js');
    usageRoutes = usageModule.default;
    console.log('Usage routes imported successfully');
  } catch (error) {
    console.error('Failed to import usage routes:', error);
  }

  // API routes
  console.log('Setting up routes...');
  if (authRoutes) {
    app.use('/api/auth', authRoutes);
    console.log('Auth routes loaded');
  }
  if (userRoutes) {
    app.use('/api/users', userRoutes);
    console.log('User routes loaded');
  }
  if (usageRoutes) {
    app.use('/api/usage', usageRoutes);
    console.log('Usage routes loaded');
  }

  app.listen(PORT, () => {
    console.log(`🚀 Creative Studio AI API running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer().catch(console.error);
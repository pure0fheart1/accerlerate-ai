const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Validation schema
const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required'),
});

// Helper function to generate JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback-secret-key', {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// Helper function to get user with plan
const getUserWithPlan = async (userId) => {
  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select(`
      *,
      subscription_plans (*)
    `)
    .eq('id', userId)
    .single();

  if (error) throw error;
  return user;
};

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Basic environment check
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing environment variables:', {
      SUPABASE_URL: !!supabaseUrl,
      SUPABASE_SERVICE_KEY: !!supabaseServiceKey,
      JWT_SECRET: !!process.env.JWT_SECRET
    });
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const { email, password, name } = signupSchema.parse(req.body);

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 12);

    // Create user
    const { data: newUser, error: createError } = await supabaseAdmin
      .from('users')
      .insert({
        email,
        name,
        password_hash: hashedPassword,
        plan_id: 'free', // Default to free plan
      })
      .select()
      .single();

    if (createError) {
      console.error('User creation error:', createError);
      return res.status(500).json({ error: 'Failed to create user' });
    }

    // Get user with plan details
    const userWithPlan = await getUserWithPlan(newUser.id);

    // Generate token
    const token = generateToken(newUser.id);

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: userWithPlan.id,
        email: userWithPlan.email,
        name: userWithPlan.name,
        createdAt: userWithPlan.created_at,
        plan: userWithPlan.subscription_plans,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
      });
    }

    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
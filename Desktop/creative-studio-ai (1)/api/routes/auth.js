import express from 'express';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { supabaseAdmin } from '../config/supabase.js';

const router = express.Router();

// Validation schemas
const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Helper function to generate JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
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

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
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
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Get user by email
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcryptjs.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Get user with plan details
    const userWithPlan = await getUserWithPlan(user.id);

    // Generate token
    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
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

    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(401).json({ error: 'Refresh token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userWithPlan = await getUserWithPlan(decoded.userId);

    // Generate new token
    const newToken = generateToken(decoded.userId);

    res.json({
      token: newToken,
      user: {
        id: userWithPlan.id,
        email: userWithPlan.email,
        name: userWithPlan.name,
        createdAt: userWithPlan.created_at,
        plan: userWithPlan.subscription_plans,
      },
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

export default router;
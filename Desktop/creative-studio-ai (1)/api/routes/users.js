import express from 'express';
import { z } from 'zod';
import { authenticateToken } from '../middleware/auth.js';
import { supabaseAdmin } from '../config/supabase.js';

const router = express.Router();

// Validation schemas
const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  plan_id: z.enum(['free', 'pro', 'premium']).optional(),
});

// GET /api/users/me
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select(`
        *,
        subscription_plans (*)
      `)
      .eq('id', req.user.id)
      .single();

    if (error) {
      console.error('Get user error:', error);
      return res.status(500).json({ error: 'Failed to fetch user' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.created_at,
        plan: user.subscription_plans,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/users/me
router.put('/me', authenticateToken, async (req, res) => {
  try {
    const updates = updateUserSchema.parse(req.body);

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('id', req.user.id)
      .select(`
        *,
        subscription_plans (*)
      `)
      .single();

    if (error) {
      console.error('Update user error:', error);
      return res.status(500).json({ error: 'Failed to update user' });
    }

    res.json({
      message: 'User updated successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.created_at,
        plan: user.subscription_plans,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
      });
    }

    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/users/subscription-plans
router.get('/subscription-plans', async (req, res) => {
  try {
    const { data: plans, error } = await supabaseAdmin
      .from('subscription_plans')
      .select('*')
      .order('price');

    if (error) {
      console.error('Get plans error:', error);
      return res.status(500).json({ error: 'Failed to fetch subscription plans' });
    }

    res.json({ plans });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
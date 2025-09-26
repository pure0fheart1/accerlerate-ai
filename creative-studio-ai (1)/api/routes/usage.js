import express from 'express';
import { z } from 'zod';
import { authenticateToken } from '../middleware/auth.js';
import { supabaseAdmin } from '../config/supabase.js';

const router = express.Router();

// Validation schemas
const trackUsageSchema = z.object({
  feature: z.enum(['image_generations', 'video_generations', 'ai_chat_messages', 'storage_used_mb']),
  amount: z.number().positive().default(1),
});

// Helper function to get current period (YYYY-MM)
const getCurrentPeriod = () => {
  const now = new Date();
  return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
};

// GET /api/usage/current
router.get('/current', authenticateToken, async (req, res) => {
  try {
    const currentPeriod = getCurrentPeriod();

    // Get or create usage stats for current period
    let { data: usage, error } = await supabaseAdmin
      .from('usage_stats')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('period', currentPeriod)
      .single();

    if (error && error.code === 'PGRST116') {
      // No usage record exists, create one
      const { data: newUsage, error: createError } = await supabaseAdmin
        .from('usage_stats')
        .insert({
          user_id: req.user.id,
          period: currentPeriod,
          image_generations: 0,
          video_generations: 0,
          ai_chat_messages: 0,
          storage_used_mb: 0,
        })
        .select()
        .single();

      if (createError) {
        console.error('Create usage error:', createError);
        return res.status(500).json({ error: 'Failed to create usage record' });
      }

      usage = newUsage;
    } else if (error) {
      console.error('Get usage error:', error);
      return res.status(500).json({ error: 'Failed to fetch usage stats' });
    }

    res.json({
      usage: {
        userId: usage.user_id,
        period: usage.period,
        imageGenerations: usage.image_generations,
        videoGenerations: usage.video_generations,
        aiChatMessages: usage.ai_chat_messages,
        storageUsedMB: usage.storage_used_mb,
      },
    });
  } catch (error) {
    console.error('Get current usage error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/usage/track
router.post('/track', authenticateToken, async (req, res) => {
  try {
    const { feature, amount } = trackUsageSchema.parse(req.body);
    const currentPeriod = getCurrentPeriod();

    // Get user's plan limits
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select(`
        *,
        subscription_plans (*)
      `)
      .eq('id', req.user.id)
      .single();

    if (userError) {
      console.error('Get user error:', userError);
      return res.status(500).json({ error: 'Failed to fetch user plan' });
    }

    const plan = user.subscription_plans;

    // Get current usage
    let { data: usage, error } = await supabaseAdmin
      .from('usage_stats')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('period', currentPeriod)
      .single();

    if (error && error.code === 'PGRST116') {
      // Create new usage record
      const { data: newUsage, error: createError } = await supabaseAdmin
        .from('usage_stats')
        .insert({
          user_id: req.user.id,
          period: currentPeriod,
          image_generations: 0,
          video_generations: 0,
          ai_chat_messages: 0,
          storage_used_mb: 0,
        })
        .select()
        .single();

      if (createError) {
        console.error('Create usage error:', createError);
        return res.status(500).json({ error: 'Failed to create usage record' });
      }

      usage = newUsage;
    } else if (error) {
      console.error('Get usage error:', error);
      return res.status(500).json({ error: 'Failed to fetch usage stats' });
    }

    // Check limits
    const featureLimits = {
      image_generations: plan.image_generations,
      video_generations: plan.video_generations,
      ai_chat_messages: plan.ai_chat_messages,
      storage_used_mb: plan.storage_gb * 1024,
    };

    const currentUsage = usage[feature];
    const limit = featureLimits[feature];

    // -1 means unlimited
    if (limit !== -1 && (currentUsage + amount) > limit) {
      return res.status(429).json({
        error: 'Usage limit exceeded',
        current: currentUsage,
        limit,
        requested: amount,
      });
    }

    // Update usage
    const { data: updatedUsage, error: updateError } = await supabaseAdmin
      .from('usage_stats')
      .update({
        [feature]: currentUsage + amount,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', req.user.id)
      .eq('period', currentPeriod)
      .select()
      .single();

    if (updateError) {
      console.error('Update usage error:', updateError);
      return res.status(500).json({ error: 'Failed to update usage' });
    }

    res.json({
      message: 'Usage tracked successfully',
      usage: {
        userId: updatedUsage.user_id,
        period: updatedUsage.period,
        imageGenerations: updatedUsage.image_generations,
        videoGenerations: updatedUsage.video_generations,
        aiChatMessages: updatedUsage.ai_chat_messages,
        storageUsedMB: updatedUsage.storage_used_mb,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
      });
    }

    console.error('Track usage error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/usage/history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const { data: usageHistory, error } = await supabaseAdmin
      .from('usage_stats')
      .select('*')
      .eq('user_id', req.user.id)
      .order('period', { ascending: false });

    if (error) {
      console.error('Get usage history error:', error);
      return res.status(500).json({ error: 'Failed to fetch usage history' });
    }

    const history = usageHistory.map(usage => ({
      userId: usage.user_id,
      period: usage.period,
      imageGenerations: usage.image_generations,
      videoGenerations: usage.video_generations,
      aiChatMessages: usage.ai_chat_messages,
      storageUsedMB: usage.storage_used_mb,
      createdAt: usage.created_at,
      updatedAt: usage.updated_at,
    }));

    res.json({ history });
  } catch (error) {
    console.error('Get usage history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
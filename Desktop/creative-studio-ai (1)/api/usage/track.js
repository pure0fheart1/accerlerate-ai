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
const trackUsageSchema = z.object({
  feature: z.enum(['image_generations', 'video_generations', 'ai_chat_messages', 'storage_used_mb']),
  amount: z.number().min(1).default(1),
});

// Helper function to get current period (YYYY-MM)
const getCurrentPeriod = () => {
  const now = new Date();
  return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
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

// Helper function to get or create usage record
const getOrCreateUsage = async (userId) => {
  const period = getCurrentPeriod();

  // Try to get existing usage record
  const { data: existingUsage, error: fetchError } = await supabaseAdmin
    .from('usage_stats')
    .select('*')
    .eq('user_id', userId)
    .eq('period', period)
    .single();

  if (existingUsage) {
    return existingUsage;
  }

  // Create new usage record if doesn't exist
  const { data: newUsage, error: createError } = await supabaseAdmin
    .from('usage_stats')
    .insert({
      user_id: userId,
      period: period,
      image_generations: 0,
      video_generations: 0,
      ai_chat_messages: 0,
      storage_used_mb: 0
    })
    .select()
    .single();

  if (createError) throw createError;
  return newUsage;
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

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');

    const { feature, amount } = trackUsageSchema.parse(req.body);

    // Get user with plan details
    const user = await getUserWithPlan(decoded.userId);
    const plan = user.subscription_plans;

    // Get current usage
    const currentUsage = await getOrCreateUsage(decoded.userId);

    // Check limits
    const featureLimits = {
      image_generations: plan.image_generations,
      video_generations: plan.video_generations,
      ai_chat_messages: plan.ai_chat_messages,
      storage_used_mb: plan.storage_gb * 1024 // Convert GB to MB
    };

    const currentValue = currentUsage[feature];
    const limit = featureLimits[feature];

    // Check if limit would be exceeded (-1 means unlimited)
    if (limit !== -1 && (currentValue + amount) > limit) {
      return res.status(400).json({
        error: 'Usage limit exceeded',
        current: currentValue,
        limit: limit,
        requested: amount
      });
    }

    // Update usage
    const updateData = {
      [feature]: currentValue + amount
    };

    const { data: updatedUsage, error: updateError } = await supabaseAdmin
      .from('usage_stats')
      .update(updateData)
      .eq('id', currentUsage.id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Transform database format to frontend format
    const frontendUsage = {
      userId: updatedUsage.user_id,
      period: updatedUsage.period,
      imageGenerations: updatedUsage.image_generations,
      videoGenerations: updatedUsage.video_generations,
      aiChatMessages: updatedUsage.ai_chat_messages,
      storageUsedMB: updatedUsage.storage_used_mb
    };

    res.json({
      message: 'Usage tracked successfully',
      usage: frontendUsage
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
      });
    }

    console.error('Track usage error:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
}
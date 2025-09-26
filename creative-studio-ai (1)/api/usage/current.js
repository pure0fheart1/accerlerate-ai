const jwt = require('jsonwebtoken');
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

// Helper function to get current period (YYYY-MM)
const getCurrentPeriod = () => {
  const now = new Date();
  return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
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

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');

    // Get or create usage stats for current period
    const usage = await getOrCreateUsage(decoded.userId);

    // Transform database format to frontend format
    const frontendUsage = {
      userId: usage.user_id,
      period: usage.period,
      imageGenerations: usage.image_generations,
      videoGenerations: usage.video_generations,
      aiChatMessages: usage.ai_chat_messages,
      storageUsedMB: usage.storage_used_mb
    };

    res.json({
      usage: frontendUsage
    });
  } catch (error) {
    console.error('Get usage error:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
}
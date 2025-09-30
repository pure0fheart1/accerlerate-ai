import { createClient } from '@supabase/supabase-js';

// Vercel serverless function for creating user profiles with service role
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, email } = req.body;

    if (!userId || !email) {
      return res.status(400).json({ error: 'Missing userId or email' });
    }

    // Use service role key to bypass RLS
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return res.status(500).json({ error: 'Supabase configuration missing' });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const displayName = email.split('@')[0];
    const now = new Date().toISOString();

    // Create user profile
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        user_id: userId,
        email,
        display_name: displayName,
        tier: 'Free',
        smechals_balance: 0,
        subscription_status: 'inactive',
        favorite_pages: [],
        login_streak: 1,
        last_login_date: now,
        longest_streak: 1,
        total_logins: 1
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user profile:', error);
      return res.status(500).json({ error: error.message });
    }

    // Give new users initial bonus (50 smechals)
    const { error: bonusError } = await supabaseAdmin
      .from('smechals_transactions')
      .insert({
        user_id: userId,
        type: 'bonus',
        amount: 50,
        description: 'Welcome bonus',
        balance_after: 50
      });

    if (bonusError) {
      console.error('Error adding welcome bonus:', bonusError);
      // Don't fail the request, profile was created successfully
    }

    return res.status(200).json({ success: true, profile: data });

  } catch (error) {
    console.error('Error in create-profile API:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}
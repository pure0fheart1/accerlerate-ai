import { createClient, SupabaseClient, User as SupabaseUser, Session } from '@supabase/supabase-js';
import { User, UsageStats, SubscriptionPlan } from '../types';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your Vercel environment variables.');
  console.error('Missing Supabase environment variables:', {
    url: !!supabaseUrl,
    anonKey: !!supabaseAnonKey
  });
}

// Create Supabase client
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Database types for better type safety
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          plan_id: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          plan_id?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          plan_id?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          updated_at?: string;
        };
      };
      usage_stats: {
        Row: {
          id: string;
          user_id: string;
          period: string;
          image_generations: number;
          video_generations: number;
          ai_chat_messages: number;
          storage_used_mb: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          period: string;
          image_generations?: number;
          video_generations?: number;
          ai_chat_messages?: number;
          storage_used_mb?: number;
        };
        Update: {
          image_generations?: number;
          video_generations?: number;
          ai_chat_messages?: number;
          storage_used_mb?: number;
          updated_at?: string;
        };
      };
      subscription_plans: {
        Row: {
          id: string;
          name: string;
          price: number;
          currency: string;
          interval: string;
          features: {
            imageGenerations: number;
            videoGenerations: number;
            aiChatMessages: number;
            storageGB: number;
            prioritySupport: boolean;
            advancedFeatures: boolean;
          };
          created_at: string;
        };
      };
    };
  };
}

// Supabase client with types
export const typedSupabase = supabase as SupabaseClient<Database>;

// Authentication helper functions
export const authService = {
  // Sign up with email and password
  async signUp(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name
        }
      }
    });

    if (error) throw error;

    // Create user profile if signup was successful
    if (data.user) {
      const { error: profileError } = await typedSupabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: data.user.email!,
          name,
          plan_id: 'free' // Default to free plan
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        throw profileError;
      }
    }

    return data;
  },

  // Sign in with email and password
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current session
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  // Get current user
  async getUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  // Listen to auth changes
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// User profile functions
export const profileService = {
  // Get user profile
  async getProfile(userId: string) {
    const { data, error } = await typedSupabase
      .from('profiles')
      .select(`
        *,
        subscription_plans (*)
      `)
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  // Update user profile
  async updateProfile(userId: string, updates: Database['public']['Tables']['profiles']['Update']) {
    const { data, error } = await typedSupabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Convert Supabase user + profile to app User type
  async buildUserObject(supabaseUser: SupabaseUser): Promise<User> {
    const profile = await this.getProfile(supabaseUser.id);

    // Fallback plan if subscription_plans is null or undefined
    const defaultFreePlan = {
      id: 'free',
      name: 'Free',
      price: 0,
      currency: 'usd',
      interval: 'month' as 'month',
      features: {
        imageGenerations: 5,
        videoGenerations: 1,
        aiChatMessages: 10,
        storageGB: 1,
        prioritySupport: false,
        advancedFeatures: false,
      }
    };

    return {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      createdAt: profile.created_at,
      plan: profile.subscription_plans || defaultFreePlan,
      stripeCustomerId: profile.stripe_customer_id || undefined,
      stripeSubscriptionId: profile.stripe_subscription_id || undefined
    };
  }
};

// Usage tracking functions
export const usageService = {
  // Get current period usage
  async getCurrentUsage(userId: string) {
    const currentPeriod = new Date().toISOString().slice(0, 7); // YYYY-MM format

    const { data, error } = await typedSupabase
      .from('usage_stats')
      .select('*')
      .eq('user_id', userId)
      .eq('period', currentPeriod)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      throw error;
    }

    // If no usage record exists, create one
    if (!data) {
      const newUsage = {
        user_id: userId,
        period: currentPeriod,
        image_generations: 0,
        video_generations: 0,
        ai_chat_messages: 0,
        storage_used_mb: 0
      };

      const { data: created, error: createError } = await typedSupabase
        .from('usage_stats')
        .insert(newUsage)
        .select()
        .single();

      if (createError) throw createError;
      return created;
    }

    return data;
  },

  // Track usage for a feature
  async trackUsage(userId: string, feature: 'image_generations' | 'video_generations' | 'ai_chat_messages' | 'storage_used_mb', amount: number = 1) {
    const currentPeriod = new Date().toISOString().slice(0, 7);

    // First ensure a usage record exists
    await this.getCurrentUsage(userId);

    // Then increment the usage
    const { data, error } = await typedSupabase.rpc('increment_usage', {
      p_user_id: userId,
      p_period: currentPeriod,
      p_feature: feature,
      p_amount: amount
    });

    if (error) {
      // Fallback to manual update if RPC doesn't exist
      const currentUsage = await this.getCurrentUsage(userId);
      const { data: updated, error: updateError } = await typedSupabase
        .from('usage_stats')
        .update({
          [feature]: currentUsage[feature] + amount,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('period', currentPeriod)
        .select()
        .single();

      if (updateError) throw updateError;
      return updated;
    }

    return data;
  },

  // Get usage history
  async getUsageHistory(userId: string, limit: number = 12) {
    const { data, error } = await typedSupabase
      .from('usage_stats')
      .select('*')
      .eq('user_id', userId)
      .order('period', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }
};

// Subscription plans
export const subscriptionService = {
  // Get all subscription plans
  async getPlans(): Promise<SubscriptionPlan[]> {
    const { data, error } = await typedSupabase
      .from('subscription_plans')
      .select('*')
      .order('price');

    if (error) throw error;
    return data.map(plan => ({
      id: plan.id,
      name: plan.name,
      price: plan.price,
      currency: plan.currency,
      interval: plan.interval as 'month' | 'year',
      features: plan.features
    }));
  }
};

export default supabase;
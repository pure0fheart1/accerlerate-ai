import { supabase } from '../lib/supabase';
import { SmechalsTransaction, UserTier } from '../types';
import { SMECHAL_RATES } from '../constants/tiers';

export interface UserProfile {
  user_id: string;
  email: string;
  display_name: string;
  tier: UserTier;
  smechals_balance: number;
  profile_picture_url?: string;
  trial_days_left?: number;
  trial_start_date?: string;
  subscription_status: 'active' | 'inactive' | 'trial' | 'cancelled';
  subscription_end_date?: string;
  favorite_pages: string[];
  login_streak: number;
  last_login_date?: string;
  longest_streak: number;
  total_logins: number;
  bio?: string;
  location?: string;
  website?: string;
  email_notifications?: boolean;
  weekly_reports?: boolean;
  marketing_emails?: boolean;
  created_at: string;
  updated_at: string;
}

export interface ToolRequest {
  id: string;
  user_id: string;
  tool_name: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  smechals_cost: number;
  estimated_delivery: string;
  created_at: string;
  updated_at: string;
}

export class SmechalsService {
  // Get user profile with tier and smechals data
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      return null;
    }
  }

  // Create initial user profile
  static async createUserProfile(userId: string, email: string): Promise<UserProfile | null> {
    try {
      // Call API endpoint that uses service role key to bypass RLS
      const response = await fetch('/api/create-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error creating user profile:', errorData);
        return null;
      }

      const { profile } = await response.json();
      return profile;
    } catch (error) {
      console.error('Error in createUserProfile:', error);
      return null;
    }
  }

  // Add smechals to user balance
  static async addSmechals(
    userId: string,
    amount: number,
    type: SmechalsTransaction['type'],
    description: string
  ): Promise<boolean> {
    try {
      // Start a transaction
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('smechals_balance')
        .eq('user_id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching user profile for smechals update:', profileError);
        return false;
      }

      const newBalance = profile.smechals_balance + amount;

      // Update balance
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ smechals_balance: newBalance, updated_at: new Date().toISOString() })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Error updating smechals balance:', updateError);
        return false;
      }

      // Record transaction
      const { error: transactionError } = await supabase
        .from('smechals_transactions')
        .insert({
          user_id: userId,
          type,
          amount,
          description,
          balance_after: newBalance
        });

      if (transactionError) {
        console.error('Error recording smechals transaction:', transactionError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in addSmechals:', error);
      return false;
    }
  }

  // Spend smechals
  static async spendSmechals(
    userId: string,
    amount: number,
    description: string
  ): Promise<boolean> {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('smechals_balance')
        .eq('user_id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching user profile for smechals spending:', profileError);
        return false;
      }

      if (profile.smechals_balance < amount) {
        console.error('Insufficient smechals balance');
        return false;
      }

      const newBalance = profile.smechals_balance - amount;

      // Update balance
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ smechals_balance: newBalance, updated_at: new Date().toISOString() })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Error updating smechals balance:', updateError);
        return false;
      }

      // Record transaction
      const { error: transactionError } = await supabase
        .from('smechals_transactions')
        .insert({
          user_id: userId,
          type: 'spent',
          amount: -amount,
          description,
          balance_after: newBalance
        });

      if (transactionError) {
        console.error('Error recording smechals transaction:', transactionError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in spendSmechals:', error);
      return false;
    }
  }

  // Get user's smechals transactions
  static async getTransactions(userId: string, limit = 50): Promise<SmechalsTransaction[]> {
    try {
      const { data, error } = await supabase
        .from('smechals_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching smechals transactions:', error);
        return [];
      }

      return data.map(transaction => ({
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        createdAt: new Date(transaction.created_at)
      }));
    } catch (error) {
      console.error('Error in getTransactions:', error);
      return [];
    }
  }

  // Submit tool request
  static async submitToolRequest(
    userId: string,
    toolName: string,
    description: string,
    priority: 'low' | 'medium' | 'high'
  ): Promise<boolean> {
    try {
      // Check if user has enough smechals
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('smechals_balance')
        .eq('user_id', userId)
        .single();

      if (profileError || profile.smechals_balance < SMECHAL_RATES.TOOL_REQUEST_COST) {
        return false;
      }

      // Calculate estimated delivery
      const estimatedDays = priority === 'high' ? 1 : priority === 'medium' ? 3 : 7;
      const estimatedDelivery = new Date();
      estimatedDelivery.setDate(estimatedDelivery.getDate() + estimatedDays);

      // Create tool request
      const { error: requestError } = await supabase
        .from('tool_requests')
        .insert({
          user_id: userId,
          tool_name: toolName,
          description,
          priority,
          status: 'pending',
          smechals_cost: SMECHAL_RATES.TOOL_REQUEST_COST,
          estimated_delivery: estimatedDelivery.toISOString()
        });

      if (requestError) {
        console.error('Error creating tool request:', requestError);
        return false;
      }

      // Spend smechals
      const success = await this.spendSmechals(
        userId,
        SMECHAL_RATES.TOOL_REQUEST_COST,
        `Tool request: ${toolName}`
      );

      return success;
    } catch (error) {
      console.error('Error in submitToolRequest:', error);
      return false;
    }
  }

  // Get user's tool requests
  static async getToolRequests(userId: string): Promise<ToolRequest[]> {
    try {
      const { data, error } = await supabase
        .from('tool_requests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tool requests:', error);
        return [];
      }

      return data;
    } catch (error) {
      console.error('Error in getToolRequests:', error);
      return [];
    }
  }

  // Update user tier
  static async updateUserTier(userId: string, tier: UserTier): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          tier,
          subscription_status: tier === 'Free' ? 'inactive' : 'active',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating user tier:', error);
        return false;
      }

      // Add tier bonus smechals
      let bonusAmount = 0;
      if (tier === 'Member') bonusAmount = SMECHAL_RATES.MONTHLY_MEMBER_BONUS;
      else if (tier === 'VIP') bonusAmount = SMECHAL_RATES.MONTHLY_VIP_BONUS;
      else if (tier === 'God-Tier') bonusAmount = SMECHAL_RATES.MONTHLY_GOD_TIER_BONUS;

      if (bonusAmount > 0) {
        await this.addSmechals(userId, bonusAmount, 'bonus', `${tier} tier upgrade bonus`);
      }

      return true;
    } catch (error) {
      console.error('Error in updateUserTier:', error);
      return false;
    }
  }

  // Start VIP trial
  static async startVipTrial(userId: string): Promise<boolean> {
    try {
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 3);

      const { error } = await supabase
        .from('user_profiles')
        .update({
          tier: 'VIP',
          subscription_status: 'trial',
          trial_start_date: new Date().toISOString(),
          trial_days_left: 3,
          subscription_end_date: trialEndDate.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Error starting VIP trial:', error);
        return false;
      }

      // Add trial bonus
      await this.addSmechals(userId, SMECHAL_RATES.VIP_TRIAL_BONUS, 'trial', 'VIP trial bonus');

      return true;
    } catch (error) {
      console.error('Error in startVipTrial:', error);
      return false;
    }
  }

  // Check and update daily login bonus
  static async checkDailyBonus(userId: string): Promise<boolean> {
    try {
      // Check if user already received daily bonus today
      const today = new Date().toISOString().split('T')[0];

      const { data: todayTransactions, error } = await supabase
        .from('smechals_transactions')
        .select('id')
        .eq('user_id', userId)
        .eq('type', 'earned')
        .like('description', '%Daily login bonus%')
        .gte('created_at', `${today}T00:00:00.000Z`)
        .lt('created_at', `${today}T23:59:59.999Z`);

      if (error) {
        console.error('Error checking daily bonus:', error);
        return false;
      }

      if (todayTransactions && todayTransactions.length > 0) {
        return false; // Already received today
      }

      // Add daily bonus
      await this.addSmechals(userId, SMECHAL_RATES.DAILY_FREE_BONUS, 'earned', 'Daily login bonus');
      return true;
    } catch (error) {
      console.error('Error in checkDailyBonus:', error);
      return false;
    }
  }

  // Update user's favorite pages
  static async updateFavoritePages(userId: string, favoritePages: string[]): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          favorite_pages: favoritePages,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating favorite pages:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateFavoritePages:', error);
      return false;
    }
  }

  // Add a page to user's favorites
  static async addFavoritePage(userId: string, pageName: string): Promise<boolean> {
    try {
      const profile = await this.getUserProfile(userId);
      if (!profile) {
        console.error('User profile not found');
        return false;
      }

      const currentFavorites = profile.favorite_pages || [];
      if (currentFavorites.includes(pageName)) {
        return true; // Already in favorites
      }

      const updatedFavorites = [...currentFavorites, pageName];
      return await this.updateFavoritePages(userId, updatedFavorites);
    } catch (error) {
      console.error('Error in addFavoritePage:', error);
      return false;
    }
  }

  // Remove a page from user's favorites
  static async removeFavoritePage(userId: string, pageName: string): Promise<boolean> {
    try {
      const profile = await this.getUserProfile(userId);
      if (!profile) {
        console.error('User profile not found');
        return false;
      }

      const currentFavorites = profile.favorite_pages || [];
      const updatedFavorites = currentFavorites.filter(page => page !== pageName);
      return await this.updateFavoritePages(userId, updatedFavorites);
    } catch (error) {
      console.error('Error in removeFavoritePage:', error);
      return false;
    }
  }

  // Update login streak
  static async updateLoginStreak(userId: string): Promise<{ streak: number; isNewStreak: boolean }> {
    try {
      const profile = await this.getUserProfile(userId);
      if (!profile) {
        return { streak: 0, isNewStreak: false };
      }

      const now = new Date();
      // Get today's date at midnight in UTC
      const todayUTC = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
      const todayString = todayUTC.toISOString().split('T')[0];

      let lastLoginDate: Date | null = null;
      let lastLoginString: string | null = null;

      if (profile.last_login_date) {
        const lastLoginRaw = new Date(profile.last_login_date);
        lastLoginDate = new Date(Date.UTC(lastLoginRaw.getFullYear(), lastLoginRaw.getMonth(), lastLoginRaw.getDate()));
        lastLoginString = lastLoginDate.toISOString().split('T')[0];
      }

      // If already logged in today, return current streak
      if (lastLoginString === todayString) {
        return { streak: profile.login_streak, isNewStreak: false };
      }

      let newStreak = 1;
      let isNewStreak = false;

      if (lastLoginDate) {
        // Calculate day difference properly in UTC
        const daysDiff = Math.floor((todayUTC.getTime() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24));

        if (daysDiff === 1) {
          // Consecutive day - increment streak
          newStreak = profile.login_streak + 1;
          isNewStreak = true;
        } else if (daysDiff > 1) {
          // Streak broken - reset to 1
          newStreak = 1;
        }
      }

      const longestStreak = Math.max(profile.longest_streak || 0, newStreak);
      const totalLogins = (profile.total_logins || 0) + 1;

      const { error } = await supabase
        .from('user_profiles')
        .update({
          login_streak: newStreak,
          last_login_date: now.toISOString(),
          longest_streak: longestStreak,
          total_logins: totalLogins,
          updated_at: now.toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating login streak:', error);
        return { streak: profile.login_streak, isNewStreak: false };
      }

      // Give streak bonus if applicable
      if (isNewStreak && newStreak % 7 === 0) {
        // Bonus every 7 days
        await this.addSmechals(userId, SMECHAL_RATES.DAILY_FREE_BONUS * 2, 'bonus', `${newStreak} day streak bonus!`);
      }

      return { streak: newStreak, isNewStreak };
    } catch (error) {
      console.error('Error in updateLoginStreak:', error);
      return { streak: 0, isNewStreak: false };
    }
  }

  // Update user profile settings
  static async updateProfile(userId: string, updates: {
    display_name?: string;
    profile_picture_url?: string;
    bio?: string;
    location?: string;
    website?: string;
    email_notifications?: boolean;
    weekly_reports?: boolean;
    marketing_emails?: boolean;
  }): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating profile:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateProfile:', error);
      return false;
    }
  }
}
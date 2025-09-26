import { supabase } from '../lib/supabase';
import { SmechalsService } from './smechalsService';

export interface TrialStatus {
  isActive: boolean;
  daysLeft: number;
  startDate: Date | null;
  endDate: Date | null;
  hasExpired: boolean;
}

export class TrialService {
  /**
   * Get the current trial status for a user
   */
  static async getTrialStatus(userId: string): Promise<TrialStatus | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('subscription_status, trial_start_date, trial_days_left, subscription_end_date, tier')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching trial status:', error);
        return null;
      }

      const now = new Date();
      const startDate = data.trial_start_date ? new Date(data.trial_start_date) : null;
      const endDate = data.subscription_end_date ? new Date(data.subscription_end_date) : null;

      const isActive = data.subscription_status === 'trial' && data.tier === 'VIP';
      const hasExpired = endDate ? now > endDate : false;
      const daysLeft = endDate ? Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0;

      return {
        isActive,
        daysLeft,
        startDate,
        endDate,
        hasExpired
      };
    } catch (error) {
      console.error('Error in getTrialStatus:', error);
      return null;
    }
  }

  /**
   * Check if user is eligible for a VIP trial
   */
  static async isEligibleForTrial(userId: string): Promise<boolean> {
    try {
      // Check if user has ever started a trial
      const { data, error } = await supabase
        .from('user_profiles')
        .select('trial_start_date, tier')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error checking trial eligibility:', error);
        return false;
      }

      // User is eligible if they've never started a trial and are currently Free tier
      return !data.trial_start_date && data.tier === 'Free';
    } catch (error) {
      console.error('Error in isEligibleForTrial:', error);
      return false;
    }
  }

  /**
   * Start a 3-day VIP trial for eligible users
   */
  static async startVipTrial(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      // Check eligibility first
      const isEligible = await this.isEligibleForTrial(userId);
      if (!isEligible) {
        return {
          success: false,
          message: 'You are not eligible for a VIP trial. Trials are only available once per account for Free tier users.'
        };
      }

      const success = await SmechalsService.startVipTrial(userId);

      if (success) {
        return {
          success: true,
          message: 'VIP trial started successfully! You now have 3 days of VIP access with all premium features.'
        };
      } else {
        return {
          success: false,
          message: 'Failed to start VIP trial. Please try again or contact support.'
        };
      }
    } catch (error) {
      console.error('Error in startVipTrial:', error);
      return {
        success: false,
        message: 'An error occurred while starting your trial. Please try again.'
      };
    }
  }

  /**
   * Update trial days left (called periodically or on user login)
   */
  static async updateTrialDaysLeft(userId: string): Promise<boolean> {
    try {
      const trialStatus = await this.getTrialStatus(userId);
      if (!trialStatus || !trialStatus.isActive) {
        return false;
      }

      // If trial has expired, handle expiration
      if (trialStatus.hasExpired) {
        return await this.handleTrialExpiration(userId);
      }

      // Update days left in database
      const { error } = await supabase
        .from('user_profiles')
        .update({
          trial_days_left: trialStatus.daysLeft,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating trial days left:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateTrialDaysLeft:', error);
      return false;
    }
  }

  /**
   * Handle trial expiration - downgrade user to Free tier
   */
  static async handleTrialExpiration(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          tier: 'Free',
          subscription_status: 'inactive',
          trial_days_left: 0,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Error handling trial expiration:', error);
        return false;
      }

      // Record trial expiration transaction
      await SmechalsService.addSmechals(
        userId,
        0,
        'system',
        'VIP trial expired - downgraded to Free tier'
      );

      return true;
    } catch (error) {
      console.error('Error in handleTrialExpiration:', error);
      return false;
    }
  }

  /**
   * Convert trial to paid subscription
   */
  static async convertTrialToPaid(userId: string, tier: 'Member' | 'VIP' | 'God-Tier'): Promise<boolean> {
    try {
      const trialStatus = await this.getTrialStatus(userId);
      if (!trialStatus || !trialStatus.isActive) {
        return false;
      }

      // Update to paid subscription
      const { error } = await supabase
        .from('user_profiles')
        .update({
          tier,
          subscription_status: 'active',
          trial_days_left: null,
          subscription_end_date: null, // Will be set by payment processor
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Error converting trial to paid:', error);
        return false;
      }

      // Record conversion transaction
      await SmechalsService.addSmechals(
        userId,
        0,
        'system',
        `Trial converted to ${tier} subscription`
      );

      return true;
    } catch (error) {
      console.error('Error in convertTrialToPaid:', error);
      return false;
    }
  }

  /**
   * Get trial notification data for UI
   */
  static async getTrialNotification(userId: string): Promise<{
    shouldShow: boolean;
    type: 'welcome' | 'reminder' | 'urgent' | 'expired';
    title: string;
    message: string;
    daysLeft: number;
  } | null> {
    try {
      const trialStatus = await this.getTrialStatus(userId);
      if (!trialStatus || !trialStatus.isActive) {
        return null;
      }

      if (trialStatus.hasExpired) {
        return {
          shouldShow: true,
          type: 'expired',
          title: 'Trial Expired',
          message: 'Your VIP trial has ended. Upgrade to continue enjoying premium features.',
          daysLeft: 0
        };
      }

      if (trialStatus.daysLeft === 3) {
        return {
          shouldShow: true,
          type: 'welcome',
          title: 'Welcome to VIP!',
          message: 'Your 3-day VIP trial has started. Enjoy all premium features!',
          daysLeft: trialStatus.daysLeft
        };
      }

      if (trialStatus.daysLeft === 1) {
        return {
          shouldShow: true,
          type: 'urgent',
          title: 'Trial Ending Soon!',
          message: 'Your VIP trial expires tomorrow. Upgrade now to keep your premium access.',
          daysLeft: trialStatus.daysLeft
        };
      }

      if (trialStatus.daysLeft === 2) {
        return {
          shouldShow: true,
          type: 'reminder',
          title: 'Trial Reminder',
          message: 'You have 2 days left in your VIP trial. Consider upgrading to continue.',
          daysLeft: trialStatus.daysLeft
        };
      }

      return {
        shouldShow: false,
        type: 'reminder',
        title: '',
        message: '',
        daysLeft: trialStatus.daysLeft
      };
    } catch (error) {
      console.error('Error in getTrialNotification:', error);
      return null;
    }
  }

  /**
   * Check all active trials and update their status (background job function)
   */
  static async checkAllActiveTrials(): Promise<number> {
    try {
      const { data: activeTrials, error } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('subscription_status', 'trial')
        .eq('tier', 'VIP');

      if (error) {
        console.error('Error fetching active trials:', error);
        return 0;
      }

      let updatedCount = 0;

      for (const trial of activeTrials) {
        const updated = await this.updateTrialDaysLeft(trial.user_id);
        if (updated) updatedCount++;
      }

      return updatedCount;
    } catch (error) {
      console.error('Error in checkAllActiveTrials:', error);
      return 0;
    }
  }
}
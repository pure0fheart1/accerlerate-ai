import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { SmechalsService, UserProfile } from '../services/smechalsService';
import { TrialService } from '../services/trialService';
import { SmechalsTransaction, UserTier } from '../types';

interface UserProfileContextType {
  profile: UserProfile | null;
  transactions: SmechalsTransaction[];
  loading: boolean;
  refreshProfile: () => Promise<void>;
  refreshTransactions: () => Promise<void>;
  addSmechals: (amount: number, type: SmechalsTransaction['type'], description: string) => Promise<boolean>;
  spendSmechals: (amount: number, description: string) => Promise<boolean>;
  submitToolRequest: (toolName: string, description: string, priority: 'low' | 'medium' | 'high') => Promise<boolean>;
  updateTier: (tier: UserTier) => Promise<boolean>;
  startVipTrial: () => Promise<boolean>;
  checkDailyBonus: () => Promise<boolean>;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
};

interface UserProfileProviderProps {
  children: React.ReactNode;
}

export const UserProfileProvider: React.FC<UserProfileProviderProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [transactions, setTransactions] = useState<SmechalsTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      let userProfile = await SmechalsService.getUserProfile(user.id);

      // If profile doesn't exist, create it
      if (!userProfile && user.email) {
        userProfile = await SmechalsService.createUserProfile(user.id, user.email);
      }

      setProfile(userProfile);

      // Check for daily bonus
      if (userProfile) {
        await SmechalsService.checkDailyBonus(user.id);
        // Refresh profile after potential daily bonus
        const updatedProfile = await SmechalsService.getUserProfile(user.id);
        setProfile(updatedProfile);
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const refreshTransactions = useCallback(async () => {
    if (!user) {
      setTransactions([]);
      return;
    }

    try {
      const userTransactions = await SmechalsService.getTransactions(user.id);
      setTransactions(userTransactions);
    } catch (error) {
      console.error('Error refreshing transactions:', error);
    }
  }, [user]);

  const addSmechals = useCallback(async (
    amount: number,
    type: SmechalsTransaction['type'],
    description: string
  ): Promise<boolean> => {
    if (!user) return false;

    const success = await SmechalsService.addSmechals(user.id, amount, type, description);
    if (success) {
      await refreshProfile();
      await refreshTransactions();
    }
    return success;
  }, [user, refreshProfile, refreshTransactions]);

  const spendSmechals = useCallback(async (
    amount: number,
    description: string
  ): Promise<boolean> => {
    if (!user) return false;

    const success = await SmechalsService.spendSmechals(user.id, amount, description);
    if (success) {
      await refreshProfile();
      await refreshTransactions();
    }
    return success;
  }, [user, refreshProfile, refreshTransactions]);

  const submitToolRequest = useCallback(async (
    toolName: string,
    description: string,
    priority: 'low' | 'medium' | 'high'
  ): Promise<boolean> => {
    if (!user) return false;

    const success = await SmechalsService.submitToolRequest(user.id, toolName, description, priority);
    if (success) {
      await refreshProfile();
      await refreshTransactions();
    }
    return success;
  }, [user, refreshProfile, refreshTransactions]);

  const updateTier = useCallback(async (tier: UserTier): Promise<boolean> => {
    if (!user) return false;

    const success = await SmechalsService.updateUserTier(user.id, tier);
    if (success) {
      await refreshProfile();
      await refreshTransactions();
    }
    return success;
  }, [user, refreshProfile, refreshTransactions]);

  const startVipTrial = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    // Use TrialService which has better eligibility checking
    const result = await TrialService.startVipTrial(user.id);
    if (result.success) {
      await refreshProfile();
      await refreshTransactions();
    }
    return result.success;
  }, [user, refreshProfile, refreshTransactions]);

  const checkDailyBonus = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    const success = await SmechalsService.checkDailyBonus(user.id);
    if (success) {
      await refreshProfile();
      await refreshTransactions();
    }
    return success;
  }, [user, refreshProfile, refreshTransactions]);

  // Load profile when user changes
  useEffect(() => {
    if (!authLoading) {
      refreshProfile();
    }
  }, [user, authLoading, refreshProfile]);

  // Load transactions when profile is loaded
  useEffect(() => {
    if (profile) {
      refreshTransactions();
    }
  }, [profile, refreshTransactions]);

  // Periodically check trial status for active trials
  useEffect(() => {
    if (!user || !profile) return;

    // Only check if user has an active trial
    if (profile.subscription_status === 'trial' && profile.tier === 'VIP') {
      const updateTrialStatus = async () => {
        await TrialService.updateTrialDaysLeft(user.id);
        await refreshProfile(); // Refresh to get updated days left
      };

      // Check immediately
      updateTrialStatus();

      // Then check every hour
      const interval = setInterval(updateTrialStatus, 60 * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [user, profile, refreshProfile]);

  const value: UserProfileContextType = {
    profile,
    transactions,
    loading: loading || authLoading,
    refreshProfile,
    refreshTransactions,
    addSmechals,
    spendSmechals,
    submitToolRequest,
    updateTier,
    startVipTrial,
    checkDailyBonus,
  };

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
};
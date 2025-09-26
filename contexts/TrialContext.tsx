import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { TrialService, TrialStatus } from '../services/trialService';

interface TrialContextType {
  trialStatus: TrialStatus | null;
  isEligibleForTrial: boolean;
  loading: boolean;
  error: string | null;

  // Actions
  startTrial: () => Promise<{ success: boolean; message: string }>;
  checkTrialStatus: () => Promise<void>;
  convertToPaid: (tier: 'Member' | 'VIP' | 'God-Tier') => Promise<boolean>;
}

const TrialContext = createContext<TrialContextType | undefined>(undefined);

interface TrialProviderProps {
  children: ReactNode;
}

export const TrialProvider: React.FC<TrialProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null);
  const [isEligibleForTrial, setIsEligibleForTrial] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check trial status when user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      checkTrialStatus();
      checkEligibility();
    } else {
      // Reset state when user logs out
      setTrialStatus(null);
      setIsEligibleForTrial(false);
      setError(null);
    }
  }, [user, isAuthenticated]);

  // Periodically update trial status for active trials
  useEffect(() => {
    if (!trialStatus?.isActive) return;

    const interval = setInterval(() => {
      if (user) {
        updateTrialDaysLeft();
      }
    }, 60 * 60 * 1000); // Check every hour

    return () => clearInterval(interval);
  }, [trialStatus?.isActive, user]);

  const checkTrialStatus = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const status = await TrialService.getTrialStatus(user.id);
      setTrialStatus(status);
    } catch (err) {
      console.error('Error checking trial status:', err);
      setError('Failed to check trial status');
    } finally {
      setLoading(false);
    }
  };

  const checkEligibility = async () => {
    if (!user) return;

    try {
      const eligible = await TrialService.isEligibleForTrial(user.id);
      setIsEligibleForTrial(eligible);
    } catch (err) {
      console.error('Error checking trial eligibility:', err);
    }
  };

  const updateTrialDaysLeft = async () => {
    if (!user) return;

    try {
      await TrialService.updateTrialDaysLeft(user.id);
      // Refresh trial status after update
      await checkTrialStatus();
    } catch (err) {
      console.error('Error updating trial days:', err);
    }
  };

  const startTrial = async (): Promise<{ success: boolean; message: string }> => {
    if (!user) {
      return {
        success: false,
        message: 'You must be logged in to start a trial'
      };
    }

    try {
      setLoading(true);
      setError(null);

      const result = await TrialService.startVipTrial(user.id);

      if (result.success) {
        // Refresh trial status and eligibility
        await checkTrialStatus();
        await checkEligibility();
      }

      return result;
    } catch (err) {
      console.error('Error starting trial:', err);
      const message = 'An unexpected error occurred while starting your trial';
      setError(message);
      return {
        success: false,
        message
      };
    } finally {
      setLoading(false);
    }
  };

  const convertToPaid = async (tier: 'Member' | 'VIP' | 'God-Tier'): Promise<boolean> => {
    if (!user) return false;

    try {
      setLoading(true);
      setError(null);

      const success = await TrialService.convertTrialToPaid(user.id, tier);

      if (success) {
        // Refresh trial status after conversion
        await checkTrialStatus();
      }

      return success;
    } catch (err) {
      console.error('Error converting trial to paid:', err);
      setError('Failed to convert trial to paid subscription');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const value: TrialContextType = {
    trialStatus,
    isEligibleForTrial,
    loading,
    error,
    startTrial,
    checkTrialStatus,
    convertToPaid
  };

  return (
    <TrialContext.Provider value={value}>
      {children}
    </TrialContext.Provider>
  );
};

export const useTrial = (): TrialContextType => {
  const context = useContext(TrialContext);
  if (context === undefined) {
    throw new Error('useTrial must be used within a TrialProvider');
  }
  return context;
};
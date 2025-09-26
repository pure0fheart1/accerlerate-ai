import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { UsageTrackingService, UsageStats, UsageSession } from '../services/usageTrackingService';

interface UsageTrackingContextType {
  stats: UsageStats | null;
  recentSessions: UsageSession[];
  loading: boolean;
  trackUsage: (
    toolName: string,
    options?: {
      toolCategory?: string;
      sessionId?: string;
      durationSeconds?: number;
      tokensUsed?: number;
      apiCalls?: number;
      success?: boolean;
      errorMessage?: string;
      metadata?: Record<string, any>;
    }
  ) => Promise<boolean>;
  startSession: (toolName: string, toolCategory?: string) => string;
  endSession: (
    sessionId: string,
    options?: {
      success?: boolean;
      tokensUsed?: number;
      apiCalls?: number;
      errorMessage?: string;
      metadata?: Record<string, any>;
    }
  ) => Promise<boolean>;
  refreshStats: () => Promise<void>;
  refreshSessions: () => Promise<void>;
}

const UsageTrackingContext = createContext<UsageTrackingContextType | undefined>(undefined);

export const useUsageTracking = () => {
  const context = useContext(UsageTrackingContext);
  if (context === undefined) {
    throw new Error('useUsageTracking must be used within a UsageTrackingProvider');
  }
  return context;
};

interface UsageTrackingProviderProps {
  children: React.ReactNode;
}

export const UsageTrackingProvider: React.FC<UsageTrackingProviderProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [recentSessions, setRecentSessions] = useState<UsageSession[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshStats = useCallback(async () => {
    if (!user) {
      setStats(null);
      return;
    }

    try {
      const userStats = await UsageTrackingService.getUserStats(user.id);
      setStats(userStats);
    } catch (error) {
      console.error('Error refreshing usage stats:', error);
    }
  }, [user]);

  const refreshSessions = useCallback(async () => {
    if (!user) {
      setRecentSessions([]);
      return;
    }

    try {
      const sessions = await UsageTrackingService.getRecentSessions(user.id, 20);
      setRecentSessions(sessions);
    } catch (error) {
      console.error('Error refreshing recent sessions:', error);
    }
  }, [user]);

  const trackUsage = useCallback(async (
    toolName: string,
    options: {
      toolCategory?: string;
      sessionId?: string;
      durationSeconds?: number;
      tokensUsed?: number;
      apiCalls?: number;
      success?: boolean;
      errorMessage?: string;
      metadata?: Record<string, any>;
    } = {}
  ): Promise<boolean> => {
    if (!user) return false;

    const success = await UsageTrackingService.trackUsage(user.id, toolName, options);
    if (success) {
      // Refresh stats and sessions in background
      refreshStats();
      refreshSessions();
    }
    return success;
  }, [user, refreshStats, refreshSessions]);

  const startSession = useCallback((toolName: string, toolCategory?: string): string => {
    return UsageTrackingService.startSession(toolName, toolCategory);
  }, []);

  const endSession = useCallback(async (
    sessionId: string,
    options: {
      success?: boolean;
      tokensUsed?: number;
      apiCalls?: number;
      errorMessage?: string;
      metadata?: Record<string, any>;
    } = {}
  ): Promise<boolean> => {
    if (!user) return false;

    const success = await UsageTrackingService.endSession(user.id, sessionId, options);
    if (success) {
      // Refresh stats and sessions in background
      refreshStats();
      refreshSessions();
    }
    return success;
  }, [user, refreshStats, refreshSessions]);

  // Load initial data when user changes
  useEffect(() => {
    if (!authLoading) {
      setLoading(true);
      Promise.all([
        refreshStats(),
        refreshSessions()
      ]).finally(() => {
        setLoading(false);
      });
    }
  }, [user, authLoading, refreshStats, refreshSessions]);

  const value: UsageTrackingContextType = {
    stats,
    recentSessions,
    loading: loading || authLoading,
    trackUsage,
    startSession,
    endSession,
    refreshStats,
    refreshSessions
  };

  return (
    <UsageTrackingContext.Provider value={value}>
      {children}
    </UsageTrackingContext.Provider>
  );
};
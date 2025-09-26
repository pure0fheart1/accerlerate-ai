import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUsageTracking as useUsageTrackingContext } from '../contexts/UsageTrackingContext';

/**
 * Hook for easily tracking tool usage throughout the application
 *
 * Usage examples:
 *
 * // Quick tracking for simple tools
 * const { trackToolUse } = useUsageTracking();
 * await trackToolUse('Content Generator', { category: 'AI Writing' });
 *
 * // For tools that need session tracking
 * const { startToolSession, endToolSession } = useUsageTracking();
 * const sessionId = startToolSession('Image Generator', 'AI Art');
 * // ... tool execution
 * await endToolSession(sessionId, { success: true, tokensUsed: 150 });
 */
export const useUsageTracking = () => {
  const { user } = useAuth();
  const {
    trackUsage,
    startSession,
    endSession,
    stats,
    recentSessions,
    loading,
    refreshStats,
    refreshSessions
  } = useUsageTrackingContext();

  // Quick tracking for simple tool usage
  const trackToolUse = useCallback(async (
    toolName: string,
    options: {
      category?: string;
      success?: boolean;
      tokensUsed?: number;
      metadata?: Record<string, any>;
    } = {}
  ) => {
    if (!user) return false;

    return await trackUsage(toolName, {
      toolCategory: options.category,
      success: options.success !== false, // Default to true
      tokensUsed: options.tokensUsed,
      metadata: options.metadata
    });
  }, [user, trackUsage]);

  // Start a session for tools that need duration tracking
  const startToolSession = useCallback((
    toolName: string,
    category?: string
  ): string => {
    return startSession(toolName, category);
  }, [startSession]);

  // End a tool session
  const endToolSession = useCallback(async (
    sessionId: string,
    options: {
      success?: boolean;
      tokensUsed?: number;
      apiCalls?: number;
      errorMessage?: string;
      metadata?: Record<string, any>;
    } = {}
  ) => {
    if (!user) return false;

    return await endSession(sessionId, {
      success: options.success !== false, // Default to true
      tokensUsed: options.tokensUsed,
      apiCalls: options.apiCalls,
      errorMessage: options.errorMessage,
      metadata: options.metadata
    });
  }, [user, endSession]);

  // Track failed tool usage
  const trackToolError = useCallback(async (
    toolName: string,
    errorMessage: string,
    options: {
      category?: string;
      metadata?: Record<string, any>;
    } = {}
  ) => {
    if (!user) return false;

    return await trackUsage(toolName, {
      toolCategory: options.category,
      success: false,
      errorMessage,
      metadata: options.metadata
    });
  }, [user, trackUsage]);

  // Get current user's usage statistics
  const getUserStats = useCallback(() => {
    return stats;
  }, [stats]);

  // Get usage summary for quick display
  const getUsageSummary = useCallback(() => {
    if (!stats) return null;

    return {
      toolsToday: stats.toolsUsedToday,
      toolsThisMonth: stats.toolsUsedThisMonth,
      totalTools: stats.totalToolsUsed,
      favoriteTools: stats.favoriteTools.slice(0, 5),
      successRate: stats.successRate,
      averageSessionTime: stats.averageSessionTime
    };
  }, [stats]);

  return {
    // Core tracking functions
    trackToolUse,
    startToolSession,
    endToolSession,
    trackToolError,

    // Data access
    getUserStats,
    getUsageSummary,
    recentSessions,
    loading,

    // Refresh functions
    refreshStats,
    refreshSessions,

    // Raw access to context (for advanced use cases)
    rawTrackUsage: trackUsage,
    rawStartSession: startSession,
    rawEndSession: endSession
  };
};

// Export common tool categories for consistency
export const TOOL_CATEGORIES = {
  AI_WRITING: 'AI Writing',
  AI_ART: 'AI Art',
  CODE_HELP: 'Code Help',
  PRODUCTIVITY: 'Productivity',
  BUSINESS: 'Business',
  CREATIVE: 'Creative',
  ANALYSIS: 'Analysis',
  EDUCATION: 'Education',
  HEALTH: 'Health & Wellness',
  ENTERTAINMENT: 'Entertainment'
} as const;

export type ToolCategory = typeof TOOL_CATEGORIES[keyof typeof TOOL_CATEGORIES];
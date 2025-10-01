import { supabase } from '../lib/supabase';

export interface UsageSession {
  id: string;
  user_id: string;
  tool_name: string;
  tool_category?: string;
  session_id: string;
  duration_seconds?: number;
  tokens_used?: number;
  api_calls: number;
  success: boolean;
  error_message?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface UsageStats {
  toolsUsedToday: number;
  toolsUsedThisWeek: number;
  toolsUsedThisMonth: number;
  totalToolsUsed: number;
  favoriteTools: { name: string; count: number; category?: string }[];
  dailyUsage: { date: string; count: number }[];
  categoryBreakdown: { category: string; count: number }[];
  averageSessionTime: number;
  successRate: number;
  totalTokensUsed: number;
}

export class UsageTrackingService {
  // Track a tool usage session
  static async trackUsage(
    userId: string,
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
  ): Promise<boolean> {
    try {
      const {
        toolCategory,
        sessionId = crypto.randomUUID(),
        durationSeconds,
        tokensUsed,
        apiCalls = 1,
        success = true,
        errorMessage,
        metadata
      } = options;

      const { error } = await supabase
        .from('usage_tracking')
        .insert({
          user_id: userId,
          tool_name: toolName,
          tool_category: toolCategory,
          session_id: sessionId,
          duration_seconds: durationSeconds,
          tokens_used: tokensUsed,
          api_calls: apiCalls,
          success,
          error_message: errorMessage,
          metadata
        });

      if (error) {
        console.error('Error tracking usage:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in trackUsage:', error);
      return false;
    }
  }

  // Get user's usage statistics
  static async getUserStats(userId: string): Promise<UsageStats | null> {
    try {
      // Get current date boundaries in local time
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

      const thisWeekStart = new Date(now);
      thisWeekStart.setDate(now.getDate() - now.getDay());
      thisWeekStart.setHours(0, 0, 0, 0);

      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      // Get basic counts
      const [todayResult, weekResult, monthResult, totalResult] = await Promise.all([
        supabase
          .from('usage_tracking')
          .select('id')
          .eq('user_id', userId)
          .gte('created_at', todayStart.toISOString())
          .lte('created_at', todayEnd.toISOString()),

        supabase
          .from('usage_tracking')
          .select('id')
          .eq('user_id', userId)
          .gte('created_at', thisWeekStart.toISOString()),

        supabase
          .from('usage_tracking')
          .select('id')
          .eq('user_id', userId)
          .gte('created_at', thisMonthStart.toISOString()),

        supabase
          .from('usage_tracking')
          .select('id')
          .eq('user_id', userId)
      ]);

      // Get detailed usage data
      const { data: usageData, error: usageError } = await supabase
        .from('usage_tracking')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1000);

      if (usageError) {
        console.error('Error fetching usage data:', usageError);
        return null;
      }

      // Calculate favorite tools
      const toolCounts = new Map<string, { count: number; category?: string }>();
      usageData?.forEach(session => {
        const current = toolCounts.get(session.tool_name) || { count: 0, category: session.tool_category };
        toolCounts.set(session.tool_name, {
          count: current.count + 1,
          category: session.tool_category || current.category
        });
      });

      const favoriteTools = Array.from(toolCounts.entries())
        .map(([name, data]) => ({ name, count: data.count, category: data.category }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Calculate daily usage for the last 30 days
      const dailyUsage = new Map<string, number>();
      const last30Days = new Date();
      last30Days.setDate(last30Days.getDate() - 30);

      usageData?.forEach(session => {
        const sessionDate = new Date(session.created_at);
        if (sessionDate >= last30Days) {
          const dateKey = sessionDate.toISOString().split('T')[0];
          dailyUsage.set(dateKey, (dailyUsage.get(dateKey) || 0) + 1);
        }
      });

      const dailyUsageArray = Array.from(dailyUsage.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Calculate category breakdown
      const categoryBreakdown = new Map<string, number>();
      usageData?.forEach(session => {
        if (session.tool_category) {
          categoryBreakdown.set(
            session.tool_category,
            (categoryBreakdown.get(session.tool_category) || 0) + 1
          );
        }
      });

      const categoryBreakdownArray = Array.from(categoryBreakdown.entries())
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count);

      // Calculate averages
      const validSessions = usageData?.filter(s => s.duration_seconds && s.duration_seconds > 0) || [];
      const averageSessionTime = validSessions.length > 0
        ? validSessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / validSessions.length
        : 0;

      const successfulSessions = usageData?.filter(s => s.success).length || 0;
      const successRate = usageData?.length ? (successfulSessions / usageData.length) * 100 : 0;

      const totalTokensUsed = usageData?.reduce((sum, s) => sum + (s.tokens_used || 0), 0) || 0;

      return {
        toolsUsedToday: todayResult.data?.length || 0,
        toolsUsedThisWeek: weekResult.data?.length || 0,
        toolsUsedThisMonth: monthResult.data?.length || 0,
        totalToolsUsed: totalResult.data?.length || 0,
        favoriteTools,
        dailyUsage: dailyUsageArray,
        categoryBreakdown: categoryBreakdownArray,
        averageSessionTime,
        successRate,
        totalTokensUsed
      };
    } catch (error) {
      console.error('Error in getUserStats:', error);
      return null;
    }
  }

  // Get recent usage sessions
  static async getRecentSessions(userId: string, limit = 20): Promise<UsageSession[]> {
    try {
      const { data, error } = await supabase
        .from('usage_tracking')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching recent sessions:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getRecentSessions:', error);
      return [];
    }
  }

  // Start a usage session (for tracking duration)
  static startSession(toolName: string, toolCategory?: string): string {
    const sessionId = crypto.randomUUID();
    const startTime = Date.now();

    // Store in sessionStorage for tracking
    sessionStorage.setItem(`usage_session_${sessionId}`, JSON.stringify({
      toolName,
      toolCategory,
      startTime,
      sessionId
    }));

    return sessionId;
  }

  // End a usage session and track it
  static async endSession(
    userId: string,
    sessionId: string,
    options: {
      success?: boolean;
      tokensUsed?: number;
      apiCalls?: number;
      errorMessage?: string;
      metadata?: Record<string, any>;
    } = {}
  ): Promise<boolean> {
    try {
      const sessionData = sessionStorage.getItem(`usage_session_${sessionId}`);
      if (!sessionData) {
        console.warn('Session not found:', sessionId);
        return false;
      }

      const { toolName, toolCategory, startTime } = JSON.parse(sessionData);
      const endTime = Date.now();
      const durationSeconds = Math.round((endTime - startTime) / 1000);

      // Clean up session storage
      sessionStorage.removeItem(`usage_session_${sessionId}`);

      // Track the usage
      return await this.trackUsage(userId, toolName, {
        toolCategory,
        sessionId,
        durationSeconds,
        ...options
      });
    } catch (error) {
      console.error('Error in endSession:', error);
      return false;
    }
  }

  // Get usage trends for analytics
  static async getUsageTrends(userId: string, days = 30): Promise<{
    daily: { date: string; count: number; tokens: number }[];
    weekly: { week: string; count: number; tokens: number }[];
  } | null> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('usage_tracking')
        .select('created_at, tokens_used')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching usage trends:', error);
        return null;
      }

      // Group by day
      const dailyMap = new Map<string, { count: number; tokens: number }>();
      data?.forEach(session => {
        const date = new Date(session.created_at).toISOString().split('T')[0];
        const current = dailyMap.get(date) || { count: 0, tokens: 0 };
        dailyMap.set(date, {
          count: current.count + 1,
          tokens: current.tokens + (session.tokens_used || 0)
        });
      });

      const daily = Array.from(dailyMap.entries())
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Group by week
      const weeklyMap = new Map<string, { count: number; tokens: number }>();
      data?.forEach(session => {
        const date = new Date(session.created_at);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekKey = weekStart.toISOString().split('T')[0];

        const current = weeklyMap.get(weekKey) || { count: 0, tokens: 0 };
        weeklyMap.set(weekKey, {
          count: current.count + 1,
          tokens: current.tokens + (session.tokens_used || 0)
        });
      });

      const weekly = Array.from(weeklyMap.entries())
        .map(([week, data]) => ({ week, ...data }))
        .sort((a, b) => a.week.localeCompare(b.week));

      return { daily, weekly };
    } catch (error) {
      console.error('Error in getUsageTrends:', error);
      return null;
    }
  }
}

// Hook for easy usage tracking in React components
export const useUsageTracking = () => {
  return {
    trackUsage: UsageTrackingService.trackUsage,
    startSession: UsageTrackingService.startSession,
    endSession: UsageTrackingService.endSession,
    getUserStats: UsageTrackingService.getUserStats,
    getRecentSessions: UsageTrackingService.getRecentSessions,
    getUsageTrends: UsageTrackingService.getUsageTrends
  };
};
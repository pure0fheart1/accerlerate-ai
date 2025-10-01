import React, { useState } from 'react';
import { useUsageTracking } from '../contexts/UsageTrackingContext';
import { useUserProfile } from '../contexts/UserProfileContext';
import { ChartBarIcon, ClockIcon, CheckIcon, XMarkIcon, StarIcon, CalendarIcon } from './icons';

interface UsageDashboardProps {
  className?: string;
}

const UsageDashboard: React.FC<UsageDashboardProps> = ({ className = '' }) => {
  const { stats, recentSessions, loading } = useUsageTracking();
  const { profile } = useUserProfile();
  const [activeTab, setActiveTab] = useState<'overview' | 'tools' | 'sessions' | 'trends'>('overview');

  if (loading) {
    return (
      <div className={`bg-white dark:bg-slate-900 rounded-xl p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-slate-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className={`bg-white dark:bg-slate-900 rounded-xl p-6 ${className}`}>
        <div className="text-center text-gray-500 dark:text-slate-400">
          <ChartBarIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No usage data available yet</p>
          <p className="text-sm">Start using tools to see your statistics here</p>
        </div>
      </div>
    );
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSuccessIcon = (success: boolean) => {
    return success ? (
      <CheckIcon className="h-4 w-4 text-green-500" />
    ) : (
      <XMarkIcon className="h-4 w-4 text-red-500" />
    );
  };

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-xl ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center space-x-3">
          <ChartBarIcon className="h-8 w-8 text-blue-500" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
              Usage Dashboard
            </h2>
            <p className="text-gray-600 dark:text-slate-400">
              Track your tool usage and productivity
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-slate-700">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'tools', label: 'Tools' },
            { id: 'sessions', label: 'Sessions' },
            { id: 'trends', label: 'Trends' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Day Streak Highlight */}
            {profile && (
              <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                      <span className="text-5xl">🔥</span>
                    </div>
                    <div>
                      <div className="text-4xl font-bold mb-1">
                        {profile.login_streak} {profile.login_streak === 1 ? 'Day' : 'Days'}
                      </div>
                      <div className="text-lg opacity-90">
                        Login Streak
                      </div>
                      {profile.longest_streak > 0 && (
                        <div className="text-sm opacity-75 mt-2 flex items-center space-x-2">
                          <span>🏆</span>
                          <span>Longest: {profile.longest_streak} days</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm opacity-75 mb-2">
                      Keep it going!
                    </div>
                    <div className="text-xs opacity-60">
                      Login daily to maintain your streak
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.toolsUsedToday}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400">Tools Today</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.toolsUsedThisWeek}
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">This Week</div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.toolsUsedThisMonth}
                </div>
                <div className="text-sm text-purple-600 dark:text-purple-400">This Month</div>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {stats.totalToolsUsed}
                </div>
                <div className="text-sm text-amber-600 dark:text-amber-400">All Time</div>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <ClockIcon className="h-5 w-5 text-gray-500" />
                  <span className="font-medium text-gray-900 dark:text-slate-100">Avg Session</span>
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                  {formatDuration(Math.round(stats.averageSessionTime))}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckIcon className="h-5 w-5 text-green-500" />
                  <span className="font-medium text-gray-900 dark:text-slate-100">Success Rate</span>
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                  {stats.successRate.toFixed(1)}%
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <StarIcon className="h-5 w-5 text-yellow-500" />
                  <span className="font-medium text-gray-900 dark:text-slate-100">Tokens Used</span>
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                  {stats.totalTokensUsed.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Favorite Pages */}
            {profile && profile.favorite_pages && profile.favorite_pages.length > 0 && (
              <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <StarIcon className="h-5 w-5 text-yellow-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                    Favorite Pages
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.favorite_pages.map((page, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-sm font-medium text-yellow-800 dark:text-yellow-200 flex items-center space-x-2"
                    >
                      <StarIcon className="h-4 w-4" />
                      <span>{page}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tools' && (
          <div className="space-y-6">
            {/* Favorite Tools */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">
                Most Used Tools
              </h3>
              <div className="space-y-3">
                {stats.favoriteTools.slice(0, 10).map((tool, index) => (
                  <div
                    key={tool.name}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-slate-100">
                          {tool.name}
                        </div>
                        {tool.category && (
                          <div className="text-sm text-gray-500 dark:text-slate-400">
                            {tool.category}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                      {tool.count}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Breakdown */}
            {stats.categoryBreakdown.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">
                  Usage by Category
                </h3>
                <div className="space-y-3">
                  {stats.categoryBreakdown.map((category) => (
                    <div
                      key={category.category}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg"
                    >
                      <div className="font-medium text-gray-900 dark:text-slate-100">
                        {category.category}
                      </div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                        {category.count}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'sessions' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">
              Recent Sessions
            </h3>
            <div className="space-y-3">
              {recentSessions.slice(0, 20).map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {getSuccessIcon(session.success)}
                    <div>
                      <div className="font-medium text-gray-900 dark:text-slate-100">
                        {session.tool_name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-slate-400 flex items-center space-x-2">
                        <CalendarIcon className="h-3 w-3" />
                        <span>{formatDate(session.created_at)}</span>
                        {session.duration_seconds && (
                          <>
                            <span>•</span>
                            <ClockIcon className="h-3 w-3" />
                            <span>{formatDuration(session.duration_seconds)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {session.tokens_used && (
                      <div className="text-sm text-gray-600 dark:text-slate-400">
                        {session.tokens_used.toLocaleString()} tokens
                      </div>
                    )}
                    {session.api_calls > 1 && (
                      <div className="text-xs text-gray-500 dark:text-slate-500">
                        {session.api_calls} API calls
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'trends' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">
              Daily Usage (Last 30 Days)
            </h3>
            {stats.dailyUsage.length > 0 ? (
              <div className="space-y-2">
                {stats.dailyUsage.slice(-14).map((day) => (
                  <div
                    key={day.date}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg"
                  >
                    <div className="font-medium text-gray-900 dark:text-slate-100">
                      {new Date(day.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-gray-600 dark:text-slate-400">
                        {day.count} tools
                      </div>
                      <div className="w-32 bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{
                            width: `${Math.min(100, (day.count / Math.max(...stats.dailyUsage.map(d => d.count))) * 100)}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 dark:text-slate-400 py-8">
                <ChartBarIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No trend data available yet</p>
                <p className="text-sm">Use tools regularly to see usage trends</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UsageDashboard;
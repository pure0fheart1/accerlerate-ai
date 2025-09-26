import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfile } from '../contexts/UserProfileContext';
import { useUsageTracking } from '../contexts/UsageTrackingContext';
import {
  ChartBarIcon,
  UserIcon,
  CogIcon,
  CoinsIcon,
  CrownIcon,
  StarIcon,
  ClockIcon,
  CheckIcon,
  CalendarIcon,
  BellIcon,
  TrophyIcon,
  FireIcon,
  HeartIcon
} from '../components/icons';
import { UserTier } from '../types';
import { getTierColor } from '../constants/tiers';
import UsageDashboard from '../components/UsageDashboard';

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const { profile, transactions } = useUserProfile();
  const { stats, recentSessions, loading } = useUsageTracking();
  const [activeTab, setActiveTab] = useState<'overview' | 'usage' | 'activity' | 'settings'>('overview');

  // Use real profile data or fallback to defaults
  const userProfile = {
    displayName: profile?.display_name || user?.email?.split('@')[0] || 'User',
    tier: (profile?.tier || 'Free') as UserTier,
    smechals: profile?.smechals_balance || 0,
    profilePicture: profile?.profile_picture_url || null,
    trialDaysLeft: profile?.trial_days_left || null,
    joinDate: profile?.created_at || new Date().toISOString(),
    usageData: {
      toolsUsedToday: stats?.toolsUsedToday || 0,
      toolsUsedThisMonth: stats?.toolsUsedThisMonth || 0,
      favoriteTools: stats?.favoriteTools?.slice(0, 3).map(tool => tool.name) || []
    }
  };

  const getTierIcon = (tier: UserTier) => {
    switch (tier) {
      case 'God-Tier':
        return <CrownIcon className="h-5 w-5 text-purple-500" />;
      case 'VIP':
        return <StarIcon className="h-5 w-5 text-yellow-500" />;
      case 'Member':
        return <StarIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <UserIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getMotivationalMessage = () => {
    const toolsToday = userProfile.usageData.toolsUsedToday;
    if (toolsToday === 0) {
      return "Ready to accelerate your productivity today?";
    } else if (toolsToday < 5) {
      return "Great start! Keep the momentum going!";
    } else if (toolsToday < 10) {
      return "You're on fire today! 🔥";
    } else {
      return "Incredible productivity! You're crushing it! 🚀";
    }
  };

  const getStreakData = () => {
    // Mock streak data - in real app, this would come from backend
    return {
      currentStreak: 7,
      longestStreak: 21,
      streakThisWeek: 5
    };
  };

  const streakData = getStreakData();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Profile Picture */}
              <div className="w-20 h-20 rounded-full overflow-hidden bg-white/20 flex items-center justify-center ring-4 ring-white/30">
                {userProfile.profilePicture ? (
                  <img
                    src={userProfile.profilePicture}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-10 h-10 text-white/80" />
                )}
              </div>

              {/* User Info */}
              <div className="text-white">
                <h1 className="text-3xl font-bold mb-2">{userProfile.displayName}</h1>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getTierIcon(userProfile.tier)}
                    <span className="font-semibold">{userProfile.tier} Member</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CoinsIcon className="w-5 h-5 text-amber-300" />
                    <span className="font-semibold">{userProfile.smechals} Smechals</span>
                  </div>
                </div>
                <div className="mt-2 text-white/80 text-sm">
                  Member since {formatDate(userProfile.joinDate)}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-3">
              <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors">
                <CogIcon className="w-5 h-5" />
              </button>
              <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors">
                <BellIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Motivational Message */}
        <div className="px-6 py-4 bg-blue-50 dark:bg-blue-900/20">
          <div className="flex items-center space-x-2">
            <FireIcon className="w-5 h-5 text-orange-500" />
            <span className="text-blue-800 dark:text-blue-200 font-medium">
              {getMotivationalMessage()}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'overview', label: 'Overview', icon: ChartBarIcon },
            { id: 'usage', label: 'Usage Analytics', icon: ChartBarIcon },
            { id: 'activity', label: 'Recent Activity', icon: ClockIcon },
            { id: 'settings', label: 'Settings', icon: CogIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Stats */}
            <div className="lg:col-span-2 space-y-6">
              {/* Today's Activity */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4">
                  Today's Activity
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {userProfile.usageData.toolsUsedToday}
                    </div>
                    <div className="text-sm text-blue-600 dark:text-blue-400">Tools Used</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {streakData.currentStreak}
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-400">Day Streak</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {stats?.successRate?.toFixed(0) || '0'}%
                    </div>
                    <div className="text-sm text-purple-600 dark:text-purple-400">Success Rate</div>
                  </div>
                  <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                      {Math.round((stats?.averageSessionTime || 0) / 60)}
                    </div>
                    <div className="text-sm text-amber-600 dark:text-amber-400">Avg Minutes</div>
                  </div>
                </div>
              </div>

              {/* Monthly Progress */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4">
                  Monthly Progress
                </h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Tools Used</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-slate-100">
                        {userProfile.usageData.toolsUsedThisMonth} / 100
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, userProfile.usageData.toolsUsedThisMonth)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Streak Goal</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-slate-100">
                        {streakData.currentStreak} / 30 days
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (streakData.currentStreak / 30) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Achievement */}
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl p-6 text-white">
                <div className="flex items-center space-x-3 mb-3">
                  <TrophyIcon className="w-8 h-8" />
                  <div>
                    <div className="font-bold">Achievement Unlocked!</div>
                    <div className="text-sm opacity-90">Productivity Warrior</div>
                  </div>
                </div>
                <div className="text-sm opacity-90">
                  You've used {userProfile.usageData.toolsUsedToday} tools today!
                </div>
              </div>

              {/* Favorite Tools */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">
                  Favorite Tools
                </h3>
                <div className="space-y-3">
                  {userProfile.usageData.favoriteTools.length > 0 ? (
                    userProfile.usageData.favoriteTools.map((tool, index) => (
                      <div key={tool} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-700 dark:text-slate-300">{tool}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500 dark:text-slate-400">
                      Start using tools to see your favorites here
                    </div>
                  )}
                </div>
              </div>

              {/* Trial Notice */}
              {userProfile.tier === 'VIP' && userProfile.trialDaysLeft && (
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 text-white">
                  <div className="flex items-center space-x-3 mb-3">
                    <StarIcon className="w-6 h-6" />
                    <div className="font-bold">VIP Trial</div>
                  </div>
                  <div className="text-sm opacity-90 mb-3">
                    {userProfile.trialDaysLeft} days remaining
                  </div>
                  <button className="bg-white/20 hover:bg-white/30 text-white text-sm px-3 py-1 rounded transition-colors">
                    Upgrade Now
                  </button>
                </div>
              )}

              {/* Upgrade Portal */}
              {userProfile.tier === 'Free' && (
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-6 text-white">
                  <div className="flex items-center space-x-3 mb-4">
                    <CrownIcon className="w-8 h-8" />
                    <div>
                      <div className="font-bold text-lg">Unlock Premium Features</div>
                      <div className="text-sm opacity-90">Get more tools, Smechals, and priority support</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-white/10 rounded-lg p-3">
                      <div className="font-semibold text-sm">Member</div>
                      <div className="text-xs opacity-90">25+ tools, 250 Smechals/month</div>
                      <div className="font-bold mt-1">$9.99/mo</div>
                    </div>
                    <div className="bg-white/20 rounded-lg p-3 border border-white/30">
                      <div className="font-semibold text-sm flex items-center">
                        VIP <StarIcon className="w-3 h-3 ml-1" />
                      </div>
                      <div className="text-xs opacity-90">50+ tools, 500 Smechals/month</div>
                      <div className="font-bold mt-1">$19.99/mo</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <div className="font-semibold text-sm">God-Tier</div>
                      <div className="text-xs opacity-90">Everything + custom tools</div>
                      <div className="font-bold mt-1">$49.99/mo</div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button className="flex-1 bg-white text-purple-600 font-semibold py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors">
                      Start VIP Trial (3 Days Free)
                    </button>
                    <button className="flex-1 bg-white/20 hover:bg-white/30 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                      View All Plans
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'usage' && (
          <UsageDashboard className="shadow-sm border border-gray-200 dark:border-slate-700" />
        )}

        {activeTab === 'activity' && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-6">
              Recent Activity
            </h2>
            <div className="space-y-4">
              {loading ? (
                <div className="animate-pulse space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-gray-200 dark:bg-slate-700 rounded"></div>
                  ))}
                </div>
              ) : recentSessions.length > 0 ? (
                recentSessions.slice(0, 10).map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${session.success ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-slate-100">
                          {session.tool_name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-slate-400">
                          {new Date(session.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-500 dark:text-slate-400">
                      {session.tokens_used && `${session.tokens_used.toLocaleString()} tokens`}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-slate-400">
                  <ClockIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No recent activity</p>
                  <p className="text-sm">Start using tools to see your activity here</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-6">
              Dashboard Settings
            </h2>
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  Email Notifications
                </label>
                <div className="mt-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 dark:border-slate-600" />
                    <span className="ml-2 text-sm text-gray-600 dark:text-slate-400">
                      Daily usage summary
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  Dashboard Theme
                </label>
                <div className="mt-2">
                  <select className="block w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700">
                    <option>Auto (system)</option>
                    <option>Light</option>
                    <option>Dark</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
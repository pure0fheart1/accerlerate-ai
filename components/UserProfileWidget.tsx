import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfile } from '../contexts/UserProfileContext';
import { useUsageTracking } from '../contexts/UsageTrackingContext';
import { ChevronDownIcon, UserIcon, CogIcon, CoinsIcon, CrownIcon, StarIcon, ChartBarIcon, LogoutIcon } from './icons';
import { UserTier } from '../types';
import PricingModal from './PricingModal';
import SmechalsModal from './SmechalsModal';
import ToolRequestModal from './ToolRequestModal';
import ProfileSettings from './ProfileSettings';
import UsageDashboard from './UsageDashboard';
import { getTierColor } from '../constants/tiers';

interface UserProfileWidgetProps {
  className?: string;
  onNavigate?: (page: string) => void;
}

const UserProfileWidget: React.FC<UserProfileWidgetProps> = ({ className = '', onNavigate }) => {
  const { user, signOut } = useAuth();
  const { profile, transactions, submitToolRequest, updateTier, startVipTrial } = useUserProfile();
  const { stats } = useUsageTracking();
  const [isOpen, setIsOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isSmechalsOpen, setIsSmechalsOpen] = useState(false);
  const [isToolRequestOpen, setIsToolRequestOpen] = useState(false);
  const [isProfileSettingsOpen, setIsProfileSettingsOpen] = useState(false);
  const [isUsageDashboardOpen, setIsUsageDashboardOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Use real profile data or fallback to defaults
  const userProfile = {
    displayName: profile?.display_name || user?.email?.split('@')[0] || 'User',
    tier: (profile?.tier || 'Free') as UserTier,
    smechals: profile?.smechals_balance || 0,
    profilePicture: profile?.profile_picture_url || null,
    trialDaysLeft: profile?.trial_days_left || null,
    usageData: {
      toolsUsedToday: stats?.toolsUsedToday || 0,
      toolsUsedThisMonth: stats?.toolsUsedThisMonth || 0,
      favoriteTools: stats?.favoriteTools?.slice(0, 3).map(tool => tool.name) || []
    }
  };

  const getTierIcon = (tier: UserTier) => {
    switch (tier) {
      case 'God-Tier':
        return <CrownIcon className="h-4 w-4 text-purple-500" />;
      case 'VIP':
        return <StarIcon className="h-4 w-4 text-yellow-500" />;
      case 'Member':
        return <StarIcon className="h-4 w-4 text-blue-500" />;
      default:
        return <UserIcon className="h-4 w-4 text-gray-500" />;
    }
  };


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  const handleUpgrade = async (tier: UserTier, billingCycle: 'monthly' | 'yearly') => {
    try {
      // In a real app, this would integrate with payment processor
      console.log('Processing upgrade to:', tier, billingCycle);

      // For now, just update the tier (in production, this would happen after successful payment)
      const success = await updateTier(tier);
      if (success) {
        console.log('Successfully upgraded to', tier);
      } else {
        console.error('Failed to upgrade tier');
      }
    } catch (error) {
      console.error('Error upgrading tier:', error);
    } finally {
      setIsPricingOpen(false);
    }
  };

  const handleStartTrial = async () => {
    try {
      const success = await startVipTrial();
      if (success) {
        console.log('Successfully started VIP trial');
      } else {
        console.error('Failed to start VIP trial');
      }
    } catch (error) {
      console.error('Error starting trial:', error);
    } finally {
      setIsPricingOpen(false);
    }
  };

  const handleToolRequest = async (request: { toolName: string; description: string; priority: 'low' | 'medium' | 'high' }) => {
    try {
      const success = await submitToolRequest(request.toolName, request.description, request.priority);
      if (success) {
        console.log('Successfully submitted tool request');
      } else {
        console.error('Failed to submit tool request - insufficient Smechals or other error');
      }
    } catch (error) {
      console.error('Error submitting tool request:', error);
    } finally {
      setIsToolRequestOpen(false);
    }
  };

  const handlePurchaseSmechals = (amount: number) => {
    console.log('Purchase Smechals:', amount);
    // TODO: Implement Smechals purchase logic with payment processor
    // This would integrate with Stripe or other payment system
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Profile trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors duration-200"
      >
        {/* Profile picture or default avatar */}
        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 dark:bg-slate-700 flex items-center justify-center">
          {userProfile.profilePicture ? (
            <img
              src={userProfile.profilePicture}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <UserIcon className="w-5 h-5 text-gray-500 dark:text-slate-400" />
          )}
        </div>

        {/* User info */}
        <div className="hidden sm:block text-left">
          <div className="flex items-center space-x-1">
            <span className="text-sm font-medium text-gray-900 dark:text-slate-100">
              {userProfile.displayName}
            </span>
            {getTierIcon(userProfile.tier)}
          </div>
          <div className="flex items-center space-x-2">
            <span className={`text-xs ${getTierColor(userProfile.tier)}`}>
              {userProfile.tier}
            </span>
            <div className="flex items-center space-x-1">
              <CoinsIcon className="w-3 h-3 text-amber-500" />
              <span className="text-xs text-gray-600 dark:text-slate-400">
                {userProfile.smechals}
              </span>
            </div>
          </div>
        </div>

        <ChevronDownIcon
          className={`w-4 h-4 text-gray-500 dark:text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-1rem)] bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 z-[99999] max-h-[calc(100vh-5rem)] overflow-y-auto">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-slate-700 flex items-center justify-center">
                {userProfile.profilePicture ? (
                  <img
                    src={userProfile.profilePicture}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-7 h-7 text-gray-500 dark:text-slate-400" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-slate-100">
                  {userProfile.displayName}
                </h3>
                <p className="text-sm text-gray-600 dark:text-slate-400">
                  {user?.email}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="flex items-center space-x-1">
                    {getTierIcon(userProfile.tier)}
                    <span className={`text-sm font-medium ${getTierColor(userProfile.tier)}`}>
                      {userProfile.tier}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CoinsIcon className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-medium text-gray-900 dark:text-slate-100">
                      {userProfile.smechals} Smechals
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="p-4 border-b border-gray-200 dark:border-slate-700">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900 dark:text-slate-100">
                  {userProfile.usageData.toolsUsedToday}
                </div>
                <div className="text-xs text-gray-600 dark:text-slate-400">
                  Tools Today
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900 dark:text-slate-100">
                  {userProfile.usageData.toolsUsedThisMonth}
                </div>
                <div className="text-xs text-gray-600 dark:text-slate-400">
                  This Month
                </div>
              </div>
            </div>
          </div>

          {/* Trial notification (if applicable) */}
          {userProfile.tier === 'VIP' && userProfile.trialDaysLeft && (
            <div className="p-3 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-b border-gray-200 dark:border-slate-700">
              <div className="flex items-center space-x-2">
                <StarIcon className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  VIP Trial: {userProfile.trialDaysLeft} days left
                </span>
              </div>
            </div>
          )}

          {/* Menu items */}
          <div className="p-2">
            <button
              onClick={() => {
                if (onNavigate) {
                  onNavigate('userdashboard');
                }
                setIsOpen(false);
              }}
              className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
            >
              <ChartBarIcon className="w-5 h-5 text-indigo-500" />
              <span className="text-sm text-gray-700 dark:text-slate-300">User Dashboard</span>
            </button>

            <button
              onClick={() => {
                setIsProfileSettingsOpen(true);
                setIsOpen(false);
              }}
              className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
            >
              <CogIcon className="w-5 h-5 text-gray-500 dark:text-slate-400" />
              <span className="text-sm text-gray-700 dark:text-slate-300">Profile Settings</span>
            </button>

            <button
              onClick={() => {
                setIsUsageDashboardOpen(true);
                setIsOpen(false);
              }}
              className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
            >
              <ChartBarIcon className="w-5 h-5 text-gray-500 dark:text-slate-400" />
              <span className="text-sm text-gray-700 dark:text-slate-300">Usage Dashboard</span>
            </button>

            <button
              onClick={() => {
                setIsPricingOpen(true);
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-3 text-left bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl mb-2"
            >
              <div className="flex items-center space-x-3">
                <CrownIcon className="w-5 h-5 text-white" />
                <span className="text-sm font-medium text-white">Upgrade Plan</span>
              </div>
              <div className="text-xs text-purple-100 font-medium">
                Premium
              </div>
            </button>

            <button
              onClick={() => {
                setIsSmechalsOpen(true);
                setIsOpen(false);
              }}
              className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
            >
              <CoinsIcon className="w-5 h-5 text-amber-500" />
              <span className="text-sm text-gray-700 dark:text-slate-300">Smechals Wallet</span>
            </button>

            <button
              onClick={() => {
                setIsToolRequestOpen(true);
                setIsOpen(false);
              }}
              className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
            >
              <CoinsIcon className="w-5 h-5 text-amber-500" />
              <span className="text-sm text-gray-700 dark:text-slate-300">Request Tool (25 Smechals)</span>
            </button>

            <div className="border-t border-gray-200 dark:border-slate-700 my-2"></div>

            <button
              onClick={handleSignOut}
              className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
            >
              <LogoutIcon className="w-5 h-5 text-red-500" />
              <span className="text-sm text-red-600 dark:text-red-400">Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        currentTier={userProfile.tier}
        onUpgrade={handleUpgrade}
        onStartTrial={handleStartTrial}
      />

      <SmechalsModal
        isOpen={isSmechalsOpen}
        onClose={() => setIsSmechalsOpen(false)}
        currentSmechals={userProfile.smechals}
        userTier={userProfile.tier}
        transactions={transactions}
        onRequestTool={() => {
          setIsSmechalsOpen(false);
          setIsToolRequestOpen(true);
        }}
        onPurchaseSmechals={handlePurchaseSmechals}
      />

      <ToolRequestModal
        isOpen={isToolRequestOpen}
        onClose={() => setIsToolRequestOpen(false)}
        currentSmechals={userProfile.smechals}
        onSubmitRequest={handleToolRequest}
      />

      <ProfileSettings
        isOpen={isProfileSettingsOpen}
        onClose={() => setIsProfileSettingsOpen(false)}
      />

      {isUsageDashboardOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Usage Dashboard</h2>
              <button
                onClick={() => setIsUsageDashboardOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <span className="sr-only">Close</span>
                <svg className="w-5 h-5 text-gray-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <UsageDashboard className="border-none rounded-none" />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileWidget;
import React, { useState } from 'react';
import {
  User,
  CreditCard,
  BarChart3,
  Settings as SettingsIcon,
  LogOut,
  Crown,
  Zap,
  ChevronRight,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useUsageTracking } from '../hooks/useUsageTracking';
import { SUBSCRIPTION_PLANS } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface UserDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { usage, getUsagePercentage, getRemainingUsage } = useUsageTracking();
  const [activeTab, setActiveTab] = useState<'profile' | 'usage' | 'billing'>('profile');

  if (!isOpen || !user) return null;

  const handleUpgrade = (planId: string) => {
    // This would integrate with Stripe - for now just show a message
    toast.success(`Upgrading to ${planId} plan... (Stripe integration coming soon!)`);
  };

  const renderUsageBar = (feature: keyof typeof usage, label: string, unit: string) => {
    if (!usage) return null;

    const percentage = getUsagePercentage(feature);
    const remaining = getRemainingUsage(feature);
    const current = usage[feature as keyof typeof usage] as number;
    const limit = user.plan.features[feature as keyof typeof user.plan.features] as number;

    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-slate-300">{label}</span>
          <span className="text-xs text-slate-400">
            {current} {unit} {limit !== -1 && `/ ${limit} ${unit}`}
          </span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              percentage > 80 ? 'bg-red-500' : percentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: limit === -1 ? '100%' : `${Math.min(percentage, 100)}%` }}
          />
        </div>
        {limit !== -1 && remaining <= 5 && remaining > 0 && (
          <p className="text-xs text-yellow-400">
            ⚠️ Only {remaining} {unit} remaining this month
          </p>
        )}
        {limit !== -1 && remaining === 0 && (
          <p className="text-xs text-red-400">
            🚫 Limit reached. Upgrade to continue using this feature.
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{user.name}</h2>
              <p className="text-sm text-slate-400">{user.email}</p>
            </div>
            <div className="flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full border border-blue-500/30">
              <Crown className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-400">{user.plan.name}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-700 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700">
          {[
            { key: 'profile', label: 'Profile', icon: User },
            { key: 'usage', label: 'Usage', icon: BarChart3 },
            { key: 'billing', label: 'Billing', icon: CreditCard },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Account Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-slate-400">Name</label>
                      <p className="text-white font-medium">{user.name}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400">Email</label>
                      <p className="text-white font-medium">{user.email}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400">Member Since</label>
                      <p className="text-white font-medium">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Current Plan</h3>
                  <div className="p-4 bg-slate-700/50 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-semibold text-white">{user.plan.name}</span>
                      {user.plan.price > 0 && (
                        <span className="text-xl font-bold text-blue-400">
                          ${user.plan.price}/{user.plan.interval}
                        </span>
                      )}
                    </div>
                    <div className="space-y-2 text-sm text-slate-300">
                      <div className="flex justify-between">
                        <span>Image Generations:</span>
                        <span>{user.plan.features.imageGenerations === -1 ? 'Unlimited' : user.plan.features.imageGenerations}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Video Generations:</span>
                        <span>{user.plan.features.videoGenerations === -1 ? 'Unlimited' : user.plan.features.videoGenerations}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>AI Chat Messages:</span>
                        <span>{user.plan.features.aiChatMessages === -1 ? 'Unlimited' : user.plan.features.aiChatMessages}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Storage:</span>
                        <span>{user.plan.features.storageGB}GB</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-700">
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'usage' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Monthly Usage</h3>
                <span className="text-sm text-slate-400">
                  Current Period: {usage?.period}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  {renderUsageBar('imageGenerations', 'Image Generations', 'images')}
                  {renderUsageBar('videoGenerations', 'Video Generations', 'videos')}
                </div>
                <div className="space-y-6">
                  {renderUsageBar('aiChatMessages', 'AI Chat Messages', 'messages')}
                  {renderUsageBar('storageUsedMB', 'Storage Used', 'MB')}
                </div>
              </div>

              {user.plan.id === 'free' && (
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/30">
                  <div className="flex items-center space-x-3">
                    <Zap className="h-5 w-5 text-blue-400" />
                    <div>
                      <h4 className="text-sm font-medium text-white">Need More?</h4>
                      <p className="text-xs text-slate-400">
                        Upgrade to Pro or Premium for higher limits and unlimited access
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">Subscription Plans</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {SUBSCRIPTION_PLANS.map((plan) => (
                  <div
                    key={plan.id}
                    className={`p-6 rounded-xl border transition-all ${
                      plan.id === user.plan.id
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-slate-700 bg-slate-700/30 hover:border-slate-600'
                    }`}
                  >
                    <div className="text-center space-y-4">
                      <div>
                        <h4 className="text-lg font-semibold text-white">{plan.name}</h4>
                        <div className="text-2xl font-bold text-white mt-2">
                          {plan.price === 0 ? (
                            'Free'
                          ) : (
                            <>
                              <span className="text-3xl">${plan.price}</span>
                              <span className="text-sm text-slate-400">/{plan.interval}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2 text-sm text-slate-300">
                        <div className="flex justify-between">
                          <span>Images:</span>
                          <span>{plan.features.imageGenerations === -1 ? '∞' : plan.features.imageGenerations}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Videos:</span>
                          <span>{plan.features.videoGenerations === -1 ? '∞' : plan.features.videoGenerations}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Chat:</span>
                          <span>{plan.features.aiChatMessages === -1 ? '∞' : plan.features.aiChatMessages}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Storage:</span>
                          <span>{plan.features.storageGB}GB</span>
                        </div>
                        {plan.features.prioritySupport && (
                          <div className="text-xs text-blue-400">✓ Priority Support</div>
                        )}
                        {plan.features.advancedFeatures && (
                          <div className="text-xs text-blue-400">✓ Advanced Features</div>
                        )}
                      </div>

                      <button
                        onClick={() => handleUpgrade(plan.id)}
                        disabled={plan.id === user.plan.id}
                        className={`w-full py-2 px-4 rounded-lg font-medium transition-all ${
                          plan.id === user.plan.id
                            ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transform hover:scale-105'
                        }`}
                      >
                        {plan.id === user.plan.id ? 'Current Plan' : 'Upgrade'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-slate-700/30 rounded-xl">
                <h4 className="text-sm font-medium text-white mb-2">💳 Payment Information</h4>
                <p className="text-xs text-slate-400 mb-4">
                  Stripe integration coming soon! You'll be able to manage your payment methods and billing history here.
                </p>
                <div className="space-y-2 text-xs text-slate-400">
                  <div>• Secure payments powered by Stripe</div>
                  <div>• Cancel anytime, no hidden fees</div>
                  <div>• 30-day money-back guarantee</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
import React, { useState } from 'react';
import { UserTier } from '../types';
import { XMarkIcon, StarIcon, CrownIcon, ArrowRightIcon } from './icons';
import UpgradePage from './UpgradePage';

interface PricingTunnelProps {
  isOpen: boolean;
  onClose: () => void;
  triggerSource?: 'feature_limit' | 'smechals_low' | 'tool_request' | 'trial_ending' | 'manual';
  currentTier: UserTier;
  requiredTier?: UserTier;
  featureName?: string;
}

const PricingTunnel: React.FC<PricingTunnelProps> = ({
  isOpen,
  onClose,
  triggerSource = 'manual',
  currentTier,
  requiredTier = 'VIP',
  featureName
}) => {
  const [showFullUpgrade, setShowFullUpgrade] = useState(false);

  if (!isOpen) return null;

  if (showFullUpgrade) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
        <UpgradePage
          currentTier={currentTier}
          onClose={onClose}
          highlightedTier={requiredTier}
        />
      </div>
    );
  }

  const getTunnelContent = () => {
    switch (triggerSource) {
      case 'feature_limit':
        return {
          title: 'Unlock This Feature',
          subtitle: `${featureName || 'This feature'} requires ${requiredTier} access`,
          description: 'Upgrade now to access this feature and many more premium capabilities.',
          buttonText: `Upgrade to ${requiredTier}`,
          urgency: 'low'
        };

      case 'smechals_low':
        return {
          title: 'Running Low on Smechals?',
          subtitle: 'Upgrade to get monthly Smechals bonuses',
          description: 'Never run out of Smechals again. Get bonus Smechals every month with your subscription.',
          buttonText: 'Get More Smechals',
          urgency: 'medium'
        };

      case 'tool_request':
        return {
          title: 'Need More Smechals?',
          subtitle: 'Tool requests cost 25 Smechals each',
          description: 'Upgrade to get monthly Smechals bonuses and never worry about running out.',
          buttonText: 'Upgrade for Smechals',
          urgency: 'high'
        };

      case 'trial_ending':
        return {
          title: 'Your VIP Trial is Ending Soon',
          subtitle: 'Continue enjoying premium features',
          description: 'Don\'t lose access to the tools you love. Upgrade now to keep your VIP benefits.',
          buttonText: 'Continue VIP Access',
          urgency: 'high'
        };

      default:
        return {
          title: 'Upgrade Your Experience',
          subtitle: 'Unlock powerful features and boost productivity',
          description: 'Get access to premium tools, monthly Smechals bonuses, and priority support.',
          buttonText: `Upgrade to ${requiredTier}`,
          urgency: 'low'
        };
    }
  };

  const content = getTunnelContent();

  const getUrgencyColor = () => {
    switch (content.urgency) {
      case 'high': return 'from-red-500 to-pink-500';
      case 'medium': return 'from-yellow-500 to-orange-500';
      default: return 'from-blue-500 to-purple-500';
    }
  };

  const getTierIcon = (tier: UserTier) => {
    switch (tier) {
      case 'God-Tier':
        return <CrownIcon className="h-12 w-12 text-purple-500" />;
      case 'VIP':
        return <StarIcon className="h-12 w-12 text-yellow-500" />;
      case 'Member':
        return <StarIcon className="h-12 w-12 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full overflow-hidden">
        {/* Header with gradient */}
        <div className={`bg-gradient-to-r ${getUrgencyColor()} p-6 text-white relative`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>

          <div className="text-center">
            {getTierIcon(requiredTier)}
            <h2 className="text-2xl font-bold mt-4 mb-2">
              {content.title}
            </h2>
            <p className="text-white text-opacity-90">
              {content.subtitle}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 dark:text-slate-400 mb-6 text-center">
            {content.description}
          </p>

          {/* Quick benefits */}
          <div className="space-y-3 mb-6">
            {requiredTier === 'VIP' && (
              <>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700 dark:text-slate-300">
                    25 Smechals every month
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700 dark:text-slate-300">
                    Priority tool requests
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700 dark:text-slate-300">
                    Advanced features
                  </span>
                </div>
              </>
            )}

            {requiredTier === 'God-Tier' && (
              <>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-gray-700 dark:text-slate-300">
                    100 Smechals every month
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-gray-700 dark:text-slate-300">
                    Unlimited tool requests
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-gray-700 dark:text-slate-300">
                    Exclusive features
                  </span>
                </div>
              </>
            )}

            {requiredTier === 'Member' && (
              <>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-700 dark:text-slate-300">
                    10 Smechals every month
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-700 dark:text-slate-300">
                    Member-only tools
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-700 dark:text-slate-300">
                    Enhanced support
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Trial offer for VIP */}
          {requiredTier === 'VIP' && currentTier === 'Free' && triggerSource !== 'trial_ending' && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <StarIcon className="h-5 w-5 text-yellow-500" />
                <span className="font-medium text-yellow-800 dark:text-yellow-200">
                  Free Trial Available
                </span>
              </div>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Try VIP free for 3 days. No credit card required.
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-3">
            <button
              onClick={() => setShowFullUpgrade(true)}
              className={`w-full py-3 px-4 bg-gradient-to-r ${getUrgencyColor()} text-white rounded-lg font-medium transition-transform hover:scale-105 flex items-center justify-center space-x-2`}
            >
              <span>{content.buttonText}</span>
              <ArrowRightIcon className="h-4 w-4" />
            </button>

            <button
              onClick={onClose}
              className="w-full py-3 px-4 text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 transition-colors"
            >
              Maybe later
            </button>
          </div>

          {/* Trust indicators */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-center space-x-6 text-xs text-gray-500 dark:text-slate-400">
              <span>✓ Instant access</span>
              <span>✓ Cancel anytime</span>
              <span>✓ 30-day refund</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingTunnel;
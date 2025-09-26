import React, { useState } from 'react';
import { useUserProfile } from '../contexts/UserProfileContext';
import { useAuth } from '../contexts/AuthContext';
import { UserTier } from '../types';
import { TIER_PRICING, TIER_BENEFITS, getTierColor } from '../constants/tiers';
import { CheckIcon, XMarkIcon, StarIcon, CrownIcon, CoinsIcon, BoltIcon } from './icons';

interface UpgradePageProps {
  currentTier?: UserTier;
  onClose?: () => void;
  highlightedTier?: UserTier;
}

const UpgradePage: React.FC<UpgradePageProps> = ({
  currentTier = 'Free',
  onClose,
  highlightedTier = 'VIP'
}) => {
  const { user } = useAuth();
  const { updateTier, startVipTrial } = useUserProfile();
  const [selectedTier, setSelectedTier] = useState<UserTier>(highlightedTier);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpgrade = async () => {
    if (!user || selectedTier === currentTier) return;

    setIsProcessing(true);
    try {
      if (selectedTier === 'VIP' && currentTier === 'Free') {
        // Offer trial first
        const wantsTrial = window.confirm(
          'Would you like to start with a 3-day free VIP trial before upgrading?'
        );

        if (wantsTrial) {
          const success = await startVipTrial();
          if (success) {
            alert('VIP trial started successfully! Enjoy 3 days of VIP access.');
            onClose?.();
            return;
          } else {
            alert('Failed to start trial. Please try upgrading directly.');
          }
        }
      }

      // Regular upgrade flow
      console.log('Processing upgrade to:', selectedTier, billingCycle);

      // In a real app, this would integrate with a payment processor
      // For now, we'll simulate the upgrade
      const success = await updateTier(selectedTier);

      if (success) {
        alert(`Successfully upgraded to ${selectedTier}!`);
        onClose?.();
      } else {
        alert('Upgrade failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during upgrade:', error);
      alert('An error occurred during upgrade. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getTierIcon = (tier: UserTier) => {
    switch (tier) {
      case 'God-Tier':
        return <CrownIcon className="h-8 w-8 text-purple-500" />;
      case 'VIP':
        return <StarIcon className="h-8 w-8 text-yellow-500" />;
      case 'Member':
        return <StarIcon className="h-8 w-8 text-blue-500" />;
      default:
        return <CoinsIcon className="h-8 w-8 text-gray-500" />;
    }
  };

  const getPrice = (tier: UserTier) => {
    const pricing = TIER_PRICING[tier];
    if (!pricing) return null;

    const price = billingCycle === 'monthly' ? pricing.monthly : pricing.yearly;
    const savings = billingCycle === 'yearly' ? Math.round((1 - pricing.yearly / (pricing.monthly * 12)) * 100) : 0;

    return { price, savings };
  };

  const isCurrentTier = (tier: UserTier) => tier === currentTier;
  const isUpgrade = (tier: UserTier) => {
    const tierOrder = { 'Free': 0, 'Member': 1, 'VIP': 2, 'God-Tier': 3 };
    return tierOrder[tier] > tierOrder[currentTier];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-purple-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100 mb-4">
            Upgrade Your Experience
          </h1>
          <p className="text-xl text-gray-600 dark:text-slate-400 mb-8">
            Unlock powerful features and boost your productivity
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-white dark:bg-slate-800 rounded-lg p-1 border border-gray-200 dark:border-slate-700">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors relative ${
                billingCycle === 'yearly'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'
              }`}
            >
              Yearly
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {(['Free', 'Member', 'VIP', 'God-Tier'] as UserTier[]).map((tier) => {
            const pricing = getPrice(tier);
            const benefits = TIER_BENEFITS[tier];
            const isSelected = selectedTier === tier;
            const isCurrent = isCurrentTier(tier);
            const canUpgrade = isUpgrade(tier);

            return (
              <div
                key={tier}
                className={`relative bg-white dark:bg-slate-800 rounded-2xl border-2 p-6 transition-all duration-200 ${
                  isSelected
                    ? 'border-blue-500 ring-4 ring-blue-500 ring-opacity-20 transform scale-105'
                    : isCurrent
                    ? 'border-green-500'
                    : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
                } ${canUpgrade || tier === 'Free' ? 'cursor-pointer' : 'opacity-75'}`}
                onClick={() => {
                  if (canUpgrade || tier === 'Free') {
                    setSelectedTier(tier);
                  }
                }}
              >
                {/* Popular badge */}
                {tier === highlightedTier && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Current tier badge */}
                {isCurrent && (
                  <div className="absolute -top-3 right-4">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Current
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  {getTierIcon(tier)}
                  <h3 className={`text-2xl font-bold mt-2 ${getTierColor(tier)}`}>
                    {tier}
                  </h3>

                  {pricing ? (
                    <div className="mt-4">
                      <div className="text-4xl font-bold text-gray-900 dark:text-slate-100">
                        ${pricing.price}
                        <span className="text-lg text-gray-500 dark:text-slate-400">
                          /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                        </span>
                      </div>
                      {pricing.savings > 0 && billingCycle === 'yearly' && (
                        <div className="text-green-600 dark:text-green-400 text-sm font-medium">
                          Save {pricing.savings}% annually
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-4xl font-bold text-gray-900 dark:text-slate-100 mt-4">
                      Free
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-3">
                  {benefits.features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600 dark:text-slate-400">
                        {feature}
                      </span>
                    </div>
                  ))}

                  {/* Smechals bonus */}
                  {benefits.smechalsBonus && (
                    <div className="flex items-start space-x-3 pt-2 border-t border-gray-200 dark:border-slate-700">
                      <CoinsIcon className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                        +{benefits.smechalsBonus} Smechals/month
                      </span>
                    </div>
                  )}
                </div>

                {/* Action button */}
                <div className="mt-6">
                  {isCurrent ? (
                    <div className="w-full py-3 text-center text-green-600 dark:text-green-400 font-medium">
                      Your Current Plan
                    </div>
                  ) : canUpgrade ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTier(tier);
                      }}
                      className={`w-full py-3 rounded-lg font-medium transition-colors ${
                        isSelected
                          ? 'bg-blue-500 hover:bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-900 dark:text-slate-100'
                      }`}
                    >
                      {isSelected ? 'Selected' : 'Select Plan'}
                    </button>
                  ) : (
                    <div className="w-full py-3 text-center text-gray-400 dark:text-slate-500">
                      Downgrade not available
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Action */}
        {selectedTier !== currentTier && (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                  Ready to upgrade to {selectedTier}?
                </h3>
                <p className="text-gray-600 dark:text-slate-400">
                  {selectedTier === 'VIP' && currentTier === 'Free' ? (
                    'Start with a 3-day free trial or upgrade directly'
                  ) : (
                    `Unlock all ${selectedTier} features and benefits`
                  )}
                </p>
              </div>
              <div className="flex space-x-3">
                {onClose && (
                  <button
                    onClick={onClose}
                    className="px-6 py-3 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={handleUpgrade}
                  disabled={isProcessing}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <BoltIcon className="h-4 w-4" />
                      <span>Upgrade Now</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FAQ or Additional Info */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-slate-400">
            Questions about upgrading? <a href="#" className="text-blue-500 hover:text-blue-600">Contact our support team</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default UpgradePage;
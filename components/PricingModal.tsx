import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon, CheckIcon, CrownIcon, StarIcon, UserIcon, CoinsIcon } from './icons';
import { TIER_BENEFITS, getTierGradient } from '../constants/tiers';
import { UserTier } from '../types';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: UserTier;
  onUpgrade: (tier: UserTier, billingCycle: 'monthly' | 'yearly') => void;
  onStartTrial?: () => void;
}

const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  currentTier,
  onUpgrade,
  onStartTrial
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  if (!isOpen) return null;

  const tiers: UserTier[] = ['Free', 'Member', 'VIP', 'God-Tier'];

  const getTierIcon = (tier: UserTier) => {
    switch (tier) {
      case 'God-Tier':
        return <CrownIcon className="h-8 w-8 text-purple-500" />;
      case 'VIP':
        return <StarIcon className="h-8 w-8 text-yellow-500" />;
      case 'Member':
        return <StarIcon className="h-8 w-8 text-blue-500" />;
      default:
        return <UserIcon className="h-8 w-8 text-gray-500" />;
    }
  };

  const getPrice = (tier: UserTier) => {
    const benefits = TIER_BENEFITS[tier];
    if (tier === 'Free') return 'Free';

    const price = billingCycle === 'monthly' ? benefits.monthlyPrice : benefits.yearlyPrice;
    return `$${price}`;
  };

  const getPriceSubtext = (tier: UserTier) => {
    const benefits = TIER_BENEFITS[tier];
    if (tier === 'Free') return 'Forever';

    if (billingCycle === 'yearly' && benefits.yearlyPrice && benefits.monthlyPrice) {
      const monthlyEquivalent = benefits.yearlyPrice / 12;
      const savings = ((benefits.monthlyPrice - monthlyEquivalent) / benefits.monthlyPrice * 100).toFixed(0);
      return `per month (${savings}% off)`;
    }

    return billingCycle === 'monthly' ? 'per month' : 'per year';
  };

  const modalContent = (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-start justify-center p-2 sm:p-4 overflow-y-auto z-[9999]"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      style={{
        zIndex: 999999,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-7xl w-full mt-2 mb-2 shadow-2xl border border-gray-200 dark:border-slate-700 max-h-[98vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
              Choose Your Plan
            </h2>
            <p className="text-gray-600 dark:text-slate-400 mt-1">
              Unlock more tools and features with our premium plans
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Billing Toggle */}
        <div className="p-2 sm:p-3 border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
          <div className="flex items-center justify-center">
            <div className="bg-gray-100 dark:bg-slate-800 rounded-lg p-1 flex">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingCycle === 'monthly'
                    ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 shadow-sm'
                    : 'text-gray-600 dark:text-slate-400'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors relative ${
                  billingCycle === 'yearly'
                    ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 shadow-sm'
                    : 'text-gray-600 dark:text-slate-400'
                }`}
              >
                Yearly
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  Save 17%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="p-3 sm:p-4 flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {tiers.map((tier) => {
              const benefits = TIER_BENEFITS[tier];
              const isCurrentTier = tier === currentTier;
              const isPopular = tier === 'VIP';

              return (
                <div
                  key={tier}
                  className={`relative rounded-xl border-2 p-4 ${
                    isCurrentTier
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                      : isPopular
                      ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                      : 'border-gray-200 dark:border-slate-700'
                  }`}
                >
                  {/* Popular Badge */}
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        MOST POPULAR
                      </span>
                    </div>
                  )}

                  {/* Current Tier Badge */}
                  {isCurrentTier && (
                    <div className="absolute -top-3 right-3">
                      <span className="bg-indigo-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        CURRENT
                      </span>
                    </div>
                  )}

                  {/* Tier Icon and Name */}
                  <div className="flex items-center space-x-3 mb-4">
                    {getTierIcon(tier)}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100">
                        {benefits.name}
                      </h3>
                      {tier !== 'Free' && (
                        <div className="flex items-center space-x-1">
                          <CoinsIcon className="h-4 w-4 text-amber-500" />
                          <span className="text-sm text-gray-600 dark:text-slate-400">
                            {benefits.smechalsIncluded} Smechals/month
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="text-3xl font-bold text-gray-900 dark:text-slate-100">
                      {getPrice(tier)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-slate-400">
                      {getPriceSubtext(tier)}
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-6">
                    {benefits.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <CheckIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-slate-300">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Action Button */}
                  <div className="space-y-2">
                    {isCurrentTier ? (
                      <button
                        disabled
                        className="w-full py-3 px-4 bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-slate-400 rounded-lg font-medium cursor-not-allowed"
                      >
                        Current Plan
                      </button>
                    ) : tier === 'Free' ? (
                      <button
                        disabled
                        className="w-full py-3 px-4 bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 rounded-lg font-medium cursor-not-allowed"
                      >
                        Downgrade not available
                      </button>
                    ) : (
                      <button
                        onClick={() => onUpgrade(tier, billingCycle)}
                        className={`w-full py-3 px-4 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl ${getTierGradient(tier)}`}
                      >
                        Upgrade to {benefits.name}
                      </button>
                    )}

                    {/* VIP Trial Button */}
                    {tier === 'VIP' && currentTier === 'Free' && onStartTrial && (
                      <button
                        onClick={onStartTrial}
                        className="w-full py-2 px-4 border-2 border-yellow-500 text-yellow-600 dark:text-yellow-400 rounded-lg font-medium hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
                      >
                        Start 3-Day Free Trial
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 rounded-b-2xl flex-shrink-0">
          <div className="text-center text-sm text-gray-600 dark:text-slate-400">
            <p>All plans include access to our core AI tools and regular updates.</p>
            <p className="mt-1">Cancel anytime. No questions asked.</p>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default PricingModal;
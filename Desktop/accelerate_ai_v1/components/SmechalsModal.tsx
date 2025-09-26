import React, { useState } from 'react';
import { XMarkIcon, CoinsIcon, PlusIcon, MinusIcon, ClockIcon, CheckIcon } from './icons';
import { SmechalsTransaction, UserTier } from '../types';
import { SMECHAL_RATES } from '../constants/tiers';

interface SmechalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSmechals: number;
  userTier: UserTier;
  transactions: SmechalsTransaction[];
  onRequestTool: () => void;
  onPurchaseSmechals?: (amount: number) => void;
}

const SmechalsModal: React.FC<SmechalsModalProps> = ({
  isOpen,
  onClose,
  currentSmechals,
  userTier,
  transactions,
  onRequestTool,
  onPurchaseSmechals
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'earn'>('overview');

  if (!isOpen) return null;

  const getTransactionIcon = (type: SmechalsTransaction['type']) => {
    switch (type) {
      case 'earned':
        return <PlusIcon className="h-4 w-4 text-green-500" />;
      case 'spent':
        return <MinusIcon className="h-4 w-4 text-red-500" />;
      case 'bonus':
        return <CheckIcon className="h-4 w-4 text-blue-500" />;
      case 'trial':
        return <CheckIcon className="h-4 w-4 text-yellow-500" />;
      default:
        return <CoinsIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTransactionColor = (type: SmechalsTransaction['type']) => {
    switch (type) {
      case 'earned':
      case 'bonus':
      case 'trial':
        return 'text-green-600 dark:text-green-400';
      case 'spent':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canRequestTool = currentSmechals >= SMECHAL_RATES.TOOL_REQUEST_COST;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[90] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <CoinsIcon className="h-8 w-8 text-amber-500" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                Smechals Wallet
              </h2>
              <p className="text-gray-600 dark:text-slate-400">
                Current balance: {currentSmechals} Smechals
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-slate-700">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'transactions', label: 'Transactions' },
              { id: 'earn', label: 'Earn More' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                    : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Balance Card */}
              <div className="bg-gradient-to-r from-amber-400 to-yellow-500 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-100">Your Balance</p>
                    <p className="text-3xl font-bold">{currentSmechals} Smechals</p>
                  </div>
                  <CoinsIcon className="h-16 w-16 text-amber-200" />
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={onRequestTool}
                  disabled={!canRequestTool}
                  className={`p-4 rounded-xl border-2 transition-colors ${
                    canRequestTool
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30'
                      : 'border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 cursor-not-allowed'
                  }`}
                >
                  <div className="text-left">
                    <h3 className={`font-semibold ${canRequestTool ? 'text-green-700 dark:text-green-300' : 'text-gray-500'}`}>
                      Request Custom Tool
                    </h3>
                    <p className={`text-sm ${canRequestTool ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                      Cost: {SMECHAL_RATES.TOOL_REQUEST_COST} Smechals
                    </p>
                    {!canRequestTool && (
                      <p className="text-xs text-red-500 mt-1">
                        Need {SMECHAL_RATES.TOOL_REQUEST_COST - currentSmechals} more Smechals
                      </p>
                    )}
                  </div>
                </button>

                {onPurchaseSmechals && (
                  <button
                    onClick={() => onPurchaseSmechals(100)}
                    className="p-4 rounded-xl border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                  >
                    <div className="text-left">
                      <h3 className="font-semibold text-blue-700 dark:text-blue-300">
                        Buy Smechals
                      </h3>
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        Top up your balance
                      </p>
                    </div>
                  </button>
                )}
              </div>

              {/* Usage Info */}
              <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-3">
                  What can you do with Smechals?
                </h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-slate-400">
                  <li className="flex items-center space-x-2">
                    <CoinsIcon className="h-4 w-4 text-amber-500" />
                    <span>Request custom tools and functions ({SMECHAL_RATES.TOOL_REQUEST_COST} Smechals)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CoinsIcon className="h-4 w-4 text-amber-500" />
                    <span>Priority processing for your requests</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CoinsIcon className="h-4 w-4 text-amber-500" />
                    <span>Access to premium features (coming soon)</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-slate-100">
                Recent Transactions
              </h3>
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-slate-400">
                  <CoinsIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No transactions yet</p>
                  <p className="text-sm">Your Smechals activity will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.slice(0, 10).map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        {getTransactionIcon(transaction.type)}
                        <div>
                          <p className="font-medium text-gray-900 dark:text-slate-100">
                            {transaction.description}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-slate-400 flex items-center space-x-1">
                            <ClockIcon className="h-3 w-3" />
                            <span>{formatDate(transaction.createdAt)}</span>
                          </p>
                        </div>
                      </div>
                      <div className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                        {transaction.type === 'spent' ? '-' : '+'}
                        {Math.abs(transaction.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'earn' && (
            <div className="space-y-6">
              <h3 className="font-semibold text-gray-900 dark:text-slate-100">
                Ways to Earn Smechals
              </h3>

              <div className="grid gap-4">
                <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-xl">
                  <h4 className="font-medium text-gray-900 dark:text-slate-100 mb-2">
                    Daily Login Bonus
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-slate-400 mb-3">
                    Get {SMECHAL_RATES.DAILY_FREE_BONUS} Smechal every day you log in
                  </p>
                  <div className="text-green-600 dark:text-green-400 text-sm font-medium">
                    +{SMECHAL_RATES.DAILY_FREE_BONUS} Smechal/day
                  </div>
                </div>

                <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-xl">
                  <h4 className="font-medium text-gray-900 dark:text-slate-100 mb-2">
                    Monthly Subscription Bonus
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-slate-400 mb-3">
                    Get bonus Smechals with your subscription
                  </p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-slate-400">Member:</span>
                      <span className="text-blue-600 dark:text-blue-400 font-medium">
                        +{SMECHAL_RATES.MONTHLY_MEMBER_BONUS}/month
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-slate-400">VIP:</span>
                      <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                        +{SMECHAL_RATES.MONTHLY_VIP_BONUS}/month
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-slate-400">God-Tier:</span>
                      <span className="text-purple-600 dark:text-purple-400 font-medium">
                        +{SMECHAL_RATES.MONTHLY_GOD_TIER_BONUS}/month
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-xl">
                  <h4 className="font-medium text-gray-900 dark:text-slate-100 mb-2">
                    VIP Trial Bonus
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-slate-400 mb-3">
                    Start your VIP trial and get bonus Smechals
                  </p>
                  <div className="text-yellow-600 dark:text-yellow-400 text-sm font-medium">
                    +{SMECHAL_RATES.VIP_TRIAL_BONUS} Smechals
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmechalsModal;
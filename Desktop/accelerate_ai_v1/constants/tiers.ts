import { TierBenefits, UserTier } from '../types';

export const TIER_BENEFITS: Record<UserTier, TierBenefits> = {
  'Free': {
    tier: 'Free',
    name: 'Free',
    features: [
      'Access to 10 basic tools',
      'Up to 5 generations per day',
      'Community support',
      'Basic templates'
    ],
    smechalsIncluded: 0,
    toolRequestsIncluded: 0,
    prioritySupport: false,
    customization: false,
    apiAccess: false
  },
  'Member': {
    tier: 'Member',
    name: 'Member',
    monthlyPrice: 9.99,
    yearlyPrice: 99.99,
    features: [
      'Access to 25+ tools',
      'Up to 50 generations per day',
      'Priority queue',
      'Advanced templates',
      'Export capabilities',
      'Email support'
    ],
    smechalsIncluded: 50,
    toolRequestsIncluded: 1,
    prioritySupport: false,
    customization: true,
    apiAccess: false
  },
  'VIP': {
    tier: 'VIP',
    name: 'VIP',
    monthlyPrice: 29.99,
    yearlyPrice: 299.99,
    features: [
      'Access to all 50+ tools',
      'Unlimited generations',
      'Priority processing',
      'Premium templates',
      'Advanced export options',
      'Priority support',
      'Custom branding',
      '3-day free trial'
    ],
    smechalsIncluded: 100,
    toolRequestsIncluded: 3,
    prioritySupport: true,
    customization: true,
    apiAccess: true
  },
  'God-Tier': {
    tier: 'God-Tier',
    name: 'God-Tier',
    monthlyPrice: 99.99,
    yearlyPrice: 999.99,
    features: [
      'Everything in VIP',
      'White-label solution',
      'Custom integrations',
      'Dedicated account manager',
      'Custom tool development',
      'Advanced analytics',
      'SLA guarantee',
      'API rate limit: Unlimited'
    ],
    smechalsIncluded: 500,
    toolRequestsIncluded: 10,
    prioritySupport: true,
    customization: true,
    apiAccess: true
  }
};

export const TIER_PRICING: Record<UserTier, { monthly: number; yearly: number } | null> = {
  'Free': null,
  'Member': {
    monthly: 9.99,
    yearly: 99.99
  },
  'VIP': {
    monthly: 29.99,
    yearly: 299.99
  },
  'God-Tier': {
    monthly: 99.99,
    yearly: 999.99
  }
};

export const SMECHAL_RATES = {
  TOOL_REQUEST_COST: 25,
  VIP_TRIAL_BONUS: 100,
  DAILY_FREE_BONUS: 1,
  MONTHLY_MEMBER_BONUS: 10,
  MONTHLY_VIP_BONUS: 25,
  MONTHLY_GOD_TIER_BONUS: 100
};

export const TRIAL_DURATION_DAYS = 3;

export const getTierColor = (tier: UserTier): string => {
  switch (tier) {
    case 'God-Tier':
      return 'text-purple-600 dark:text-purple-400';
    case 'VIP':
      return 'text-yellow-600 dark:text-yellow-400';
    case 'Member':
      return 'text-blue-600 dark:text-blue-400';
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
};

export const getTierGradient = (tier: UserTier): string => {
  switch (tier) {
    case 'God-Tier':
      return 'bg-gradient-to-r from-purple-500 to-pink-500';
    case 'VIP':
      return 'bg-gradient-to-r from-yellow-400 to-orange-500';
    case 'Member':
      return 'bg-gradient-to-r from-blue-500 to-indigo-600';
    default:
      return 'bg-gradient-to-r from-gray-400 to-gray-600';
  }
};
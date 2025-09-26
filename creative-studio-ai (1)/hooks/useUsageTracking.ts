import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UsageStats } from '../types';
import { apiClient } from '../services/api';
import toast from 'react-hot-toast';

export const useUsageTracking = () => {
  const { user } = useAuth();
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Get current period (YYYY-MM)
  const getCurrentPeriod = () => {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  };

  // Load usage stats on mount and user change
  useEffect(() => {
    if (!user) {
      setUsage(null);
      setLoading(false);
      return;
    }

    const loadUsage = async () => {
      try {
        const response = await apiClient.getCurrentUsage();
        setUsage(response.usage);
      } catch (error) {
        console.error('Error loading usage stats:', error);
        // Initialize with default values on error
        const defaultUsage: UsageStats = {
          userId: user.id,
          period: getCurrentPeriod(),
          imageGenerations: 0,
          videoGenerations: 0,
          aiChatMessages: 0,
          storageUsedMB: 0,
        };
        setUsage(defaultUsage);
      } finally {
        setLoading(false);
      }
    };

    loadUsage();
  }, [user]);

  // No need to save to localStorage anymore as data is in the database

  // Check if user has exceeded limits
  const checkUsageLimit = useCallback((feature: keyof UsageStats, increment = 1): boolean => {
    if (!user || !usage) return false;

    const { features } = user.plan;
    let currentUsage = 0;
    let limit = 0;

    switch (feature) {
      case 'imageGenerations':
        currentUsage = usage.imageGenerations;
        limit = features.imageGenerations;
        break;
      case 'videoGenerations':
        currentUsage = usage.videoGenerations;
        limit = features.videoGenerations;
        break;
      case 'aiChatMessages':
        currentUsage = usage.aiChatMessages;
        limit = features.aiChatMessages;
        break;
      case 'storageUsedMB':
        currentUsage = usage.storageUsedMB;
        limit = features.storageGB * 1024; // Convert GB to MB
        break;
      default:
        return false;
    }

    // -1 means unlimited
    if (limit === -1) return true;

    return (currentUsage + increment) <= limit;
  }, [user, usage]);

  // Track usage for a specific feature
  const trackUsage = useCallback(async (feature: keyof UsageStats, amount = 1): Promise<boolean> => {
    if (!user || !usage) return false;

    try {
      // Map frontend feature names to backend API names
      const featureMapping = {
        imageGenerations: 'image_generations',
        videoGenerations: 'video_generations',
        aiChatMessages: 'ai_chat_messages',
        storageUsedMB: 'storage_used_mb'
      };

      const apiFeature = featureMapping[feature];
      const response = await apiClient.trackUsage(apiFeature, amount);

      // Update local state with new usage
      setUsage(response.usage);
      return true;
    } catch (error: any) {
      console.error('Usage tracking error:', error);

      const featureNames = {
        imageGenerations: 'image generations',
        videoGenerations: 'video generations',
        aiChatMessages: 'AI chat messages',
        storageUsedMB: 'storage'
      };

      if (error.message?.includes('limit exceeded')) {
        toast.error(`You've reached your ${featureNames[feature]} limit. Please upgrade your plan.`);
      } else {
        toast.error('Failed to track usage. Please try again.');
      }
      return false;
    }
  }, [user, usage]);

  // Get usage percentage for a feature
  const getUsagePercentage = useCallback((feature: keyof UsageStats): number => {
    if (!user || !usage) return 0;

    const { features } = user.plan;
    let currentUsage = 0;
    let limit = 0;

    switch (feature) {
      case 'imageGenerations':
        currentUsage = usage.imageGenerations;
        limit = features.imageGenerations;
        break;
      case 'videoGenerations':
        currentUsage = usage.videoGenerations;
        limit = features.videoGenerations;
        break;
      case 'aiChatMessages':
        currentUsage = usage.aiChatMessages;
        limit = features.aiChatMessages;
        break;
      case 'storageUsedMB':
        currentUsage = usage.storageUsedMB;
        limit = features.storageGB * 1024;
        break;
      default:
        return 0;
    }

    // -1 means unlimited
    if (limit === -1) return 0;

    return Math.min((currentUsage / limit) * 100, 100);
  }, [user, usage]);

  // Get remaining usage for a feature
  const getRemainingUsage = useCallback((feature: keyof UsageStats): number => {
    if (!user || !usage) return 0;

    const { features } = user.plan;
    let currentUsage = 0;
    let limit = 0;

    switch (feature) {
      case 'imageGenerations':
        currentUsage = usage.imageGenerations;
        limit = features.imageGenerations;
        break;
      case 'videoGenerations':
        currentUsage = usage.videoGenerations;
        limit = features.videoGenerations;
        break;
      case 'aiChatMessages':
        currentUsage = usage.aiChatMessages;
        limit = features.aiChatMessages;
        break;
      case 'storageUsedMB':
        currentUsage = usage.storageUsedMB;
        limit = features.storageGB * 1024;
        break;
      default:
        return 0;
    }

    // -1 means unlimited
    if (limit === -1) return -1;

    return Math.max(limit - currentUsage, 0);
  }, [user, usage]);

  return {
    usage,
    loading,
    trackUsage,
    checkUsageLimit,
    getUsagePercentage,
    getRemainingUsage,
  };
};
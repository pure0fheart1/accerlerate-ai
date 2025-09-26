import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { TrialService } from '../services/trialService';
import { StarIcon, XMarkIcon, ExclamationTriangleIcon, ClockIcon, CrownIcon } from './icons';

interface TrialNotificationProps {
  onUpgradeClick?: () => void;
  className?: string;
}

const TrialNotification: React.FC<TrialNotificationProps> = ({
  onUpgradeClick,
  className = ''
}) => {
  const { user } = useAuth();
  const [notification, setNotification] = useState<{
    shouldShow: boolean;
    type: 'welcome' | 'reminder' | 'urgent' | 'expired';
    title: string;
    message: string;
    daysLeft: number;
  } | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!user) return;

    const checkTrialNotification = async () => {
      try {
        const trialNotification = await TrialService.getTrialNotification(user.id);
        setNotification(trialNotification);
      } catch (error) {
        console.error('Error checking trial notification:', error);
      }
    };

    checkTrialNotification();

    // Check every hour for trial updates
    const interval = setInterval(checkTrialNotification, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user]);

  if (!notification || !notification.shouldShow || !isVisible) {
    return null;
  }

  const getNotificationStyles = () => {
    switch (notification.type) {
      case 'welcome':
        return {
          background: 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
          border: 'border-green-200 dark:border-green-800',
          text: 'text-green-800 dark:text-green-200',
          icon: <StarIcon className="h-6 w-6 text-green-500" />
        };
      case 'reminder':
        return {
          background: 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
          border: 'border-blue-200 dark:border-blue-800',
          text: 'text-blue-800 dark:text-blue-200',
          icon: <ClockIcon className="h-6 w-6 text-blue-500" />
        };
      case 'urgent':
        return {
          background: 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20',
          border: 'border-yellow-200 dark:border-yellow-800',
          text: 'text-yellow-800 dark:text-yellow-200',
          icon: <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />
        };
      case 'expired':
        return {
          background: 'bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20',
          border: 'border-red-200 dark:border-red-800',
          text: 'text-red-800 dark:text-red-200',
          icon: <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
        };
    }
  };

  const styles = getNotificationStyles();

  const handleUpgrade = () => {
    onUpgradeClick?.();
    setIsVisible(false); // Hide notification after upgrade click
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  return (
    <div className={`relative ${styles.background} ${styles.border} border rounded-xl p-4 ${className}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {styles.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className={`text-lg font-semibold ${styles.text}`}>
              {notification.title}
            </h3>
            {notification.daysLeft > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
                {notification.daysLeft} day{notification.daysLeft !== 1 ? 's' : ''} left
              </span>
            )}
          </div>

          <p className={`text-sm ${styles.text} mb-3`}>
            {notification.message}
          </p>

          {/* Action buttons */}
          <div className="flex items-center space-x-3">
            {notification.type !== 'welcome' && (
              <button
                onClick={handleUpgrade}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-medium rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-200 transform hover:scale-105"
              >
                <CrownIcon className="h-4 w-4 mr-2" />
                Upgrade Now
              </button>
            )}

            {notification.type === 'welcome' && (
              <button
                onClick={handleDismiss}
                className="inline-flex items-center px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors"
              >
                <StarIcon className="h-4 w-4 mr-2" />
                Got it!
              </button>
            )}

            <button
              onClick={handleDismiss}
              className={`text-xs ${styles.text} opacity-75 hover:opacity-100 transition-opacity`}
            >
              Dismiss
            </button>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={handleDismiss}
          className={`flex-shrink-0 p-1 ${styles.text} opacity-50 hover:opacity-100 transition-opacity`}
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Progress bar for days left */}
      {notification.daysLeft > 0 && notification.type !== 'expired' && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className={`${styles.text} opacity-75`}>Trial Progress</span>
            <span className={`${styles.text} opacity-75`}>
              Day {4 - notification.daysLeft} of 3
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
              style={{
                width: `${((3 - notification.daysLeft) / 3) * 100}%`
              }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrialNotification;
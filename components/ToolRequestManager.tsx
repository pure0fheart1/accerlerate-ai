import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { SmechalsService, ToolRequest } from '../services/smechalsService';
import {
  ClockIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  CogIcon,
  CalendarIcon,
  CoinsIcon
} from './icons';

interface ToolRequestManagerProps {
  className?: string;
}

const ToolRequestManager: React.FC<ToolRequestManagerProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ToolRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'in_progress' | 'completed' | 'rejected'>('pending');

  useEffect(() => {
    if (user) {
      loadToolRequests();
    }
  }, [user]);

  const loadToolRequests = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const userRequests = await SmechalsService.getToolRequests(user.id);
      setRequests(userRequests);
    } catch (error) {
      console.error('Error loading tool requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: ToolRequest['status']) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'in_progress':
        return <CogIcon className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckIcon className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XMarkIcon className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusColor = (status: ToolRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'in_progress':
        return 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      case 'completed':
        return 'text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'rejected':
        return 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    }
  };

  const getPriorityColor = (priority: ToolRequest['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 dark:text-red-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'low':
        return 'text-green-600 dark:text-green-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstimatedDelivery = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return 'Overdue';
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else {
      return `Due in ${diffDays} days`;
    }
  };

  const filteredRequests = requests.filter(request => request.status === activeTab);

  const getTabCount = (status: ToolRequest['status']) => {
    return requests.filter(request => request.status === status).length;
  };

  if (loading) {
    return (
      <div className={`bg-white dark:bg-slate-900 rounded-xl p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-slate-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-xl ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center space-x-3">
          <CogIcon className="h-8 w-8 text-blue-500" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
              Tool Requests
            </h2>
            <p className="text-gray-600 dark:text-slate-400">
              Track your custom tool development requests
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-slate-700">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'pending', label: 'Pending' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'completed', label: 'Completed' },
            { id: 'rejected', label: 'Rejected' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
              }`}
            >
              <span>{tab.label}</span>
              {getTabCount(tab.id as ToolRequest['status']) > 0 && (
                <span className="bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-slate-300 px-2 py-0.5 rounded-full text-xs">
                  {getTabCount(tab.id as ToolRequest['status'])}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <CogIcon className="h-12 w-12 mx-auto text-gray-400 dark:text-slate-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-2">
              No {activeTab.replace('_', ' ')} requests
            </h3>
            <p className="text-gray-600 dark:text-slate-400">
              {activeTab === 'pending' && 'Submit a tool request to get started'}
              {activeTab === 'in_progress' && 'No tools currently being developed'}
              {activeTab === 'completed' && 'You haven\'t completed any tool requests yet'}
              {activeTab === 'rejected' && 'No rejected requests'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div
                key={request.id}
                className="border border-gray-200 dark:border-slate-700 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3">
                    {getStatusIcon(request.status)}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                        {request.tool_name}
                      </h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                          {request.status.replace('_', ' ')}
                        </span>
                        <span className={`text-sm font-medium ${getPriorityColor(request.priority)}`}>
                          {request.priority} priority
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-slate-400">
                      <CoinsIcon className="h-4 w-4 text-amber-500" />
                      <span>{request.smechals_cost} Smechals</span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 dark:text-slate-300 mb-4">
                  {request.description}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-slate-400">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <CalendarIcon className="h-4 w-4" />
                      <span>Submitted {formatDate(request.created_at)}</span>
                    </div>
                  </div>

                  {request.status !== 'completed' && request.status !== 'rejected' && (
                    <div className="flex items-center space-x-1">
                      <ClockIcon className="h-4 w-4" />
                      <span>{getEstimatedDelivery(request.estimated_delivery)}</span>
                    </div>
                  )}
                </div>

                {/* Progress indicator for in-progress requests */}
                {request.status === 'in_progress' && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-slate-400 mb-1">
                      <span>Development in progress</span>
                      <span>Estimated delivery: {formatDate(request.estimated_delivery)}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full w-2/3 transition-all duration-300"></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ToolRequestManager;
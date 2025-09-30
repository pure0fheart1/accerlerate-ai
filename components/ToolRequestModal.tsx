import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon, CoinsIcon, CheckIcon, ClockIcon } from './icons';
import { SMECHAL_RATES } from '../constants/tiers';

interface ToolRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSmechals: number;
  onSubmitRequest: (request: {
    toolName: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
  }) => void;
}

const ToolRequestModal: React.FC<ToolRequestModalProps> = ({
  isOpen,
  onClose,
  currentSmechals,
  onSubmitRequest
}) => {
  const [toolName, setToolName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canAfford = currentSmechals >= SMECHAL_RATES.TOOL_REQUEST_COST;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canAfford || !toolName.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmitRequest({
        toolName: toolName.trim(),
        description: description.trim(),
        priority
      });

      // Reset form
      setToolName('');
      setDescription('');
      setPriority('medium');
      onClose();
    } catch (error) {
      console.error('Error submitting tool request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const getPriorityColor = (p: 'low' | 'medium' | 'high') => {
    switch (p) {
      case 'high':
        return 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300';
      case 'low':
        return 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300';
    }
  };

  const getPriorityLabel = (p: 'low' | 'medium' | 'high') => {
    switch (p) {
      case 'high':
        return 'High Priority (24-48 hours)';
      case 'medium':
        return 'Medium Priority (3-5 days)';
      case 'low':
        return 'Low Priority (1-2 weeks)';
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      style={{ zIndex: 999999 }}
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <CoinsIcon className="h-8 w-8 text-amber-500" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                Request Custom Tool
              </h2>
              <p className="text-gray-600 dark:text-slate-400">
                Cost: {SMECHAL_RATES.TOOL_REQUEST_COST} Smechals
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

        {/* Balance Warning */}
        {!canAfford && (
          <div className="mx-6 mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <XMarkIcon className="h-5 w-5 text-red-500" />
              <span className="text-red-700 dark:text-red-300 font-medium">
                Insufficient Smechals
              </span>
            </div>
            <p className="text-red-600 dark:text-red-400 text-sm mt-1">
              You need {SMECHAL_RATES.TOOL_REQUEST_COST - currentSmechals} more Smechals to submit this request.
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Tool Name */}
          <div>
            <label htmlFor="toolName" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Tool Name
            </label>
            <input
              type="text"
              id="toolName"
              value={toolName}
              onChange={(e) => setToolName(e.target.value)}
              placeholder="e.g., PDF Merger, Code Formatter, Recipe Generator"
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
              required
              disabled={!canAfford}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Describe what this tool should do, what inputs it needs, and what outputs you expect. Be as detailed as possible to help our developers understand your requirements."
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 resize-none"
              required
              disabled={!canAfford}
            />
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
              {description.length}/500 characters
            </p>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">
              Priority Level
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(['low', 'medium', 'high'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  disabled={!canAfford}
                  className={`p-4 border-2 rounded-lg transition-colors text-left ${
                    priority === p
                      ? getPriorityColor(p)
                      : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
                  } ${!canAfford ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="font-medium">{p.charAt(0).toUpperCase() + p.slice(1)}</div>
                  <div className="text-sm opacity-75">{getPriorityLabel(p)}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
            <h3 className="font-medium text-amber-800 dark:text-amber-200 mb-3 flex items-center space-x-2">
              <CheckIcon className="h-5 w-5" />
              <span>What you get</span>
            </h3>
            <ul className="space-y-2 text-sm text-amber-700 dark:text-amber-300">
              <li className="flex items-start space-x-2">
                <CheckIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Custom tool developed specifically for your needs</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Same-day delivery for high priority requests</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Credit to you as the tool creator</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Tool available to entire community</span>
              </li>
            </ul>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-slate-400">
              <CoinsIcon className="h-4 w-4" />
              <span>Current balance: {currentSmechals} Smechals</span>
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!canAfford || !toolName.trim() || !description.trim() || isSubmitting}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  canAfford && toolName.trim() && description.trim() && !isSubmitting
                    ? 'bg-amber-500 hover:bg-amber-600 text-white'
                    : 'bg-gray-300 dark:bg-slate-700 text-gray-500 dark:text-slate-400 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="h-4 w-4 animate-spin" />
                    <span>Submitting...</span>
                  </div>
                ) : (
                  `Submit Request (${SMECHAL_RATES.TOOL_REQUEST_COST} Smechals)`
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ToolRequestModal;
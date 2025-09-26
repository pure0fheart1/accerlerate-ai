import React, { useState, useCallback, useMemo } from 'react';
import { CloudCostEstimatorIcon, LoaderIcon, AlertTriangleIcon, SparklesIcon } from '../components/icons';
import { estimateCloudCosts } from '../services/geminiService';
import { VoiceInputButton } from '../components/VoiceInputButton';

const CloudCostEstimator: React.FC = () => {
  const [description, setDescription] = useState('');
  const [estimate, setEstimate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!description.trim()) {
      setError("Please describe your application.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setEstimate(null);
    try {
      const result = await estimateCloudCosts(description);
      setEstimate(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [description]);

  const isGenerateDisabled = useMemo(() => isLoading || !description.trim(), [isLoading, description]);

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center gap-4 mb-4">
        <CloudCostEstimatorIcon className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100">Cloud Cost Estimator</h1>
      </header>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-6 max-w-4xl">
        Get a high-level estimate of monthly cloud costs for your application. Describe your architecture, expected traffic, and resource usage.
      </p>

      <main className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0">
        <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 flex flex-col">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100 mb-4">Application Description</h2>
          <div className="relative w-full flex-grow">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., A web app with a Node.js backend, a PostgreSQL database, and a React frontend, expecting 10,000 monthly users."
              className="w-full h-full p-3 bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 resize-none pr-12 focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 transition-all"
              aria-label="Application description for cost estimation"
            />
            <div className="absolute bottom-3 right-3">
                <VoiceInputButton onTranscript={(t) => setDescription(current => (current ? current.trim() + ' ' : '') + t)} />
            </div>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerateDisabled}
            className="w-full mt-4 py-3 px-6 bg-indigo-600 text-white font-semibold rounded-lg shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/40 hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            {isLoading ? <><LoaderIcon className="h-5 w-5" /> Estimating...</> : <><SparklesIcon className="h-5 w-5" /> Estimate Costs</>}
          </button>
        </div>

        <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 flex flex-col min-h-0">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100 mb-4">Cost Estimate</h2>
          <div className="w-full flex-grow bg-gray-50 dark:bg-slate-900 rounded-xl p-4 overflow-y-auto border border-gray-200 dark:border-slate-700">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <LoaderIcon className="h-12 w-12 text-indigo-500 dark:text-indigo-400" />
                <p className="text-indigo-600 dark:text-indigo-300">Calculating potential costs...</p>
              </div>
            )}
            {error && !isLoading && (
              <div className="flex items-center justify-center h-full">
                <div className="text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-4 rounded-lg flex items-center gap-3">
                  <AlertTriangleIcon className="h-8 w-8 text-red-500 dark:text-red-400" />
                  <div><h3 className="font-bold">Error</h3><p className="text-sm">{error}</p></div>
                </div>
              </div>
            )}
            {!isLoading && !error && estimate && (
              <div className="prose dark:prose-invert max-w-none">{estimate}</div>
            )}
            {!isLoading && !error && !estimate && (
              <div className="flex items-center justify-center h-full text-center text-gray-500 dark:text-slate-500">
                <div>
                  <CloudCostEstimatorIcon className="h-24 w-24 mx-auto mb-4" />
                  <p>Your estimated cloud cost breakdown will appear here.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CloudCostEstimator;

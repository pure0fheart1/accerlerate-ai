
import React, { useState, useCallback, useMemo } from 'react';
import { ItineraryOptimizerIcon, LoaderIcon, AlertTriangleIcon, SparklesIcon } from '../components/icons';
import { optimizeItinerary } from '../services/geminiService';
import { ItineraryOptimization } from '../types';
import { VoiceInputButton } from '../components/VoiceInputButton';

const ItineraryOptimizer: React.FC = () => {
  const [itinerary, setItinerary] = useState('');
  const [optimizedPlan, setOptimizedPlan] = useState<ItineraryOptimization | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!itinerary.trim()) {
      setError("Please paste your itinerary to optimize.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setOptimizedPlan(null);
    try {
      const result = await optimizeItinerary(itinerary);
      setOptimizedPlan(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [itinerary]);

  const isGenerateDisabled = useMemo(() => isLoading || !itinerary.trim(), [isLoading, itinerary]);

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center gap-4 mb-4">
        <ItineraryOptimizerIcon className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Itinerary Optimizer</h1>
      </header>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 max-w-4xl">
        Make your travel plans more efficient. Paste your existing itinerary and let AI suggest a more logical and enjoyable schedule.
      </p>

      <main className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0">
        <div className="bg-white/70 dark:bg-gray-950/30 backdrop-blur-md border border-gray-200 dark:border-gray-800/50 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 flex flex-col">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Current Itinerary</h2>
          <div className="relative w-full flex-grow">
            <textarea
              value={itinerary}
              onChange={(e) => setItinerary(e.target.value)}
              placeholder="Paste your day-by-day travel plan here..."
              className="w-full h-full p-3 bg-gray-100 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 resize-none pr-12 focus:ring-2 focus:ring-indigo-500"
              aria-label="Current itinerary input"
            />
            <div className="absolute bottom-3 right-3">
                <VoiceInputButton onTranscript={(t) => setItinerary(current => current + '\n' + t)} />
            </div>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerateDisabled}
            className="w-full mt-4 py-3 px-6 bg-indigo-600 text-white font-semibold rounded-lg shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/40 hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            {isLoading ? <><LoaderIcon className="h-5 w-5" /> Optimizing...</> : <><SparklesIcon className="h-5 w-5" /> Optimize Itinerary</>}
          </button>
        </div>

        <div className="bg-white/70 dark:bg-gray-950/30 backdrop-blur-md border border-gray-200 dark:border-gray-800/50 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 flex flex-col min-h-0">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Optimized Plan</h2>
          <div className="w-full flex-grow bg-gray-50 dark:bg-black/20 rounded-xl p-4 overflow-y-auto border border-gray-200 dark:border-gray-800">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full gap-4"><LoaderIcon className="h-12 w-12 text-indigo-500 dark:text-indigo-400" /><p className="text-indigo-600 dark:text-indigo-300">Rerouting your plans...</p></div>
            )}
            {error && !isLoading && (
              <div className="flex items-center justify-center h-full"><div className="text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-4 rounded-lg flex items-center gap-3"><AlertTriangleIcon className="h-8 w-8" /><div><h3 className="font-bold">Error</h3><p className="text-sm">{error}</p></div></div></div>
            )}
            {!isLoading && !error && optimizedPlan && (
              <div className="prose dark:prose-invert max-w-none">
                <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">Optimized Schedule</h3>
                <div className="space-y-3">
                  {optimizedPlan.optimizedPlan.map((day) => (
                    <div key={day.day} className="p-3 bg-white/50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                      <p><strong>Day {day.day}:</strong></p>
                      <ul className="list-disc list-inside">
                        {day.activities.map((act, i) => <li key={i}>{act}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
                <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-6">Suggestions</h3>
                <ul className="list-disc list-inside">
                  {optimizedPlan.suggestions.map((sug, i) => <li key={i}>{sug}</li>)}
                </ul>
              </div>
            )}
            {!isLoading && !error && !optimizedPlan && (
              <div className="flex items-center justify-center h-full text-center text-gray-400 dark:text-gray-600">
                <div><ItineraryOptimizerIcon className="h-24 w-24 mx-auto mb-4" /><p>Your optimized travel plan will appear here.</p></div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ItineraryOptimizer;

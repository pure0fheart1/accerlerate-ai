
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { HistoricalWhatIfIcon, LoaderIcon, AlertTriangleIcon, SparklesIcon } from '../components/icons';
import { generateHistoricalWhatIf } from '../services/geminiService';
import { VoiceInputButton } from '../components/VoiceInputButton';

const SCENARIO_KEY = 'accelerate-historicalwhatif-scenario';
const OUTPUT_KEY = 'accelerate-historicalwhatif-output';

export const HistoricalWhatIf: React.FC = () => {
  const [scenario, setScenario] = useState(() => localStorage.getItem(SCENARIO_KEY) || '');
  const [consequences, setConsequences] = useState<string | null>(() => localStorage.getItem(OUTPUT_KEY) || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(SCENARIO_KEY, scenario);
  }, [scenario]);

  useEffect(() => {
    if (consequences) {
      localStorage.setItem(OUTPUT_KEY, consequences);
    } else {
      localStorage.removeItem(OUTPUT_KEY);
    }
  }, [consequences]);

  const handleGenerate = useCallback(async () => {
    if (!scenario.trim()) {
      setError("Please enter a 'what if' scenario.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setConsequences(null);
    try {
      const result = await generateHistoricalWhatIf(scenario);
      setConsequences(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [scenario]);

  const isGenerateDisabled = useMemo(() => isLoading || !scenario.trim(), [isLoading, scenario]);

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center gap-4 mb-4">
        <HistoricalWhatIfIcon className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100">Historical 'What If' Scenarios</h1>
      </header>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-6 max-w-4xl">
        Explore alternate historical timelines. Pose a "what if" question and let AI, acting as a historian specializing in counterfactual history, explore the likely consequences.
      </p>
      
      <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 mb-8 flex flex-col sm:flex-row items-center gap-4">
        <div className="relative w-full flex-grow">
          <textarea
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
            placeholder="e.g., 'What if the Library of Alexandria never burned down?', 'What if the Vikings had colonized North America?'"
            className="w-full p-3 bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 pr-12 focus:ring-2 focus:ring-indigo-500 resize-none h-24"
            aria-label="Historical 'what if' scenario"
          />
           <div className="absolute top-3 right-3">
            <VoiceInputButton onTranscript={(t) => setScenario(current => (current ? current.trim() + ' ' : '') + t)} />
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isGenerateDisabled}
          className="w-full sm:w-auto py-3 px-8 bg-indigo-600 text-white font-semibold rounded-lg shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/40 hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2 flex-shrink-0"
        >
          {isLoading ? <><LoaderIcon className="h-5 w-5" /> Exploring...</> : <><SparklesIcon className="h-5 w-5" /> Explore Consequences</>}
        </button>
      </div>

      <main className="flex-grow flex flex-col min-h-0">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-4">Analysis of Alternate History</h2>
        <div className="w-full flex-grow bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-xl p-4 overflow-y-auto shadow-inner">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <LoaderIcon className="h-12 w-12 text-indigo-500 dark:text-indigo-400" />
                <p className="text-indigo-600 dark:text-indigo-300">Traveling through time...</p>
              </div>
            )}
            {error && !isLoading && (
              <div className="flex items-center justify-center h-full">
                <div className="text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-4 rounded-lg flex items-center gap-3">
                  <AlertTriangleIcon className="h-8 w-8" />
                  <div><h3 className="font-bold">Error</h3><p className="text-sm">{error}</p></div>
                </div>
              </div>
            )}
            {!isLoading && !error && consequences && (
              <div className="prose dark:prose-invert max-w-none">{consequences}</div>
            )}
            {!isLoading && !error && !consequences && (
              <div className="flex items-center justify-center h-full text-center text-gray-500 dark:text-slate-500">
                <div>
                  <HistoricalWhatIfIcon className="h-24 w-24 mx-auto mb-4" />
                  <p>Your alternate history will be written here.</p>
                </div>
              </div>
            )}
          </div>
      </main>
    </div>
  );
};

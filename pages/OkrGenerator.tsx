import React, { useState, useCallback, useMemo } from 'react';
import { OkrGeneratorIcon, LoaderIcon, AlertTriangleIcon, SparklesIcon } from '../components/icons';
import { generateOkr } from '../services/geminiService';
import { Okr } from '../types';
import { VoiceInputButton } from '../components/VoiceInputButton';

const OkrGenerator: React.FC = () => {
  const [goal, setGoal] = useState('');
  const [okr, setOkr] = useState<Okr | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!goal.trim()) {
      setError("Please describe your goal.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setOkr(null);
    try {
      const result = await generateOkr(goal);
      setOkr(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [goal]);

  const isGenerateDisabled = useMemo(() => isLoading || !goal.trim(), [isLoading, goal]);

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center gap-4 mb-4">
        <OkrGeneratorIcon className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100">OKR Generator</h1>
      </header>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-6 max-w-4xl">
        Define clear and measurable goals for your team. Describe your high-level objective, and let AI generate a structured OKR (Objective and Key Results).
      </p>

      <main className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-0">
        <div className="lg:col-span-1 bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 flex flex-col gap-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100">Your Goal</h2>
          <div className="relative flex-grow">
            <label htmlFor="goal" className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-2">Describe the overall goal or objective</label>
            <div className="relative h-full">
              <textarea
                id="goal"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g., 'Improve user engagement in our mobile app this quarter.'"
                className="w-full h-full p-2 bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg resize-none min-h-[12rem] pr-12 focus:ring-2 focus:ring-indigo-500 dark:focus:bg-slate-800 transition-all text-gray-900 dark:text-slate-100"
              />
              <div className="absolute bottom-2 right-2">
                <VoiceInputButton onTranscript={(t) => setGoal(current => (current ? current + ' ' : '') + t)} />
              </div>
            </div>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerateDisabled}
            className="w-full mt-auto py-3 px-6 bg-indigo-600 text-white font-semibold rounded-lg shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/40 hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            {isLoading ? <><LoaderIcon className="h-5 w-5" /> Generating...</> : <><SparklesIcon className="h-5 w-5" /> Generate OKR</>}
          </button>
        </div>

        <div className="lg:col-span-2 bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 flex flex-col min-h-0">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100 mb-4">Generated OKR</h2>
          <div className="w-full flex-grow bg-gray-50 dark:bg-slate-900 rounded-xl p-4 overflow-y-auto border border-gray-200 dark:border-slate-700">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <LoaderIcon className="h-12 w-12 text-indigo-500 dark:text-indigo-400" />
                <p className="text-indigo-600 dark:text-indigo-300">Defining your objective...</p>
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
            {!isLoading && !error && okr && (
              <div className="space-y-6 text-gray-700 dark:text-slate-300">
                <div>
                  <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500/20 dark:border-indigo-500/30 pb-1 mb-2">Objective</h3>
                  <p className="text-lg font-semibold">{okr.objective}</p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500/20 dark:border-indigo-500/30 pb-1 mb-2">Key Results</h3>
                  <ul className="space-y-2 list-decimal list-inside">
                    {okr.keyResults.map((kr, i) => (
                      <li key={i}>
                        <span className="font-medium text-gray-800 dark:text-slate-100">{kr.result}</span>
                        <span className="text-sm text-gray-500 dark:text-slate-400 ml-2">({kr.metric})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            {!isLoading && !error && !okr && (
              <div className="flex items-center justify-center h-full text-center text-gray-500 dark:text-slate-500">
                <div>
                  <OkrGeneratorIcon className="h-24 w-24 mx-auto mb-4" />
                  <p>Your generated OKR will appear here.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default OkrGenerator;

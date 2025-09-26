
import React, { useState, useCallback, useMemo } from 'react';
import { UsersIcon, LoaderIcon, AlertTriangleIcon, SparklesIcon } from '../components/icons';
import { scriptNegotiation } from '../services/geminiService';
import { VoiceInputButton } from '../components/VoiceInputButton';

const NegotiationScripter: React.FC = () => {
  const [situation, setSituation] = useState('');
  const [goal, setGoal] = useState('');
  const [script, setScript] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!situation.trim() || !goal.trim()) {
      setError("Please provide both the situation and your goal.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setScript(null);
    try {
      const result = await scriptNegotiation({ situation, goal });
      setScript(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [situation, goal]);

  const isGenerateDisabled = useMemo(() => isLoading || !situation.trim() || !goal.trim(), [isLoading, situation, goal]);

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center gap-4 mb-4">
        <UsersIcon className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Negotiation Scripter</h1>
      </header>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 max-w-4xl">
        Prepare for important negotiations with AI-generated talking points and strategies to help you achieve your goals.
      </p>

      <main className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0">
        <div className="bg-white/70 dark:bg-gray-950/30 backdrop-blur-md border border-gray-200 dark:border-gray-800/50 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 flex flex-col gap-4">
          <div>
            <label htmlFor="situation" className="block text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Negotiation Situation</label>
            <div className="relative h-48">
              <textarea
                id="situation"
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
                placeholder="e.g., Negotiating a salary for a new job offer, Discussing project deadlines with a client..."
                className="w-full h-full p-2 bg-gray-100 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 rounded-lg resize-none pr-12 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
              <div className="absolute bottom-2 right-2">
                <VoiceInputButton onTranscript={(t) => setSituation(current => current + ' ' + t)} />
              </div>
            </div>
          </div>
          <div className="flex-grow flex flex-col">
            <label htmlFor="goal" className="block text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Your Primary Goal</label>
            <div className="relative flex-grow">
              <textarea
                id="goal"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g., Secure a 15% salary increase, Extend the project deadline by two weeks..."
                className="w-full h-full p-2 bg-gray-100 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 rounded-lg resize-none pr-12 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
               <div className="absolute bottom-2 right-2">
                <VoiceInputButton onTranscript={(t) => setGoal(current => current + ' ' + t)} />
              </div>
            </div>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerateDisabled}
            className="w-full mt-4 py-3 px-6 bg-indigo-600 text-white font-semibold rounded-lg shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/40 hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            {isLoading ? <><LoaderIcon className="h-5 w-5" /> Scripting...</> : <><SparklesIcon className="h-5 w-5" /> Create Script</>}
          </button>
        </div>

        <div className="bg-white/70 dark:bg-gray-950/30 backdrop-blur-md border border-gray-200 dark:border-gray-800/50 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 flex flex-col min-h-0">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Negotiation Script & Talking Points</h2>
          <div className="w-full flex-grow bg-gray-50 dark:bg-black/20 rounded-xl p-4 overflow-y-auto border border-gray-200 dark:border-gray-800">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full gap-4"><LoaderIcon className="h-12 w-12 text-indigo-500 dark:text-indigo-400" /><p className="text-indigo-600 dark:text-indigo-300">Preparing your script...</p></div>
            )}
            {error && !isLoading && (
              <div className="flex items-center justify-center h-full"><div className="text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-4 rounded-lg flex items-center gap-3"><AlertTriangleIcon className="h-8 w-8" /><div><h3 className="font-bold">Error</h3><p className="text-sm">{error}</p></div></div></div>
            )}
            {!isLoading && !error && script && (
              <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">{script}</div>
            )}
            {!isLoading && !error && !script && (
              <div className="flex items-center justify-center h-full text-center text-gray-400 dark:text-gray-600">
                <div><UsersIcon className="h-24 w-24 mx-auto mb-4" /><p>Your negotiation script will appear here.</p></div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default NegotiationScripter;

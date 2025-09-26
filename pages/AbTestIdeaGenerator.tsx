import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { AbTestIdeaGeneratorIcon, LoaderIcon, AlertTriangleIcon, SparklesIcon } from '../components/icons';
import { generateAbTestIdeas } from '../services/geminiService';
import { VoiceInputButton } from '../components/VoiceInputButton';

const GOAL_KEY = 'accelerate-abtest-goal';
const IDEAS_KEY = 'accelerate-abtest-ideas';

const AbTestIdeaGenerator: React.FC = () => {
  const [goal, setGoal] = useState(() => localStorage.getItem(GOAL_KEY) || '');
  const [ideas, setIdeas] = useState<string | null>(() => localStorage.getItem(IDEAS_KEY) || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(GOAL_KEY, goal);
  }, [goal]);

  useEffect(() => {
    if (ideas) {
      localStorage.setItem(IDEAS_KEY, ideas);
    } else {
      localStorage.removeItem(IDEAS_KEY);
    }
  }, [ideas]);

  const handleGenerate = useCallback(async () => {
    if (!goal.trim()) {
      setError("Please define your goal for the A/B test.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setIdeas(null);
    try {
      const result = await generateAbTestIdeas(goal);
      setIdeas(result);
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
        <AbTestIdeaGeneratorIcon className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">A/B Test Idea Generator</h1>
      </header>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 max-w-4xl">
        Generate hypotheses and actionable ideas for your next A/B test to improve your conversion rates.
      </p>
      
      <div className="bg-white/70 dark:bg-gray-950/30 backdrop-blur-md border border-gray-200 dark:border-gray-800/50 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 mb-8 flex flex-col sm:flex-row items-center gap-4">
        <div className="relative w-full flex-grow">
          <input
            type="text"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="e.g., 'Increase sign-ups on our landing page', 'Improve user engagement with our new feature'"
            className="w-full p-3 bg-gray-100 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 pr-12 focus:ring-2 focus:ring-indigo-500"
            aria-label="A/B test goal"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <VoiceInputButton onTranscript={setGoal} />
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isGenerateDisabled}
          className="w-full sm:w-auto py-3 px-8 bg-indigo-600 text-white font-semibold rounded-lg shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/40 hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2 flex-shrink-0"
        >
          {isLoading ? <><LoaderIcon className="h-5 w-5" /> Generating...</> : <><SparklesIcon className="h-5 w-5" /> Generate Ideas</>}
        </button>
      </div>

      <main className="flex-grow flex flex-col min-h-0">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">A/B Test Ideas</h2>
        <div className="w-full flex-grow bg-white/70 dark:bg-gray-950/30 backdrop-blur-md border border-gray-200 dark:border-gray-800/50 rounded-xl p-4 overflow-y-auto shadow-inner">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <LoaderIcon className="h-12 w-12 text-indigo-500 dark:text-indigo-400" />
                <p className="text-indigo-600 dark:text-indigo-300">Brainstorming test ideas...</p>
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
            {!isLoading && !error && ideas && (
              <div className="prose dark:prose-invert max-w-none">{ideas}</div>
            )}
            {!isLoading && !error && !ideas && (
              <div className="flex items-center justify-center h-full text-center text-gray-400 dark:text-gray-600">
                <div>
                  <AbTestIdeaGeneratorIcon className="h-24 w-24 mx-auto mb-4" />
                  <p>Your A/B test ideas will appear here.</p>
                </div>
              </div>
            )}
          </div>
      </main>
    </div>
  );
};

export default AbTestIdeaGenerator;

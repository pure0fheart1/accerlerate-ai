import React, { useState, useCallback, useMemo } from 'react';
import { PersonalizedAffirmationsIcon, LoaderIcon, AlertTriangleIcon, SparklesIcon, CopyIcon } from '../components/icons';
import { generateAffirmations } from '../services/geminiService';
import { VoiceInputButton } from '../components/VoiceInputButton';

const PersonalizedAffirmations: React.FC = () => {
  const [goal, setGoal] = useState('');
  const [affirmations, setAffirmations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!goal.trim()) {
      setError("Please describe your goal or area of focus.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setAffirmations([]);
    try {
      const result = await generateAffirmations(goal);
      setAffirmations(result.split('\n').filter(line => line.trim() !== ''));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [goal]);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const isGenerateDisabled = useMemo(() => isLoading || !goal.trim(), [isLoading, goal]);

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center gap-4 mb-4">
        <PersonalizedAffirmationsIcon className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100">Personalized Affirmations</h1>
      </header>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-6 max-w-4xl">
        Foster a positive mindset by generating powerful, personalized affirmations tailored to your goals.
      </p>
      
      <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 mb-8 flex flex-col sm:flex-row items-center gap-4">
        <div className="relative w-full flex-grow">
          <input
            type="text"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="e.g., 'To be more confident in public speaking', 'To stay calm during stressful situations'"
            className="w-full p-3 bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 pr-12 focus:ring-2 focus:ring-indigo-500"
            aria-label="Goal or area of focus"
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
          {isLoading ? <><LoaderIcon className="h-5 w-5" /> Generating...</> : <><SparklesIcon className="h-5 w-5" /> Generate</>}
        </button>
      </div>

      <main className="flex-grow flex flex-col min-h-0">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-4">Your Affirmations</h2>
        <div className="w-full flex-grow bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-xl p-4 overflow-y-auto shadow-inner">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <LoaderIcon className="h-12 w-12 text-indigo-500 dark:text-indigo-400" />
                <p className="text-indigo-600 dark:text-indigo-300">Creating positive affirmations...</p>
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
            {!isLoading && !error && affirmations.length > 0 && (
              <div className="space-y-3">
                {affirmations.map((affirmation, index) => (
                  <div key={index} className="group bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 flex justify-between items-center gap-4">
                    <p className="text-lg font-medium text-gray-800 dark:text-slate-200 flex-grow">"{affirmation}"</p>
                    <button 
                        onClick={() => handleCopy(affirmation, index)}
                        className="p-2 rounded-full text-gray-400 dark:text-slate-500 hover:bg-gray-200 dark:hover:bg-slate-700 hover:text-gray-700 dark:hover:text-slate-200 transition-all opacity-0 group-hover:opacity-100"
                        aria-label="Copy affirmation"
                    >
                       {copiedIndex === index ? <span className="text-xs text-indigo-500">Copied!</span> : <CopyIcon className="h-5 w-5" />}
                    </button>
                  </div>
                ))}
              </div>
            )}
            {!isLoading && !error && affirmations.length === 0 && (
              <div className="flex items-center justify-center h-full text-center text-gray-500 dark:text-slate-500">
                <div>
                  <PersonalizedAffirmationsIcon className="h-24 w-24 mx-auto mb-4" />
                  <p>Your personalized affirmations will appear here.</p>
                </div>
              </div>
            )}
          </div>
      </main>
    </div>
  );
};

export default PersonalizedAffirmations;

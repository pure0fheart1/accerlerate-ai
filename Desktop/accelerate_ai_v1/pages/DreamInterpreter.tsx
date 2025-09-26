
import React, { useState, useCallback, useMemo } from 'react';
import { MoonIcon, LoaderIcon, AlertTriangleIcon, SparklesIcon } from '../components/icons';
import { interpretDream } from '../services/geminiService';
import { DreamInterpretation } from '../types';
import { VoiceInputButton } from '../components/VoiceInputButton';

const DreamInterpreter: React.FC = () => {
  const [dream, setDream] = useState('');
  const [interpretation, setInterpretation] = useState<DreamInterpretation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInterpret = useCallback(async () => {
    if (!dream.trim()) {
      setError("Please describe your dream.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setInterpretation(null);
    try {
      const result = await interpretDream(dream);
      setInterpretation(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [dream]);

  const isInterpretDisabled = useMemo(() => isLoading || !dream.trim(), [isLoading, dream]);

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center gap-4 mb-4">
        <MoonIcon className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100">Dream Interpreter</h1>
      </header>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-6 max-w-4xl">
        Explore the symbolic meanings behind your dreams. Describe what you remember, and let AI provide a possible interpretation.
      </p>

      <main className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0">
        <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 flex flex-col">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100 mb-4">Your Dream</h2>
           <div className="relative w-full flex-grow">
            <textarea
              value={dream}
              onChange={(e) => setDream(e.target.value)}
              placeholder="Describe your dream in as much detail as you can remember..."
              className="w-full h-full p-3 bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 dark:focus:bg-slate-800 transition-all duration-200 resize-none pr-12"
              aria-label="Dream description"
            />
            <div className="absolute bottom-3 right-3">
                <VoiceInputButton onTranscript={(t) => setDream(current => current + ' ' + t)} />
            </div>
          </div>
          <button
            onClick={handleInterpret}
            disabled={isInterpretDisabled}
            className="w-full mt-4 py-3 px-6 bg-indigo-600 text-white font-semibold rounded-lg shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/40 hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            {isLoading ? <><LoaderIcon className="h-5 w-5" /> Interpreting...</> : <><SparklesIcon className="h-5 w-5" /> Interpret Dream</>}
          </button>
        </div>

        <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 flex flex-col min-h-0">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100 mb-4">Interpretation</h2>
          <div className="w-full flex-grow bg-gray-50 dark:bg-slate-900 rounded-xl p-4 overflow-y-auto border border-gray-200 dark:border-slate-700">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full gap-4"><LoaderIcon className="h-12 w-12 text-indigo-500 dark:text-indigo-400" /><p className="text-indigo-600 dark:text-indigo-300">Analyzing your dream...</p></div>
            )}
            {error && !isLoading && (
              <div className="flex items-center justify-center h-full"><div className="text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-4 rounded-lg flex items-center gap-3"><AlertTriangleIcon className="h-8 w-8" /><div><h3 className="font-bold">Error</h3><p className="text-sm">{error}</p></div></div></div>
            )}
            {!isLoading && !error && interpretation && (
              <div className="prose dark:prose-invert max-w-none">
                <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">Key Themes</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {interpretation.themes.map((theme, i) => <span key={i} className="bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-slate-200 text-sm font-medium px-3 py-1 rounded-full">{theme}</span>)}
                </div>
                <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">Possible Meaning</h3>
                <p>{interpretation.interpretation}</p>
              </div>
            )}
            {!isLoading && !error && !interpretation && (
              <div className="flex items-center justify-center h-full text-center text-gray-500 dark:text-slate-500"><div><MoonIcon className="h-24 w-24 mx-auto mb-4" /><p>Your dream interpretation will appear here.</p></div></div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DreamInterpreter;
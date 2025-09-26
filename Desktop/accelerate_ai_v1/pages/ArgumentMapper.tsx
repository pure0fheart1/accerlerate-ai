import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { ArgumentMapperIcon, LoaderIcon, AlertTriangleIcon, SparklesIcon } from '../components/icons';
import { mapArgument } from '../services/geminiService';
import { VoiceInputButton } from '../components/VoiceInputButton';

const ARGUMENT_KEY = 'accelerate-argumentmapper-argument';
const OUTPUT_KEY = 'accelerate-argumentmapper-output';

const ArgumentMapper: React.FC = () => {
  const [argument, setArgument] = useState(() => localStorage.getItem(ARGUMENT_KEY) || '');
  const [mapped, setMapped] = useState<string | null>(() => localStorage.getItem(OUTPUT_KEY) || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => { localStorage.setItem(ARGUMENT_KEY, argument); }, [argument]);
  useEffect(() => {
    if (mapped) localStorage.setItem(OUTPUT_KEY, mapped);
    else localStorage.removeItem(OUTPUT_KEY);
  }, [mapped]);

  const handleGenerate = useCallback(async () => {
    if (!argument.trim()) {
      setError("Please enter an argument to map.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setMapped(null);
    try {
      const result = await mapArgument(argument);
      setMapped(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [argument]);

  const isGenerateDisabled = useMemo(() => isLoading || !argument.trim(), [isLoading, argument]);

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center gap-4 mb-4">
        <ArgumentMapperIcon className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Argument Mapper</h1>
      </header>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 max-w-4xl">
        Visualize the logical structure of an argument. Paste a piece of text, and the AI will identify the premises and conclusion.
      </p>

      <main className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0">
        <div className="bg-white/70 dark:bg-gray-950/30 backdrop-blur-md border border-gray-200 dark:border-gray-800/50 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 flex flex-col">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Argument Text</h2>
          <div className="relative w-full flex-grow">
            <textarea
              value={argument}
              onChange={(e) => setArgument(e.target.value)}
              placeholder="Paste the argument you want to analyze here..."
              className="w-full h-full p-3 bg-gray-100 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 resize-none pr-12 focus:ring-2 focus:ring-indigo-500"
              aria-label="Argument input"
            />
            <div className="absolute bottom-3 right-3">
                <VoiceInputButton onTranscript={(t) => setArgument(current => current + ' ' + t)} />
            </div>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerateDisabled}
            className="w-full mt-4 py-3 px-6 bg-indigo-600 text-white font-semibold rounded-lg shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/40 hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            {isLoading ? <><LoaderIcon className="h-5 w-5" /> Mapping...</> : <><SparklesIcon className="h-5 w-5" /> Map Argument</>}
          </button>
        </div>

        <div className="bg-white/70 dark:bg-gray-950/30 backdrop-blur-md border border-gray-200 dark:border-gray-800/50 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 flex flex-col min-h-0">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Argument Map</h2>
          <div className="w-full flex-grow bg-gray-50 dark:bg-black/20 rounded-xl p-4 overflow-y-auto border border-gray-200 dark:border-gray-800">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full gap-4"><LoaderIcon className="h-12 w-12 text-indigo-500 dark:text-indigo-400" /><p className="text-indigo-600 dark:text-indigo-300">Analyzing structure...</p></div>
            )}
            {error && !isLoading && (
              <div className="flex items-center justify-center h-full"><div className="text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-4 rounded-lg flex items-center gap-3"><AlertTriangleIcon className="h-8 w-8" /><div><h3 className="font-bold">Error</h3><p className="text-sm">{error}</p></div></div></div>
            )}
            {!isLoading && !error && mapped && (
              <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">{mapped}</div>
            )}
            {!isLoading && !error && !mapped && (
              <div className="flex items-center justify-center h-full text-center text-gray-400 dark:text-gray-600">
                <div><ArgumentMapperIcon className="h-24 w-24 mx-auto mb-4" /><p>The structured argument map will appear here.</p></div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ArgumentMapper;

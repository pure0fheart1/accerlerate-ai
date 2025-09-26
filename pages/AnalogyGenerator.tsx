import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { AnalogyGeneratorIcon, LoaderIcon, AlertTriangleIcon, SparklesIcon } from '../components/icons';
import { generateAnalogy } from '../services/geminiService';
import { VoiceInputButton } from '../components/VoiceInputButton';

const TOPIC_KEY = 'accelerate-analogy-topic';
const OUTPUT_KEY = 'accelerate-analogy-output';

const AnalogyGenerator: React.FC = () => {
  const [topic, setTopic] = useState(() => localStorage.getItem(TOPIC_KEY) || '');
  const [analogy, setAnalogy] = useState<string | null>(() => localStorage.getItem(OUTPUT_KEY) || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { localStorage.setItem(TOPIC_KEY, topic); }, [topic]);
  useEffect(() => {
    if (analogy) localStorage.setItem(OUTPUT_KEY, analogy);
    else localStorage.removeItem(OUTPUT_KEY);
  }, [analogy]);

  const handleGenerate = useCallback(async () => {
    if (!topic.trim()) {
      setError("Please enter a topic to create an analogy for.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalogy(null);
    try {
      const result = await generateAnalogy(topic);
      setAnalogy(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [topic]);

  const isGenerateDisabled = useMemo(() => isLoading || !topic.trim(), [isLoading, topic]);

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center gap-4 mb-4">
        <AnalogyGeneratorIcon className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Analogy Generator</h1>
      </header>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 max-w-4xl">
        Explain complex topics using simple, effective, and easy-to-understand analogies.
      </p>
      
      <div className="bg-white/70 dark:bg-gray-950/30 backdrop-blur-md border border-gray-200 dark:border-gray-800/50 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 mb-8 flex flex-col sm:flex-row items-center gap-4">
        <div className="relative w-full flex-grow">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., 'How does a blockchain work?', 'The concept of inflation'"
            className="w-full p-3 bg-gray-100 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 pr-12 focus:ring-2 focus:ring-indigo-500"
            aria-label="Complex topic for analogy"
          />
           <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <VoiceInputButton onTranscript={setTopic} />
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isGenerateDisabled}
          className="w-full sm:w-auto py-3 px-8 bg-indigo-600 text-white font-semibold rounded-lg shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/40 hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2 flex-shrink-0"
        >
          {isLoading ? <><LoaderIcon className="h-5 w-5" /> Creating...</> : <><SparklesIcon className="h-5 w-5" /> Generate Analogy</>}
        </button>
      </div>

      <main className="flex-grow flex flex-col min-h-0">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">The Analogy</h2>
        <div className="w-full flex-grow bg-white/70 dark:bg-gray-950/30 backdrop-blur-md border border-gray-200 dark:border-gray-800/50 rounded-xl p-4 overflow-y-auto shadow-inner">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <LoaderIcon className="h-12 w-12 text-indigo-500 dark:text-indigo-400" />
                <p className="text-indigo-600 dark:text-indigo-300">Thinking of a good comparison...</p>
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
            {!isLoading && !error && analogy && (
              <div className="prose dark:prose-invert max-w-none text-lg leading-relaxed">{analogy}</div>
            )}
            {!isLoading && !error && !analogy && (
              <div className="flex items-center justify-center h-full text-center text-gray-400 dark:text-gray-600">
                <div>
                  <AnalogyGeneratorIcon className="h-24 w-24 mx-auto mb-4" />
                  <p>Your generated analogy will appear here.</p>
                </div>
              </div>
            )}
          </div>
      </main>
    </div>
  );
};

export default AnalogyGenerator;

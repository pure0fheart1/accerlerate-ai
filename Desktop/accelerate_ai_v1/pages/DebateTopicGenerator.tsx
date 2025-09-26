
import React, { useState, useCallback, useMemo } from 'react';
import { SpeakerWaveIcon, LoaderIcon, AlertTriangleIcon, SparklesIcon } from '../components/icons';
import { generateDebateTopic } from '../services/geminiService';
import { DebateTopic } from '../types';
import { VoiceInputButton } from '../components/VoiceInputButton';

const DebateTopicGenerator: React.FC = () => {
  const [theme, setTheme] = useState('');
  const [topic, setTopic] = useState<DebateTopic | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!theme.trim()) {
      setError("Please enter a theme for the debate.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setTopic(null);
    try {
      const result = await generateDebateTopic(theme);
      setTopic(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [theme]);

  const isGenerateDisabled = useMemo(() => isLoading || !theme.trim(), [isLoading, theme]);

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center gap-4 mb-4">
        <SpeakerWaveIcon className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100">Debate Topic Generator</h1>
      </header>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-6 max-w-4xl">
        Generate compelling debate topics with key arguments for both sides.
      </p>
      
      <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 mb-8 flex flex-col sm:flex-row items-center gap-4">
        <div className="relative w-full flex-grow">
          <input
            type="text"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="e.g., 'Artificial Intelligence in art', 'Universal basic income'"
            className="w-full p-3 bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg pr-12 focus:ring-2 focus:ring-indigo-500 dark:focus:bg-slate-800 transition-all text-gray-900 dark:text-slate-100"
            aria-label="Debate theme"
          />
           <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <VoiceInputButton onTranscript={setTheme} />
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isGenerateDisabled}
          className="w-full sm:w-auto py-3 px-8 bg-indigo-600 text-white font-semibold rounded-lg shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/40 hover:bg-indigo-500 disabled:bg-gray-600 flex items-center justify-center gap-2 flex-shrink-0"
        >
          {isLoading ? <><LoaderIcon className="h-5 w-5" /> Generating...</> : <><SparklesIcon className="h-5 w-5" /> Generate Topic</>}
        </button>
      </div>

      <main className="flex-grow min-h-0">
        {isLoading && (
            <div className="flex justify-center items-center h-full"><div className="flex flex-col items-center gap-4 text-center"><LoaderIcon className="h-12 w-12 text-indigo-500 dark:text-indigo-400" /><p className="text-indigo-600 dark:text-indigo-300">Finding a great topic...</p></div></div>
        )}
        {error && !isLoading && (
            <div className="flex justify-center"><div className="text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-4 rounded-lg flex items-center gap-3 max-w-lg"><AlertTriangleIcon className="h-8 w-8 text-red-500 dark:text-red-400 flex-shrink-0" /><div><h3 className="font-bold">Error</h3><p className="text-sm">{error}</p></div></div></div>
        )}
        {!isLoading && !error && topic && (
          <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20">
            <h2 className="text-2xl font-bold text-center text-indigo-600 dark:text-indigo-400 mb-6">{topic.topic}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-800 dark:text-slate-300">
              <div className="bg-green-100 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-500/30">
                <h3 className="text-lg font-bold text-green-700 dark:text-green-400 mb-2">Pro Arguments</h3>
                <ul className="list-disc list-inside space-y-1">{topic.pro.map((arg, i) => <li key={i}>{arg}</li>)}</ul>
              </div>
              <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-500/30">
                <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-2">Con Arguments</h3>
                <ul className="list-disc list-inside space-y-1">{topic.con.map((arg, i) => <li key={i}>{arg}</li>)}</ul>
              </div>
            </div>
          </div>
        )}
        {!isLoading && !error && !topic && (
            <div className="flex justify-center items-center h-full text-center text-gray-500 dark:text-slate-500 bg-white/30 dark:bg-slate-800/10 rounded-2xl border-2 border-dashed border-gray-300 dark:border-slate-700">
                <div><SpeakerWaveIcon className="h-24 w-24 mx-auto mb-4" /><h2 className="text-2xl font-semibold text-gray-700 dark:text-slate-400">Your debate topic will appear here</h2></div>
            </div>
        )}
      </main>
    </div>
  );
};

export default DebateTopicGenerator;
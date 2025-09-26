
import React, { useState, useCallback, useMemo } from 'react';
import { PresentationChartLineIcon, LoaderIcon, AlertTriangleIcon, SparklesIcon } from '../components/icons';
import { writeSpeech } from '../services/geminiService';
import { VoiceInputButton } from '../components/VoiceInputButton';

const SpeechWriter: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [occasion, setOccasion] = useState('');
  const [duration, setDuration] = useState('5 minute');
  const [speech, setSpeech] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!topic.trim() || !occasion.trim()) {
      setError("Please provide a topic and occasion for the speech.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setSpeech(null);
    try {
      const result = await writeSpeech({ topic, occasion, duration });
      setSpeech(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [topic, occasion, duration]);

  const isGenerateDisabled = useMemo(() => isLoading || !topic.trim() || !occasion.trim(), [isLoading, topic, occasion]);

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center gap-4 mb-4">
        <PresentationChartLineIcon className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Speech Writer</h1>
      </header>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 max-w-4xl">
        Draft structured and impactful speeches for any occasion. Provide the context and let AI create a compelling narrative.
      </p>

      <main className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-0">
        <div className="lg:col-span-1 bg-white/70 dark:bg-gray-950/30 backdrop-blur-md border border-gray-200 dark:border-gray-800/50 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 flex flex-col gap-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Speech Details</h2>
          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">Topic</label>
            <div className="relative">
                <input id="topic" type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., The Future of AI" className="w-full p-2 bg-gray-100 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 rounded-lg pr-12 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500" />
                <div className="absolute inset-y-0 right-0 flex items-center pr-2"><VoiceInputButton onTranscript={setTopic} /></div>
            </div>
          </div>
          <div>
            <label htmlFor="occasion" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">Occasion</label>
            <div className="relative">
                <input id="occasion" type="text" value={occasion} onChange={(e) => setOccasion(e.target.value)} placeholder="e.g., Tech conference keynote, Wedding toast" className="w-full p-2 bg-gray-100 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 rounded-lg pr-12 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500" />
                <div className="absolute inset-y-0 right-0 flex items-center pr-2"><VoiceInputButton onTranscript={setOccasion} /></div>
            </div>
          </div>
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">Desired Duration</label>
            <select id="duration" value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full p-2 bg-gray-100 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500">
              <option>1 minute</option>
              <option>5 minute</option>
              <option>10 minute</option>
              <option>15 minute</option>
            </select>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerateDisabled}
            className="w-full mt-auto py-3 px-6 bg-indigo-600 text-white font-semibold rounded-lg shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/40 hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            {isLoading ? <><LoaderIcon className="h-5 w-5" /> Writing...</> : <><SparklesIcon className="h-5 w-5" /> Write Speech</>}
          </button>
        </div>

        <div className="lg:col-span-2 bg-white/70 dark:bg-gray-950/30 backdrop-blur-md border border-gray-200 dark:border-gray-800/50 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 flex flex-col min-h-0">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Generated Speech</h2>
          <div className="w-full flex-grow bg-gray-50 dark:bg-black/20 rounded-xl p-4 overflow-y-auto border border-gray-200 dark:border-gray-800">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full gap-4"><LoaderIcon className="h-12 w-12 text-indigo-500 dark:text-indigo-400" /><p className="text-indigo-600 dark:text-indigo-300">Drafting your speech...</p></div>
            )}
            {error && !isLoading && (
              <div className="flex items-center justify-center h-full"><div className="text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-4 rounded-lg flex items-center gap-3"><AlertTriangleIcon className="h-8 w-8" /><div><h3 className="font-bold">Error</h3><p className="text-sm">{error}</p></div></div></div>
            )}
            {!isLoading && !error && speech && (
              <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">{speech}</div>
            )}
            {!isLoading && !error && !speech && (
              <div className="flex items-center justify-center h-full text-center text-gray-400 dark:text-gray-600">
                <div><PresentationChartLineIcon className="h-24 w-24 mx-auto mb-4" /><p>Your generated speech will appear here.</p></div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SpeechWriter;

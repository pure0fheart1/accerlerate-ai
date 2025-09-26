
import React, { useState, useCallback, useMemo } from 'react';
import { GiftIcon, LoaderIcon, AlertTriangleIcon, SparklesIcon } from '../components/icons';
import { generateGiftIdeas } from '../services/geminiService';
import { GiftIdea } from '../types';
import { VoiceInputButton } from '../components/VoiceInputButton';

const GiftIdeaGenerator: React.FC = () => {
  const [recipient, setRecipient] = useState('');
  const [age, setAge] = useState('');
  const [interests, setInterests] = useState('');
  const [budget, setBudget] = useState('');
  const [ideas, setIdeas] = useState<GiftIdea[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!recipient.trim() || !interests.trim()) {
      setError("Please describe the recipient and their interests.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setIdeas([]);
    try {
      const result = await generateGiftIdeas({ recipient, age, interests, budget });
      setIdeas(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [recipient, age, interests, budget]);

  const isGenerateDisabled = useMemo(() => isLoading || !recipient.trim() || !interests.trim(), [isLoading, recipient, interests]);

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center gap-4 mb-4">
        <GiftIcon className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100">Gift Idea Generator</h1>
      </header>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-6 max-w-4xl">
        Find the perfect gift for anyone. Describe the person and let AI brainstorm thoughtful ideas for you.
      </p>

      <main className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-0">
        <div className="lg:col-span-1 bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 flex flex-col gap-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100">Gift Details</h2>
          <div>
            <label htmlFor="recipient" className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-2">Who is the gift for?</label>
            <input id="recipient" type="text" value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="e.g., My mom, my best friend" className="w-full p-2 bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:bg-slate-800 transition-all text-gray-900 dark:text-slate-100" />
          </div>
          <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-2">Age (Optional)</label>
            <input id="age" type="text" value={age} onChange={(e) => setAge(e.target.value)} placeholder="e.g., 30s, 5" className="w-full p-2 bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:bg-slate-800 transition-all text-gray-900 dark:text-slate-100" />
          </div>
          <div>
            <label htmlFor="interests" className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-2">Interests</label>
            <div className="relative">
                <textarea id="interests" value={interests} onChange={(e) => setInterests(e.target.value)} placeholder="e.g., Loves gardening, sci-fi movies, and cooking" className="w-full p-2 bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg h-24 resize-none pr-12 focus:ring-2 focus:ring-indigo-500 dark:focus:bg-slate-800 transition-all text-gray-900 dark:text-slate-100" />
                <div className="absolute bottom-2 right-2"><VoiceInputButton onTranscript={(t) => setInterests(current => current + ' ' + t)} /></div>
            </div>
          </div>
          <div>
            <label htmlFor="budget" className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-2">Budget (Optional)</label>
            <input id="budget" type="text" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="e.g., under $50, around $200" className="w-full p-2 bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:bg-slate-800 transition-all text-gray-900 dark:text-slate-100" />
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerateDisabled}
            className="w-full mt-auto py-3 px-6 bg-indigo-600 text-white font-semibold rounded-lg shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/40 hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            {isLoading ? <><LoaderIcon className="h-5 w-5" /> Finding Gifts...</> : <><SparklesIcon className="h-5 w-5" /> Generate Ideas</>}
          </button>
        </div>

        <div className="lg:col-span-2 bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 flex flex-col min-h-0">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100 mb-4">Gift Ideas</h2>
          <div className="w-full flex-grow overflow-y-auto pr-2">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full gap-4"><LoaderIcon className="h-12 w-12 text-indigo-500 dark:text-indigo-400" /><p className="text-indigo-600 dark:text-indigo-300">Brainstorming perfect gifts...</p></div>
            )}
            {error && !isLoading && (
              <div className="flex items-center justify-center h-full"><div className="text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-4 rounded-lg flex items-center gap-3"><AlertTriangleIcon className="h-8 w-8" /><div><h3 className="font-bold">Error</h3><p className="text-sm">{error}</p></div></div></div>
            )}
            {!isLoading && !error && ideas.length > 0 && (
              <div className="space-y-4">
                {ideas.map((idea, i) => (
                  <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700">
                    <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{idea.idea}</h3>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 mb-2">~{idea.estimatedCost}</p>
                    <p className="text-gray-700 dark:text-slate-300">{idea.reason}</p>
                  </div>
                ))}
              </div>
            )}
            {!isLoading && !error && ideas.length === 0 && (
              <div className="flex items-center justify-center h-full text-center text-gray-500 dark:text-slate-500"><GiftIcon className="h-24 w-24 mx-auto mb-4" /><p>Your gift ideas will appear here.</p></div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default GiftIdeaGenerator;
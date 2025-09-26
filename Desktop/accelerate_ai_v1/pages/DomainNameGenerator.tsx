
import React, { useState, useCallback, useMemo } from 'react';
import { AtSymbolIcon, LoaderIcon, AlertTriangleIcon, SparklesIcon } from '../components/icons';
import { generateDomainNames } from '../services/geminiService';
import { DomainSuggestion } from '../types';
import { VoiceInputButton } from '../components/VoiceInputButton';

const DomainNameGenerator: React.FC = () => {
  const [keywords, setKeywords] = useState('');
  const [suggestions, setSuggestions] = useState<DomainSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!keywords.trim()) {
      setError("Please enter some keywords.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuggestions([]);
    try {
      const result = await generateDomainNames(keywords);
      setSuggestions(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [keywords]);

  const isGenerateDisabled = useMemo(() => isLoading || !keywords.trim(), [isLoading, keywords]);

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center gap-4 mb-4">
        <AtSymbolIcon className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Domain Name Generator</h1>
      </header>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 max-w-4xl">
        Generate creative and available domain names for your next project based on keywords.
      </p>
      
      <div className="bg-white/70 dark:bg-gray-950/30 backdrop-blur-md border border-gray-200 dark:border-gray-800/50 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 mb-8 flex flex-col sm:flex-row items-center gap-4">
        <div className="relative w-full flex-grow">
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="e.g., 'sustainable coffee delivery', 'AI-powered gardening'"
            className="w-full p-3 bg-gray-100 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 pr-12 focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-gray-800/60 transition-all"
            aria-label="Keywords for domain names"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <VoiceInputButton onTranscript={setKeywords} />
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

      <main className="flex-grow min-h-0">
        {isLoading && (
            <div className="flex justify-center items-center h-full"><div className="flex flex-col items-center gap-4 text-center"><LoaderIcon className="h-12 w-12 text-indigo-500 dark:text-indigo-400" /><p className="text-indigo-600 dark:text-indigo-300">Searching for domains...</p></div></div>
        )}
        {error && !isLoading && (
            <div className="flex justify-center"><div className="text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-4 rounded-lg flex items-center gap-3 max-w-lg"><AlertTriangleIcon className="h-8 w-8 text-red-500 dark:text-red-400 flex-shrink-0" /><div><h3 className="font-bold">Error</h3><p className="text-sm">{error}</p></div></div></div>
        )}
        {!isLoading && !error && suggestions.length > 0 && (
          <div className="space-y-4">
            {suggestions.map((suggestion, i) => (
              <div key={i} className="bg-white/70 dark:bg-gray-950/30 backdrop-blur-md border border-gray-200 dark:border-gray-800/50 rounded-2xl p-4 shadow-xl dark:shadow-2xl dark:shadow-black/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{suggestion.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{suggestion.reason}</p>
                </div>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${suggestion.available ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}>
                    {suggestion.available ? 'Likely Available' : 'Likely Taken'}
                </span>
              </div>
            ))}
          </div>
        )}
        {!isLoading && !error && suggestions.length === 0 && (
            <div className="flex justify-center items-center h-full text-center text-gray-500 dark:text-gray-600 bg-white/30 dark:bg-gray-950/10 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-800">
                <div><AtSymbolIcon className="h-16 w-16 mx-auto mb-4" /><h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-400">Domain suggestions will appear here</h2></div>
            </div>
        )}
      </main>
    </div>
  );
};

export default DomainNameGenerator;

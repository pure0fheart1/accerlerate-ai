import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { ApiEndpointSuggesterIcon, LoaderIcon, AlertTriangleIcon, SparklesIcon } from '../components/icons';
import { suggestApiEndpoints } from '../services/geminiService';
import { VoiceInputButton } from '../components/VoiceInputButton';

const DESCRIPTION_KEY = 'accelerate-apiendpoint-description';
const OUTPUT_KEY = 'accelerate-apiendpoint-output';

const ApiEndpointSuggester: React.FC = () => {
  const [description, setDescription] = useState(() => localStorage.getItem(DESCRIPTION_KEY) || '');
  const [endpoints, setEndpoints] = useState<string | null>(() => localStorage.getItem(OUTPUT_KEY) || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => { localStorage.setItem(DESCRIPTION_KEY, description); }, [description]);
  useEffect(() => {
    if (endpoints) localStorage.setItem(OUTPUT_KEY, endpoints);
    else localStorage.removeItem(OUTPUT_KEY);
  }, [endpoints]);

  const handleGenerate = useCallback(async () => {
    if (!description.trim()) {
      setError("Please describe your application or data model.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setEndpoints(null);
    try {
      const result = await suggestApiEndpoints(description);
      setEndpoints(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [description]);

  const isGenerateDisabled = useMemo(() => isLoading || !description.trim(), [isLoading, description]);

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center gap-4 mb-4">
        <ApiEndpointSuggesterIcon className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">API Endpoint Suggester</h1>
      </header>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 max-w-4xl">
        Generate RESTful API endpoint designs based on your data models or application description.
      </p>

      <main className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0">
        <div className="bg-white/70 dark:bg-gray-950/30 backdrop-blur-md border border-gray-200 dark:border-gray-800/50 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 flex flex-col">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Application Description</h2>
          <div className="relative w-full flex-grow">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., 'A simple blog application with users, posts, and comments.'"
              className="w-full h-full p-3 bg-gray-100 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 resize-none pr-12 focus:ring-2 focus:ring-indigo-500"
              aria-label="Application description"
            />
            <div className="absolute bottom-3 right-3">
                <VoiceInputButton onTranscript={(t) => setDescription(current => current + ' ' + t)} />
            </div>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerateDisabled}
            className="w-full mt-4 py-3 px-6 bg-indigo-600 text-white font-semibold rounded-lg shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/40 hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            {isLoading ? <><LoaderIcon className="h-5 w-5" /> Suggesting...</> : <><SparklesIcon className="h-5 w-5" /> Suggest Endpoints</>}
          </button>
        </div>

        <div className="bg-white/70 dark:bg-gray-950/30 backdrop-blur-md border border-gray-200 dark:border-gray-800/50 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 flex flex-col min-h-0">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Suggested Endpoints</h2>
          <div className="w-full flex-grow bg-gray-50 dark:bg-black/20 rounded-xl p-4 overflow-y-auto border border-gray-200 dark:border-gray-800">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full gap-4"><LoaderIcon className="h-12 w-12 text-indigo-500 dark:text-indigo-400" /><p className="text-indigo-600 dark:text-indigo-300">Designing your API...</p></div>
            )}
            {error && !isLoading && (
              <div className="flex items-center justify-center h-full"><div className="text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-4 rounded-lg flex items-center gap-3"><AlertTriangleIcon className="h-8 w-8" /><div><h3 className="font-bold">Error</h3><p className="text-sm">{error}</p></div></div></div>
            )}
            {!isLoading && !error && endpoints && (
              <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">{endpoints}</div>
            )}
            {!isLoading && !error && !endpoints && (
              <div className="flex items-center justify-center h-full text-center text-gray-400 dark:text-gray-600">
                <div><ApiEndpointSuggesterIcon className="h-24 w-24 mx-auto mb-4" /><p>Your suggested API endpoints will appear here.</p></div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ApiEndpointSuggester;

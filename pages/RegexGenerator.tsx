
import React, { useState, useCallback, useMemo } from 'react';
import { RegexGeneratorIcon, LoaderIcon, AlertTriangleIcon, SparklesIcon } from '../components/icons';
import { generateRegex } from '../services/geminiService';
import { VoiceInputButton } from '../components/VoiceInputButton';

const RegexGenerator: React.FC = () => {
  const [description, setDescription] = useState('');
  const [regex, setRegex] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!description.trim()) {
      setError("Please describe the pattern you want to match.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setRegex(null);
    try {
      const result = await generateRegex(description);
      setRegex(result);
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
        <RegexGeneratorIcon className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Regex Generator</h1>
      </header>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 max-w-4xl">
        Create complex regular expressions from natural language descriptions.
      </p>

      <main className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-0">
        <div className="lg:col-span-1 bg-white/70 dark:bg-gray-950/30 backdrop-blur-md border border-gray-200 dark:border-gray-800/50 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 flex flex-col gap-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Pattern Description</h2>
          <div className="relative flex-grow">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">Describe what you want to match</label>
            <div className="relative h-full">
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., 'match an email address', 'extract a date in YYYY-MM-DD format'"
                  className="w-full h-full p-2 bg-gray-100 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 rounded-lg resize-none min-h-[12rem] pr-12 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
                <div className="absolute bottom-2 right-2">
                    <VoiceInputButton onTranscript={(t) => setDescription(current => current + ' ' + t)} />
                </div>
            </div>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerateDisabled}
            className="w-full mt-auto py-3 px-6 bg-indigo-600 text-white font-semibold rounded-lg shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/40 hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            {isLoading ? <><LoaderIcon className="h-5 w-5" /> Generating...</> : <><SparklesIcon className="h-5 w-5" /> Generate Regex</>}
          </button>
        </div>

        <div className="lg:col-span-2 bg-white/70 dark:bg-gray-950/30 backdrop-blur-md border border-gray-200 dark:border-gray-800/50 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 flex flex-col min-h-0">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Generated Regex</h2>
          <div className="w-full flex-grow bg-gray-50 dark:bg-black/20 rounded-xl p-4 overflow-y-auto border border-gray-200 dark:border-gray-800">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full gap-4"><LoaderIcon className="h-12 w-12 text-indigo-500 dark:text-indigo-400" /><p className="text-indigo-600 dark:text-indigo-300">Generating pattern...</p></div>
            )}
            {error && !isLoading && (
              <div className="flex items-center justify-center h-full"><div className="text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-4 rounded-lg flex items-center gap-3"><AlertTriangleIcon className="h-8 w-8" /><div><h3 className="font-bold">Error</h3><p className="text-sm">{error}</p></div></div></div>
            )}
            {!isLoading && !error && regex && (
              <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">{regex}</div>
            )}
            {!isLoading && !error && !regex && (
              <div className="flex items-center justify-center h-full text-center text-gray-400 dark:text-gray-600">
                <div><RegexGeneratorIcon className="h-24 w-24 mx-auto mb-4" /><p>Your generated regex and explanation will appear here.</p></div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default RegexGenerator;

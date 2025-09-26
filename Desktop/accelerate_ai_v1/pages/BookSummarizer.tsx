import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { BookSummarizerIcon, LoaderIcon, AlertTriangleIcon, SparklesIcon } from '../components/icons';
import { summarizeBook } from '../services/geminiService';
import { VoiceInputButton } from '../components/VoiceInputButton';

const TITLE_KEY = 'accelerate-booksummarizer-title';
const SUMMARY_KEY = 'accelerate-booksummarizer-output';

const BookSummarizer: React.FC = () => {
  const [title, setTitle] = useState(() => localStorage.getItem(TITLE_KEY) || '');
  const [summary, setSummary] = useState<string | null>(() => localStorage.getItem(SUMMARY_KEY) || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { localStorage.setItem(TITLE_KEY, title); }, [title]);
  useEffect(() => {
    if (summary) localStorage.setItem(SUMMARY_KEY, summary);
    else localStorage.removeItem(SUMMARY_KEY);
  }, [summary]);

  const handleGenerate = useCallback(async () => {
    if (!title.trim()) {
      setError("Please enter a book title.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setSummary(null);
    try {
      const result = await summarizeBook(title);
      setSummary(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [title]);

  const isGenerateDisabled = useMemo(() => isLoading || !title.trim(), [isLoading, title]);

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center gap-4 mb-4">
        <BookSummarizerIcon className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Book Summarizer</h1>
      </header>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 max-w-4xl">
        Get detailed summaries of popular books, including plot points, character analysis, and major themes.
      </p>
      
      <div className="bg-white/70 dark:bg-gray-950/30 backdrop-blur-md border border-gray-200 dark:border-gray-800/50 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 mb-8 flex flex-col sm:flex-row items-center gap-4">
        <div className="relative w-full flex-grow">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., 'Dune' by Frank Herbert, 'To Kill a Mockingbird'"
            className="w-full p-3 bg-gray-100 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 pr-12 focus:ring-2 focus:ring-indigo-500"
            aria-label="Book title"
          />
           <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <VoiceInputButton onTranscript={setTitle} />
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isGenerateDisabled}
          className="w-full sm:w-auto py-3 px-8 bg-indigo-600 text-white font-semibold rounded-lg shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/40 hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2 flex-shrink-0"
        >
          {isLoading ? <><LoaderIcon className="h-5 w-5" /> Summarizing...</> : <><SparklesIcon className="h-5 w-5" /> Summarize Book</>}
        </button>
      </div>

      <main className="flex-grow flex flex-col min-h-0">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Summary</h2>
        <div className="w-full flex-grow bg-white/70 dark:bg-gray-950/30 backdrop-blur-md border border-gray-200 dark:border-gray-800/50 rounded-xl p-4 overflow-y-auto shadow-inner">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <LoaderIcon className="h-12 w-12 text-indigo-500 dark:text-indigo-400" />
                <p className="text-indigo-600 dark:text-indigo-300">Reading the book for you...</p>
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
            {!isLoading && !error && summary && (
              <div className="prose dark:prose-invert max-w-none">{summary}</div>
            )}
            {!isLoading && !error && !summary && (
              <div className="flex items-center justify-center h-full text-center text-gray-400 dark:text-gray-600">
                <div>
                  <BookSummarizerIcon className="h-24 w-24 mx-auto mb-4" />
                  <p>The book summary will appear here.</p>
                </div>
              </div>
            )}
          </div>
      </main>
    </div>
  );
};

export default BookSummarizer;

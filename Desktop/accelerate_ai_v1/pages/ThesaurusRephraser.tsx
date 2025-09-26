import React, { useState, useCallback, useMemo } from 'react';
import { ThesaurusRephraserIcon, LoaderIcon, AlertTriangleIcon, SparklesIcon } from '../components/icons';
import { rephraseText } from '../services/geminiService';
import { VoiceInputButton } from '../components/VoiceInputButton';

const TONES = ["more professional", "more casual", "more confident", "simpler", "more persuasive", "more empathetic"];

const ThesaurusRephraser: React.FC = () => {
  const [originalText, setOriginalText] = useState('');
  const [tone, setTone] = useState('more professional');
  const [rephrasedText, setRephrasedText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!originalText.trim()) {
      setError("Please enter some text to rephrase.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setRephrasedText(null);
    try {
      const result = await rephraseText({ text: originalText, tone });
      setRephrasedText(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [originalText, tone]);

  const isGenerateDisabled = useMemo(() => isLoading || !originalText.trim(), [isLoading, originalText]);

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center gap-4 mb-4">
        <ThesaurusRephraserIcon className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100">Thesaurus & Rephraser</h1>
      </header>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-6 max-w-4xl">
        Refine your writing by rephrasing sentences with a different tone or complexity.
      </p>

      <main className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0">
        <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 flex flex-col">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100 mb-4">Your Text</h2>
          <div className="relative w-full flex-grow">
            <textarea
              value={originalText}
              onChange={(e) => setOriginalText(e.target.value)}
              placeholder="Enter the text you want to improve..."
              className="w-full h-full p-3 bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 resize-none pr-12 focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 transition-all"
              aria-label="Text to rephrase"
            />
            <div className="absolute bottom-3 right-3">
                <VoiceInputButton onTranscript={(t) => setOriginalText(current => (current ? current.trim() + ' ' : '') + t)} />
            </div>
          </div>
          <div className="mt-4">
            <label htmlFor="tone" className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-2">Rephrase to be...</label>
            <select
              id="tone"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full p-2 bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
            >
              {TONES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
            </select>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerateDisabled}
            className="w-full mt-4 py-3 px-6 bg-indigo-600 text-white font-semibold rounded-lg shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/40 hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            {isLoading ? <><LoaderIcon className="h-5 w-5" /> Rephrasing...</> : <><SparklesIcon className="h-5 w-5" /> Rephrase</>}
          </button>
        </div>

        <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 flex flex-col min-h-0">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100 mb-4">Rephrased Text</h2>
          <div className="w-full flex-grow bg-gray-50 dark:bg-slate-900 rounded-xl p-4 overflow-y-auto border border-gray-200 dark:border-slate-700">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <LoaderIcon className="h-12 w-12 text-indigo-500 dark:text-indigo-400" />
                <p className="text-indigo-600 dark:text-indigo-300">Finding the right words...</p>
              </div>
            )}
            {error && !isLoading && (
              <div className="flex items-center justify-center h-full">
                <div className="text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-4 rounded-lg flex items-center gap-3">
                  <AlertTriangleIcon className="h-8 w-8 text-red-500 dark:text-red-400" />
                  <div><h3 className="font-bold">Error</h3><p className="text-sm">{error}</p></div>
                </div>
              </div>
            )}
            {!isLoading && !error && rephrasedText && (
              <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap text-lg">{rephrasedText}</div>
            )}
            {!isLoading && !error && !rephrasedText && (
              <div className="flex items-center justify-center h-full text-center text-gray-500 dark:text-slate-500">
                <div>
                  <ThesaurusRephraserIcon className="h-16 w-16 mx-auto mb-4" />
                  <p>Your improved text will appear here.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
export default ThesaurusRephraser;

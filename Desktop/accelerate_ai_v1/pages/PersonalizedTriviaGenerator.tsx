import React, { useState, useCallback, useMemo } from 'react';
import { PersonalizedTriviaGeneratorIcon, LoaderIcon, AlertTriangleIcon, SparklesIcon } from '../components/icons';
import { generatePersonalizedTrivia } from '../services/geminiService';
import { TriviaQuestion } from '../types';
import { VoiceInputButton } from '../components/VoiceInputButton';

const PersonalizedTriviaGenerator: React.FC = () => {
  const [info, setInfo] = useState('');
  const [trivia, setTrivia] = useState<TriviaQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revealedAnswers, setRevealedAnswers] = useState<Set<number>>(new Set());

  const handleGenerate = useCallback(async () => {
    if (!info.trim()) {
      setError("Please enter a topic or person for the trivia.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setTrivia([]);
    setRevealedAnswers(new Set());
    try {
      const result = await generatePersonalizedTrivia(info);
      setTrivia(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [info]);
  
  const handleToggleAnswer = (index: number) => {
    setRevealedAnswers(prev => {
        const newSet = new Set(prev);
        if (newSet.has(index)) {
            newSet.delete(index);
        } else {
            newSet.add(index);
        }
        return newSet;
    });
  };

  const isGenerateDisabled = useMemo(() => isLoading || !info.trim(), [isLoading, info]);

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center gap-4 mb-4">
        <PersonalizedTriviaGeneratorIcon className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100">Personalized Trivia Generator</h1>
      </header>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-6 max-w-4xl">
        Create a fun trivia quiz about any topic or even a specific person (for birthdays, parties, etc.).
      </p>
      
      <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 mb-8 flex flex-col sm:flex-row items-center gap-4">
        <div className="relative w-full flex-grow">
          <input
            type="text"
            value={info}
            onChange={(e) => setInfo(e.target.value)}
            placeholder="e.g., 'The Harry Potter books', 'My friend John Doe, who loves hiking and is from Texas'"
            className="w-full p-3 bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 pr-12 focus:ring-2 focus:ring-indigo-500"
            aria-label="Trivia topic or person"
          />
           <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <VoiceInputButton onTranscript={setInfo} />
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isGenerateDisabled}
          className="w-full sm:w-auto py-3 px-8 bg-indigo-600 text-white font-semibold rounded-lg shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/40 hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2 flex-shrink-0"
        >
          {isLoading ? <><LoaderIcon className="h-5 w-5" /> Generating...</> : <><SparklesIcon className="h-5 w-5" /> Generate Trivia</>}
        </button>
      </div>

      <main className="flex-grow flex flex-col min-h-0">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-4">Trivia Questions</h2>
        <div className="w-full flex-grow bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-xl p-4 overflow-y-auto shadow-inner">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <LoaderIcon className="h-12 w-12 text-indigo-500 dark:text-indigo-400" />
                <p className="text-indigo-600 dark:text-indigo-300">Coming up with questions...</p>
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
            {!isLoading && !error && trivia.length > 0 && (
              <div className="space-y-4">
                {trivia.map((q, index) => (
                    <div key={index} className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-slate-100 mb-3">{index + 1}. {q.question}</h3>
                        <button onClick={() => handleToggleAnswer(index)} className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                            {revealedAnswers.has(index) ? 'Hide Answer' : 'Show Answer'}
                        </button>
                        {revealedAnswers.has(index) && (
                            <p className="mt-2 p-2 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 rounded-md animate-fadeInUp">
                                {q.answer}
                            </p>
                        )}
                    </div>
                ))}
              </div>
            )}
            {!isLoading && !error && trivia.length === 0 && (
              <div className="flex items-center justify-center h-full text-center text-gray-500 dark:text-slate-500">
                <div>
                  <PersonalizedTriviaGeneratorIcon className="h-24 w-24 mx-auto mb-4" />
                  <p>Your personalized trivia questions will appear here.</p>
                </div>
              </div>
            )}
          </div>
      </main>
    </div>
  );
};

export default PersonalizedTriviaGenerator;

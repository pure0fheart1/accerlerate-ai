import React, { useState, useCallback, useMemo } from 'react';
import { BoardGameIdeaGeneratorIcon, LoaderIcon, AlertTriangleIcon, SparklesIcon } from '../components/icons';
import { generateBoardGameIdea } from '../services/geminiService';
import { BoardGameIdea } from '../types';
import { VoiceInputButton } from '../components/VoiceInputButton';

const BoardGameIdeaGenerator: React.FC = () => {
  const [theme, setTheme] = useState('');
  const [idea, setIdea] = useState<BoardGameIdea | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!theme.trim()) {
      setError("Please provide a theme for the board game.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setIdea(null);
    try {
      const result = await generateBoardGameIdea(theme);
      setIdea(result);
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
        <BoardGameIdeaGeneratorIcon className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100">Board Game Idea Generator</h1>
      </header>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-6 max-w-4xl">
        Brainstorm unique concepts for your next tabletop creation. Enter a theme and get a complete idea with mechanics and a description.
      </p>

      <main className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-0">
        <div className="lg:col-span-1 bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 flex flex-col gap-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100">Game Theme</h2>
          <div className="relative flex-grow">
            <label htmlFor="theme" className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-2">What's your game about?</label>
            <div className="relative h-full">
                <textarea
                  id="theme"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder="e.g., 'Space pirates exploring ancient alien ruins', 'Rival chefs in a fantasy city', 'Building a colony on Mars'"
                  className="w-full h-full p-2 bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg resize-none min-h-[12rem] pr-12 focus:ring-2 focus:ring-indigo-500 dark:focus:bg-slate-800 transition-all text-gray-900 dark:text-slate-100"
                />
                 <div className="absolute bottom-2 right-2">
                    <VoiceInputButton onTranscript={(t) => setTheme(current => current + ' ' + t)} />
                </div>
            </div>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerateDisabled}
            className="w-full mt-auto py-3 px-6 bg-indigo-600 text-white font-semibold rounded-lg shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/40 hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            {isLoading ? <><LoaderIcon className="h-5 w-5" /> Brainstorming...</> : <><SparklesIcon className="h-5 w-5" /> Generate Idea</>}
          </button>
        </div>

        <div className="lg:col-span-2 bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 flex flex-col min-h-0">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100 mb-4">Generated Game Concept</h2>
          <div className="w-full flex-grow bg-gray-50 dark:bg-slate-900 rounded-xl p-4 overflow-y-auto border border-gray-200 dark:border-slate-700">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full gap-4"><LoaderIcon className="h-12 w-12 text-indigo-500 dark:text-indigo-400" /><p className="text-indigo-600 dark:text-indigo-300">Rolling the dice for ideas...</p></div>
            )}
            {error && !isLoading && (
              <div className="flex items-center justify-center h-full"><div className="text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-4 rounded-lg flex items-center gap-3"><AlertTriangleIcon className="h-8 w-8" /><div><h3 className="font-bold">Error</h3><p className="text-sm">{error}</p></div></div></div>
            )}
            {!isLoading && !error && idea && (
              <div className="prose dark:prose-invert max-w-none">
                <h3 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">{idea.title}</h3>
                <p className="lead italic text-gray-600 dark:text-slate-300">{idea.shortDescription}</p>
                 <div className="flex flex-wrap gap-4 mb-6 text-sm not-prose">
                  <span className="bg-gray-200 dark:bg-slate-700 px-3 py-1 rounded-full"><b>Players:</b> {idea.playerCount}</span>
                  <span className="bg-gray-200 dark:bg-slate-700 px-3 py-1 rounded-full"><b>Theme:</b> {idea.theme}</span>
                </div>
                <div>
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-2">Key Mechanics</h4>
                    <ul className="list-disc list-inside">
                        {idea.mechanics.map((mech, i) => <li key={i}>{mech}</li>)}
                    </ul>
                </div>
              </div>
            )}
            {!isLoading && !error && !idea && (
              <div className="flex items-center justify-center h-full text-center text-gray-500 dark:text-slate-500">
                <div><BoardGameIdeaGeneratorIcon className="h-24 w-24 mx-auto mb-4" /><p>Your board game concept will appear here.</p></div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default BoardGameIdeaGenerator;

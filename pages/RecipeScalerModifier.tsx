import React, { useState, useCallback, useMemo } from 'react';
import { RecipeScalerModifierIcon, LoaderIcon, AlertTriangleIcon, SparklesIcon } from '../components/icons';
import { scaleRecipe } from '../services/geminiService';
import { VoiceInputButton } from '../components/VoiceInputButton';

const RecipeScalerModifier: React.FC = () => {
  const [originalRecipe, setOriginalRecipe] = useState('');
  const [modifications, setModifications] = useState('');
  const [modifiedRecipe, setModifiedRecipe] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!originalRecipe.trim() || !modifications.trim()) {
      setError("Please provide the original recipe and the desired modifications.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setModifiedRecipe(null);
    try {
      const result = await scaleRecipe({ recipe: originalRecipe, servings: modifications });
      setModifiedRecipe(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [originalRecipe, modifications]);

  const isGenerateDisabled = useMemo(() => isLoading || !originalRecipe.trim() || !modifications.trim(), [isLoading, originalRecipe, modifications]);

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center gap-4 mb-4">
        <RecipeScalerModifierIcon className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100">Recipe Scaler & Modifier</h1>
      </header>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-6 max-w-4xl">
        Adjust recipes for different serving sizes or dietary needs. Paste a recipe, specify your changes, and get an updated version.
      </p>

      <main className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0">
        <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 flex flex-col gap-4">
          <div>
            <label htmlFor="originalRecipe" className="block text-lg font-semibold text-gray-800 dark:text-slate-200 mb-2">Original Recipe</label>
            <div className="relative h-64">
              <textarea
                id="originalRecipe"
                value={originalRecipe}
                onChange={(e) => setOriginalRecipe(e.target.value)}
                placeholder="Paste the full recipe here, including ingredients and instructions..."
                className="w-full h-full p-3 bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 resize-none pr-12 focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 transition-all"
                aria-label="Original recipe input"
              />
              <div className="absolute bottom-3 right-3">
                <VoiceInputButton onTranscript={(t) => setOriginalRecipe(current => (current ? current.trim() + ' ' : '') + t)} />
              </div>
            </div>
          </div>
          <div className="flex-grow flex flex-col">
            <label htmlFor="modifications" className="block text-lg font-semibold text-gray-800 dark:text-slate-200 mb-2">Changes Needed</label>
            <div className="relative flex-grow">
              <textarea
                id="modifications"
                value={modifications}
                onChange={(e) => setModifications(e.target.value)}
                placeholder="e.g., 'Scale to 8 servings', 'Make it gluten-free', 'Double the recipe and make it vegan'"
                className="w-full h-full p-3 bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 resize-none min-h-[4rem] pr-12 focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 transition-all"
                aria-label="Modifications input"
              />
               <div className="absolute bottom-3 right-3">
                <VoiceInputButton onTranscript={(t) => setModifications(current => (current ? current.trim() + ' ' : '') + t)} />
              </div>
            </div>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerateDisabled}
            className="w-full mt-4 py-3 px-6 bg-indigo-600 text-white font-semibold rounded-lg shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/40 hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            {isLoading ? <><LoaderIcon className="h-5 w-5" /> Modifying...</> : <><SparklesIcon className="h-5 w-5" /> Modify Recipe</>}
          </button>
        </div>

        <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 flex flex-col min-h-0">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100 mb-4">Modified Recipe</h2>
          <div className="w-full flex-grow bg-gray-50 dark:bg-slate-900 rounded-xl p-4 overflow-y-auto border border-gray-200 dark:border-slate-700">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <LoaderIcon className="h-12 w-12 text-indigo-500 dark:text-indigo-400" />
                <p className="text-indigo-600 dark:text-indigo-300">Adjusting your recipe...</p>
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
            {!isLoading && !error && modifiedRecipe && (
              <div className="prose dark:prose-invert max-w-none">{modifiedRecipe}</div>
            )}
            {!isLoading && !error && !modifiedRecipe && (
              <div className="flex items-center justify-center h-full text-center text-gray-500 dark:text-slate-500">
                <div>
                  <RecipeScalerModifierIcon className="h-24 w-24 mx-auto mb-4" />
                  <p>Your modified recipe will appear here.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default RecipeScalerModifier;

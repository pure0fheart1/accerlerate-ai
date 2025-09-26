import React, { useState, useCallback, useMemo } from 'react';
import { CocktailRecipeCreatorIcon, LoaderIcon, AlertTriangleIcon, SparklesIcon } from '../components/icons';
import { createCocktailRecipe } from '../services/geminiService';
import { CocktailRecipe } from '../types';
import { VoiceInputButton } from '../components/VoiceInputButton';

const CocktailRecipeCreator: React.FC = () => {
  const [info, setInfo] = useState('');
  const [recipe, setRecipe] = useState<CocktailRecipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!info.trim()) {
      setError("Please list some ingredients or flavors.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setRecipe(null);
    try {
      const result = await createCocktailRecipe(info);
      setRecipe(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [info]);

  const isGenerateDisabled = useMemo(() => isLoading || !info.trim(), [isLoading, info]);

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center gap-4 mb-4">
        <CocktailRecipeCreatorIcon className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100">Custom Cocktail/Mocktail Recipe Creator</h1>
      </header>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-6 max-w-4xl">
        Become a master mixologist. List ingredients or flavors you like, and AI will create a unique drink recipe for you.
      </p>

      <main className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-0">
        <div className="lg:col-span-1 bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 flex flex-col gap-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100">Ingredients & Flavors</h2>
          <div className="relative flex-grow">
            <label htmlFor="info" className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-2">What do you have or like?</label>
            <div className="relative h-full">
              <textarea
                id="info"
                value={info}
                onChange={(e) => setInfo(e.target.value)}
                placeholder="e.g., 'gin, lime, mint, something spicy', 'a non-alcoholic fruity drink with raspberries'"
                className="w-full h-full p-2 bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg resize-none min-h-[12rem] pr-12 focus:ring-2 focus:ring-indigo-500 dark:focus:bg-slate-800 transition-all text-gray-900 dark:text-slate-100"
              />
              <div className="absolute bottom-2 right-2">
                <VoiceInputButton onTranscript={(t) => setInfo(current => (current ? current + ', ' : '') + t)} />
              </div>
            </div>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerateDisabled}
            className="w-full mt-auto py-3 px-6 bg-indigo-600 text-white font-semibold rounded-lg shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/40 hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            {isLoading ? <><LoaderIcon className="h-5 w-5" /> Mixing...</> : <><SparklesIcon className="h-5 w-5" /> Create Recipe</>}
          </button>
        </div>

        <div className="lg:col-span-2 bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 flex flex-col min-h-0">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100 mb-4">Your Custom Recipe</h2>
          <div className="w-full flex-grow bg-gray-50 dark:bg-slate-900 rounded-xl p-4 overflow-y-auto border border-gray-200 dark:border-slate-700">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full gap-4"><LoaderIcon className="h-12 w-12 text-indigo-500 dark:text-indigo-400" /><p className="text-indigo-600 dark:text-indigo-300">Crafting your drink...</p></div>
            )}
            {error && !isLoading && (
              <div className="flex items-center justify-center h-full"><div className="text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-4 rounded-lg flex items-center gap-3"><AlertTriangleIcon className="h-8 w-8" /><div><h3 className="font-bold">Error</h3><p className="text-sm">{error}</p></div></div></div>
            )}
            {!isLoading && !error && recipe && (
              <div className="prose dark:prose-invert max-w-none">
                <h3 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">{recipe.name}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                    <div>
                        <h4 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-2">Ingredients</h4>
                        <ul>
                            {recipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-2">Instructions</h4>
                        <ol>
                            {recipe.instructions.map((step, i) => <li key={i}>{step}</li>)}
                        </ol>
                        <h4 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mt-4 mb-2">Garnish</h4>
                        <p>{recipe.garnish}</p>
                    </div>
                </div>
              </div>
            )}
            {!isLoading && !error && !recipe && (
              <div className="flex items-center justify-center h-full text-center text-gray-500 dark:text-slate-500">
                <div><CocktailRecipeCreatorIcon className="h-24 w-24 mx-auto mb-4" /><p>Your custom drink recipe will appear here.</p></div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CocktailRecipeCreator;

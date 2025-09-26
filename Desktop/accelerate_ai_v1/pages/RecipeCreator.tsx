import React, { useState, useCallback, useMemo } from 'react';
import { CakeIcon, LoaderIcon, AlertTriangleIcon, SparklesIcon } from '../components/icons';
import { createRecipe } from '../services/geminiService';
import { Recipe } from '../types';
import { VoiceInputButton } from '../components/VoiceInputButton';

const RecipeCreator: React.FC = () => {
  const [ingredients, setIngredients] = useState('');
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!ingredients.trim()) {
      setError("Please list some ingredients.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setRecipe(null);
    try {
      const result = await createRecipe(ingredients);
      setRecipe(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [ingredients]);

  const isGenerateDisabled = useMemo(() => isLoading || !ingredients.trim(), [isLoading, ingredients]);

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center gap-4 mb-4">
        <CakeIcon className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100">Recipe Creator</h1>
      </header>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-6 max-w-4xl">
        Don't know what to cook? List the ingredients you have, and let AI create a delicious recipe for you.
      </p>

      <main className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-0">
        <div className="lg:col-span-1 bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 flex flex-col gap-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100">Your Ingredients</h2>
          <div>
            <label htmlFor="ingredients" className="block text-sm font-medium text-gray-500 dark:text-slate-400 mb-2">List ingredients, separated by commas</label>
            <div className="relative">
                <textarea id="ingredients" value={ingredients} onChange={(e) => setIngredients(e.target.value)} placeholder="e.g., chicken breast, rice, broccoli, soy sauce" className="w-full p-2 bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg h-48 resize-none pr-12 focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-gray-900 dark:text-slate-100" />
                <div className="absolute bottom-2 right-2">
                    <VoiceInputButton onTranscript={(t) => setIngredients(current => current + ', ' + t)} />
                </div>
            </div>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerateDisabled}
            className="w-full mt-auto py-3 px-6 bg-indigo-600 text-white font-semibold rounded-lg shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/40 hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            {isLoading ? <><LoaderIcon className="h-5 w-5" /> Creating...</> : <><SparklesIcon className="h-5 w-5" /> Create Recipe</>}
          </button>
        </div>

        <div className="lg:col-span-2 bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 flex flex-col min-h-0">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100 mb-4">Generated Recipe</h2>
          <div className="w-full flex-grow bg-gray-50 dark:bg-slate-900 rounded-xl p-4 overflow-y-auto border border-gray-200 dark:border-slate-700">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <LoaderIcon className="h-12 w-12 text-indigo-500 dark:text-indigo-400" />
                <p className="text-indigo-600 dark:text-indigo-300">Cooking up a recipe...</p>
              </div>
            )}

            {error && !isLoading && (
              <div className="flex items-center justify-center h-full">
                <div className="text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-4 rounded-lg flex items-center gap-3">
                  <AlertTriangleIcon className="h-8 w-8 text-red-500 dark:text-red-400" />
                  <div>
                    <h3 className="font-bold">Error</h3>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {!isLoading && !error && recipe && (
              <div className="prose dark:prose-invert max-w-none">
                <h3 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">{recipe.title}</h3>
                <p className="text-gray-600 dark:text-slate-300 mb-4 italic">{recipe.description}</p>
                <div className="flex flex-wrap gap-4 mb-6 text-sm not-prose">
                  <span className="bg-gray-200 dark:bg-slate-700 px-3 py-1 rounded-full"><b>Prep:</b> {recipe.prepTime}</span>
                  <span className="bg-gray-200 dark:bg-slate-700 px-3 py-1 rounded-full"><b>Cook:</b> {recipe.cookTime}</span>
                  <span className="bg-gray-200 dark:bg-slate-700 px-3 py-1 rounded-full"><b>Servings:</b> {recipe.servings}</span>
                </div>
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
                    </div>
                </div>
              </div>
            )}
            
            {!isLoading && !error && !recipe && (
              <div className="flex items-center justify-center h-full text-center text-gray-500 dark:text-slate-500">
                <div>
                  <CakeIcon className="h-24 w-24 mx-auto mb-4" />
                  <p>Your delicious recipe will appear here.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default RecipeCreator;
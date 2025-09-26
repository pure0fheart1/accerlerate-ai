import React, { useState, useCallback, useMemo } from 'react';
import { DietaryRecipeIcon, LoaderIcon, AlertTriangleIcon, SparklesIcon } from '../components/icons';
import { findDietaryRecipe } from '../services/geminiService';
import { DietaryRecipe } from '../types';
import { VoiceInputButton } from '../components/VoiceInputButton';

const DietaryRecipeFinder: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [recipe, setRecipe] = useState<DietaryRecipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      setError("Please describe the recipe and dietary needs.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setRecipe(null);
    try {
      const result = await findDietaryRecipe(prompt);
      setRecipe(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [prompt]);

  const isGenerateDisabled = useMemo(() => isLoading || !prompt.trim(), [isLoading, prompt]);

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center gap-4 mb-4">
        <DietaryRecipeIcon className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100">Dietary Recipe Finder</h1>
      </header>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-6 max-w-4xl">
        Find recipes that fit your specific dietary restrictions. Describe what you're looking for, and AI will find or create a suitable recipe.
      </p>

      <main className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-0">
        <div className="lg:col-span-1 bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 flex flex-col gap-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100">Your Request</h2>
          <div className="relative flex-grow">
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-2">Recipe and Dietary Needs</label>
            <div className="relative h-full">
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., 'A gluten-free lasagna recipe', 'Quick vegan breakfast ideas', 'low-fodmap chicken dinner'"
                className="w-full h-full p-2 bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg resize-none min-h-[12rem] pr-12 focus:ring-2 focus:ring-indigo-500 dark:focus:bg-slate-800 transition-all text-gray-900 dark:text-slate-100"
              />
              <div className="absolute bottom-2 right-2">
                <VoiceInputButton onTranscript={(t) => setPrompt(current => (current ? current + ' ' : '') + t)} />
              </div>
            </div>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerateDisabled}
            className="w-full mt-auto py-3 px-6 bg-indigo-600 text-white font-semibold rounded-lg shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/40 hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            {isLoading ? <><LoaderIcon className="h-5 w-5" /> Finding...</> : <><SparklesIcon className="h-5 w-5" /> Find Recipe</>}
          </button>
        </div>

        <div className="lg:col-span-2 bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 flex flex-col min-h-0">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100 mb-4">Generated Recipe</h2>
          <div className="w-full flex-grow bg-gray-50 dark:bg-slate-900 rounded-xl p-4 overflow-y-auto border border-gray-200 dark:border-slate-700">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <LoaderIcon className="h-12 w-12 text-indigo-500 dark:text-indigo-400" />
                <p className="text-indigo-600 dark:text-indigo-300">Finding a delicious recipe for you...</p>
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
                <div className="flex flex-wrap gap-2 mb-6 not-prose">
                  {recipe.dietaryMatch.map((tag, i) => (
                    <span key={i} className="bg-cyan-100 dark:bg-cyan-900/40 text-cyan-800 dark:text-cyan-300 px-3 py-1 rounded-full text-sm font-medium">{tag}</span>
                  ))}
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
                  <DietaryRecipeIcon className="h-24 w-24 mx-auto mb-4" />
                  <p>Your recipe tailored to your needs will appear here.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DietaryRecipeFinder;

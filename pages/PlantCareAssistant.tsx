import React, { useState, useCallback, useMemo } from 'react';
import { PlantCareAssistantIcon, LoaderIcon, AlertTriangleIcon, SparklesIcon } from '../components/icons';
import { getPlantCareAdvice } from '../services/geminiService';
import { VoiceInputButton } from '../components/VoiceInputButton';

const PlantCareAssistant: React.FC = () => {
  const [plant, setPlant] = useState('');
  const [advice, setAdvice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!plant.trim()) {
      setError("Please enter a plant name.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setAdvice(null);
    try {
      const result = await getPlantCareAdvice(plant);
      setAdvice(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [plant]);

  const isGenerateDisabled = useMemo(() => isLoading || !plant.trim(), [isLoading, plant]);

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center gap-4 mb-4">
        <PlantCareAssistantIcon className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100">Plant Care Assistant</h1>
      </header>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-6 max-w-4xl">
        Get personalized care instructions for your houseplants. Enter the name of your plant to learn about its needs.
      </p>
      
      <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 mb-8 flex flex-col sm:flex-row items-center gap-4">
        <div className="relative w-full flex-grow">
          <input
            type="text"
            value={plant}
            onChange={(e) => setPlant(e.target.value)}
            placeholder="e.g., 'Monstera Deliciosa', 'Fiddle Leaf Fig', 'Snake Plant'"
            className="w-full p-3 bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 pr-12 focus:ring-2 focus:ring-indigo-500"
            aria-label="Plant name"
          />
           <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <VoiceInputButton onTranscript={setPlant} />
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isGenerateDisabled}
          className="w-full sm:w-auto py-3 px-8 bg-indigo-600 text-white font-semibold rounded-lg shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/40 hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2 flex-shrink-0"
        >
          {isLoading ? <><LoaderIcon className="h-5 w-5" /> Researching...</> : <><SparklesIcon className="h-5 w-5" /> Get Care Info</>}
        </button>
      </div>

      <main className="flex-grow flex flex-col min-h-0">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-4">Care Instructions</h2>
        <div className="w-full flex-grow bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-xl p-4 overflow-y-auto shadow-inner">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <LoaderIcon className="h-12 w-12 text-indigo-500 dark:text-indigo-400" />
                <p className="text-indigo-600 dark:text-indigo-300">Looking up plant care tips...</p>
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
            {!isLoading && !error && advice && (
              <div className="prose dark:prose-invert max-w-none">{advice}</div>
            )}
            {!isLoading && !error && !advice && (
              <div className="flex items-center justify-center h-full text-center text-gray-500 dark:text-slate-500">
                <div>
                  <PlantCareAssistantIcon className="h-24 w-24 mx-auto mb-4" />
                  <p>Your plant care instructions will appear here.</p>
                </div>
              </div>
            )}
          </div>
      </main>
    </div>
  );
};

export default PlantCareAssistant;

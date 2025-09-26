
import React, { useState, useCallback, useMemo } from 'react';
import { ColorPaletteGeneratorIcon, LoaderIcon, AlertTriangleIcon, SparklesIcon, CopyIcon } from '../components/icons';
import { generateColorPalette } from '../services/geminiService';
import { ColorPalette } from '../types';
import { VoiceInputButton } from '../components/VoiceInputButton';

const ColorPaletteGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [palette, setPalette] = useState<ColorPalette | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      setError("Please enter a theme or description.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setPalette(null);
    try {
      const result = await generateColorPalette(prompt);
      setPalette(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [prompt]);

  const handleCopy = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const isGenerateDisabled = useMemo(() => isLoading || !prompt.trim(), [isLoading, prompt]);

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center gap-4 mb-4">
        <ColorPaletteGeneratorIcon className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100">Color Palette Generator</h1>
      </header>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-6 max-w-4xl">
        Generate beautiful, harmonious color palettes from a text description. Perfect for designers, developers, and artists.
      </p>
      
      <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 mb-8 flex flex-col sm:flex-row items-center gap-4">
        <div className="relative w-full flex-grow">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., 'Calm coastal morning', 'Cyberpunk city at night', 'Autumn forest'"
            className="w-full p-3 bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-slate-100 pr-12"
            aria-label="Color palette theme input"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <VoiceInputButton onTranscript={(t) => setPrompt(current => current + ' ' + t)} />
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isGenerateDisabled}
          className="w-full sm:w-auto py-3 px-8 bg-indigo-600 text-white font-semibold rounded-lg shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/40 hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2 flex-shrink-0"
        >
          {isLoading ? <><LoaderIcon className="h-5 w-5" /> Generating...</> : <><SparklesIcon className="h-5 w-5" /> Generate</>}
        </button>
      </div>

      <main className="flex-grow">
        {isLoading && (
          <div className="flex justify-center items-center h-full">
            <div className="flex flex-col items-center gap-4 text-center">
              <LoaderIcon className="h-12 w-12 text-indigo-500 dark:text-indigo-400" />
              <p className="text-indigo-600 dark:text-indigo-300">Mixing your colors...</p>
            </div>
          </div>
        )}

        {error && !isLoading && (
          <div className="flex justify-center items-center h-full">
            <div className="text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-4 rounded-lg flex items-center gap-3 max-w-lg">
              <AlertTriangleIcon className="h-8 w-8 text-red-500 dark:text-red-400 flex-shrink-0" />
              <div><h3 className="font-bold">Error</h3><p className="text-sm">{error}</p></div>
            </div>
          </div>
        )}

        {!isLoading && !error && palette && (
          <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20">
            <h2 className="text-2xl font-bold text-center text-indigo-600 dark:text-indigo-400 mb-6">{palette.name}</h2>
            <div className="flex flex-col sm:flex-row h-64 rounded-lg overflow-hidden">
                {palette.hexCodes.map((hex, index) => (
                    <div key={index} style={{ backgroundColor: hex }} className="flex-1 flex flex-col justify-end items-center p-4 text-white text-shadow-lg group" >
                        <button onClick={() => handleCopy(hex)} className="bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-mono flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {copiedHex === hex ? 'Copied!' : hex}
                            {copiedHex !== hex && <CopyIcon className="h-4 w-4" />}
                        </button>
                    </div>
                ))}
            </div>
          </div>
        )}

        {!isLoading && !error && !palette && (
          <div className="flex justify-center items-center h-full text-center text-gray-500 dark:text-slate-500 bg-white/30 dark:bg-slate-800/10 rounded-2xl border-2 border-dashed border-gray-300 dark:border-slate-700">
            <div>
              <ColorPaletteGeneratorIcon className="h-16 w-16 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-700 dark:text-slate-400">Your color palette will appear here</h2>
              <p className="mt-1">Enter a theme above to get started!</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ColorPaletteGenerator;
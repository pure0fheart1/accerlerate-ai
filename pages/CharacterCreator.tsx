import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { FaceSmileIcon, LoaderIcon, AlertTriangleIcon, SparklesIcon } from '../components/icons';
import { createCharacter } from '../services/geminiService';
import { CharacterProfile } from '../types';
import { VoiceInputButton } from '../components/VoiceInputButton';

const DESCRIPTION_KEY = 'accelerate-charactercreator-description';
const OUTPUT_KEY = 'accelerate-charactercreator-output';

const CharacterCreator: React.FC = () => {
  const [description, setDescription] = useState(() => localStorage.getItem(DESCRIPTION_KEY) || '');
  const [character, setCharacter] = useState<CharacterProfile | null>(() => {
    try {
      const stored = localStorage.getItem(OUTPUT_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { localStorage.setItem(DESCRIPTION_KEY, description); }, [description]);
  useEffect(() => {
    if (character) localStorage.setItem(OUTPUT_KEY, JSON.stringify(character));
    else localStorage.removeItem(OUTPUT_KEY);
  }, [character]);

  const handleGenerate = useCallback(async () => {
    if (!description.trim()) {
      setError("Please provide a character description.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setCharacter(null);
    try {
      const result = await createCharacter(description);
      setCharacter(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [description]);

  const isGenerateDisabled = useMemo(() => isLoading || !description.trim(), [isLoading, description]);

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center gap-4 mb-4">
        <FaceSmileIcon className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100">Character Creator</h1>
      </header>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-6 max-w-4xl">
        Flesh out your characters for stories, games, or role-playing. Provide a basic concept and let AI build a detailed profile.
      </p>

      <main className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-0">
        <div className="lg:col-span-1 bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 flex flex-col gap-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100">Character Concept</h2>
          <div className="relative flex-grow">
            <label htmlFor="description" className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-2">Describe your character</label>
            <div className="relative h-full">
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., A grizzled space pirate with a secret heart of gold, a young sorceress who can talk to plants"
                  className="w-full h-full p-2 bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg resize-none pr-12 focus:ring-2 focus:ring-indigo-500 dark:focus:bg-slate-800 transition-all text-gray-900 dark:text-slate-100"
                />
                 <div className="absolute bottom-2 right-2">
                    <VoiceInputButton onTranscript={(t) => setDescription(current => current + ' ' + t)} />
                </div>
            </div>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerateDisabled}
            className="w-full mt-auto py-3 px-6 bg-indigo-600 text-white font-semibold rounded-lg shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/40 hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            {isLoading ? <><LoaderIcon className="h-5 w-5" /> Creating...</> : <><SparklesIcon className="h-5 w-5" /> Create Character</>}
          </button>
        </div>

        <div className="lg:col-span-2 bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 flex flex-col min-h-0">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100 mb-4">Generated Profile</h2>
          <div className="w-full flex-grow bg-gray-50 dark:bg-slate-900 rounded-xl p-4 overflow-y-auto border border-gray-200 dark:border-slate-700">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <LoaderIcon className="h-12 w-12 text-indigo-500 dark:text-indigo-400" />
                <p className="text-indigo-600 dark:text-indigo-300">Bringing your character to life...</p>
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
            {!isLoading && !error && character && (
              <div className="prose dark:prose-invert max-w-none space-y-4">
                <h3 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">{character.name}, Age {character.age}</h3>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-slate-100">Appearance</h4>
                  <p>{character.appearance}</p>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-slate-100">Personality</h4>
                  <p>{character.personality}</p>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-slate-100">Backstory</h4>
                  <p>{character.backstory}</p>
                </div>
              </div>
            )}
            {!isLoading && !error && !character && (
              <div className="flex items-center justify-center h-full text-center text-gray-500 dark:text-slate-500">
                <div>
                  <FaceSmileIcon className="h-24 w-24 mx-auto mb-4" />
                  <p>Your generated character profile will appear here.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CharacterCreator;

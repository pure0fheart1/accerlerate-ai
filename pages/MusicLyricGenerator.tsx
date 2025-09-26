
import React, { useState, useCallback, useMemo } from 'react';
import { MusicalNoteIcon, LoaderIcon, AlertTriangleIcon, SparklesIcon } from '../components/icons';
import { generateLyrics } from '../services/geminiService';
import { VoiceInputButton } from '../components/VoiceInputButton';

const MusicLyricGenerator: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [genre, setGenre] = useState('Pop');
  const [mood, setMood] = useState('Happy');
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!topic.trim()) {
      setError("Please provide a topic for the lyrics.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setLyrics(null);
    try {
      const result = await generateLyrics({ topic, genre, mood });
      setLyrics(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [topic, genre, mood]);

  const isGenerateDisabled = useMemo(() => isLoading || !topic.trim(), [isLoading, topic]);

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center gap-4 mb-4">
        <MusicalNoteIcon className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Music Lyric Generator</h1>
      </header>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 max-w-4xl">
        Create original song lyrics based on a topic, genre, and mood.
      </p>

      <main className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-0">
        <div className="lg:col-span-1 bg-white/70 dark:bg-gray-950/30 backdrop-blur-md border border-gray-200 dark:border-gray-800/50 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 flex flex-col gap-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Song Details</h2>
          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">Topic</label>
             <div className="relative">
                <input id="topic" type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., A road trip with friends" className="w-full p-2 bg-gray-100 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 rounded-lg pr-12 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500" />
                <div className="absolute inset-y-0 right-0 flex items-center pr-2"><VoiceInputButton onTranscript={setTopic} /></div>
            </div>
          </div>
          <div>
            <label htmlFor="genre" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">Genre</label>
            <select id="genre" value={genre} onChange={(e) => setGenre(e.target.value)} className="w-full p-2 bg-gray-100 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500">
              {['Pop', 'Rock', 'Hip-Hop', 'Country', 'Electronic', 'Folk', 'R&B'].map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="mood" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">Mood</label>
            <select id="mood" value={mood} onChange={(e) => setMood(e.target.value)} className="w-full p-2 bg-gray-100 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500">
              {['Happy', 'Sad', 'Energetic', 'Calm', 'Romantic', 'Angry', 'Hopeful'].map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerateDisabled}
            className="w-full mt-auto py-3 px-6 bg-indigo-600 text-white font-semibold rounded-lg shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/40 hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            {isLoading ? <><LoaderIcon className="h-5 w-5" /> Writing...</> : <><SparklesIcon className="h-5 w-5" /> Generate Lyrics</>}
          </button>
        </div>

        <div className="lg:col-span-2 bg-white/70 dark:bg-gray-950/30 backdrop-blur-md border border-gray-200 dark:border-gray-800/50 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 flex flex-col min-h-0">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Generated Lyrics</h2>
          <div className="w-full flex-grow bg-gray-50 dark:bg-black/20 rounded-xl p-4 overflow-y-auto border border-gray-200 dark:border-gray-800">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full gap-4"><LoaderIcon className="h-12 w-12 text-indigo-500 dark:text-indigo-400" /><p className="text-indigo-600 dark:text-indigo-300">Writing your song...</p></div>
            )}
            {error && !isLoading && (
              <div className="flex items-center justify-center h-full"><div className="text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-4 rounded-lg flex items-center gap-3"><AlertTriangleIcon className="h-8 w-8" /><div><h3 className="font-bold">Error</h3><p className="text-sm">{error}</p></div></div></div>
            )}
            {!isLoading && !error && lyrics && (
              <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">{lyrics}</div>
            )}
            {!isLoading && !error && !lyrics && (
              <div className="flex items-center justify-center h-full text-center text-gray-400 dark:text-gray-600">
                <div><MusicalNoteIcon className="h-24 w-24 mx-auto mb-4" /><p>Your generated lyrics will appear here.</p></div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MusicLyricGenerator;

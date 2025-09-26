import React, { useState, useCallback, useMemo } from 'react';
import { VideoCameraIcon, LoaderIcon, AlertTriangleIcon, SparklesIcon } from '../components/icons';
import { generateVideoIdeas } from '../services/geminiService';
import { VideoIdea } from '../types';
import { VoiceInputButton } from '../components/VoiceInputButton';

const VideoIdeator: React.FC = () => {
    const [topic, setTopic] = useState('');
    const [ideas, setIdeas] = useState<VideoIdea[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = useCallback(async () => {
        if (!topic.trim()) {
            setError("Please enter a topic to generate ideas.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setIdeas([]);
        try {
            const result = await generateVideoIdeas(topic);
            if (Array.isArray(result)) {
                 setIdeas(result);
            } else {
                throw new Error("The AI returned an unexpected data format.");
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [topic]);

    const isGenerateDisabled = useMemo(() => isLoading || !topic.trim(), [isLoading, topic]);

    return (
        <div className="h-full flex flex-col">
            <header className="flex items-center gap-4 mb-4">
                <VideoCameraIcon className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
                <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100">Viral Video Idea Generator</h1>
            </header>
            <p className="text-lg text-gray-600 dark:text-slate-400 mb-6 max-w-4xl">
                Never run out of ideas. Enter a topic and get unique, viral-ready video concepts for VEO, complete with hooks, visuals, and more.
            </p>
            
            <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 mb-8 flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-full flex-grow">
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g., 'Space exploration', 'Healthy breakfast recipes', 'DIY home decor'"
                        className="w-full p-3 bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 transition-all duration-200 pr-12"
                        aria-label="Video topic input"
                    />
                     <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <VoiceInputButton onTranscript={(transcript) => setTopic(p => (p ? p.trim() + ' ' : '') + transcript)} />
                    </div>
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={isGenerateDisabled}
                    className="w-full sm:w-auto py-3 px-8 bg-indigo-600 text-white font-semibold rounded-lg shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/40 hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2 flex-shrink-0"
                >
                    {isLoading ? (
                        <>
                            <LoaderIcon className="h-5 w-5" />
                            <span>Generating...</span>
                        </>
                    ) : (
                        <><SparklesIcon className="h-5 w-5"/><span>Generate Ideas</span></>
                    )}
                </button>
            </div>

            <main className="flex-grow min-h-0">
                {isLoading && (
                    <div className="flex justify-center items-center h-full">
                        <div className="flex flex-col items-center gap-4 text-center">
                            <LoaderIcon className="h-12 w-12 text-indigo-500 dark:text-indigo-400" />
                            <p className="text-indigo-600 dark:text-indigo-300">Brainstorming viral ideas...</p>
                        </div>
                    </div>
                )}

                {error && !isLoading && (
                    <div className="flex justify-center items-center h-full">
                        <div className="text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-4 rounded-lg flex items-center gap-3 max-w-lg">
                            <AlertTriangleIcon className="h-8 w-8 text-red-500 dark:text-red-400 flex-shrink-0" />
                            <div>
                                <h3 className="font-bold">Error Generating Ideas</h3>
                                <p className="text-sm">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {!isLoading && !error && ideas.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {ideas.map((idea, index) => (
                            <div key={index} className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 flex flex-col gap-4 transform transition-all duration-300 hover:-translate-y-2 hover:border-indigo-500/50">
                                <h2 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{idea.title}</h2>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-1">Hook (First 3s):</h3>
                                    <p className="text-gray-700 dark:text-slate-300 italic">"{idea.hook}"</p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-1">Concept:</h3>
                                    <p className="text-gray-600 dark:text-slate-400">{idea.concept}</p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-1">Visuals:</h3>
                                    <p className="text-gray-600 dark:text-slate-400">{idea.visuals}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!isLoading && !error && ideas.length === 0 && (
                    <div className="flex justify-center items-center h-full text-center text-gray-500 dark:text-slate-500 bg-gray-100/50 dark:bg-slate-800/10 rounded-2xl border-2 border-dashed border-gray-300 dark:border-slate-700">
                        <div>
                            <VideoCameraIcon className="h-24 w-24 mx-auto mb-4" />
                            <h2 className="text-2xl font-semibold text-gray-700 dark:text-slate-400">Your video ideas will appear here</h2>
                            <p className="mt-1">Enter a topic above and let the AI work its magic!</p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default VideoIdeator;
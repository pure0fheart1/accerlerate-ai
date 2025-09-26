import React, { useState, useCallback, useMemo } from 'react';
import { WandIcon, LoaderIcon, AlertTriangleIcon, CopyIcon, SendIcon, DocumentCheckIcon } from '../components/icons';
import { polishPrompt } from '../services/geminiService';
import { Page } from '../App';
import { VoiceInputButton } from '../components/VoiceInputButton';
import { LibraryPrompt } from '../types';

interface PromptPolisherProps {
    setActivePage: (page: Page) => void;
    setSharedPrompt: (prompt: string) => void;
}

const PROMPT_LIBRARY_KEY = 'accelerate-prompt-library';

const PromptPolisher: React.FC<PromptPolisherProps> = ({ setActivePage, setSharedPrompt }) => {
    const [originalPrompt, setOriginalPrompt] = useState<string>('');
    const [polishedPrompt, setPolishedPrompt] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [copySuccess, setCopySuccess] = useState<boolean>(false);
    const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

    const handlePolish = useCallback(async () => {
        if (!originalPrompt.trim()) {
            setError("Please enter a prompt to polish.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setPolishedPrompt(null);
        try {
            const result = await polishPrompt(originalPrompt);
            setPolishedPrompt(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [originalPrompt]);

    const handleCopy = () => {
        if (polishedPrompt) {
            navigator.clipboard.writeText(polishedPrompt);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        }
    };

    const handleSendToGenerator = () => {
        if (polishedPrompt) {
            setSharedPrompt(polishedPrompt);
            setActivePage('generator');
        }
    };
    
    const handleSaveToLibrary = () => {
        if (!polishedPrompt) return;

        try {
            const storedPromptsRaw = localStorage.getItem(PROMPT_LIBRARY_KEY);
            const currentPrompts: LibraryPrompt[] = storedPromptsRaw ? JSON.parse(storedPromptsRaw) : [];
            
            const newPrompt: LibraryPrompt = {
                id: Date.now(),
                prompt: polishedPrompt,
                category: 'Polished',
                style: 'AI Enhanced',
                imageUrl: `https://picsum.photos/seed/${Date.now()}/500/500`
            };
            
            const updatedPrompts = [newPrompt, ...currentPrompts];
            localStorage.setItem(PROMPT_LIBRARY_KEY, JSON.stringify(updatedPrompts));
            
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 2000);

        } catch (e) {
            console.error("Failed to save prompt to library", e);
            setError("Could not save prompt to library. It might be corrupted.");
        }
    };

    const isPolishDisabled = useMemo(() => isLoading || !originalPrompt.trim(), [isLoading, originalPrompt]);

    return (
        <div className="h-full flex flex-col">
            <header className="flex items-center gap-4 mb-4">
                <WandIcon className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
                <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100">Prompt Polisher</h1>
            </header>
            <p className="text-lg text-gray-600 dark:text-slate-400 mb-6 max-w-4xl">
                Refine your ideas into brilliant, detailed prompts. Enter a basic concept, and let AI enhance it with rich details to get stunning results from the image generator.
            </p>

            <main className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0">
                {/* Input Column */}
                <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 flex flex-col">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100 mb-4">Your Idea</h2>
                    <div className="relative w-full flex-grow">
                        <textarea
                            value={originalPrompt}
                            onChange={(e) => setOriginalPrompt(e.target.value)}
                            placeholder="e.g., 'a cat in space'"
                            className="w-full h-full p-3 bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 transition-all duration-200 resize-none pr-12"
                            aria-label="Original prompt input"
                        />
                         <div className="absolute bottom-3 right-3">
                            <VoiceInputButton onTranscript={(transcript) => setOriginalPrompt(p => (p ? p.trim() + ' ' : '') + transcript)} />
                        </div>
                    </div>
                    <button
                        onClick={handlePolish}
                        disabled={isPolishDisabled}
                        className="w-full mt-4 py-3 px-6 bg-indigo-600 text-white font-semibold rounded-lg shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/40 hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2"
                        aria-label="Polish prompt"
                    >
                        {isLoading ? (
                            <>
                                <LoaderIcon className="h-5 w-5" />
                                Polishing...
                            </>
                        ) : (
                            <>
                                <WandIcon className="h-5 w-5" />
                                Polish Prompt
                            </>
                        )}
                    </button>
                </div>

                {/* Output Column */}
                <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 flex flex-col">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100 mb-4">Polished Prompt</h2>
                    <div className="w-full flex-grow flex flex-col justify-center items-center bg-gray-50 dark:bg-slate-900 rounded-xl p-4 min-h-[15rem] border border-gray-200 dark:border-slate-700">
                        {isLoading && (
                            <div className="flex flex-col items-center gap-4 text-center">
                                <LoaderIcon className="h-12 w-12 text-indigo-500 dark:text-indigo-400" />
                                <p className="text-indigo-600 dark:text-indigo-300">AI is working its magic...</p>
                            </div>
                        )}

                        {error && !isLoading && (
                            <div className="text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-4 rounded-lg flex items-center gap-3 w-full">
                                <AlertTriangleIcon className="h-8 w-8 text-red-500 dark:text-red-400 flex-shrink-0" />
                                <div>
                                    <h3 className="font-bold">Error</h3>
                                    <p className="text-sm">{error}</p>
                                </div>
                            </div>
                        )}

                        {!isLoading && !error && polishedPrompt && (
                            <div className="w-full h-full flex flex-col">
                                <div className="prose dark:prose-invert max-w-none flex-grow">
                                    <p>{polishedPrompt}</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-3 mt-4">
                                    <button 
                                        onClick={handleCopy}
                                        className="py-2 px-4 bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-slate-100 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <CopyIcon className="h-5 w-5" />
                                        {copySuccess ? 'Copied!' : 'Copy'}
                                    </button>
                                    <button 
                                        onClick={handleSaveToLibrary}
                                        className="py-2 px-4 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <DocumentCheckIcon className="h-5 w-5" />
                                        {saveSuccess ? 'Saved!' : 'Save'}
                                    </button>
                                    <button 
                                        onClick={handleSendToGenerator}
                                        className="py-2 px-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-500 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <SendIcon className="h-5 w-5" />
                                        Use Prompt
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        {!isLoading && !error && !polishedPrompt && (
                             <div className="text-center text-gray-500 dark:text-slate-500">
                                <WandIcon className="h-16 w-16 mx-auto mb-4" />
                                <p>Your enhanced prompt will appear here.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PromptPolisher;

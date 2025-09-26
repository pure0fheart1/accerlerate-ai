import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { 
    DocumentTextIcon, LoaderIcon, AlertTriangleIcon, SummarizeIcon, KeyPointsIcon
} from '../components/icons';
import { processNotes } from '../services/geminiService';
import { VoiceInputButton } from '../components/VoiceInputButton';

const INPUT_KEY = 'accelerate-autonotes-input';
const OUTPUT_KEY = 'accelerate-autonotes-output';

interface AutonotesProps {
    sharedNoteContent: string | null;
    setSharedNoteContent: (content: string | null) => void;
}

const Autonotes: React.FC<AutonotesProps> = ({ sharedNoteContent, setSharedNoteContent }) => {
    const [inputText, setInputText] = useState(() => localStorage.getItem(INPUT_KEY) || '');
    const [processedText, setProcessedText] = useState<string | null>(() => localStorage.getItem(OUTPUT_KEY) || null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [currentMode, setCurrentMode] = useState<'summarize' | 'extract' | null>(null);

    useEffect(() => {
        if (sharedNoteContent) {
            setInputText(sharedNoteContent);
            setProcessedText(null); // Clear previous results
            setSharedNoteContent(null); // Consume the shared content
        }
    }, [sharedNoteContent, setSharedNoteContent]);

    useEffect(() => {
        localStorage.setItem(INPUT_KEY, inputText);
    }, [inputText]);

    useEffect(() => {
        if (processedText) {
            localStorage.setItem(OUTPUT_KEY, processedText);
        } else {
            localStorage.removeItem(OUTPUT_KEY);
        }
    }, [processedText]);

    const handleProcess = useCallback(async (mode: 'summarize' | 'extract') => {
        if (!inputText.trim()) {
            setError("Please enter some text to process.");
            return;
        }
        setIsLoading(true);
        setCurrentMode(mode);
        setError(null);
        setProcessedText(null);

        try {
            const result = await processNotes(inputText, mode);
            setProcessedText(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [inputText]);
    
    const isProcessDisabled = useMemo(() => isLoading || !inputText.trim(), [isLoading, inputText]);

    return (
        <div className="h-full flex flex-col">
            <header className="flex items-center gap-4 mb-4">
                <DocumentTextIcon className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
                <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100">Autonotes</h1>
            </header>
            <p className="text-lg text-gray-600 dark:text-slate-400 mb-6 max-w-4xl">
                Instantly summarize articles or extract key points from your notes. Paste your text below and let AI do the heavy lifting.
            </p>

            <main className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0">
                {/* Input Column */}
                <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 flex flex-col">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100 mb-4">Your Text</h2>
                    <div className="relative w-full flex-grow">
                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Paste your notes, article, or any text here..."
                            className="w-full h-full p-3 bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 transition-all duration-200 resize-none pr-12"
                            aria-label="Text input for Autonotes"
                        />
                         <div className="absolute bottom-3 right-3">
                            <VoiceInputButton onTranscript={(transcript) => setInputText(p => (p ? p.trim() + ' ' : '') + transcript)} />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        <button
                            onClick={() => handleProcess('summarize')}
                            disabled={isProcessDisabled}
                            className="w-full py-3 px-6 bg-indigo-600 text-white font-semibold rounded-lg shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/40 hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2"
                        >
                            {isLoading && currentMode === 'summarize' ? <LoaderIcon className="h-5 w-5" /> : <SummarizeIcon className="h-5 w-5" />}
                            <span>{isLoading && currentMode === 'summarize' ? 'Summarizing...' : 'Summarize'}</span>
                        </button>
                        <button
                            onClick={() => handleProcess('extract')}
                            disabled={isProcessDisabled}
                            className="w-full py-3 px-6 bg-cyan-600 text-white font-semibold rounded-lg shadow-md shadow-cyan-500/20 hover:shadow-lg hover:shadow-cyan-500/40 hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2"
                        >
                            {isLoading && currentMode === 'extract' ? <LoaderIcon className="h-5 w-5" /> : <KeyPointsIcon className="h-5 w-5" />}
                            <span>{isLoading && currentMode === 'extract' ? 'Extracting...' : 'Extract Key Points'}</span>
                        </button>
                    </div>
                </div>

                {/* Output Column */}
                <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 flex flex-col">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100 mb-4">Result</h2>
                    <div className="w-full flex-grow flex flex-col justify-center items-center bg-gray-50 dark:bg-slate-900 rounded-xl p-4 min-h-[15rem] border border-gray-200 dark:border-slate-700">
                        {isLoading && (
                            <div className="flex flex-col items-center gap-4 text-center">
                                <LoaderIcon className="h-12 w-12 text-indigo-500 dark:text-indigo-400" />
                                <p className="text-indigo-600 dark:text-indigo-300">AI is analyzing your notes...</p>
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

                        {!isLoading && !error && processedText && (
                            <div className="w-full h-full prose dark:prose-invert max-w-none">
                                <p>{processedText}</p>
                            </div>
                        )}
                        
                        {!isLoading && !error && !processedText && (
                             <div className="text-center text-gray-500 dark:text-slate-500">
                                <DocumentTextIcon className="h-16 w-16 mx-auto mb-4" />
                                <p>Your processed text will appear here.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Autonotes;

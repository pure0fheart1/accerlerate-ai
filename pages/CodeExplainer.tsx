import React, { useState, useCallback, useMemo } from 'react';
import { CodeBracketIcon, LoaderIcon, AlertTriangleIcon, SparklesIcon } from '../components/icons';
import { explainCode } from '../services/geminiService';
import { VoiceInputButton } from '../components/VoiceInputButton';

const LANGUAGES = [
    "JavaScript", "Python", "Java", "C++", "C#", "TypeScript", "PHP", "Swift", "Go", "Ruby", "Rust", "SQL", "HTML", "CSS"
];

const CodeExplainer: React.FC = () => {
    const [codeSnippet, setCodeSnippet] = useState('');
    const [language, setLanguage] = useState('JavaScript');
    const [explanation, setExplanation] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleExplain = useCallback(async () => {
        if (!codeSnippet.trim()) {
            setError("Please enter some code to explain.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setExplanation(null);
        try {
            const result = await explainCode(codeSnippet, language);
            setExplanation(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [codeSnippet, language]);

    const isExplainDisabled = useMemo(() => isLoading || !codeSnippet.trim(), [isLoading, codeSnippet]);

    return (
        <div className="h-full flex flex-col">
            <header className="flex items-center gap-4 mb-4">
                <CodeBracketIcon className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
                <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100">Code Explainer</h1>
            </header>
            <p className="text-lg text-gray-600 dark:text-slate-400 mb-6 max-w-4xl">
                Demystify complex code. Paste any snippet, select the language, and get a clear, step-by-step explanation of what it does.
            </p>

            <main className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0">
                {/* Input Column */}
                <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100">Your Code</h2>
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-slate-100 py-2 px-3 focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 transition-all duration-200"
                        >
                            {LANGUAGES.map(lang => <option key={lang} value={lang} className="bg-white dark:bg-slate-900">{lang}</option>)}
                        </select>
                    </div>
                    <div className="relative w-full flex-grow">
                        <textarea
                            value={codeSnippet}
                            onChange={(e) => setCodeSnippet(e.target.value)}
                            placeholder={`// Paste your ${language} code here...`}
                            className="w-full h-full p-3 bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 transition-all duration-200 resize-none font-mono text-sm pr-12"
                            aria-label="Code snippet input"
                            spellCheck="false"
                        />
                         <div className="absolute top-3 right-3">
                            <VoiceInputButton onTranscript={(transcript) => setCodeSnippet(p => p + transcript)} />
                        </div>
                    </div>
                    <button
                        onClick={handleExplain}
                        disabled={isExplainDisabled}
                        className="w-full mt-4 py-3 px-6 bg-indigo-600 text-white font-semibold rounded-lg shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/40 hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2"
                        aria-label="Explain code"
                    >
                        {isLoading ? (
                            <><LoaderIcon className="h-5 w-5" /> Explaining...</>
                        ) : (
                            <><SparklesIcon className="h-5 w-5" /> Explain Code</>
                        )}
                    </button>
                </div>

                {/* Output Column */}
                <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 flex flex-col min-h-0">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100 mb-4">Explanation</h2>
                    <div className="w-full flex-grow bg-gray-50 dark:bg-slate-900 rounded-xl p-4 overflow-y-auto border border-gray-200 dark:border-slate-700">
                        {isLoading && (
                            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                                <LoaderIcon className="h-12 w-12 text-indigo-500 dark:text-indigo-400" />
                                <p className="text-indigo-600 dark:text-indigo-300">AI is analyzing the code...</p>
                            </div>
                        )}

                        {error && !isLoading && (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-4 rounded-lg flex items-center gap-3 w-full">
                                    <AlertTriangleIcon className="h-8 w-8 text-red-500 dark:text-red-400 flex-shrink-0" />
                                    <div>
                                        <h3 className="font-bold">Error</h3>
                                        <p className="text-sm">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {!isLoading && !error && explanation && (
                            <div className="prose dark:prose-invert max-w-none">
                                {explanation}
                            </div>
                        )}
                        
                        {!isLoading && !error && !explanation && (
                            <div className="flex items-center justify-center h-full text-center text-gray-500 dark:text-slate-500">
                                <div>
                                    <CodeBracketIcon className="h-24 w-24 mx-auto mb-4" />
                                    <p>The code explanation will appear here.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CodeExplainer;
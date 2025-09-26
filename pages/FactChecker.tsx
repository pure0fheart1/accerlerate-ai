import { GoogleGenAI } from '@google/genai';
import React, { useState, useCallback, useMemo } from 'react';
import { FactCheckerIcon, LoaderIcon, AlertTriangleIcon, SparklesIcon } from '../components/icons';
import { VoiceInputButton } from '../components/VoiceInputButton';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}
const ai = new GoogleGenAI({ apiKey: API_KEY });

interface GroundingChunk {
    web?: {
        uri?: string;
        title?: string;
    };
}

const FactChecker: React.FC = () => {
  const [claim, setClaim] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [sources, setSources] = useState<GroundingChunk[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = useCallback(async () => {
    if (!claim.trim()) {
      setError("Please enter a claim to check.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setResult(null);
    setSources([]);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Fact-check the following claim: "${claim}"`,
        config: {
          tools: [{googleSearch: {}}],
        },
      });
      
      // FIX: Correctly access the generated text from the response object.
      setResult(response.text);
      if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
          setSources(response.candidates[0].groundingMetadata.groundingChunks);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [claim]);

  const isCheckDisabled = useMemo(() => isLoading || !claim.trim(), [isLoading, claim]);

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center gap-4 mb-4">
        <FactCheckerIcon className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100">Fact Checker</h1>
      </header>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-6 max-w-4xl">
        Verify claims and get sourced information. Enter a statement and the AI will use Google Search to find relevant information.
      </p>
      
      <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 mb-8 flex flex-col sm:flex-row items-center gap-4">
        <div className="relative w-full flex-grow">
          <input
            type="text"
            value={claim}
            onChange={(e) => setClaim(e.target.value)}
            placeholder="e.g., 'Is the Great Wall of China visible from space?'"
            className="w-full p-3 bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 pr-12 focus:ring-2 focus:ring-indigo-500"
            aria-label="Claim to fact-check"
          />
           <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <VoiceInputButton onTranscript={setClaim} />
          </div>
        </div>
        <button
          onClick={handleCheck}
          disabled={isCheckDisabled}
          className="w-full sm:w-auto py-3 px-8 bg-indigo-600 text-white font-semibold rounded-lg shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/40 hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2 flex-shrink-0"
        >
          {isLoading ? <><LoaderIcon className="h-5 w-5" /> Checking...</> : <><SparklesIcon className="h-5 w-5" /> Check Fact</>}
        </button>
      </div>

      <main className="flex-grow min-h-0">
         {isLoading && (
            <div className="flex justify-center items-center h-full">
                <div className="flex flex-col items-center gap-4 text-center">
                    <LoaderIcon className="h-12 w-12 text-indigo-500 dark:text-indigo-400" />
                    <p className="text-indigo-600 dark:text-indigo-300">Searching for information...</p>
                </div>
            </div>
        )}

        {error && !isLoading && (
            <div className="flex justify-center">
                <div className="text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-4 rounded-lg flex items-center gap-3 max-w-lg">
                    <AlertTriangleIcon className="h-8 w-8 text-red-500 dark:text-red-400 flex-shrink-0" />
                    <div><h3 className="font-bold">Error</h3><p className="text-sm">{error}</p></div>
                </div>
            </div>
        )}

        {!isLoading && !error && result && (
          <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100 mb-4">Verification Result</h2>
            <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap leading-relaxed mb-6">{result}</div>
            {sources.length > 0 && (
                <div>
                    <h3 className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mb-2">Sources:</h3>
                    <ul className="space-y-2">
                        {sources.map((source, index) => (
                           source.web?.uri && (
                               <li key={index} className="text-sm">
                                   <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-cyan-600 dark:text-cyan-400 hover:underline break-all">
                                       {source.web.title || source.web.uri}
                                   </a>
                               </li>
                           )
                        ))}
                    </ul>
                </div>
            )}
          </div>
        )}

         {!isLoading && !error && !result && (
            <div className="flex justify-center items-center h-full text-center text-gray-500 dark:text-slate-500 bg-white/30 dark:bg-slate-800/10 rounded-2xl border-2 border-dashed border-gray-300 dark:border-slate-700">
                <div>
                    <FactCheckerIcon className="h-16 w-16 mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold text-gray-700 dark:text-slate-400">Fact-check results will appear here</h2>
                </div>
            </div>
        )}
      </main>
    </div>
  );
};

export default FactChecker;
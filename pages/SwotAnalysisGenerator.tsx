
import React, { useState, useCallback, useMemo } from 'react';
import { SwotAnalysisIcon, LoaderIcon, AlertTriangleIcon, SparklesIcon } from '../components/icons';
import { generateSwotAnalysis } from '../services/geminiService';
import { SwotAnalysis } from '../types';
import { VoiceInputButton } from '../components/VoiceInputButton';

const SwotAnalysisGenerator: React.FC = () => {
  const [companyInfo, setCompanyInfo] = useState('');
  const [analysis, setAnalysis] = useState<SwotAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!companyInfo.trim()) {
      setError("Please provide company/project information.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const result = await generateSwotAnalysis(companyInfo);
      setAnalysis(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [companyInfo]);

  const isGenerateDisabled = useMemo(() => isLoading || !companyInfo.trim(), [isLoading, companyInfo]);

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center gap-4 mb-4">
        <SwotAnalysisIcon className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100">SWOT Analysis Generator</h1>
      </header>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-6 max-w-4xl">
        Generate a comprehensive SWOT analysis for your business or project to identify Strengths, Weaknesses, Opportunities, and Threats.
      </p>

      <main className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-0">
        <div className="lg:col-span-1 bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 flex flex-col gap-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100">Company / Project Info</h2>
          <div className="relative flex-grow">
            <label htmlFor="companyInfo" className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-2">Describe your business, product, or project</label>
            <div className="relative h-full">
                <textarea id="companyInfo" value={companyInfo} onChange={(e) => setCompanyInfo(e.target.value)} placeholder="e.g., A small coffee shop in a downtown area known for its unique blends and cozy atmosphere." className="w-full h-full p-2 bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg resize-none pr-12 focus:ring-2 focus:ring-indigo-500 dark:focus:bg-slate-800 transition-all text-gray-900 dark:text-slate-100" />
                <div className="absolute bottom-2 right-2">
                    <VoiceInputButton onTranscript={(t) => setCompanyInfo(current => current + ' ' + t)} />
                </div>
            </div>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerateDisabled}
            className="w-full mt-auto py-3 px-6 bg-indigo-600 text-white font-semibold rounded-lg shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/40 hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            {isLoading ? <><LoaderIcon className="h-5 w-5" /> Analyzing...</> : <><SparklesIcon className="h-5 w-5" /> Generate Analysis</>}
          </button>
        </div>

        <div className="lg:col-span-2 bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 flex flex-col min-h-0">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100 mb-4">SWOT Analysis</h2>
          <div className="w-full flex-grow bg-gray-50 dark:bg-slate-900 rounded-xl p-4 overflow-y-auto border border-gray-200 dark:border-slate-700">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <LoaderIcon className="h-12 w-12 text-indigo-500 dark:text-indigo-400" />
                <p className="text-indigo-600 dark:text-indigo-300">Performing analysis...</p>
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
            {!isLoading && !error && analysis && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-800 dark:text-slate-300 prose dark:prose-invert max-w-none">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-green-200 dark:border-green-500/20">
                  <h3 className="text-lg font-bold text-green-700 dark:text-green-400 mb-2 not-prose">Strengths</h3>
                  <ul>{analysis.strengths.map((item, i) => <li key={i}>{item}</li>)}</ul>
                </div>
                 <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-red-200 dark:border-red-500/20">
                  <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-2 not-prose">Weaknesses</h3>
                  <ul>{analysis.weaknesses.map((item, i) => <li key={i}>{item}</li>)}</ul>
                </div>
                 <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-blue-200 dark:border-blue-500/20">
                  <h3 className="text-lg font-bold text-blue-700 dark:text-blue-400 mb-2 not-prose">Opportunities</h3>
                  <ul>{analysis.opportunities.map((item, i) => <li key={i}>{item}</li>)}</ul>
                </div>
                 <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-yellow-200 dark:border-yellow-500/20">
                  <h3 className="text-lg font-bold text-yellow-700 dark:text-yellow-400 mb-2 not-prose">Threats</h3>
                  <ul>{analysis.threats.map((item, i) => <li key={i}>{item}</li>)}</ul>
                </div>
              </div>
            )}
            {!isLoading && !error && !analysis && (
              <div className="flex items-center justify-center h-full text-center text-gray-500 dark:text-slate-500">
                <div>
                  <SwotAnalysisIcon className="h-24 w-24 mx-auto mb-4" />
                  <p>Your SWOT analysis will appear here.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SwotAnalysisGenerator;
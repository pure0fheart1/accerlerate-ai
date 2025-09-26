
import React, { useState, useCallback, useMemo } from 'react';
import { ContractAnalyzerIcon, LoaderIcon, AlertTriangleIcon, SparklesIcon } from '../components/icons';
import { analyzeContract } from '../services/geminiService';
import { LegalSummary } from '../types';
import { VoiceInputButton } from '../components/VoiceInputButton';

const ContractAnalyzer: React.FC = () => {
  const [contractText, setContractText] = useState('');
  const [analysis, setAnalysis] = useState<LegalSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = useCallback(async () => {
    if (!contractText.trim()) {
      setError("Please paste the contract text to analyze.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const result = await analyzeContract(contractText);
      setAnalysis(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [contractText]);

  const isAnalyzeDisabled = useMemo(() => isLoading || !contractText.trim(), [isLoading, contractText]);

  const riskStyles: { [key: string]: string } = {
    High: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-500/30',
    Medium: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-500/30',
    Low: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-500/30',
    None: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-500/30',
  };

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center gap-4 mb-4">
        <ContractAnalyzerIcon className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100">Contract Analyzer</h1>
      </header>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-6 max-w-4xl">
        Simplify complex legal contracts. Paste the text to identify key clauses, get summaries, and see potential risks. <strong className="font-semibold text-yellow-500 dark:text-yellow-400">Note: This is not legal advice.</strong>
      </p>

      <main className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0">
        <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 flex flex-col">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100 mb-4">Contract Text</h2>
          <div className="relative w-full flex-grow">
            <textarea
              value={contractText}
              onChange={(e) => setContractText(e.target.value)}
              placeholder="Paste the full contract text here..."
              className="w-full h-full p-3 bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 dark:focus:bg-slate-800 transition-all duration-200 resize-none pr-12"
              aria-label="Contract text input"
            />
            <div className="absolute bottom-3 right-3">
                <VoiceInputButton onTranscript={(t) => setContractText(current => current + ' ' + t)} />
            </div>
          </div>
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzeDisabled}
            className="w-full mt-4 py-3 px-6 bg-indigo-600 text-white font-semibold rounded-lg shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/40 hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            {isLoading ? <><LoaderIcon className="h-5 w-5" /> Analyzing...</> : <><SparklesIcon className="h-5 w-5" /> Analyze Contract</>}
          </button>
        </div>

        <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 flex flex-col min-h-0">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100 mb-4">Analysis</h2>
          <div className="w-full flex-grow bg-gray-50 dark:bg-slate-900 rounded-xl p-4 overflow-y-auto border border-gray-200 dark:border-slate-700">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <LoaderIcon className="h-12 w-12 text-indigo-500 dark:text-indigo-400" />
                <p className="text-indigo-600 dark:text-indigo-300">Reading the fine print...</p>
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
            {!isLoading && !error && analysis && (
              <div className="space-y-6">
                <div>
                    <h3 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">{analysis.documentType}</h3>
                    <p className="text-lg text-gray-700 dark:text-slate-300 italic">{analysis.overallSummary}</p>
                </div>
                <div>
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-slate-100 border-b border-gray-200 dark:border-slate-700 pb-2 mb-4">Key Clauses & Risks</h4>
                    <div className="space-y-4">
                        {analysis.keyClauses.map((item, i) => (
                            <div key={i} className={`p-4 rounded-lg border ${riskStyles[item.potentialRisk] || riskStyles['None']}`}>
                                <div className="flex justify-between items-center mb-2">
                                    <h5 className="font-bold text-gray-900 dark:text-slate-100">{item.clause}</h5>
                                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${riskStyles[item.potentialRisk]}`}>{item.potentialRisk} Risk</span>
                                </div>
                                <p className="text-sm text-gray-700 dark:text-slate-300">{item.summary}</p>
                            </div>
                        ))}
                    </div>
                </div>
              </div>
            )}
            {!isLoading && !error && !analysis && (
              <div className="flex items-center justify-center h-full text-center text-gray-500 dark:text-slate-500">
                <div>
                  <ContractAnalyzerIcon className="h-24 w-24 mx-auto mb-4" />
                  <p>Your contract analysis will appear here.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContractAnalyzer;

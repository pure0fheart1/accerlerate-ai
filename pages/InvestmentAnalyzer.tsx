
import React, { useState, useCallback, useMemo } from 'react';
import { ChartBarIcon, LoaderIcon, AlertTriangleIcon, SparklesIcon } from '../components/icons';
import { analyzeInvestment } from '../services/geminiService';
import { InvestmentSummary } from '../types';

const InvestmentAnalyzer: React.FC = () => {
  const [ticker, setTicker] = useState('');
  const [summary, setSummary] = useState<InvestmentSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = useCallback(async () => {
    if (!ticker.trim()) {
      setError("Please enter a stock ticker.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setSummary(null);
    try {
      const result = await analyzeInvestment(ticker.toUpperCase());
      setSummary(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [ticker]);

  const isAnalyzeDisabled = useMemo(() => isLoading || !ticker.trim(), [isLoading, ticker]);
  
  const sentimentStyles = {
    Positive: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    Negative: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    Neutral: 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300',
  };

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center gap-4 mb-4">
        <ChartBarIcon className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Investment Analyzer</h1>
      </header>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 max-w-4xl">
        Get a high-level, AI-driven summary for a stock ticker. <span className="font-semibold text-yellow-500 dark:text-yellow-400">Note: This is not financial advice.</span>
      </p>
      
      <div className="bg-white/70 dark:bg-gray-950/30 backdrop-blur-md border border-gray-200 dark:border-gray-800/50 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 mb-8 flex flex-col sm:flex-row items-center gap-4">
        <input
          type="text"
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          placeholder="e.g., GOOGL, TSLA"
          className="w-full flex-grow p-3 bg-gray-100 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 uppercase"
          aria-label="Stock ticker input"
        />
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzeDisabled}
          className="w-full sm:w-auto py-3 px-8 bg-indigo-600 text-white font-semibold rounded-lg shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/40 hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2"
        >
          {isLoading ? <><LoaderIcon className="h-5 w-5" /> Analyzing...</> : <><SparklesIcon className="h-5 w-5" /> Analyze</>}
        </button>
      </div>

      <main className="flex-grow min-h-0">
        {isLoading && (
            <div className="flex justify-center items-center h-full"><div className="flex flex-col items-center gap-4 text-center"><LoaderIcon className="h-12 w-12 text-indigo-500 dark:text-indigo-400" /><p className="text-indigo-600 dark:text-indigo-300">Analyzing data...</p></div></div>
        )}
        {error && !isLoading && (
            <div className="flex justify-center"><div className="text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-4 rounded-lg flex items-center gap-3 max-w-lg"><AlertTriangleIcon className="h-8 w-8 text-red-500 dark:text-red-400 flex-shrink-0" /><div><h3 className="font-bold">Error</h3><p className="text-sm">{error}</p></div></div></div>
        )}
        {!isLoading && !error && summary && (
          <div className="bg-white/70 dark:bg-gray-950/30 backdrop-blur-md border border-gray-200 dark:border-gray-800/50 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 prose dark:prose-invert max-w-none">
            <div className="flex justify-between items-baseline">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white not-prose mb-0">{summary.companyName} ({summary.ticker})</h2>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${sentimentStyles[summary.sentiment]}`}>
                    {summary.sentiment}
                </span>
            </div>
            <p className="lead text-gray-600 dark:text-gray-400">{summary.summary}</p>
            <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">Key Points</h3>
            <ul className="list-disc list-outside space-y-1 pl-5">
                {summary.keyPoints.map((point, i) => <li key={i}>{point}</li>)}
            </ul>
          </div>
        )}
        {!isLoading && !error && !summary && (
            <div className="flex justify-center items-center h-full text-center text-gray-500 dark:text-gray-600 bg-white/30 dark:bg-gray-950/10 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-800">
                <div><ChartBarIcon className="h-16 w-16 mx-auto mb-4" /><h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-400">Analysis results will appear here</h2></div>
            </div>
        )}
      </main>
    </div>
  );
};

export default InvestmentAnalyzer;

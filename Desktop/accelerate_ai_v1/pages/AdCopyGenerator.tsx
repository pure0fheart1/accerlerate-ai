import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { MegaphoneIcon, LoaderIcon, AlertTriangleIcon, SparklesIcon } from '../components/icons';
import { generateAdCopy } from '../services/geminiService';
import { VoiceInputButton } from '../components/VoiceInputButton';

const PLATFORMS = ["Facebook", "Instagram", "Twitter", "LinkedIn", "Google Ads"];

const PRODUCT_KEY = 'accelerate-adcopy-product';
const AUDIENCE_KEY = 'accelerate-adcopy-audience';
const PLATFORM_KEY = 'accelerate-adcopy-platform';
const OUTPUT_KEY = 'accelerate-adcopy-output';

const AdCopyGenerator: React.FC = () => {
  const [product, setProduct] = useState(() => localStorage.getItem(PRODUCT_KEY) || '');
  const [targetAudience, setTargetAudience] = useState(() => localStorage.getItem(AUDIENCE_KEY) || '');
  const [platform, setPlatform] = useState(() => localStorage.getItem(PLATFORM_KEY) || 'Facebook');
  const [adCopy, setAdCopy] = useState<string | null>(() => localStorage.getItem(OUTPUT_KEY) || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { localStorage.setItem(PRODUCT_KEY, product); }, [product]);
  useEffect(() => { localStorage.setItem(AUDIENCE_KEY, targetAudience); }, [targetAudience]);
  useEffect(() => { localStorage.setItem(PLATFORM_KEY, platform); }, [platform]);
  useEffect(() => {
    if (adCopy) localStorage.setItem(OUTPUT_KEY, adCopy);
    else localStorage.removeItem(OUTPUT_KEY);
  }, [adCopy]);

  const handleGenerate = useCallback(async () => {
    if (!product.trim() || !targetAudience.trim()) {
      setError("Please provide a product and target audience.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setAdCopy(null);
    try {
      const result = await generateAdCopy({ product, targetAudience, platform });
      setAdCopy(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [product, targetAudience, platform]);

  const isGenerateDisabled = useMemo(() => isLoading || !product.trim() || !targetAudience.trim(), [isLoading, product, targetAudience]);

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center gap-4 mb-4">
        <MegaphoneIcon className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100">Ad Copy Generator</h1>
      </header>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-6 max-w-4xl">
        Create compelling ad copy for your marketing campaigns. Provide details about your product and audience to get started.
      </p>

      <main className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-0">
        <div className="lg:col-span-1 bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 flex flex-col gap-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100">Campaign Details</h2>
          <div>
            <label htmlFor="product" className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-2">Product/Service</label>
            <div className="relative">
              <input id="product" type="text" value={product} onChange={(e) => setProduct(e.target.value)} placeholder="e.g., AI-powered productivity app" className="w-full p-2 bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg pr-12 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 dark:focus:bg-slate-800 transition-all" />
              <div className="absolute inset-y-0 right-0 flex items-center pr-2"><VoiceInputButton onTranscript={setProduct} /></div>
            </div>
          </div>
          <div>
            <label htmlFor="audience" className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-2">Target Audience</label>
            <div className="relative">
              <input id="audience" type="text" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} placeholder="e.g., Tech startups, busy professionals" className="w-full p-2 bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg pr-12 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 dark:focus:bg-slate-800 transition-all" />
              <div className="absolute inset-y-0 right-0 flex items-center pr-2"><VoiceInputButton onTranscript={setTargetAudience} /></div>
            </div>
          </div>
          <div>
            <label htmlFor="platform" className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-2">Platform</label>
            <select id="platform" value={platform} onChange={(e) => setPlatform(e.target.value)} className="w-full p-2 bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 dark:focus:bg-slate-800 transition-all">
              {PLATFORMS.map(p => <option key={p} value={p} className="bg-white dark:bg-slate-900">{p}</option>)}
            </select>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerateDisabled}
            className="w-full mt-auto py-3 px-6 bg-indigo-600 text-white font-semibold rounded-lg shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/40 hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            {isLoading ? <><LoaderIcon className="h-5 w-5" /> Generating...</> : <><SparklesIcon className="h-5 w-5" /> Generate Ad Copy</>}
          </button>
        </div>

        <div className="lg:col-span-2 bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 flex flex-col min-h-0">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100 mb-4">Generated Ad Copy</h2>
          <div className="w-full flex-grow bg-gray-50 dark:bg-slate-900 rounded-xl p-4 overflow-y-auto border border-gray-200 dark:border-slate-700">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <LoaderIcon className="h-12 w-12 text-indigo-500 dark:text-indigo-400" />
                <p className="text-indigo-600 dark:text-indigo-300">Writing your ads...</p>
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
            {!isLoading && !error && adCopy && (
              <div className="prose dark:prose-invert max-w-none">{adCopy}</div>
            )}
            {!isLoading && !error && !adCopy && (
              <div className="flex items-center justify-center h-full text-center text-gray-500 dark:text-slate-500">
                <div>
                  <MegaphoneIcon className="h-24 w-24 mx-auto mb-4" />
                  <p>Your generated ad copy variations will appear here.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdCopyGenerator;

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { NewspaperIcon, LoaderIcon, AlertTriangleIcon, SparklesIcon } from '../components/icons';
import { writeBlogPost } from '../services/geminiService';
import { VoiceInputButton } from '../components/VoiceInputButton';

const TOPIC_KEY = 'accelerate-blogpost-topic';
const OUTPUT_KEY = 'accelerate-blogpost-output';

const BlogPostWriter: React.FC = () => {
  const [topic, setTopic] = useState(() => localStorage.getItem(TOPIC_KEY) || '');
  const [blogPost, setBlogPost] = useState<string | null>(() => localStorage.getItem(OUTPUT_KEY) || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { localStorage.setItem(TOPIC_KEY, topic); }, [topic]);
  useEffect(() => {
    if (blogPost) localStorage.setItem(OUTPUT_KEY, blogPost);
    else localStorage.removeItem(OUTPUT_KEY);
  }, [blogPost]);

  const handleGenerate = useCallback(async () => {
    if (!topic.trim()) {
      setError("Please provide a topic for the blog post.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setBlogPost(null);
    try {
      const result = await writeBlogPost(topic);
      setBlogPost(result);
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
        <NewspaperIcon className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100">Blog Post Writer</h1>
      </header>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-6 max-w-4xl">
        Generate complete, engaging, and well-structured blog posts from a single topic or title.
      </p>

      <main className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-0">
        <div className="lg:col-span-1 bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 flex flex-col gap-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100">Blog Post Details</h2>
          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-2">Topic or Title</label>
            <div className="relative">
              <textarea
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., 'The impact of remote work on productivity', 'Top 5 destinations for solo travelers'"
                className="w-full p-2 bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg h-32 resize-none pr-12 focus:ring-2 focus:ring-indigo-500 dark:focus:bg-slate-800 transition-all text-gray-900 dark:text-slate-100"
                aria-label="Blog post topic input"
              />
              <div className="absolute bottom-2 right-2">
                <VoiceInputButton onTranscript={(t) => setTopic(current => current + ' ' + t)} />
              </div>
            </div>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerateDisabled}
            className="w-full mt-auto py-3 px-6 bg-indigo-600 text-white font-semibold rounded-lg shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/40 hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            {isLoading ? <><LoaderIcon className="h-5 w-5" /> Generating...</> : <><SparklesIcon className="h-5 w-5" /> Generate Post</>}
          </button>
        </div>

        <div className="lg:col-span-2 bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 flex flex-col min-h-0">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100 mb-4">Generated Blog Post</h2>
          <div className="w-full flex-grow bg-gray-50 dark:bg-slate-900 rounded-xl p-4 overflow-y-auto border border-gray-200 dark:border-slate-700">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <LoaderIcon className="h-12 w-12 text-indigo-500 dark:text-indigo-400" />
                <p className="text-indigo-600 dark:text-indigo-300">Writing your article...</p>
              </div>
            )}
            {error && !isLoading && (
              <div className="flex items-center justify-center h-full">
                <div className="text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-4 rounded-lg flex items-center gap-3">
                  <AlertTriangleIcon className="h-8 w-8" />
                  <div>
                    <h3 className="font-bold">Error</h3>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}
            {!isLoading && !error && blogPost && (
              <div className="prose dark:prose-invert max-w-none">{blogPost}</div>
            )}
            {!isLoading && !error && !blogPost && (
              <div className="flex items-center justify-center h-full text-center text-gray-500 dark:text-slate-500">
                <div>
                  <NewspaperIcon className="h-24 w-24 mx-auto mb-4" />
                  <p>Your generated blog post will appear here.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default BlogPostWriter;

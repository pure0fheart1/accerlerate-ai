import React, { useState, useCallback, useMemo } from 'react';
import { EnvelopeIcon, LoaderIcon, AlertTriangleIcon, SparklesIcon } from '../components/icons';
import { writeEmail } from '../services/geminiService';
import { VoiceInputButton } from '../components/VoiceInputButton';

const TONES = ["Professional", "Casual", "Friendly", "Urgent", "Formal", "Persuasive"];

const EmailWriter: React.FC = () => {
  const [recipient, setRecipient] = useState('');
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('Professional');
  const [email, setEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!topic.trim()) {
      setError("Please provide a topic for the email.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setEmail(null);
    try {
      const result = await writeEmail({ recipient, topic, tone });
      setEmail(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [recipient, topic, tone]);

  const isGenerateDisabled = useMemo(() => isLoading || !topic.trim(), [isLoading, topic]);

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center gap-4 mb-4">
        <EnvelopeIcon className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100">Email Writer</h1>
      </header>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-6 max-w-4xl">
        Draft professional and effective emails in seconds. Just provide the context and let AI handle the writing.
      </p>

      <main className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-0">
        <div className="lg:col-span-1 bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 flex flex-col gap-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100">Email Details</h2>
          <div>
            <label htmlFor="recipient" className="block text-sm font-medium text-gray-500 dark:text-slate-400 mb-2">Recipient (Optional)</label>
            <div className="relative">
                <input id="recipient" type="text" value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="e.g., Project Team, Dr. Smith" className="w-full p-2 bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg pr-12 focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 transition-all text-gray-900 dark:text-slate-100" />
                 <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                    <VoiceInputButton onTranscript={setRecipient} />
                </div>
            </div>
          </div>
          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-gray-500 dark:text-slate-400 mb-2">Topic / Main Point</label>
             <div className="relative">
                <textarea id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., Follow up on our meeting, Request for project update" className="w-full p-2 bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg h-32 resize-none pr-12 focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 transition-all text-gray-900 dark:text-slate-100" />
                <div className="absolute bottom-2 right-2">
                    <VoiceInputButton onTranscript={(t) => setTopic(current => current + ' ' + t)} />
                </div>
            </div>
          </div>
          <div>
            <label htmlFor="tone" className="block text-sm font-medium text-gray-500 dark:text-slate-400 mb-2">Tone</label>
            <select id="tone" value={tone} onChange={(e) => setTone(e.target.value)} className="w-full p-2 bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-gray-900 dark:text-slate-100">
              {TONES.map(t => <option key={t} value={t} className="bg-white dark:bg-slate-900">{t}</option>)}
            </select>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerateDisabled}
            className="w-full mt-auto py-3 px-6 bg-indigo-600 text-white font-semibold rounded-lg shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/40 hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            {isLoading ? <><LoaderIcon className="h-5 w-5" /> Generating...</> : <><SparklesIcon className="h-5 w-5" /> Generate Email</>}
          </button>
        </div>

        <div className="lg:col-span-2 bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 flex flex-col min-h-0">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100 mb-4">Generated Email</h2>
          <div className="w-full flex-grow bg-gray-50 dark:bg-slate-900 rounded-xl p-4 overflow-y-auto border border-gray-200 dark:border-slate-700">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <LoaderIcon className="h-12 w-12 text-indigo-500 dark:text-indigo-400" />
                <p className="text-indigo-600 dark:text-indigo-300">Writing your email...</p>
              </div>
            )}

            {error && !isLoading && (
              <div className="flex items-center justify-center h-full">
                <div className="text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-4 rounded-lg flex items-center gap-3">
                  <AlertTriangleIcon className="h-8 w-8 text-red-500 dark:text-red-400" />
                  <div>
                    <h3 className="font-bold">Error</h3>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {!isLoading && !error && email && (
              <div className="prose dark:prose-invert max-w-none">{email}</div>
            )}
            
            {!isLoading && !error && !email && (
              <div className="flex items-center justify-center h-full text-center text-gray-500 dark:text-slate-500">
                <div>
                  <EnvelopeIcon className="h-24 w-24 mx-auto mb-4" />
                  <p>Your generated email will appear here.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmailWriter;

import React, { useState, useCallback, useMemo } from 'react';
import { DocumentCheckIcon, LoaderIcon, AlertTriangleIcon, SparklesIcon } from '../components/icons';
import { writeCoverLetter } from '../services/geminiService';
import { VoiceInputButton } from '../components/VoiceInputButton';

const CoverLetterWriter: React.FC = () => {
  const [jobDescription, setJobDescription] = useState('');
  const [userSkills, setUserSkills] = useState('');
  const [coverLetter, setCoverLetter] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!jobDescription.trim() || !userSkills.trim()) {
      setError("Please provide both the job description and your skills.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setCoverLetter(null);
    try {
      const result = await writeCoverLetter({ jobDescription, userSkills });
      setCoverLetter(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [jobDescription, userSkills]);

  const isGenerateDisabled = useMemo(() => isLoading || !jobDescription.trim() || !userSkills.trim(), [isLoading, jobDescription, userSkills]);

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center gap-4 mb-4">
        <DocumentCheckIcon className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100">Cover Letter Writer</h1>
      </header>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-6 max-w-4xl">
        Draft professional cover letters tailored to specific job descriptions. Paste the details and your skills to get started.
      </p>

      <main className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0">
        <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 flex flex-col gap-4">
          <div>
            <label htmlFor="jobDescription" className="block text-lg font-semibold text-gray-800 dark:text-slate-200 mb-2">Job Description</label>
            <div className="relative h-48">
              <textarea
                id="jobDescription"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job description here..."
                className="w-full h-full p-2 bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg resize-none pr-12 focus:ring-2 focus:ring-indigo-500 dark:focus:bg-slate-800 transition-all text-gray-900 dark:text-slate-100"
              />
              <div className="absolute bottom-2 right-2">
                <VoiceInputButton onTranscript={(t) => setJobDescription(current => current + ' ' + t)} />
              </div>
            </div>
          </div>
          <div className="flex-grow flex flex-col">
            <label htmlFor="userSkills" className="block text-lg font-semibold text-gray-800 dark:text-slate-200 mb-2">Your Skills & Experience</label>
            <div className="relative flex-grow">
              <textarea
                id="userSkills"
                value={userSkills}
                onChange={(e) => setUserSkills(e.target.value)}
                placeholder="Briefly list your key skills and relevant experience..."
                className="w-full h-full p-2 bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg resize-none pr-12 focus:ring-2 focus:ring-indigo-500 dark:focus:bg-slate-800 transition-all text-gray-900 dark:text-slate-100"
              />
               <div className="absolute bottom-2 right-2">
                <VoiceInputButton onTranscript={(t) => setUserSkills(current => current + ' ' + t)} />
              </div>
            </div>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerateDisabled}
            className="w-full mt-4 py-3 px-6 bg-indigo-600 text-white font-semibold rounded-lg shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/40 hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            {isLoading ? <><LoaderIcon className="h-5 w-5" /> Writing...</> : <><SparklesIcon className="h-5 w-5" /> Write Cover Letter</>}
          </button>
        </div>

        <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 flex flex-col min-h-0">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100 mb-4">Generated Cover Letter</h2>
          <div className="w-full flex-grow bg-gray-50 dark:bg-slate-900 rounded-xl p-4 overflow-y-auto border border-gray-200 dark:border-slate-700">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <LoaderIcon className="h-12 w-12 text-indigo-500 dark:text-indigo-400" />
                <p className="text-indigo-600 dark:text-indigo-300">Drafting your cover letter...</p>
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
            {!isLoading && !error && coverLetter && (
              <div className="prose dark:prose-invert max-w-none">{coverLetter}</div>
            )}
            {!isLoading && !error && !coverLetter && (
              <div className="flex items-center justify-center h-full text-center text-gray-500 dark:text-slate-500">
                <div>
                  <DocumentCheckIcon className="h-24 w-24 mx-auto mb-4" />
                  <p>Your tailored cover letter will appear here.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CoverLetterWriter;
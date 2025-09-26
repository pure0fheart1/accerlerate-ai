
import React, { useState, useCallback, useMemo } from 'react';
import { JobDescriptionIcon, LoaderIcon, AlertTriangleIcon, SparklesIcon } from '../components/icons';
import { writeJobDescription } from '../services/geminiService';
import { VoiceInputButton } from '../components/VoiceInputButton';

const JobDescriptionWriter: React.FC = () => {
  const [role, setRole] = useState('');
  const [responsibilities, setResponsibilities] = useState('');
  const [requirements, setRequirements] = useState('');
  const [jobDescription, setJobDescription] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!role.trim() || !responsibilities.trim() || !requirements.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setJobDescription(null);
    try {
      const result = await writeJobDescription({ role, responsibilities, requirements });
      setJobDescription(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [role, responsibilities, requirements]);

  const isGenerateDisabled = useMemo(() => isLoading || !role.trim() || !responsibilities.trim() || !requirements.trim(), [isLoading, role, responsibilities, requirements]);

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center gap-4 mb-4">
        <JobDescriptionIcon className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Job Description Writer</h1>
      </header>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 max-w-4xl">
        Craft clear, comprehensive, and appealing job descriptions to attract the right candidates.
      </p>

      <main className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-0">
        <div className="lg:col-span-1 bg-white/70 dark:bg-gray-950/30 backdrop-blur-md border border-gray-200 dark:border-gray-800/50 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 flex flex-col gap-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Job Details</h2>
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">Job Role</label>
            <div className="relative">
                <input id="role" type="text" value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g., Senior Frontend Engineer" className="w-full p-2 bg-gray-100 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white pr-12 focus:ring-2 focus:ring-indigo-500" />
                <div className="absolute inset-y-0 right-0 flex items-center pr-2"><VoiceInputButton onTranscript={setRole} /></div>
            </div>
          </div>
          <div>
            <label htmlFor="responsibilities" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">Key Responsibilities</label>
            <div className="relative">
                <textarea id="responsibilities" value={responsibilities} onChange={(e) => setResponsibilities(e.target.value)} placeholder="e.g., Develop new user-facing features, Optimize applications for speed and scalability" className="w-full p-2 bg-gray-100 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 rounded-lg h-24 resize-none text-gray-900 dark:text-white pr-12 focus:ring-2 focus:ring-indigo-500" />
                 <div className="absolute bottom-2 right-2"><VoiceInputButton onTranscript={(t) => setResponsibilities(current => current + ' ' + t)} /></div>
            </div>
          </div>
          <div>
            <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">Qualifications / Requirements</label>
            <div className="relative">
                <textarea id="requirements" value={requirements} onChange={(e) => setRequirements(e.target.value)} placeholder="e.g., 5+ years of React experience, Strong proficiency in TypeScript" className="w-full p-2 bg-gray-100 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 rounded-lg h-24 resize-none text-gray-900 dark:text-white pr-12 focus:ring-2 focus:ring-indigo-500" />
                 <div className="absolute bottom-2 right-2"><VoiceInputButton onTranscript={(t) => setRequirements(current => current + ' ' + t)} /></div>
            </div>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerateDisabled}
            className="w-full mt-auto py-3 px-6 bg-indigo-600 text-white font-semibold rounded-lg shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/40 hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            {isLoading ? <><LoaderIcon className="h-5 w-5" /> Writing...</> : <><SparklesIcon className="h-5 w-5" /> Write Description</>}
          </button>
        </div>

        <div className="lg:col-span-2 bg-white/70 dark:bg-gray-950/30 backdrop-blur-md border border-gray-200 dark:border-gray-800/50 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 flex flex-col min-h-0">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Generated Job Description</h2>
          <div className="w-full flex-grow bg-gray-50 dark:bg-black/20 rounded-xl p-4 overflow-y-auto border border-gray-200 dark:border-gray-800">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full gap-4"><LoaderIcon className="h-12 w-12 text-indigo-500 dark:text-indigo-400" /><p className="text-indigo-600 dark:text-indigo-300">Crafting job description...</p></div>
            )}
            {error && !isLoading && (
              <div className="flex items-center justify-center h-full"><div className="text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-4 rounded-lg flex items-center gap-3"><AlertTriangleIcon className="h-8 w-8" /><div><h3 className="font-bold">Error</h3><p className="text-sm">{error}</p></div></div></div>
            )}
            {!isLoading && !error && jobDescription && (
              <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">{jobDescription}</div>
            )}
            {!isLoading && !error && !jobDescription && (
              <div className="flex items-center justify-center h-full text-center text-gray-400 dark:text-gray-600">
                <div><JobDescriptionIcon className="h-24 w-24 mx-auto mb-4" /><p>Your generated job description will appear here.</p></div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default JobDescriptionWriter;

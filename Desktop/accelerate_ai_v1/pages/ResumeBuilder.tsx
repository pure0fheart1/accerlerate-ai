import React, { useState, useCallback, useMemo } from 'react';
import { UserCircleIcon, LoaderIcon, AlertTriangleIcon, SparklesIcon } from '../components/icons';
import { buildResume } from '../services/geminiService';
import { Resume } from '../types';
import { VoiceInputButton } from '../components/VoiceInputButton';

const ResumeBuilder: React.FC = () => {
  const [userInfo, setUserInfo] = useState('');
  const [resume, setResume] = useState<Resume | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!userInfo.trim()) {
      setError("Please paste your resume information.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setResume(null);
    try {
      const result = await buildResume(userInfo);
      setResume(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [userInfo]);

  const isGenerateDisabled = useMemo(() => isLoading || !userInfo.trim(), [isLoading, userInfo]);

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center gap-4 mb-4">
        <UserCircleIcon className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100">Resume Builder</h1>
      </header>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-6 max-w-4xl">
        Craft the perfect resume with AI-powered suggestions. Paste your experience, and let AI structure and polish it for you.
      </p>

      <main className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0">
        <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 flex flex-col">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100 mb-4">Your Information</h2>
          <div className="relative w-full flex-grow">
            <textarea
              value={userInfo}
              onChange={(e) => setUserInfo(e.target.value)}
              placeholder="Paste your job history, skills, education, and a summary here..."
              className="w-full h-full p-3 bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 resize-none pr-12 focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 transition-all"
              aria-label="Resume information input"
            />
             <div className="absolute bottom-3 right-3">
                <VoiceInputButton onTranscript={(t) => setUserInfo(current => current + '\n' + t)} />
            </div>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerateDisabled}
            className="w-full mt-4 py-3 px-6 bg-indigo-600 text-white font-semibold rounded-lg shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/40 hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            {isLoading ? <><LoaderIcon className="h-5 w-5" /> Building...</> : <><SparklesIcon className="h-5 w-5" /> Build Resume</>}
          </button>
        </div>

        <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 flex flex-col min-h-0">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100 mb-4">Formatted Resume</h2>
          <div className="w-full flex-grow bg-gray-50 dark:bg-slate-900 rounded-xl p-4 overflow-y-auto border border-gray-200 dark:border-slate-700">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <LoaderIcon className="h-12 w-12 text-indigo-500 dark:text-indigo-400" />
                <p className="text-indigo-600 dark:text-indigo-300">Polishing your resume...</p>
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
            {!isLoading && !error && resume && (
              <div className="space-y-6 text-gray-700 dark:text-slate-300 prose dark:prose-invert max-w-none">
                <div>
                    <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500/20 dark:border-indigo-500/30 pb-1 mb-2">Professional Summary</h3>
                    <p>{resume.summary}</p>
                </div>
                 <div>
                    <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500/20 dark:border-indigo-500/30 pb-1 mb-2">Experience</h3>
                    <div className="space-y-4">
                        {resume.experiences.map((exp, i) => (
                            <div key={i} className="not-prose">
                                <h4 className="font-bold text-gray-900 dark:text-slate-100">{exp.role}</h4>
                                <p className="text-sm text-gray-500 dark:text-slate-400">{exp.company} | {exp.date}</p>
                                <ul className="list-disc list-inside mt-1 space-y-1 text-gray-700 dark:text-slate-300">
                                    {exp.points.map((p, j) => <li key={j}>{p}</li>)}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
                 <div>
                    <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500/20 dark:border-indigo-500/30 pb-1 mb-2">Education</h3>
                    {resume.education.map((edu, i) => (
                        <div key={i} className="not-prose">
                            <h4 className="font-bold text-gray-900 dark:text-slate-100">{edu.institution}</h4>
                            <p className="text-sm">{edu.degree} | {edu.date}</p>
                        </div>
                    ))}
                </div>
                <div>
                    <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500/20 dark:border-indigo-500/30 pb-1 mb-2">Skills</h3>
                    <p>{resume.skills.join(', ')}</p>
                </div>
              </div>
            )}
            {!isLoading && !error && !resume && (
              <div className="flex items-center justify-center h-full text-center text-gray-500 dark:text-slate-500">
                <div>
                  <UserCircleIcon className="h-24 w-24 mx-auto mb-4" />
                  <p>Your polished resume will appear here.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResumeBuilder;
import React, { useState, useCallback, useMemo } from 'react';
import { GitCommandIcon, LoaderIcon, AlertTriangleIcon, SparklesIcon } from '../components/icons';
import { generateGitCommand } from '../services/geminiService';
import { VoiceInputButton } from '../components/VoiceInputButton';

const GitCommandGenerator: React.FC = () => {
  const [task, setTask] = useState('');
  const [command, setCommand] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!task.trim()) {
      setError("Please describe the Git task you want to perform.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setCommand(null);
    try {
      const result = await generateGitCommand(task);
      setCommand(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [task]);

  const isGenerateDisabled = useMemo(() => isLoading || !task.trim(), [isLoading, task]);

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center gap-4 mb-4">
        <GitCommandIcon className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100">Git Command Generator</h1>
      </header>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-6 max-w-4xl">
        Translate plain English descriptions into the correct Git commands. Describe the task, and let AI provide the command and an explanation.
      </p>

      <main className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-0">
        <div className="lg:col-span-1 bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 flex flex-col gap-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100">Task Description</h2>
          <div className="relative flex-grow">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-2">Describe what you want to do</label>
            <div className="relative h-full">
                <textarea
                  id="description"
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  placeholder="e.g., 'create a new branch called feature/login', 'undo my last commit but keep the changes'"
                  className="w-full h-full p-2 bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg resize-none min-h-[12rem] pr-12 focus:ring-2 focus:ring-indigo-500 dark:focus:bg-slate-800 transition-all text-gray-900 dark:text-slate-100"
                />
                <div className="absolute bottom-2 right-2">
                    <VoiceInputButton onTranscript={(t) => setTask(current => (current ? current + ' ' : '') + t)} />
                </div>
            </div>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerateDisabled}
            className="w-full mt-auto py-3 px-6 bg-indigo-600 text-white font-semibold rounded-lg shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/40 hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            {isLoading ? <><LoaderIcon className="h-5 w-5" /> Generating...</> : <><SparklesIcon className="h-5 w-5" /> Generate Command</>}
          </button>
        </div>

        <div className="lg:col-span-2 bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 flex flex-col min-h-0">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100 mb-4">Generated Command</h2>
          <div className="w-full flex-grow bg-gray-50 dark:bg-slate-900 rounded-xl p-4 overflow-y-auto border border-gray-200 dark:border-slate-700">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full gap-4"><LoaderIcon className="h-12 w-12 text-indigo-500 dark:text-indigo-400" /><p className="text-indigo-600 dark:text-indigo-300">Generating command...</p></div>
            )}
            {error && !isLoading && (
              <div className="flex items-center justify-center h-full"><div className="text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-4 rounded-lg flex items-center gap-3"><AlertTriangleIcon className="h-8 w-8" /><div><h3 className="font-bold">Error</h3><p className="text-sm">{error}</p></div></div></div>
            )}
            {!isLoading && !error && command && (
              <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">{command}</div>
            )}
            {!isLoading && !error && !command && (
              <div className="flex items-center justify-center h-full text-center text-gray-500 dark:text-slate-500">
                <div><GitCommandIcon className="h-24 w-24 mx-auto mb-4" /><p>Your generated Git command and explanation will appear here.</p></div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default GitCommandGenerator;

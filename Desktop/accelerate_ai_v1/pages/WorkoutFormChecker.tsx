import React, { useState, useCallback, useMemo } from 'react';
import { WorkoutFormCheckerIcon, LoaderIcon, AlertTriangleIcon, SparklesIcon } from '../components/icons';
import { checkWorkoutForm } from '../services/geminiService';
import { VoiceInputButton } from '../components/VoiceInputButton';

const WorkoutFormChecker: React.FC = () => {
  const [exercise, setExercise] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    const fullDescription = `Exercise: ${exercise}\n\nMy form: ${formDescription}`;
    if (!exercise.trim() || !formDescription.trim()) {
      setError("Please enter an exercise and describe your form.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setFeedback(null);
    try {
      const result = await checkWorkoutForm(fullDescription);
      setFeedback(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [exercise, formDescription]);

  const isGenerateDisabled = useMemo(() => isLoading || !exercise.trim() || !formDescription.trim(), [isLoading, exercise, formDescription]);

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center gap-4 mb-4">
        <WorkoutFormCheckerIcon className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100">Workout Form Checker</h1>
      </header>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-6 max-w-4xl">
        Get AI feedback on your exercise form. Describe how you perform an exercise to receive tips for improvement and injury prevention. <strong className="font-semibold text-yellow-500 dark:text-yellow-400">This is for informational purposes and is not a substitute for professional coaching.</strong>
      </p>

      <main className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0">
        <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 flex flex-col gap-4">
          <div>
            <label htmlFor="exercise" className="block text-lg font-semibold text-gray-800 dark:text-slate-200 mb-2">Exercise Name</label>
            <div className="relative">
              <input
                id="exercise"
                type="text"
                value={exercise}
                onChange={(e) => setExercise(e.target.value)}
                placeholder="e.g., Barbell Squat, Push-up, Deadlift"
                className="w-full p-3 bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 pr-12 focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <VoiceInputButton onTranscript={(t) => setExercise(current => (current ? current.trim() + ' ' : '') + t)} />
              </div>
            </div>
          </div>
          <div className="flex-grow flex flex-col">
            <label htmlFor="formDescription" className="block text-lg font-semibold text-gray-800 dark:text-slate-200 mb-2">Describe Your Form</label>
            <div className="relative flex-grow">
              <textarea
                id="formDescription"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Be detailed. Describe your stance, back position, depth, where you feel the movement, etc."
                className="w-full h-full p-3 bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 resize-none pr-12 focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
              />
               <div className="absolute bottom-3 right-3">
                <VoiceInputButton onTranscript={(t) => setFormDescription(current => (current ? current.trim() + ' ' : '') + t)} />
              </div>
            </div>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerateDisabled}
            className="w-full mt-4 py-3 px-6 bg-indigo-600 text-white font-semibold rounded-lg shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/40 hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            {isLoading ? <><LoaderIcon className="h-5 w-5" /> Analyzing...</> : <><SparklesIcon className="h-5 w-5" /> Get Feedback</>}
          </button>
        </div>

        <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 flex flex-col min-h-0">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100 mb-4">AI Feedback</h2>
          <div className="w-full flex-grow bg-gray-50 dark:bg-slate-900 rounded-xl p-4 overflow-y-auto border border-gray-200 dark:border-slate-700">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <LoaderIcon className="h-12 w-12 text-indigo-500 dark:text-indigo-400" />
                <p className="text-indigo-600 dark:text-indigo-300">Analyzing your form description...</p>
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
            {!isLoading && !error && feedback && (
              <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">{feedback}</div>
            )}
            {!isLoading && !error && !feedback && (
              <div className="flex items-center justify-center h-full text-center text-gray-500 dark:text-slate-500">
                <div>
                  <WorkoutFormCheckerIcon className="h-24 w-24 mx-auto mb-4" />
                  <p>Your personalized form feedback will appear here.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default WorkoutFormChecker;

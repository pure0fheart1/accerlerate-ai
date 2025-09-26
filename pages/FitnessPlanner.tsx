import React, { useState, useCallback, useMemo } from 'react';
import { HeartIcon, LoaderIcon, AlertTriangleIcon, SparklesIcon } from '../components/icons';
import { createFitnessPlan } from '../services/geminiService';
import { FitnessPlan } from '../types';
import { VoiceInputButton } from '../components/VoiceInputButton';

const LEVELS = ["Beginner", "Intermediate", "Advanced"];

const FitnessPlanner: React.FC = () => {
  const [goal, setGoal] = useState('');
  const [days, setDays] = useState('3');
  const [level, setLevel] = useState('Beginner');
  const [plan, setPlan] = useState<FitnessPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!goal.trim()) {
      setError("Please specify your fitness goal.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setPlan(null);
    try {
      const result = await createFitnessPlan({ goal, days, level });
      setPlan(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [goal, days, level]);

  const isGenerateDisabled = useMemo(() => isLoading || !goal.trim(), [isLoading, goal]);

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center gap-4 mb-4">
        <HeartIcon className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100">Fitness Planner</h1>
      </header>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-6 max-w-4xl">
        Create personalized workout plans tailored to your goals. Let AI be your personal trainer.
      </p>

      <main className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-0">
        <div className="lg:col-span-1 bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 flex flex-col gap-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100">Your Fitness Goals</h2>
          <div>
            <label htmlFor="goal" className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-2">Primary Goal</label>
            <div className="relative">
                <input id="goal" type="text" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="e.g., Build muscle, Lose weight" className="w-full p-2 bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg pr-12 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 transition-all" />
                <div className="absolute inset-y-0 right-0 flex items-center pr-2"><VoiceInputButton onTranscript={setGoal} /></div>
            </div>
          </div>
          <div>
            <label htmlFor="days" className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-2">Days per Week</label>
            <input id="days" type="number" min="1" max="7" value={days} onChange={(e) => setDays(e.target.value)} className="w-full p-2 bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 transition-all" />
          </div>
          <div>
            <label htmlFor="level" className="block text-sm font-medium text-gray-700 dark:text-slate-400 mb-2">Fitness Level</label>
            <select id="level" value={level} onChange={(e) => setLevel(e.target.value)} className="w-full p-2 bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 transition-all">
              {LEVELS.map(l => <option key={l} value={l} className="bg-white dark:bg-slate-900">{l}</option>)}
            </select>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerateDisabled}
            className="w-full mt-auto py-3 px-6 bg-indigo-600 text-white font-semibold rounded-lg shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/40 hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            {isLoading ? <><LoaderIcon className="h-5 w-5" /> Building Plan...</> : <><SparklesIcon className="h-5 w-5" /> Generate Plan</>}
          </button>
        </div>

        <div className="lg:col-span-2 bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 flex flex-col min-h-0">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100 mb-4">Your Workout Plan</h2>
          <div className="w-full flex-grow bg-gray-50 dark:bg-slate-900 rounded-xl p-4 overflow-y-auto border border-gray-200 dark:border-slate-700">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <LoaderIcon className="h-12 w-12 text-indigo-500 dark:text-indigo-400" />
                <p className="text-indigo-600 dark:text-indigo-300">Generating your personalized plan...</p>
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

            {!isLoading && !error && plan && (
              <div>
                <h3 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">{plan.title}</h3>
                <div className="flex flex-wrap gap-4 mb-6 text-sm">
                  <span className="bg-gray-200 dark:bg-slate-700 px-3 py-1 rounded-full text-gray-800 dark:text-slate-200"><b>Goal:</b> {plan.goal}</span>
                  <span className="bg-gray-200 dark:bg-slate-700 px-3 py-1 rounded-full text-gray-800 dark:text-slate-200"><b>Duration:</b> {plan.duration}</span>
                  <span className="bg-gray-200 dark:bg-slate-700 px-3 py-1 rounded-full text-gray-800 dark:text-slate-200"><b>Frequency:</b> {plan.frequency}</span>
                </div>
                <div className="space-y-4">
                    {plan.schedule.map((day, i) => (
                        <div key={i} className="bg-white dark:bg-slate-800/50 p-4 rounded-lg border border-gray-200 dark:border-slate-700">
                            <h4 className="text-xl font-semibold text-gray-900 dark:text-slate-100">{day.day}: <span className="text-cyan-600 dark:text-cyan-400">{day.focus}</span></h4>
                            <p className="text-gray-700 dark:text-slate-300 mt-1">{day.workout}</p>
                        </div>
                    ))}
                </div>
              </div>
            )}
            
            {!isLoading && !error && !plan && (
              <div className="flex items-center justify-center h-full text-center text-gray-500 dark:text-slate-500">
                <div>
                  <HeartIcon className="h-24 w-24 mx-auto mb-4" />
                  <p>Your personalized fitness plan will appear here.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default FitnessPlanner;
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { BudgetPlannerIcon, LoaderIcon, AlertTriangleIcon, SparklesIcon } from '../components/icons';
import { createBudgetPlan } from '../services/geminiService';
import { BudgetPlan } from '../types';
import { VoiceInputButton } from '../components/VoiceInputButton';

const INCOME_KEY = 'accelerate-budgetplanner-income';
const EXPENSES_KEY = 'accelerate-budgetplanner-expenses';
const PLAN_KEY = 'accelerate-budgetplanner-plan';

const BudgetPlanner: React.FC = () => {
  const [income, setIncome] = useState(() => localStorage.getItem(INCOME_KEY) || '');
  const [expenses, setExpenses] = useState(() => localStorage.getItem(EXPENSES_KEY) || '');
  const [plan, setPlan] = useState<BudgetPlan | null>(() => {
    try {
      const stored = localStorage.getItem(PLAN_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => { localStorage.setItem(INCOME_KEY, income); }, [income]);
  useEffect(() => { localStorage.setItem(EXPENSES_KEY, expenses); }, [expenses]);
  useEffect(() => {
    if (plan) localStorage.setItem(PLAN_KEY, JSON.stringify(plan));
    else localStorage.removeItem(PLAN_KEY);
  }, [plan]);

  const handleGenerate = useCallback(async () => {
    if (!income.trim() || !expenses.trim()) {
      setError("Please provide your income and a list of expenses.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setPlan(null);
    try {
      const result = await createBudgetPlan({ income, expenses });
      setPlan(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [income, expenses]);

  const isGenerateDisabled = useMemo(() => isLoading || !income.trim() || !expenses.trim(), [isLoading, income, expenses]);
  
  const totalAllocated = useMemo(() => plan?.categories.reduce((acc, cat) => acc + cat.allocated, 0) || 0, [plan]);
  const remaining = useMemo(() => (plan?.income || 0) - totalAllocated, [plan, totalAllocated]);

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center gap-4 mb-4">
        <BudgetPlannerIcon className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Budget Planner</h1>
      </header>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 max-w-4xl">
        Create a personalized budget based on your income and expenses. Let AI help you organize your finances.
      </p>

      <main className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-0">
        <div className="lg:col-span-1 bg-white/70 dark:bg-gray-950/30 backdrop-blur-md border border-gray-200 dark:border-gray-800/50 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 flex flex-col gap-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Your Finances</h2>
          <div>
            <label htmlFor="income" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">Monthly Income</label>
            <input id="income" type="text" value={income} onChange={(e) => setIncome(e.target.value)} placeholder="e.g., 4000" className="w-full p-2 bg-gray-100 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="flex-grow flex flex-col">
            <label htmlFor="expenses" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">Monthly Expenses</label>
            <div className="relative h-full">
                <textarea id="expenses" value={expenses} onChange={(e) => setExpenses(e.target.value)} placeholder="List your expenses, e.g., Rent: 1500, Groceries: 400, Gas: 100, Entertainment: 150" className="w-full h-full p-2 bg-gray-100 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 rounded-lg resize-none text-gray-900 dark:text-white pr-12 focus:ring-2 focus:ring-indigo-500" />
                 <div className="absolute bottom-2 right-2">
                    <VoiceInputButton onTranscript={(t) => setExpenses(current => current + ', ' + t)} />
                </div>
            </div>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerateDisabled}
            className="w-full mt-4 py-3 px-6 bg-indigo-600 text-white font-semibold rounded-lg shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/40 hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            {isLoading ? <><LoaderIcon className="h-5 w-5" /> Planning...</> : <><SparklesIcon className="h-5 w-5" /> Plan Budget</>}
          </button>
        </div>

        <div className="lg:col-span-2 bg-white/70 dark:bg-gray-950/30 backdrop-blur-md border border-gray-200 dark:border-gray-800/50 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 flex flex-col min-h-0">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Your Budget Plan</h2>
          <div className="w-full flex-grow bg-gray-50 dark:bg-black/20 rounded-xl p-4 overflow-y-auto border border-gray-200 dark:border-gray-800">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full gap-4"><LoaderIcon className="h-12 w-12 text-indigo-500 dark:text-indigo-400" /><p className="text-indigo-600 dark:text-indigo-300">Calculating your budget...</p></div>
            )}
            {error && !isLoading && (
              <div className="flex items-center justify-center h-full"><div className="text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-4 rounded-lg flex items-center gap-3"><AlertTriangleIcon className="h-8 w-8" /><div><h3 className="font-bold">Error</h3><p className="text-sm">{error}</p></div></div></div>
            )}
            {!isLoading && !error && plan && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg"><div className="text-sm text-green-800 dark:text-green-300">Income</div><div className="text-2xl font-bold text-green-900 dark:text-green-200">${plan.income.toLocaleString()}</div></div>
                    <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg"><div className="text-sm text-red-800 dark:text-red-300">Allocated</div><div className="text-2xl font-bold text-red-900 dark:text-red-200">${totalAllocated.toLocaleString()}</div></div>
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg"><div className="text-sm text-blue-800 dark:text-blue-300">Remaining</div><div className="text-2xl font-bold text-blue-900 dark:text-blue-200">${remaining.toLocaleString()}</div></div>
                </div>
                <div>
                    {plan.categories.map((cat, i) => (
                        <div key={i} className="flex justify-between items-center p-3 border-b border-gray-200 dark:border-gray-700">
                            <span className="font-medium text-gray-800 dark:text-gray-200">{cat.name}</span>
                            <span className="font-semibold text-gray-900 dark:text-white">${cat.allocated.toLocaleString()}</span>
                        </div>
                    ))}
                </div>
              </div>
            )}
            {!isLoading && !error && !plan && (
              <div className="flex items-center justify-center h-full text-center text-gray-400 dark:text-gray-600">
                <div><BudgetPlannerIcon className="h-24 w-24 mx-auto mb-4" /><p>Your personalized budget plan will appear here.</p></div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default BudgetPlanner;

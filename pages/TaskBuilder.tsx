import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ClipboardListIcon, LoaderIcon, AlertTriangleIcon, TrashIcon, SparklesIcon } from '../components/icons';
import { manageTasks } from '../services/geminiService';
import { Task } from '../types';
import { VoiceInputButton } from '../components/VoiceInputButton';

const TASK_STORAGE_KEY = 'aiTaskManagerTasks';

const TaskBuilder: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [isTasksExpanded, setIsTasksExpanded] = useState(true);
    const [isInputExpanded, setIsInputExpanded] = useState(true);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        try {
            const storedTasks = localStorage.getItem(TASK_STORAGE_KEY);
            if (storedTasks) {
                setTasks(JSON.parse(storedTasks));
            }
        } catch (e) {
            console.error("Failed to parse tasks from localStorage", e);
        }
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setActiveDropdown(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const saveTasks = (updatedTasks: Task[]) => {
        setTasks(updatedTasks);
        localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(updatedTasks));
    };

    const handleProcess = useCallback(async () => {
        if (!userInput.trim()) {
            setError("Please enter a command or task.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const updatedTasks = await manageTasks(userInput, tasks);
            saveTasks(updatedTasks);
            setUserInput(''); // Clear input on success
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [userInput, tasks]);
    
    const handleToggleTask = (id: string) => {
        const updatedTasks = tasks.map(task => 
            task.id === id ? { ...task, completed: !task.completed } : task
        );
        saveTasks(updatedTasks);
    };

    const handleDeleteTask = (id: string) => {
        const updatedTasks = tasks.filter(task => task.id !== id);
        saveTasks(updatedTasks);
    };

    const handlePriorityChange = (id: string, newPriority: Task['priority']) => {
        const updatedTasks = tasks.map(task =>
            task.id === id ? { ...task, priority: newPriority } : task
        );
        saveTasks(updatedTasks);
        setActiveDropdown(null);
    };

    const isProcessDisabled = useMemo(() => isLoading || !userInput.trim(), [isLoading, userInput]);

    const priorityStyles: { [key in Task['priority']]: string } = {
        High: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300 border border-red-200 dark:border-red-500/30',
        Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-500/30',
        Low: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30',
    };

    const sortedTasks = useMemo(() => {
        const priorityOrder = { High: 1, Medium: 2, Low: 3 };
        return [...tasks].sort((a, b) => {
            if (a.completed !== b.completed) return a.completed ? 1 : -1;
            const priorityA = a.priority || 'Low';
            const priorityB = b.priority || 'Low';
            return priorityOrder[priorityA] - priorityOrder[priorityB];
        });
    }, [tasks]);

    return (
        <div className="h-full flex flex-col">
            <div className="flex-shrink-0 mb-4">
                <button
                    onClick={() => setIsInputExpanded(!isInputExpanded)}
                    className="flex items-center justify-between text-2xl font-bold text-gray-900 dark:text-slate-100 mb-3 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors w-full text-left"
                >
                    <div className="flex items-center gap-4">
                        <ClipboardListIcon className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
                        <span className="text-4xl">AI Task Manager</span>
                    </div>
                    <svg
                        className={`w-6 h-6 transition-transform duration-200 ${isInputExpanded ? 'transform rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {isInputExpanded && (
                    <>
                        <p className="text-lg text-gray-600 dark:text-slate-400 mb-4 max-w-4xl">
                            Use natural language to manage your tasks. Try "Add 'finish report' for tomorrow, high priority" or "Prioritize my tasks."
                        </p>

                        <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-2xl p-4 shadow-xl dark:shadow-2xl dark:shadow-black/20 mb-3 flex flex-col gap-3">
                            <div className="relative">
                                <textarea
                                    value={userInput}
                                    onChange={(e) => setUserInput(e.target.value)}
                                    placeholder="Describe your tasks or commands here..."
                                    className="w-full p-3 bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 transition-all h-20 resize-none pr-12"
                                    aria-label="Natural language task input"
                                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (!isProcessDisabled) handleProcess(); } }}
                                />
                                <div className="absolute top-3 right-3">
                                    <VoiceInputButton onTranscript={(transcript) => setUserInput(p => (p ? p.trim() + ' ' : '') + transcript)} />
                                </div>
                            </div>
                            <button
                                onClick={handleProcess}
                                disabled={isProcessDisabled}
                                className="w-full sm:w-auto self-end py-2 px-6 bg-indigo-600 text-white font-semibold rounded-lg shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/40 hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2"
                            >
                                {isLoading ? <><LoaderIcon className="h-5 w-5" /><span>Processing...</span></> : <><SparklesIcon className="h-5 w-5"/><span>Process</span></>}
                            </button>
                        </div>

                        {error && <div className="text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-3 rounded-lg flex items-center gap-3 mb-3"><AlertTriangleIcon className="h-6 w-6 text-red-500 dark:text-red-400 flex-shrink-0" /><div><h3 className="font-bold text-sm">Error</h3><p className="text-xs">{error}</p></div></div>}
                    </>
                )}
            </div>

            <main className="flex-grow flex flex-col min-h-0 overflow-hidden">
                <button
                    onClick={() => setIsTasksExpanded(!isTasksExpanded)}
                    className="flex items-center justify-between text-2xl font-bold text-gray-900 dark:text-slate-100 mb-3 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors w-full text-left flex-shrink-0"
                >
                    <span>Your Tasks</span>
                    <svg
                        className={`w-6 h-6 transition-transform duration-200 ${isTasksExpanded ? 'transform rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {isTasksExpanded && (
                    <div className="flex-grow flex flex-col min-h-0 overflow-hidden">
                        {isLoading && tasks.length === 0 ? (
                            <div className="flex justify-center items-center h-full">
                                <div className="flex flex-col items-center gap-4 text-center">
                                    <LoaderIcon className="h-12 w-12 text-indigo-500 dark:text-indigo-400" />
                                    <p className="text-indigo-600 dark:text-indigo-300">Organizing your tasks...</p>
                                </div>
                            </div>
                        ) : sortedTasks.length > 0 ? (
                            <div className="space-y-3 overflow-y-auto pr-2 flex-grow">
                                {sortedTasks.map((task) => (
                                    <div key={task.id} className={`p-4 rounded-lg transition-all duration-300 flex items-start gap-4 border ${task.completed ? 'bg-gray-100 dark:bg-slate-800/20 border-gray-200 dark:border-slate-800 opacity-60' : 'bg-white dark:bg-slate-800/50 border-gray-200 dark:border-slate-700'}`}>
                                        <input type="checkbox" checked={task.completed} onChange={() => handleToggleTask(task.id)} className="mt-1 h-5 w-5 rounded bg-gray-200 dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-indigo-600 dark:text-indigo-500 focus:ring-indigo-500 dark:focus:ring-indigo-600 cursor-pointer flex-shrink-0" />
                                        <div className="flex-1">
                                            <span className={`font-bold text-lg ${task.completed ? 'line-through text-gray-500 dark:text-slate-400' : 'text-gray-900 dark:text-slate-100'}`}>{task.taskName}</span>
                                            <p className={`text-sm ${task.completed ? 'text-gray-500 dark:text-slate-500' : 'text-gray-600 dark:text-slate-300'}`}>{task.description}</p>
                                            <div className="flex items-center gap-3 mt-2 text-xs">
                                                {task.priority && (
                                                    <div className="relative">
                                                        <button
                                                            onClick={() => setActiveDropdown(activeDropdown === task.id ? null : task.id)}
                                                            className={`px-2 py-0.5 rounded-full font-semibold transition-all duration-200 ${priorityStyles[task.priority]} hover:ring-2 hover:ring-offset-2 hover:ring-offset-white dark:hover:ring-offset-slate-800 ${
                                                                { High: 'hover:ring-red-500', Medium: 'hover:ring-yellow-500', Low: 'hover:ring-blue-500' }[task.priority]
                                                            }`}
                                                            aria-haspopup="true"
                                                            aria-expanded={activeDropdown === task.id}
                                                        >
                                                            {task.priority}
                                                        </button>
                                                        {activeDropdown === task.id && (
                                                            <div
                                                                ref={dropdownRef}
                                                                className="absolute z-10 top-full mt-2 w-32 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-md shadow-lg"
                                                            >
                                                                {(['High', 'Medium', 'Low'] as const).map(p => (
                                                                    <button
                                                                        key={p}
                                                                        onClick={() => handlePriorityChange(task.id, p)}
                                                                        className="w-full text-left px-3 py-2 text-sm text-gray-800 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 flex items-center gap-2 first:rounded-t-md last:rounded-b-md"
                                                                    >
                                                                        <span className={`h-2 w-2 rounded-full ${
                                                                            { High: 'bg-red-500', Medium: 'bg-yellow-500', Low: 'bg-blue-500' }[p]
                                                                        }`}></span>
                                                                        {p}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                {task.dueDate && <span className="text-gray-500 dark:text-slate-400">{new Date(task.dueDate + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>}
                                            </div>
                                        </div>
                                        <button onClick={() => handleDeleteTask(task.id)} className="p-2 text-gray-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700/50 transition-colors"><TrashIcon className="h-5 w-5"/></button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex-grow flex justify-center items-center text-center text-gray-500 dark:text-slate-500 bg-gray-100/50 dark:bg-slate-800/10 rounded-2xl border-2 border-dashed border-gray-300 dark:border-slate-700">
                                <div>
                                    <ClipboardListIcon className="h-24 w-24 mx-auto mb-4" />
                                    <h2 className="text-2xl font-semibold text-gray-700 dark:text-slate-400">Your task list is empty</h2>
                                    <p className="mt-1">Use the input above to add your first task!</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default TaskBuilder;
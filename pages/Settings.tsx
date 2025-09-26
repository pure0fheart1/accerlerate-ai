import React, { useState, useEffect } from 'react';
import { CogIcon, TrashIcon } from '../components/icons';
// FIX: `updateShortcuts` is passed in as a prop, not exported from App.tsx
import { Shortcuts, ShortcutAction, Shortcut, defaultShortcuts } from '../App';
import { useAuth } from '../contexts/AuthContext';

// Constants for localStorage keys
const THEME_KEY = 'accelerate-theme';
const THINKING_KEY = 'accelerate-thinking-enabled';
const SIDEBAR_COLLAPSED_KEY = 'accelerate-sidebar-collapsed';
const PROMPT_HISTORY_KEY = 'promptHistory';
const TASK_STORAGE_KEY = 'aiTaskManagerTasks';
const WIKI_STORAGE_KEY = 'personalWikiPages';
const FAVORITES_KEY = 'accelerate-favorites';
const SIDEBAR_WIDTH_KEY = 'accelerate-sidebar-width';

const allDataKeys = [
    THEME_KEY,
    THINKING_KEY,
    SIDEBAR_COLLAPSED_KEY,
    SIDEBAR_WIDTH_KEY,
    PROMPT_HISTORY_KEY,
    TASK_STORAGE_KEY,
    WIKI_STORAGE_KEY,
    FAVORITES_KEY,
    // Add the shortcuts key to the list for deletion
    'accelerate-shortcuts',
];

interface SettingsProps {
    shortcuts: Shortcuts;
    updateShortcuts: (shortcuts: Shortcuts) => void;
}


const Settings: React.FC<SettingsProps> = ({ shortcuts, updateShortcuts }) => {
    const { user, signOut } = useAuth();

    // Appearance State
    const [theme, setTheme] = useState(() => {
        const storedTheme = localStorage.getItem(THEME_KEY);
        if (storedTheme) return storedTheme;
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });
    
    const [defaultSidebarCollapsed, setDefaultSidebarCollapsed] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem(SIDEBAR_COLLAPSED_KEY) || 'false');
        } catch {
            return false;
        }
    });
    
    // AI Behavior State
    const [enableThinking, setEnableThinking] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem(THINKING_KEY) ?? 'true');
        } catch {
            return true;
        }
    });
    
    // Shortcuts State
    const [recordingFor, setRecordingFor] = useState<ShortcutAction | null>(null);

    // Handle saving settings to localStorage and applying theme
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem(THEME_KEY, theme);
    }, [theme]);

    useEffect(() => {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, JSON.stringify(defaultSidebarCollapsed));
    }, [defaultSidebarCollapsed]);

    useEffect(() => {
        localStorage.setItem(THINKING_KEY, JSON.stringify(enableThinking));
    }, [enableThinking]);
    
    // Effect for recording new shortcut
    useEffect(() => {
        if (!recordingFor) return;

        const handleRecordKey = (e: KeyboardEvent) => {
            e.preventDefault();
            e.stopPropagation();

            if (['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) return;

            const newShortcutDef: Omit<Shortcut, 'name'> = {
                ctrlKey: e.ctrlKey,
                altKey: e.altKey,
                shiftKey: e.shiftKey,
                key: e.key,
                code: e.code,
            };

            const isDuplicate = (Object.keys(shortcuts) as ShortcutAction[]).some(key => {
                if (key === recordingFor) return false;
                const s = shortcuts[key];
                return s.ctrlKey === newShortcutDef.ctrlKey &&
                       s.altKey === newShortcutDef.altKey &&
                       s.shiftKey === newShortcutDef.shiftKey &&
                       s.code === newShortcutDef.code;
            });

            if (isDuplicate) {
                alert('This shortcut is already in use. Please choose another.');
                setRecordingFor(null);
                return;
            }

            const updated: Shortcuts = {
                ...shortcuts,
                [recordingFor]: { ...shortcuts[recordingFor], ...newShortcutDef }
            };

            updateShortcuts(updated);
            setRecordingFor(null);
        };
        
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setRecordingFor(null);
            }
        };

        window.addEventListener('keydown', handleRecordKey, { capture: true });
        window.addEventListener('keyup', handleEscape, { capture: true }); // Use keyup for escape
        
        return () => {
            window.removeEventListener('keydown', handleRecordKey, { capture: true });
            window.removeEventListener('keyup', handleEscape, { capture: true });
        };
    }, [recordingFor, shortcuts, updateShortcuts]);


    // Data Management Handlers
    const handleClearHistory = (key: string, name: string) => {
        if (window.confirm(`Are you sure you want to clear the ${name}? This action cannot be undone.`)) {
            localStorage.removeItem(key);
            alert(`${name} has been cleared.`);
        }
    };

    const handleExportData = () => {
        const data: { [key: string]: any } = {};
        allDataKeys.forEach(key => {
            const value = localStorage.getItem(key);
            if (value !== null) {
                try {
                    data[key] = JSON.parse(value);
                } catch {
                    data[key] = value;
                }
            }
        });

        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `accelerate-ai-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleDeleteAllData = () => {
        if (window.confirm('ARE YOU ABSOLUTELY SURE?\nThis will delete all your local data, including settings, history, tasks, and wiki pages. This action is irreversible.')) {
            allDataKeys.forEach(key => localStorage.removeItem(key));
            alert('All application data has been deleted.');
            window.location.reload();
        }
    };

    const handleResetShortcuts = () => {
        if (window.confirm('Are you sure you want to reset all keyboard shortcuts to their defaults?')) {
            updateShortcuts(defaultShortcuts);
        }
    };
    
    const formatShortcut = (shortcut: Shortcut): string => {
        const parts = [];
        if (shortcut.ctrlKey) parts.push('Ctrl');
        if (shortcut.altKey) parts.push('Alt');
        if (shortcut.shiftKey) parts.push('Shift');
        
        let displayKey = shortcut.key.toUpperCase();
        if (shortcut.code === 'Space') displayKey = 'Space';
        else if (shortcut.key.length > 1) displayKey = shortcut.key;

        parts.push(displayKey);
        return parts.join(' + ');
    };

    return (
        <div className="h-full flex flex-col">
            <header className="flex items-center gap-4 mb-8">
                <CogIcon className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Settings</h1>
            </header>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-4xl">
                Customize your Accelerate.ai experience and manage your application data.
            </p>

            <div className="flex-grow overflow-y-auto space-y-12 pr-4">
                <section>
                    <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500/20 dark:border-indigo-500/30 pb-2 mb-6">Appearance</h2>
                    <div className="space-y-6 max-w-md">
                        <div className="flex items-center justify-between">
                            <label htmlFor="theme" className="font-semibold text-gray-800 dark:text-gray-200">Theme</label>
                            <select id="theme" value={theme} onChange={e => setTheme(e.target.value)} className="w-48 p-2 bg-gray-100 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500">
                                <option value="light">Light</option>
                                <option value="dark">Dark</option>
                            </select>
                        </div>
                        <div className="flex items-center justify-between">
                            <label htmlFor="sidebar-toggle" className="font-semibold text-gray-800 dark:text-gray-200">Collapse sidebar by default</label>
                            <button id="sidebar-toggle" onClick={() => setDefaultSidebarCollapsed(!defaultSidebarCollapsed)} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${defaultSidebarCollapsed ? 'bg-indigo-600' : 'bg-gray-400 dark:bg-gray-600'}`} aria-pressed={defaultSidebarCollapsed}>
                                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${defaultSidebarCollapsed ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500/20 dark:border-indigo-500/30 pb-2 mb-6">AI Behavior</h2>
                    <div className="space-y-6 max-w-2xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <label htmlFor="thinking-toggle" className="font-semibold text-gray-800 dark:text-gray-200">Enable AI "thinking"</label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Allows the AI to take more time for higher quality responses. <br />Disable for faster, lower-latency answers (e.g., for chat bots).</p>
                            </div>
                            <button id="thinking-toggle" onClick={() => setEnableThinking(!enableThinking)} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors flex-shrink-0 ${enableThinking ? 'bg-indigo-600' : 'bg-gray-400 dark:bg-gray-600'}`} aria-pressed={enableThinking}>
                                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${enableThinking ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    </div>
                </section>
                
                 <section>
                    <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500/20 dark:border-indigo-500/30 pb-2 mb-6">Keyboard Shortcuts</h2>
                    <div className="space-y-4 max-w-2xl">
                         {(Object.keys(shortcuts) as ShortcutAction[]).map(action => (
                            <div key={action} className="flex items-center justify-between p-3 bg-white/50 dark:bg-slate-800/20 rounded-lg">
                                <label className="font-medium text-gray-800 dark:text-gray-200">{shortcuts[action].name}</label>
                                <button
                                    onClick={() => setRecordingFor(action)}
                                    className="px-3 py-1 bg-gray-200 dark:bg-slate-700 rounded-md text-gray-700 dark:text-slate-200 font-mono text-sm hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
                                >
                                    {recordingFor === action ? 'Press new key... (Esc to cancel)' : formatShortcut(shortcuts[action])}
                                </button>
                            </div>
                        ))}
                         <div className="pt-4 text-right">
                             <button onClick={handleResetShortcuts} className="py-2 px-4 bg-gray-200 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors">
                                Reset to Defaults
                            </button>
                         </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500/20 dark:border-indigo-500/30 pb-2 mb-6">Data Management</h2>
                    <div className="space-y-4 max-w-2xl">
                         <p className="text-gray-600 dark:text-gray-400 text-sm">Your data is stored locally in your browser. You have full control over it.</p>
                        <div className="bg-white/70 dark:bg-gray-950/30 backdrop-blur-md border border-gray-200 dark:border-gray-800/50 rounded-2xl p-6 space-y-4">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Clear Specific Data</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <button onClick={() => handleClearHistory(PROMPT_HISTORY_KEY, 'Image Prompt History')} className="p-3 bg-gray-200 dark:bg-gray-700/50 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium text-sm text-gray-800 dark:text-gray-200">Clear Prompt History</button>
                                <button onClick={() => handleClearHistory(TASK_STORAGE_KEY, 'Task Manager Data')} className="p-3 bg-gray-200 dark:bg-gray-700/50 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium text-sm text-gray-800 dark:text-gray-200">Clear Task Data</button>
                                <button onClick={() => handleClearHistory(WIKI_STORAGE_KEY, 'Personal Wiki Pages')} className="p-3 bg-gray-200 dark:bg-gray-700/50 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium text-sm text-gray-800 dark:text-gray-200">Clear Wiki Pages</button>
                            </div>
                        </div>
                        <div className="bg-white/70 dark:bg-gray-950/30 backdrop-blur-md border border-gray-200 dark:border-gray-800/50 rounded-2xl p-6 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Export All Data</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">Save a backup of all your data as a JSON file.</p>
                            </div>
                            <button onClick={handleExportData} className="py-2 px-5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 transition-colors">Export</button>
                        </div>
                         <div className="bg-red-100 dark:bg-red-900/20 backdrop-blur-md border border-red-200 dark:border-red-500/30 rounded-2xl p-6 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-semibold text-red-800 dark:text-red-300">Delete All Data</h3>
                                <p className="text-red-700/80 dark:text-red-400/80 text-sm">Permanently delete all application data from your browser.</p>
                            </div>
                            <button onClick={handleDeleteAllData} className="py-2 px-5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-500 transition-colors flex items-center gap-2">
                                <TrashIcon className="h-4 w-4" /> Delete
                            </button>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500/20 dark:border-indigo-500/30 pb-2 mb-6">Account</h2>
                    <div className="space-y-4 max-w-2xl">
                        <div className="bg-white/70 dark:bg-gray-950/30 backdrop-blur-md border border-gray-200 dark:border-gray-800/50 rounded-2xl p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Account Information</h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                                        Signed in as: {user?.email}
                                    </p>
                                </div>
                                <button
                                    onClick={async () => {
                                        const { error } = await signOut();
                                        if (error) {
                                            console.error('Error signing out:', error);
                                        }
                                    }}
                                    className="py-2 px-5 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
                                >
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Settings;

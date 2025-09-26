import React, { useState, useCallback, useMemo } from 'react';
import { MindMapIcon, LoaderIcon, AlertTriangleIcon, SparklesIcon } from '../components/icons';
import { generateMindMap } from '../services/geminiService';
import { MindMapNode } from '../types';
import { VoiceInputButton } from '../components/VoiceInputButton';

// Recursive component to render each node and its children
const Node: React.FC<{ node: MindMapNode; level: number }> = ({ node, level }) => {
  const levelStyles = [
    // Level 0 is for direct children of the root
    { border: 'border-sky-500 dark:border-sky-600', bg: 'bg-sky-100 dark:bg-sky-900/40', text: 'text-sky-800 dark:text-sky-200' },
    { border: 'border-teal-500 dark:border-teal-600', bg: 'bg-teal-100 dark:bg-teal-900/40', text: 'text-teal-800 dark:text-teal-200' },
    { border: 'border-emerald-500 dark:border-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-800 dark:text-emerald-200' },
  ];
  
  const currentStyle = levelStyles[level % levelStyles.length];

  return (
    <div className={`ml-4 pl-4 border-l-2 ${currentStyle.border}`}>
      <div className={`mb-2 p-3 rounded-lg shadow-sm ${currentStyle.bg}`}>
        <p className={`font-semibold ${currentStyle.text}`}>{node.text}</p>
      </div>
      
      {node.children && node.children.length > 0 && (
        <div className="space-y-2">
          {node.children.map(child => <Node key={child.id} node={child} level={level + 1} />)}
        </div>
      )}
    </div>
  );
};


const MindMapGenerator: React.FC = () => {
    const [topic, setTopic] = useState('');
    const [mindMap, setMindMap] = useState<MindMapNode | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = useCallback(async () => {
        if (!topic.trim()) {
            setError("Please enter a central topic for the mind map.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setMindMap(null);
        try {
            const result = await generateMindMap(topic);
            setMindMap(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [topic]);

    const isGenerateDisabled = useMemo(() => isLoading || !topic.trim(), [isLoading, topic]);

    return (
        <div className="h-full flex flex-col">
            <header className="flex items-center gap-4 mb-4">
                <MindMapIcon className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
                <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100">Mind Map Generator</h1>
            </header>
            <p className="text-lg text-gray-600 dark:text-slate-400 mb-6 max-w-4xl">
                Visualize complex ideas. Enter a central topic and let AI create a structured mind map with main branches and sub-branches.
            </p>

            <main className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-0">
                <div className="lg:col-span-1 bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 flex flex-col gap-6">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100">Central Topic</h2>
                    <div className="relative flex-grow">
                        <label htmlFor="topic" className="block text-sm font-medium text-gray-600 dark:text-slate-400 mb-2">Enter the core idea for your mind map</label>
                        <div className="relative h-full">
                            <textarea
                                id="topic"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="e.g., 'Effective Time Management Strategies'"
                                className="w-full h-full p-2 bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg resize-none min-h-[8rem] pr-12 focus:ring-2 focus:ring-indigo-500 dark:focus:bg-slate-800 transition-all text-gray-900 dark:text-slate-100"
                            />
                            <div className="absolute bottom-2 right-2">
                                <VoiceInputButton onTranscript={(t) => setTopic(current => (current ? current + ' ' : '') + t)} />
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerateDisabled}
                        className="w-full mt-auto py-3 px-6 bg-indigo-600 text-white font-semibold rounded-lg shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/40 hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2"
                    >
                        {isLoading ? <><LoaderIcon className="h-5 w-5" /> Generating...</> : <><SparklesIcon className="h-5 w-5" /> Generate Mind Map</>}
                    </button>
                </div>

                <div className="lg:col-span-2 bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20 flex flex-col min-h-0">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100 mb-4">Generated Mind Map</h2>
                    <div className="w-full flex-grow bg-gray-50 dark:bg-slate-900 rounded-xl p-4 overflow-y-auto border border-gray-200 dark:border-slate-700">
                        {isLoading && (
                            <div className="flex flex-col items-center justify-center h-full gap-4">
                                <LoaderIcon className="h-12 w-12 text-indigo-500 dark:text-indigo-400" />
                                <p className="text-indigo-600 dark:text-indigo-300">Structuring your ideas...</p>
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
                        {!isLoading && !error && mindMap && (
                            <div className="space-y-4">
                                <div className="p-4 rounded-lg shadow-lg bg-indigo-600 text-white">
                                    <h3 className="text-xl font-bold text-center">{mindMap.text}</h3>
                                </div>
                                <div className="space-y-2 pt-2">
                                    {mindMap.children?.map(child => <Node key={child.id} node={child} level={0} />)}
                                </div>
                            </div>
                        )}
                        {!isLoading && !error && !mindMap && (
                            <div className="flex items-center justify-center h-full text-center text-gray-500 dark:text-slate-500">
                                <div>
                                    <MindMapIcon className="h-24 w-24 mx-auto mb-4" />
                                    <p>Your generated mind map will appear here.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MindMapGenerator;

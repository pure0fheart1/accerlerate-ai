import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
    BrainIcon, PlusIcon, PencilIcon, TrashIcon, LoaderIcon, AlertTriangleIcon, SparklesIcon, MarketResearchIcon, XIcon 
} from '../components/icons';
import { WikiPage } from '../types';
import { askWiki } from '../services/geminiService';
import { VoiceInputButton } from '../components/VoiceInputButton';
import { Shortcuts } from '../App';

const WIKI_STORAGE_KEY = 'personalWikiPages';

interface PersonalWikiProps {
    triggerNewPage: boolean;
    setTriggerNewPage: (value: boolean) => void;
    shortcuts: Shortcuts;
    sharedNoteContent: string | null;
    setSharedNoteContent: (content: string | null) => void;
}

const MarkdownRenderer = ({ content, highlight }: { content: string; highlight?: string }) => {
    const highlightRegex = useMemo(() => {
        if (!highlight || highlight.trim() === '') return null;
        const escapedHighlight = highlight.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        return new RegExp(`(${escapedHighlight})`, 'gi');
    }, [highlight]);

    const renderWithHighlight = (text: string) => {
        if (!highlightRegex) return [text];
        const parts = text.split(highlightRegex);
        return parts.map((part, i) =>
            i % 2 === 1 ? (
                <mark key={i} className="bg-yellow-300 dark:bg-yellow-500/30 text-yellow-900 dark:text-yellow-200 rounded px-1 py-0.5">
                    {part}
                </mark>
            ) : (
                part
            )
        );
    };

    const processInline = (line: string) => {
        const segments = line.split(/(\*\*.*?\*\*|\*.*?\*)/g).filter(Boolean);
        return segments.map((segment, index) => {
            if (segment.startsWith('**') && segment.endsWith('**')) {
                return <strong key={index}>{renderWithHighlight(segment.slice(2, -2))}</strong>;
            }
            if (segment.startsWith('*') && segment.endsWith('*')) {
                return <em key={index}>{renderWithHighlight(segment.slice(1, -1))}</em>;
            }
            return renderWithHighlight(segment);
        });
    };

    const elements = useMemo(() => {
        const lines = content.split('\n');
        const renderedElements: React.ReactNode[] = [];
        let listItems: React.ReactNode[] = [];

        const flushList = () => {
            if (listItems.length > 0) {
                renderedElements.push(<ul key={`ul-${renderedElements.length}`} className="list-disc list-inside my-4 space-y-1">{listItems}</ul>);
                listItems = [];
            }
        };

        lines.forEach((line, index) => {
            if (line.startsWith('# ')) {
                flushList();
                renderedElements.push(<h1 key={index} className="text-3xl font-bold mt-6 mb-3 border-b border-gray-200 dark:border-slate-700 pb-2">{processInline(line.substring(2))}</h1>);
            } else if (line.startsWith('## ')) {
                flushList();
                renderedElements.push(<h2 key={index} className="text-2xl font-bold mt-5 mb-2">{processInline(line.substring(3))}</h2>);
            } else if (line.startsWith('### ')) {
                flushList();
                renderedElements.push(<h3 key={index} className="text-xl font-bold mt-4 mb-1">{processInline(line.substring(4))}</h3>);
            } else if (line.startsWith('- ') || line.startsWith('* ')) {
                listItems.push(<li key={index}>{processInline(line.substring(2))}</li>);
            } else if (line.trim() === '') {
                flushList();
            } else {
                flushList();
                renderedElements.push(<p key={index}>{processInline(line)}</p>);
            }
        });

        flushList();
        return renderedElements;
    }, [content, highlightRegex]);

    return <>{elements}</>;
};


const PersonalWiki: React.FC<PersonalWikiProps> = ({ triggerNewPage, setTriggerNewPage, shortcuts, sharedNoteContent, setSharedNoteContent }) => {
    const [pages, setPages] = useState<WikiPage[]>([]);
    const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'welcome' | 'view' | 'edit' | 'create'>('welcome');
    
    const [editTitle, setEditTitle] = useState('');
    const [editContent, setEditContent] = useState('');
    const [editorMode, setEditorMode] = useState<'write' | 'preview'>('write');

    const [searchTerm, setSearchTerm] = useState('');
    const [aiQuestion, setAiQuestion] = useState('');
    const [aiAnswer, setAiAnswer] = useState<string | null>(null);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);

    const contentHistory = useRef<string[]>(['']);
    const historyIndex = useRef(0);
    // FIX: Replaced NodeJS.Timeout with ReturnType<typeof setTimeout> for browser compatibility.
    const historyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        try {
            const storedPages = localStorage.getItem(WIKI_STORAGE_KEY);
            if (storedPages) {
                const parsedPages: WikiPage[] = JSON.parse(storedPages);
                const sortedPages = parsedPages.sort((a, b) => b.createdAt - a.createdAt);
                setPages(sortedPages);
                if (sortedPages.length > 0) {
                    setSelectedPageId(sortedPages[0].id);
                    setViewMode('view');
                }
            }
        } catch (e) {
            console.error("Failed to parse wiki pages from localStorage", e);
        }
    }, []);
    
    const handleNewPage = useCallback(() => {
        setEditTitle('');
        setEditContent('');
        contentHistory.current = [''];
        historyIndex.current = 0;
        setViewMode('create');
        setEditorMode('write');
        setSelectedPageId(null);
        setAiQuestion('');
        setAiAnswer(null);
        setAiError(null);
        setSearchTerm('');
    }, []);

    useEffect(() => {
        if (triggerNewPage) {
            handleNewPage();
            setTriggerNewPage(false);
        }
    }, [triggerNewPage, handleNewPage, setTriggerNewPage]);

    useEffect(() => {
        if (sharedNoteContent) {
            setEditTitle(`Note from ${new Date().toLocaleString()}`);
            setEditContent(sharedNoteContent);
            contentHistory.current = [sharedNoteContent];
            historyIndex.current = 0;
            setViewMode('create');
            setEditorMode('write');
            setSelectedPageId(null);
            setAiQuestion('');
            setAiAnswer(null);
            setAiError(null);
            setSearchTerm('');
            setSharedNoteContent(null); // Consume the shared content
        }
    }, [sharedNoteContent, setSharedNoteContent]);


    useEffect(() => {
        if (pages.length === 0 && viewMode !== 'create') {
            setViewMode('welcome');
            setSelectedPageId(null);
        }
    }, [pages, viewMode]);

    const savePagesToStorage = (updatedPages: WikiPage[]) => {
        localStorage.setItem(WIKI_STORAGE_KEY, JSON.stringify(updatedPages));
    };

    const selectedPage = useMemo(() => {
        return pages.find(p => p.id === selectedPageId) || null;
    }, [pages, selectedPageId]);

    const handleSelectPage = (id: string) => {
        setSelectedPageId(id);
        setViewMode('view');
        setAiQuestion('');
        setAiAnswer(null);
        setAiError(null);
        setSearchTerm('');
    };

    const handleEditPage = () => {
        if (selectedPage) {
            setEditTitle(selectedPage.title);
            setEditContent(selectedPage.content);
            contentHistory.current = [selectedPage.content];
            historyIndex.current = 0;
            setViewMode('edit');
            setEditorMode('write');
        }
    };

    const handleDeletePage = (id: string) => {
        if (window.confirm('Are you sure you want to delete this page?')) {
            const updatedPages = pages.filter(p => p.id !== id);
            setPages(updatedPages);
            savePagesToStorage(updatedPages);
            if (selectedPageId === id) {
                const newSelectedId = updatedPages.length > 0 ? updatedPages[0].id : null;
                setSelectedPageId(newSelectedId);
                setViewMode(newSelectedId ? 'view' : 'welcome');
            }
        }
    };

    const handleSavePage = () => {
        if (!editTitle.trim()) {
            alert('Title cannot be empty.');
            return;
        }

        let updatedPages: WikiPage[];
        let newPageId: string;

        if (viewMode === 'create') {
            const newPage: WikiPage = {
                id: Date.now().toString(),
                title: editTitle,
                content: editContent,
                createdAt: Date.now(),
            };
            updatedPages = [newPage, ...pages];
            newPageId = newPage.id;
        } else if (viewMode === 'edit' && selectedPageId) {
            updatedPages = pages.map(p =>
                p.id === selectedPageId ? { ...p, title: editTitle, content: editContent } : p
            );
            newPageId = selectedPageId;
        } else {
            return;
        }

        updatedPages.sort((a, b) => b.createdAt - a.createdAt);
        setPages(updatedPages);
        savePagesToStorage(updatedPages);
        setSelectedPageId(newPageId);
        setViewMode('view');
    };

    const handleCancelEdit = () => {
        if (pages.length > 0 && selectedPageId) {
            setViewMode('view');
        } else {
            setViewMode(pages.length > 0 ? 'view' : 'welcome');
            if(pages.length > 0) setSelectedPageId(pages[0].id);
        }
    };

    const handleAskAI = useCallback(async () => {
        if (!aiQuestion.trim() || !selectedPage) return;
        
        setIsAiLoading(true);
        setAiAnswer(null);
        setAiError(null);

        try {
            const answer = await askWiki(selectedPage.content, aiQuestion);
            setAiAnswer(answer);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
            setAiError(errorMessage);
        } finally {
            setIsAiLoading(false);
        }
    }, [aiQuestion, selectedPage]);
    
    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newContent = e.target.value;
        setEditContent(newContent);
        
        if (historyTimer.current) clearTimeout(historyTimer.current);

        historyTimer.current = setTimeout(() => {
            const newHistory = contentHistory.current.slice(0, historyIndex.current + 1);
            newHistory.push(newContent);
            contentHistory.current = newHistory;
            historyIndex.current = newHistory.length - 1;
        }, 500);
    };

    const handleContentKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        const undoShortcut = shortcuts.wikiUndo;
        const redoShortcut = shortcuts.wikiRedo;

        const isUndo = e.ctrlKey === undoShortcut.ctrlKey && e.altKey === undoShortcut.altKey && e.shiftKey === undoShortcut.shiftKey && e.code === undoShortcut.code;
        const isRedo = e.ctrlKey === redoShortcut.ctrlKey && e.altKey === redoShortcut.altKey && e.shiftKey === redoShortcut.shiftKey && e.code === redoShortcut.code;

        if (isUndo) {
            e.preventDefault();
            if (historyTimer.current) clearTimeout(historyTimer.current);
            if (historyIndex.current > 0) {
                historyIndex.current--;
                setEditContent(contentHistory.current[historyIndex.current]);
            }
        } else if (isRedo) {
            e.preventDefault();
            if (historyTimer.current) clearTimeout(historyTimer.current);
            if (historyIndex.current < contentHistory.current.length - 1) {
                historyIndex.current++;
                setEditContent(contentHistory.current[historyIndex.current]);
            }
        }
    };
    
    const renderContent = () => {
        switch (viewMode) {
            case 'welcome':
                return (
                    <div className="text-center text-gray-500 dark:text-slate-500">
                        <BrainIcon className="h-24 w-24 mx-auto mb-4" />
                        <h2 className="text-2xl font-semibold text-gray-700 dark:text-slate-300">Welcome to your Personal Wiki</h2>
                        <p className="text-gray-600 dark:text-slate-400 mt-2 mb-6">Capture your thoughts, notes, and ideas in one place.</p>
                        <button onClick={handleNewPage} className="py-2 px-5 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2 mx-auto">
                            <PlusIcon className="h-5 w-5" />
                            Create Your First Page
                        </button>
                    </div>
                );
            case 'view':
                if (!selectedPage) return null;
                return (
                    <div className="h-full flex flex-col">
                        <header className="pb-4 border-b border-gray-200 dark:border-slate-700 mb-4 flex justify-between items-start gap-4">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-slate-100 flex-grow">{selectedPage.title}</h2>
                            <button onClick={handleEditPage} className="flex-shrink-0 flex items-center gap-2 py-2 px-4 bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-slate-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 hover:text-gray-900 dark:hover:text-slate-100 transition-colors">
                                <PencilIcon className="h-4 w-4" /> Edit
                            </button>
                        </header>
                         <div className="relative mb-4">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <MarketResearchIcon className="h-5 w-5 text-gray-400 dark:text-slate-500" />
                            </span>
                            <input 
                                type="text"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                placeholder="Search in this page..."
                                className="w-full p-2 pl-10 pr-10 bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                                    aria-label="Clear search"
                                >
                                    <XIcon className="h-5 w-5 text-gray-400 dark:text-slate-500 hover:text-gray-800 dark:hover:text-slate-100" />
                                </button>
                            )}
                        </div>
                        <div className="flex-grow overflow-y-auto pr-2 prose dark:prose-invert max-w-none">
                            <MarkdownRenderer content={selectedPage.content} highlight={searchTerm} />
                        </div>
                        <div className="mt-auto pt-4 border-t border-gray-200 dark:border-slate-700">
                           <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-2 flex items-center gap-2"><SparklesIcon className="h-5 w-5" /> Ask your notes</h3>
                           <div className="flex gap-2 mb-3">
                             <div className="relative flex-grow">
                                <input type="text" value={aiQuestion} onChange={(e) => setAiQuestion(e.target.value)} placeholder="Ask a question about this page..." className="w-full p-2 bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-slate-100 pr-12 focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all" />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                                     <VoiceInputButton onTranscript={(transcript) => setAiQuestion(p => (p ? p.trim() + ' ' : '') + transcript)} />
                                </div>
                             </div>
                             <button onClick={handleAskAI} disabled={isAiLoading || !aiQuestion.trim()} className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 disabled:bg-gray-600 transition-colors">
                                {isAiLoading ? <LoaderIcon className="h-5 w-5" /> : 'Ask'}
                             </button>
                           </div>
                           {(aiAnswer || aiError) && <div className={`p-3 rounded-lg whitespace-pre-wrap ${aiError ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-300 border border-gray-200 dark:border-slate-700'}`}><p>{aiAnswer || aiError}</p></div>}
                        </div>
                    </div>
                );
            case 'edit':
            case 'create':
                return (
                    <div className="h-full flex flex-col gap-4">
                        <div className="relative">
                            <input
                                type="text"
                                value={editTitle}
                                onChange={e => setEditTitle(e.target.value)}
                                placeholder="Page Title"
                                className="w-full p-3 bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-slate-100 text-2xl font-bold focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all pr-12"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                <VoiceInputButton onTranscript={(transcript) => setEditTitle(p => (p ? p.trim() + ' ' : '') + transcript)} />
                            </div>
                        </div>
                        <div className="flex border-b border-gray-200 dark:border-slate-700">
                            <button onClick={() => setEditorMode('write')} className={`px-4 py-2 font-medium transition-colors ${editorMode === 'write' ? 'border-b-2 border-indigo-500 text-gray-900 dark:text-slate-100' : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'}`}>Write</button>
                            <button onClick={() => setEditorMode('preview')} className={`px-4 py-2 font-medium transition-colors ${editorMode === 'preview' ? 'border-b-2 border-indigo-500 text-gray-900 dark:text-slate-100' : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'}`}>Preview</button>
                        </div>
                         {editorMode === 'write' ? (
                            <div className="relative w-full flex-grow">
                                <textarea
                                    value={editContent}
                                    onChange={handleContentChange}
                                    onKeyDown={handleContentKeyDown}
                                    placeholder="Start writing your notes here... You can use markdown for formatting."
                                    className="w-full h-full p-3 bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 resize-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all pr-12"
                                />
                                <div className="absolute bottom-3 right-3">
                                    <VoiceInputButton onTranscript={(transcript) => setEditContent(p => (p ? p.trim() + ' ' : '') + transcript)} />
                                </div>
                            </div>
                         ) : (
                             <div className="w-full flex-grow bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg p-3 overflow-y-auto prose dark:prose-invert max-w-none">
                                <MarkdownRenderer content={editContent} />
                            </div>
                         )}

                        <div className="flex justify-end gap-3">
                            <button onClick={handleCancelEdit} className="py-2 px-5 bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-slate-100 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors">Cancel</button>
                            <button onClick={handleSavePage} className="py-2 px-5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 transition-colors">Save Page</button>
                        </div>
                    </div>
                );
        }
    };

    return (
    <div className="h-full flex flex-col lg:flex-row bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-black/20 overflow-hidden">
        <div className="w-full lg:w-1/3 lg:max-w-sm bg-gray-100/50 dark:bg-slate-900/20 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-slate-700 p-4 flex flex-col">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200 dark:border-slate-700">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
                    <BrainIcon className="h-6 w-6 text-indigo-500 dark:text-indigo-400" />
                    My Wiki
                </h1>
                <button onClick={handleNewPage} className="p-2 text-gray-500 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-slate-700/50 rounded-lg transition-colors" aria-label="Create new page">
                    <PlusIcon className="h-6 w-6" />
                </button>
            </div>
            <div className="flex-grow overflow-y-auto -mr-2 pr-2">
                <ul className="space-y-1">
                    {pages.map(page => (
                        <li key={page.id}>
                            <div className={`group w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors cursor-pointer ${selectedPageId === page.id ? 'bg-indigo-100 dark:bg-indigo-600/20' : 'hover:bg-gray-200 dark:hover:bg-slate-700/50'}`} onClick={() => handleSelectPage(page.id)}>
                                <span className="font-semibold text-gray-800 dark:text-slate-200 truncate pr-2">{page.title || 'Untitled'}</span>
                                <button onClick={(e) => { e.stopPropagation(); handleDeletePage(page.id); }} className="p-1 text-gray-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><TrashIcon className="h-4 w-4"/></button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            <div className="h-full flex flex-col justify-center items-center">
                 {renderContent()}
            </div>
        </main>
    </div>
    );
};

export default PersonalWiki;
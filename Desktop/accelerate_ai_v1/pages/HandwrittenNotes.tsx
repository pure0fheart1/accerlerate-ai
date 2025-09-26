import React, { useState, useEffect, useRef } from 'react';
import { PencilIcon, MicrophoneIcon, TrashIcon, DocumentCheckIcon } from '../components/icons';
import { useVoiceRecognition } from '../contexts/VoiceContext';

interface HandwrittenNotesProps {
    onSaveNote: (destination: 'wiki' | 'autonotes', content: string) => void;
}

const fontStyles = [
    { name: 'Elegant', class: 'font-handwriting', size: 'text-4xl', leading: 'leading-loose' },
    { name: 'Neat', class: 'font-patrick-hand', size: 'text-3xl', leading: 'leading-10' },
    { name: 'Casual', class: 'font-kalam', size: 'text-3xl', leading: 'leading-10' },
    { name: 'Bold', class: 'font-permanent-marker', size: 'text-3xl', leading: 'leading-10' },
];

const HandwrittenNotes: React.FC<HandwrittenNotesProps> = ({ onSaveNote }) => {
    const [noteContent, setNoteContent] = useState('');
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const { isListening, startListening, stopListening, isSupported, error } = useVoiceRecognition();
    const notepadRef = useRef<HTMLDivElement>(null);
    const [selectedStyle, setSelectedStyle] = useState(fontStyles[0]);


    // Auto-scroll to the bottom of the notepad as content is added
    useEffect(() => {
        if (notepadRef.current) {
            notepadRef.current.scrollTop = notepadRef.current.scrollHeight;
        }
    }, [noteContent]);
    
    // Handle microphone toggle
    const handleToggleListening = () => {
        if (isListening) {
            stopListening();
        } else {
            // Append transcript with a leading space if content already exists
            startListening((transcript) => {
                setNoteContent(current => (current ? current.trim() + ' ' : '') + transcript);
            });
        }
    };
    
    // Clear the notepad content
    const handleClear = () => {
        setNoteContent('');
    };

    return (
        <div className="h-full flex flex-col">
            <header className="flex items-center gap-4 mb-4">
                <PencilIcon className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
                <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100">Handwritten Notes</h1>
            </header>
            <p className="text-lg text-gray-600 dark:text-slate-400 mb-6 max-w-4xl">
                Capture your thoughts by voice. Speak, and your words will be transcribed into handwritten notes on the notepad below.
            </p>

            <div className="flex items-center justify-center gap-4 mb-4">
                {isSupported ? (
                    <button
                        onClick={handleToggleListening}
                        className={`flex items-center gap-3 px-8 py-4 rounded-full text-white font-semibold shadow-lg transition-all transform hover:scale-105 ${
                            isListening ? 'bg-red-600 animate-pulse' : 'bg-indigo-600 hover:bg-indigo-500'
                        }`}
                    >
                        <MicrophoneIcon className="h-6 w-6" />
                        <span>{isListening ? 'Stop Listening' : 'Start Dictation'}</span>
                    </button>
                ) : (
                    <p className="text-red-500">Voice recognition is not supported in this browser.</p>
                )}
                 <button
                    onClick={() => setIsSaveModalOpen(true)}
                    disabled={!noteContent || isListening}
                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-green-600 text-white font-semibold hover:bg-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <DocumentCheckIcon className="h-5 w-5" />
                    <span>Save Note</span>
                </button>
                 <button
                    onClick={handleClear}
                    disabled={!noteContent || isListening}
                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-200 font-semibold hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <TrashIcon className="h-5 w-5" />
                    <span>Clear</span>
                </button>
            </div>
            
             {error && <p className="text-center text-red-500 mb-4">{error}</p>}

            <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Style:</span>
                {fontStyles.map(style => (
                    <button
                        key={style.name}
                        onClick={() => setSelectedStyle(style)}
                        className={`px-3 py-1 text-sm rounded-full transition-all ${
                            selectedStyle.class === style.class
                                ? 'bg-indigo-600 text-white font-semibold shadow'
                                : 'bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600'
                        }`}
                    >
                        {style.name}
                    </button>
                ))}
            </div>

            <main className="flex-grow bg-amber-50 dark:bg-[#2a2a2e] rounded-2xl shadow-inner overflow-hidden border border-gray-200 dark:border-slate-700 flex flex-col">
                {/* Notepad lines and red margin line */}
                <div
                    ref={notepadRef}
                    className="relative w-full flex-grow p-8 pl-16 overflow-y-auto"
                    style={{
                        backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 39px, #a8d1ff50 40px)',
                        backgroundSize: '100% 40px',
                    }}
                >
                    <div className="absolute top-0 left-12 bottom-0 w-px bg-red-400/50"></div>
                    {/* The content itself */}
                    <div className={`${selectedStyle.class} ${selectedStyle.size} ${selectedStyle.leading} text-slate-800 dark:text-slate-200 whitespace-pre-wrap break-words`}>
                        {noteContent}
                    </div>
                </div>
            </main>

            {isSaveModalOpen && (
                <div 
                    className="fixed inset-0 bg-gray-900/80 dark:bg-slate-900/90 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeInUp"
                    onClick={() => setIsSaveModalOpen(false)}
                >
                    <div 
                        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 w-full max-w-sm m-4 text-center"
                        onClick={e => e.stopPropagation()}
                    >
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-6">Save Note To...</h2>
                        <div className="space-y-4">
                            <button
                                onClick={() => {
                                    onSaveNote('wiki', noteContent);
                                    setIsSaveModalOpen(false);
                                }}
                                className="w-full py-3 px-6 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-500 transition-colors"
                            >
                                Personal Wiki
                            </button>
                            <button
                                onClick={() => {
                                    onSaveNote('autonotes', noteContent);
                                    setIsSaveModalOpen(false);
                                }}
                                className="w-full py-3 px-6 bg-cyan-600 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-500 transition-colors"
                            >
                                Autonotes
                            </button>
                        </div>
                         <button
                            onClick={() => setIsSaveModalOpen(false)}
                            className="mt-6 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-slate-200"
                         >
                            Cancel
                         </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HandwrittenNotes;
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { WorldBuilderIcon, LoaderIcon, AlertTriangleIcon, SendIcon } from '../components/icons';
import { assistWorldBuilding } from '../services/geminiService';
import { ChatMessage } from '../types';
import { VoiceInputButton } from '../components/VoiceInputButton';

const MESSAGES_KEY = 'accelerate-worldbuilder-messages';

const WorldBuilderAssistant: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        try {
            const storedMessages = localStorage.getItem(MESSAGES_KEY);
            if (storedMessages) {
                setMessages(JSON.parse(storedMessages));
            } else {
                setMessages([{ sender: 'ai', text: "Greetings, creator! I am your World Smith. Tell me about the world you're building, and I'll help you flesh out the details. What's on your mind first? A map? A culture? A magic system?" }]);
            }
        } catch (e) {
            console.error("Failed to load messages from localStorage", e);
            setMessages([{ sender: 'ai', text: "Greetings, creator! I am your World Smith. Tell me about the world you're building, and I'll help you flesh out the details. What's on your mind first? A map? A culture? A magic system?" }]);
        }
    }, []);

    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
        } else {
            localStorage.removeItem(MESSAGES_KEY);
        }
    }, [messages]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = useCallback(async () => {
        if (!userInput.trim()) return;

        const newMessages: ChatMessage[] = [...messages, { sender: 'user', text: userInput }];
        setMessages(newMessages);
        setUserInput('');
        setIsLoading(true);
        setError(null);

        try {
            const aiResponse = await assistWorldBuilding(newMessages);
            setMessages(prev => [...prev, { sender: 'ai', text: aiResponse }]);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [userInput, messages]);

    return (
        <div className="h-full flex flex-col">
            <header className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-200 dark:border-slate-700">
                <WorldBuilderIcon className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100">World Builder Assistant</h1>
                    <p className="text-lg text-gray-600 dark:text-slate-400">Your creative partner for building fictional worlds.</p>
                </div>
            </header>
            
            <main className="flex-grow overflow-y-auto pr-2 flex flex-col gap-4 py-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 animate-fadeInUp ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                         {msg.sender === 'ai' && <div className="bg-gray-200 dark:bg-slate-700 p-2 rounded-full mt-1"><WorldBuilderIcon className="h-5 w-5 text-indigo-500 dark:text-indigo-400 flex-shrink-0" /></div>}
                        <div className={`max-w-xl p-3 rounded-2xl ${msg.sender === 'user' 
                                ? 'bg-indigo-600 text-white rounded-br-none' 
                                : 'bg-gray-200 text-gray-800 dark:bg-slate-800 dark:text-slate-200 rounded-bl-none'}`
                            }>
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                     <div className="flex justify-start items-start gap-3 animate-fadeInUp">
                        <div className="bg-gray-200 dark:bg-slate-700 p-2 rounded-full mt-1"><WorldBuilderIcon className="h-5 w-5 text-indigo-500 dark:text-indigo-400 flex-shrink-0" /></div>
                        <div className="max-w-xl p-3 rounded-2xl bg-gray-200 dark:bg-slate-800 rounded-bl-none flex items-center">
                           <LoaderIcon className="h-5 w-5 text-gray-600 dark:text-slate-400" />
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </main>

            <footer className="mt-auto pt-4">
                 {error && (
                    <div className="text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30 p-3 rounded-lg flex items-center gap-3 mb-3 text-sm">
                        <AlertTriangleIcon className="h-5 w-5 flex-shrink-0" />
                        <p>{error}</p>
                    </div>
                 )}
                <div className="relative flex items-center gap-3">
                     <textarea
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Describe an idea for your world..."
                        className="w-full p-3 bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-slate-100 resize-none pr-24 focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
                        rows={1}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                    />
                    <div className="absolute right-[4.5rem] bottom-1/2 translate-y-1/2">
                        <VoiceInputButton onTranscript={(t) => setUserInput(current => current + ' ' + t)} />
                    </div>
                    <button
                        onClick={handleSendMessage}
                        disabled={isLoading || !userInput.trim()}
                        className="p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:bg-gray-600 transition-colors"
                        aria-label="Send message"
                    >
                        <SendIcon className="h-6 w-6" />
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default WorldBuilderAssistant;

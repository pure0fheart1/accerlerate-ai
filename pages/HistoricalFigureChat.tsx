import React, { useState, useCallback, useRef, useEffect } from 'react';
import { HistoricalFigureChatIcon, LoaderIcon, AlertTriangleIcon, SendIcon } from '../components/icons';
import { chatWithHistoricalFigure } from '../services/geminiService';
import { ChatMessage } from '../types';
import { VoiceInputButton } from '../components/VoiceInputButton';

const FIGURES = ["Cleopatra", "Leonardo da Vinci", "William Shakespeare", "Albert Einstein", "Marie Curie", "Nikola Tesla", "Joan of Arc"];

const HistoricalFigureChat: React.FC = () => {
    const [stage, setStage] = useState<'figure' | 'chat'>('figure');
    const [figure, setFigure] = useState('Albert Einstein');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleStart = useCallback(async () => {
        setStage('chat');
        setIsLoading(true);
        setError(null);
        setMessages([]);

        try {
            const initialMessages: ChatMessage[] = [{ sender: 'user', text: `Greetings, ${figure}. Tell me a little about yourself.` }];
            const firstResponse = await chatWithHistoricalFigure(figure, initialMessages);
            setMessages([{ sender: 'ai', text: firstResponse }]);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [figure]);

    const handleSendMessage = useCallback(async () => {
        if (!userInput.trim()) return;

        const newMessages: ChatMessage[] = [...messages, { sender: 'user', text: userInput }];
        setMessages(newMessages);
        setUserInput('');
        setIsLoading(true);
        setError(null);

        try {
            const aiResponse = await chatWithHistoricalFigure(figure, newMessages);
            setMessages(prev => [...prev, { sender: 'ai', text: aiResponse }]);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [userInput, messages, figure]);

    const renderFigureSelector = () => (
        <div className="h-full flex flex-col items-center justify-center text-center">
            <header className="flex flex-col items-center gap-4 mb-8">
                <HistoricalFigureChatIcon className="h-16 w-16 text-indigo-500 dark:text-indigo-400" />
                <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100">Historical Figure Chat</h1>
                <p className="text-lg text-gray-600 dark:text-slate-400 max-w-2xl">
                    Choose a historical figure to chat with an AI persona.
                </p>
            </header>
            <div className="w-full max-w-lg flex flex-col sm:flex-row items-center gap-4 bg-white/70 dark:bg-slate-800/50 p-6 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-xl dark:shadow-2xl dark:shadow-black/20">
                <select
                    value={figure}
                    onChange={(e) => setFigure(e.target.value)}
                    className="w-full p-3 bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                >
                    {FIGURES.map(f => <option key={f} value={f} className="bg-white dark:bg-slate-900">{f}</option>)}
                </select>
                <button
                    onClick={handleStart}
                    disabled={isLoading}
                    className="w-full sm:w-auto py-3 px-6 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-500 flex items-center justify-center gap-2 disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                   {isLoading ? <LoaderIcon className="h-5 w-5" /> : 'Start Chat'}
                </button>
            </div>
        </div>
    );

    const renderChat = () => (
        <div className="h-full flex flex-col">
            <header className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                    <HistoricalFigureChatIcon className="h-8 w-8 text-indigo-500 dark:text-indigo-400" />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Chatting with {figure}</h1>
                    </div>
                </div>
                <button onClick={() => setStage('figure')} className="text-sm text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white">Change Figure</button>
            </header>
            
            <main className="flex-grow overflow-y-auto pr-2 flex flex-col gap-4 py-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 animate-fadeInUp ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                         {msg.sender === 'ai' && <HistoricalFigureChatIcon className="h-6 w-6 text-indigo-500 dark:text-indigo-400 flex-shrink-0 mt-1" />}
                        <div className={`max-w-xl p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-slate-800 text-gray-800 dark:text-slate-200'}`}>
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                     <div className="flex justify-start items-start gap-3 animate-fadeInUp">
                        <HistoricalFigureChatIcon className="h-6 w-6 text-indigo-500 dark:text-indigo-400 flex-shrink-0 mt-1" />
                        <div className="max-w-xl p-3 rounded-2xl bg-gray-200 dark:bg-slate-800 flex items-center">
                           <LoaderIcon className="h-5 w-5 text-gray-600 dark:text-slate-400" />
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </main>

            <footer className="mt-auto pt-4">
                 {error && (
                    <div className="text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-3 rounded-lg flex items-center gap-3 mb-3 text-sm">
                        <AlertTriangleIcon className="h-5 w-5 flex-shrink-0" />
                        <p>{error}</p>
                    </div>
                 )}
                <div className="relative flex items-center gap-3">
                     <textarea
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder={`Ask ${figure} a question...`}
                        className="w-full p-3 bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-slate-100 resize-none pr-24 focus:ring-2 focus:ring-indigo-500"
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
    
    return stage === 'figure' ? renderFigureSelector() : renderChat();
};

export default HistoricalFigureChat;

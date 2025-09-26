
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { TextAdventureIcon, LoaderIcon, AlertTriangleIcon, SendIcon } from '../components/icons';
import { generateTextAdventure } from '../services/geminiService';
import { ChatMessage } from '../types';
import { VoiceInputButton } from '../components/VoiceInputButton';

const TextAdventureGame: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const startGame = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const initialMessages: ChatMessage[] = [{ sender: 'user', text: "Let's start the adventure." }];
    setMessages(initialMessages);
    try {
        const firstScene = await generateTextAdventure(initialMessages);
        setMessages([{ sender: 'ai', text: firstScene }]);
    } catch(err) {
        const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
        setError(errorMessage);
    } finally {
        setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    startGame();
  }, [startGame]);

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
      const aiResponse = await generateTextAdventure(newMessages);
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
      <header className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-200 dark:border-gray-800">
        <TextAdventureIcon className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">AI Text Adventure</h1>
      </header>
      
      <main className="flex-grow overflow-y-auto pr-2 flex flex-col gap-4 py-4">
        {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 animate-fadeInUp ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.sender === 'ai' && <div className="bg-gray-200 dark:bg-gray-700 p-2 rounded-full mt-1"><TextAdventureIcon className="h-5 w-5 text-indigo-500 dark:text-indigo-400 flex-shrink-0" /></div>}
                <div className={`max-w-xl p-3 rounded-2xl ${msg.sender === 'user' 
                        ? 'bg-indigo-600 text-white rounded-br-none' 
                        : 'bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-200 rounded-bl-none'}`
                    }>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
            </div>
        ))}
        {isLoading && (
             <div className="flex justify-start items-start gap-3 animate-fadeInUp">
                <div className="bg-gray-200 dark:bg-gray-700 p-2 rounded-full mt-1"><TextAdventureIcon className="h-5 w-5 text-indigo-500 dark:text-indigo-400 flex-shrink-0" /></div>
                <div className="max-w-xl p-3 rounded-2xl bg-gray-200 dark:bg-gray-800 rounded-bl-none flex items-center">
                   <LoaderIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
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
                placeholder="What do you do next?"
                className="w-full p-3 bg-gray-100 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white resize-none pr-24 focus:ring-2 focus:ring-indigo-500"
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
                aria-label="Send action"
            >
                <SendIcon className="h-6 w-6" />
            </button>
        </div>
      </footer>
    </div>
  );
};

export default TextAdventureGame;

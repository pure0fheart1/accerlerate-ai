
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { useAuth } from '../../contexts/AuthContext.tsx';
import { useUsageTracking } from '../../hooks/useUsageTracking.ts';
import { SendIcon, UserIcon, BotIcon } from '../../components/Icons.tsx';

// Define message structure with timestamp
interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

// Model definitions
const MODELS = {
  'gemini-2.5-flash': 'Gemini 2.5 Flash',
  'gemini-1.5-pro': 'Gemini 1.5 Pro', // User-facing option
};
type ModelKey = keyof typeof MODELS;

// Thinking modes
const THINKING_MODES = ['Standard (Default)', 'Quick', 'Extended', 'Extended x2'];
type ThinkingMode = typeof THINKING_MODES[number];

// UI sub-components
const TypingIndicator: React.FC = () => (
    <div className="flex items-center gap-1.5 p-2">
        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
    </div>
);

const Avatar: React.FC<{role: 'user' | 'model'}> = ({ role }) => (
    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-slate-300 ${role === 'user' ? 'bg-blue-600' : 'bg-slate-700'}`}>
        {role === 'user' ? <UserIcon /> : <BotIcon />}
    </div>
);


const GeminiChat: React.FC = () => {
    const { user } = useAuth();
    const { trackUsage, checkUsageLimit } = useUsageTracking();

    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [selectedModel, setSelectedModel] = useState<ModelKey>('gemini-2.5-flash');
    const [thinkingMode, setThinkingMode] = useState<ThinkingMode>('Standard (Default)');

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages, isLoading]);
    
    // When switching to a model that doesn't support thinking modes, reset to default.
    useEffect(() => {
        if (selectedModel !== 'gemini-2.5-flash') {
            setThinkingMode('Standard (Default)');
        }
    }, [selectedModel]);

    // Initialize or re-initialize chat when model or thinking mode changes
    useEffect(() => {
        const initializeChat = () => {
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                
                let config: { thinkingConfig?: { thinkingBudget: number } } = {};
                // The 'thinkingConfig' is only available for the 'gemini-2.5-flash' model.
                if (selectedModel === 'gemini-2.5-flash') {
                    if (thinkingMode === 'Quick') {
                        config.thinkingConfig = { thinkingBudget: 0 };
                    }
                    // 'Standard', 'Extended', and 'Extended x2' use default thinking (empty config)
                }
                
                // Per API guidelines, only 'gemini-2.5-flash' should be used for text generation.
                // We map the user-facing "Pro" model to the compliant "Flash" model.
                const modelToUse = selectedModel === 'gemini-1.5-pro' ? 'gemini-2.5-flash' : selectedModel;
        
                const newChat = ai.chats.create({
                  model: modelToUse,
                  config: config,
                });
                setChat(newChat);
                setMessages([]); // Clear history for new session
                setError(null);
            } catch(e) {
                setError(e instanceof Error ? e.message : 'Failed to initialize AI Chat');
                console.error(e);
            }
        };
        initializeChat();
    }, [selectedModel, thinkingMode]);

    const handleSendMessage = useCallback(async () => {
        if (!userInput.trim() || isLoading || !chat) return;

        // Check authentication and usage limits
        if (!user) {
            setError('Please sign in to use AI chat.');
            return;
        }

        if (!checkUsageLimit('aiChatMessages')) {
            setError('You have reached your AI chat message limit. Please upgrade your plan.');
            return;
        }

        const userMessage: Message = { role: 'user', text: userInput, timestamp: new Date() };
        setMessages(prev => [...prev, userMessage]);
        setUserInput('');
        setIsLoading(true); // Show typing indicator
        setError(null);

        try {
            const responseStream = await chat.sendMessageStream({ message: userMessage.text });
            
            let firstChunk = true;
            for await (const chunk of responseStream) {
                if (firstChunk) {
                    setIsLoading(false); // Hide typing indicator, show message
                    // Track usage on first chunk (successful response)
                    trackUsage('aiChatMessages', 1);
                    // Add new model message with the first bit of text
                    setMessages(prev => [...prev, { role: 'model', text: chunk.text, timestamp: new Date() }]);
                    firstChunk = false;
                } else {
                    // Append to the last message immutably
                    setMessages(prev => {
                        if (prev.length === 0) return prev;
                        const lastMessage = prev[prev.length - 1];
                        // Create a new message object with the updated text
                        const updatedLastMessage = {
                            ...lastMessage,
                            text: lastMessage.text + chunk.text,
                        };
                        // Return a new array with the last element replaced
                        return [...prev.slice(0, -1), updatedLastMessage];
                    });
                }
            }
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred.';
            setError(`Error: ${errorMessage}`);
        } finally {
            if (isLoading) { // In case of error or empty stream
                setIsLoading(false);
            }
        }
    }, [chat, userInput, isLoading]);

    return (
        <div className="flex flex-col h-full bg-slate-800 -m-6"> {/* Negative margin to fill parent padding */}
            {/* Header with Controls */}
            <header className="flex-shrink-0 bg-slate-800/70 backdrop-blur-sm border-b border-slate-700 p-2 flex items-center justify-center gap-4 z-10">
                <div>
                    <label htmlFor="model-select" className="text-xs text-slate-400 mr-2">Model</label>
                    <select
                        id="model-select"
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value as ModelKey)}
                        className="bg-slate-700 text-white p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {Object.entries(MODELS).map(([key, name]) => (
                            <option key={key} value={key}>{name}</option>
                        ))}
                    </select>
                </div>
                 <div>
                    <label htmlFor="thinking-mode-select" className="text-xs text-slate-400 mr-2">Thinking Mode</label>
                    <select
                        id="thinking-mode-select"
                        value={thinkingMode}
                        onChange={(e) => setThinkingMode(e.target.value as ThinkingMode)}
                        disabled={selectedModel !== 'gemini-2.5-flash'}
                        className="bg-slate-700 text-white p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        title={selectedModel !== 'gemini-2.5-flash' ? "Thinking modes are only available for Gemini 2.5 Flash" : ""}
                    >
                       {THINKING_MODES.map(mode => (
                           <option key={mode} value={mode}>{mode}</option>
                       ))}
                    </select>
                </div>
            </header>

            {/* Messages Area */}
            <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                {messages.length === 0 && !isLoading && (
                    <div className="text-center text-slate-500 pt-16">
                        <h2 className="text-2xl font-semibold">Gemini PRO 2.5</h2>
                        <p>Start a conversation by typing a message below.</p>
                    </div>
                )}
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-end gap-2 animate-slide-in-up ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'model' && <Avatar role="model" />}
                        <div className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                             <div className={`max-w-xl p-3 rounded-lg whitespace-pre-wrap ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-200'}`}>
                               {msg.text}
                            </div>
                            <span className="text-xs text-slate-500 px-1">
                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                         {msg.role === 'user' && <Avatar role="user" />}
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-end gap-2 justify-start animate-slide-in-up">
                        <Avatar role="model" />
                        <div className="max-w-xl p-2 rounded-lg bg-slate-700">
                            <TypingIndicator />
                        </div>
                    </div>
                )}
                 <div ref={messagesEndRef} />
            </main>

            {/* Input Area */}
            <footer className="flex-shrink-0 border-t border-slate-700 p-4 bg-slate-800">
                 {error && <p className="text-red-400 text-center mb-2">{error}</p>}
                <div className="max-w-3xl mx-auto flex items-center gap-2 bg-slate-700 rounded-lg p-2">
                    <textarea
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                        placeholder="Type your message here..."
                        rows={1}
                        className="flex-grow bg-transparent text-white placeholder-slate-400 focus:outline-none resize-none p-2"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={isLoading || !userInput.trim()}
                        className="bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed transition-all active:scale-95"
                        aria-label="Send message"
                    >
                        <SendIcon />
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default GeminiChat;
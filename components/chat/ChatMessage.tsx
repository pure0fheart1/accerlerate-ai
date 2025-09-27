import React from 'react';
import { Message } from '../../types/chat';

interface ChatMessageProps {
    message: Message;
    currentUser: string | null;
}

// Simple hash function to get a color for a user
const FNV_OFFSET_BASIS = 2166136261;
const FNV_PRIME = 16777619;
const stringToColor = (str: string): string => {
    if (!str) return 'text-gray-500';
    let hash = FNV_OFFSET_BASIS;
    for (let i = 0; i < str.length; i++) {
        hash ^= str.charCodeAt(i);
        hash *= FNV_PRIME;
    }
    const colors = [
        'text-red-500', 'text-green-500', 'text-yellow-500', 'text-teal-500',
        'text-indigo-500', 'text-purple-500', 'text-pink-500', 'text-orange-500'
    ];
    return colors[Math.abs(hash) % colors.length];
};

const ChatMessage: React.FC<ChatMessageProps> = ({ message, currentUser }) => {
    const isCurrentUser = message.user === currentUser;

    // Special styling for System messages
    if (message.user === 'System') {
        return (
            <div className="flex justify-center my-2 animate-fade-in">
                <p className="text-xs text-gray-500 dark:text-gray-400 italic px-4 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                    {message.text}
                </p>
            </div>
        );
    }

    const bubbleClasses = isCurrentUser
        ? 'bg-blue-500 text-white rounded-br-none'
        : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none';

    const containerClasses = isCurrentUser ? 'justify-end' : 'justify-start';
    const userColor = stringToColor(message.user);

    return (
        <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'} mb-4 animate-fade-in`}>
            {!isCurrentUser && (
                 <p className={`text-xs font-semibold mb-1 ml-3 ${userColor}`}>{message.user}</p>
            )}
            <div className={`flex ${containerClasses} w-full`}>
                <div className={`max-w-xs md:max-w-md lg:max-w-2/3 px-4 py-3 rounded-2xl shadow-md ${bubbleClasses}`}>
                    <p className="text-sm break-words whitespace-pre-wrap">{message.text}</p>
                </div>
            </div>
        </div>
    );
};

export default ChatMessage;
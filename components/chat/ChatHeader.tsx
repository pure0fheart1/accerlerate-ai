import React, { useState } from 'react';

interface ChatHeaderProps {
    roomName: string;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ roomName }) => {
    const [copyStatus, setCopyStatus] = useState('Share');

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
            setCopyStatus('Copied!');
            setTimeout(() => setCopyStatus('Share'), 2000);
        }, () => {
            setCopyStatus('Failed!');
            setTimeout(() => setCopyStatus('Share'), 2000);
        });
    };

    return (
        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm flex-shrink-0">
            <div className="flex items-center">
                <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-500 to-green-500 flex items-center justify-center text-white ring-2 ring-white dark:ring-gray-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V7a2 2 0 012-2h2m6 0a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2h2m4-10h2m-2 4h2" />
                        </svg>
                    </div>
                    <span className="absolute bottom-0 right-0 block h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-white dark:border-gray-800"></span>
                </div>
                <div className="ml-4">
                    <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate" title={`Room: ${roomName}`}>
                        Room: <span className="font-bold text-blue-500 dark:text-blue-400">{roomName}</span>
                    </h1>
                    <p className="text-sm text-green-600 dark:text-green-400">Online</p>
                </div>
            </div>
            <button
                onClick={handleShare}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 flex items-center"
            >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                {copyStatus}
            </button>
        </div>
    );
};

export default ChatHeader;
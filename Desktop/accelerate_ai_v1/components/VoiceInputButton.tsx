import React, { useEffect } from 'react';
import { useVoiceRecognition } from '../contexts/VoiceContext';
import { MicrophoneIcon } from './icons';

interface VoiceInputButtonProps {
    onTranscript: (transcript: string) => void;
    className?: string;
    disabled?: boolean;
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({ onTranscript, className, disabled }) => {
    const { isListening, startListening, stopListening, isSupported } = useVoiceRecognition();

    useEffect(() => {
        const handleGlobalDictation = () => {
            if (!isListening) {
                startListening(onTranscript);
            }
        };

        window.addEventListener('start-global-dictation', handleGlobalDictation);
        return () => {
            window.removeEventListener('start-global-dictation', handleGlobalDictation);
        };
    }, [isListening, startListening, onTranscript]);


    if (!isSupported) {
        return null;
    }

    const handleToggleListening = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening(onTranscript);
        }
    };
    
    return (
        <button
            type="button"
            onClick={handleToggleListening}
            disabled={disabled}
            className={`p-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                isListening 
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                : 'text-gray-400 hover:bg-gray-700 hover:text-white'
            } ${className}`}
            aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
        >
            <MicrophoneIcon className="h-5 w-5" />
        </button>
    );
};

import React, { createContext, useState, useCallback, useRef, ReactNode, FC, useContext } from 'react';
import { MicrophoneIcon, AlertTriangleIcon, XIcon } from '../components/icons';

interface VoiceContextType {
    isListening: boolean;
    startListening: (onResultCallback: (transcript: string) => void) => void;
    stopListening: () => void;
    error: string | null;
    isSupported: boolean;
    clearError: () => void;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

export const VoiceProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const recognitionRef = useRef<any>(null);
    const onResultCallbackRef = useRef<(transcript: string) => void>(() => {});

    const isSupported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (err) {
                console.warn("Error stopping speech recognition:", err);
            }
        }
    }, []);

    const startListening = useCallback(async (onResultCallback: (transcript: string) => void) => {
        if (!isSupported) {
            setError("Voice recognition is not supported in this browser. Please try using Chrome, Edge, or Safari.");
            return;
        }

        if (isListening) {
            stopListening();
            return;
        }

        setError(null);

        // Only check microphone permissions when user actually tries to use the feature
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            // Stop the track immediately once permission is granted
            stream.getTracks().forEach(track => track.stop());
        } catch (err) {
            if (err instanceof DOMException) {
                if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                    setError('Microphone access was denied. Please allow microphone access in your browser settings to use voice features.');
                } else if (err.name === 'NotFoundError') {
                     setError('No microphone found. Please ensure your microphone is connected and try again.');
                } else if (err.name === 'NotSupportedError') {
                     setError('Microphone access is not supported. Please use HTTPS or try a different browser.');
                } else {
                     setError(`Microphone access failed: ${err.message}. Please check your browser settings.`);
                }
            } else {
                 setError('Unable to access microphone. Please check your browser permissions and try again.');
            }
            return;
        }

        onResultCallbackRef.current = onResultCallback;

        try {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            const recognition = recognitionRef.current;
            
            recognition.continuous = true;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onstart = () => {
                setIsListening(true);
                setError(null);
            };

            recognition.onerror = (event: any) => {
                let errorMessage = '';
                switch (event.error) {
                    case 'no-speech':
                        errorMessage = 'No speech detected. Please try speaking again.';
                        break;
                    case 'audio-capture':
                        errorMessage = 'Audio capture failed. Please check your microphone connection.';
                        break;
                    case 'not-allowed':
                        errorMessage = 'Microphone access denied. Please allow microphone access and try again.';
                        break;
                    case 'network':
                        errorMessage = 'Network error with speech service. Please check your internet connection and try again.';
                        break;
                    case 'aborted':
                        // Don't show error for user-initiated stops
                        break;
                    default:
                        errorMessage = `Speech recognition error: ${event.error}. Please try again.`;
                        break;
                }
                if (errorMessage) {
                    setError(errorMessage);
                }
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
                recognitionRef.current = null;
            };

            recognition.onresult = (event: any) => {
                let transcript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    transcript += event.results[i][0].transcript;
                }

                if (onResultCallbackRef.current && transcript.trim()) {
                    onResultCallbackRef.current(transcript.trim());
                }
            };
            
            recognition.start();
        } catch(e) {
            console.error("Error starting speech recognition:", e);
            setError("Could not start voice recognition. Please ensure no other tab is using the microphone and try again.");
            setIsListening(false);
        }

    }, [isSupported, isListening, stopListening]);

    const value = {
        isListening,
        startListening,
        stopListening,
        error,
        isSupported,
        clearError
    };

    return (
        <VoiceContext.Provider value={value}>
            {children}
            {isListening && (
                <div className="fixed bottom-5 right-5 bg-red-600 text-white rounded-full p-4 shadow-lg flex items-center gap-3 z-50 animate-pulse">
                    <MicrophoneIcon className="h-6 w-6" />
                    <span>Listening...</span>
                </div>
            )}
            {error && (
                <div className="fixed bottom-5 left-5 bg-red-800 text-white rounded-lg p-4 shadow-lg flex items-start gap-3 z-50 max-w-sm">
                    <AlertTriangleIcon className="h-6 w-6 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-bold">Voice Input Error</p>
                        <p className="text-sm">{error}</p>
                    </div>
                    <button onClick={clearError} className="ml-auto -mr-2 -my-2 p-2 rounded-full hover:bg-red-700 transition-colors">
                        <XIcon className="h-5 w-5" />
                    </button>
                </div>
            )}
        </VoiceContext.Provider>
    );
};

export const useVoiceRecognition = (): VoiceContextType => {
    const context = useContext(VoiceContext);
    if (context === undefined) {
        throw new Error('useVoiceRecognition must be used within a VoiceProvider');
    }
    return context;
};

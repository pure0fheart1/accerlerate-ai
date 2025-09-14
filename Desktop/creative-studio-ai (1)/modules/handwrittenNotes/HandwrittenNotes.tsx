
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useAppContext } from '../../contexts/AppContext.tsx';
import { Modal } from '../../components/Modal.tsx';

// SpeechRecognition API interface for cross-browser compatibility
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: () => void;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
}
declare global {
  interface Window {
    SpeechRecognition: { new (): SpeechRecognition };
    webkitSpeechRecognition: { new (): SpeechRecognition };
  }
}

const PLACEHOLDER_TEXT = 'Click "Start Dictation" and begin speaking to see your words handwritten here...';

const HandwrittenNotes: React.FC = () => {
  const { addSavedNote } = useAppContext();
  const [text, setText] = useState<string>(PLACEHOLDER_TEXT);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false);
  const [noteTitle, setNoteTitle] = useState<string>('');

  // New state for styling
  const [handwritingStyle, setHandwritingStyle] = useState<'font-handwriting' | 'font-cursive' | 'font-indie'>('font-handwriting');
  const [fontSize, setFontSize] = useState<number>(36); // Default to 36px, similar to text-4xl

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTranscriptRef = useRef<string>('');
  const userStoppedRef = useRef<boolean>(false);
  
  // Load saved notes from localStorage on initial render
  useEffect(() => {
    const savedText = localStorage.getItem('handwrittenNotesText');
    if (savedText) {
      setText(savedText);
      finalTranscriptRef.current = savedText;
    }
  }, []);
  
  // Auto-save notes to localStorage every 30 seconds
  useEffect(() => {
    const autoSave = setInterval(() => {
        if (text && text !== PLACEHOLDER_TEXT) {
            localStorage.setItem('handwrittenNotesText', text);
        }
    }, 30000); // 30 seconds

    return () => clearInterval(autoSave);
  }, [text]);

  const memoizedHandwrittenText = useMemo(() => {
    const JITTER_Y = 1.5; // px, reduced for legibility
    const JITTER_ROTATION = 1.0; // deg, reduced for legibility

    return text.split(' ').map((word, wordIndex) => (
      <span key={wordIndex} className="relative inline-block mr-[0.5ch]">
        {word.split('').map((char, charIndex) => {
          const style = {
            transform: `translateY(${(Math.random() - 0.5) * JITTER_Y}px) rotate(${(Math.random() - 0.5) * JITTER_ROTATION}deg)`,
            display: 'inline-block',
          };
          return (
            <span key={charIndex} style={style}>
              {char}
            </span>
          );
        })}
      </span>
    ));
  }, [text]);
  
  const startRecognition = useCallback(() => {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognitionAPI) {
        setError("Speech recognition is not supported in this browser.");
        return;
      }
      
      if (recognitionRef.current) {
          recognitionRef.current.onend = null;
          recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognitionRef.current = recognition;

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = finalTranscriptRef.current;
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        finalTranscriptRef.current = finalTranscript;
        setText(finalTranscript + interimTranscript);
      };

      recognition.onerror = (event) => {
          if (event.error !== 'no-speech' && event.error !== 'aborted') {
              setError(`Speech recognition error: ${event.error}`);
              if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                  userStoppedRef.current = true;
                  setIsListening(false);
              }
          }
      };

      recognition.onend = () => {
          if (!userStoppedRef.current) {
              setTimeout(() => {
                  if (!userStoppedRef.current) {
                    startRecognition();
                  }
              }, 500);
          } else {
              setIsListening(false);
          }
      };
      
      try {
          userStoppedRef.current = false;
          recognition.start();
      } catch (e) {
          setError("Could not start dictation. Check microphone permissions.");
          setIsListening(false);
      }
  }, []);

  const stopRecognition = useCallback(() => {
      userStoppedRef.current = true;
      if (recognitionRef.current) {
          recognitionRef.current.stop();
      }
      setIsListening(false);
  }, []);

  const handleToggleListening = useCallback(() => {
    if (isListening) {
      stopRecognition();
    } else {
      if (text === PLACEHOLDER_TEXT) {
          setText('');
          finalTranscriptRef.current = '';
      }
      startRecognition();
    }
  }, [isListening, startRecognition, stopRecognition, text]);
  
  const handleClear = () => {
      setText(PLACEHOLDER_TEXT);
      finalTranscriptRef.current = '';
      localStorage.removeItem('handwrittenNotesText');
      if (isListening) {
        stopRecognition();
      }
  }

  const handleSave = (destination: 'wiki' | 'aiNotes') => {
    if (!noteTitle.trim() || !text.trim() || text === PLACEHOLDER_TEXT) return;
    addSavedNote({ title: noteTitle, content: text, destination });
    setNoteTitle('');
    setIsSaveModalOpen(false);
    handleClear(); // Clear the note after saving
  };

  const isNoteEmpty = !text || text === PLACEHOLDER_TEXT;

  useEffect(() => {
    const handleShortcut = (e: Event) => {
        const detail = (e as CustomEvent).detail;
        if (detail === 'notes-toggle-dictation') {
            handleToggleListening();
        }
    };
    document.addEventListener('app-shortcut', handleShortcut);
    return () => document.removeEventListener('app-shortcut', handleShortcut);
  }, [handleToggleListening]);


  useEffect(() => {
    return () => {
        userStoppedRef.current = true;
        if (recognitionRef.current) {
            recognitionRef.current.abort();
        }
    };
  }, []);

  return (
    <div className="flex flex-col h-full items-center">
      <div 
        className="w-full max-w-4xl flex-1 flex flex-col p-8 bg-white rounded-lg shadow-2xl relative overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(to bottom, transparent 49px, #d4e3ff 50px)`,
          backgroundSize: '100% 50px',
        }}
      >
        <div 
          className="absolute top-0 left-8 h-full w-px bg-pink-400"
        />
        <div 
          className={`flex-1 overflow-y-auto text-slate-800 ${handwritingStyle} leading-relaxed tracking-wide pt-12 pl-12`}
          style={{ fontSize: `${fontSize}px` }}
        >
           {memoizedHandwrittenText}
        </div>
      </div>
      
      {/* Controls Container */}
      <div className="w-full max-w-4xl mt-6">
        <div className="flex flex-wrap items-center justify-center gap-4">
            <button 
              onClick={handleToggleListening}
              className={`px-8 py-3 rounded-lg font-semibold text-white transition-all duration-300 flex items-center gap-2 active:scale-95 ${isListening ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {isListening ? (
                  <>
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                    </span>
                    Stop Dictation
                  </>
              ) : (
                 'Start Dictation'
              )}
            </button>
             <button
                onClick={() => setIsSaveModalOpen(true)}
                disabled={isNoteEmpty}
                className="px-8 py-3 rounded-lg font-semibold bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-transform active:scale-95"
            >
                Save Note
            </button>
            <button
                onClick={handleClear}
                className="px-8 py-3 rounded-lg font-semibold bg-slate-600 text-white hover:bg-slate-500 transition-transform active:scale-95"
            >
                Clear
            </button>
        </div>

        {/* New Style Controls */}
        <div className="mt-4 p-4 bg-slate-800 rounded-lg flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            <div className="flex items-center gap-3 text-sm">
                <label htmlFor="handwriting-style" className="font-medium text-slate-300">Style</label>
                <select 
                    id="handwriting-style" 
                    value={handwritingStyle} 
                    onChange={(e) => setHandwritingStyle(e.target.value as 'font-handwriting' | 'font-cursive' | 'font-indie')} 
                    className="bg-slate-700 text-white py-1 px-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="font-handwriting">Casual (Caveat)</option>
                    <option value="font-cursive">Cursive (Dancing Script)</option>
                    <option value="font-indie">Playful (Indie Flower)</option>
                </select>
            </div>
            <div className="flex items-center gap-3 text-sm">
                <label htmlFor="font-size-slider" className="font-medium text-slate-300">Size</label>
                <input 
                    type="range" 
                    id="font-size-slider" 
                    min="20" 
                    max="60" 
                    value={fontSize} 
                    onChange={(e) => setFontSize(parseInt(e.target.value, 10))} 
                    className="w-40" 
                />
                <span className="w-8 text-center text-slate-300 font-mono">{fontSize}px</span>
            </div>
        </div>
      </div>
      
      {error && <p className="mt-4 text-red-400">{error}</p>}
      <Modal isOpen={isSaveModalOpen} onClose={() => setIsSaveModalOpen(false)} title="Save Note">
        <div className="flex flex-col gap-4">
            <div>
                <label htmlFor="note-title" className="block text-sm font-medium text-slate-300 mb-2">Note Title</label>
                <input
                    id="note-title"
                    type="text"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    placeholder="Enter a title for your note..."
                    className="w-full bg-slate-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div className="flex justify-end gap-4 mt-4">
                <button 
                    onClick={() => handleSave('wiki')} 
                    disabled={!noteTitle.trim()}
                    className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-transform active:scale-95"
                >
                    Save to Wiki
                </button>
                <button 
                    onClick={() => handleSave('aiNotes')} 
                    disabled={!noteTitle.trim()}
                    className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-transform active:scale-95"
                >
                    Save to AI Notes
                </button>
            </div>
        </div>
      </Modal>
    </div>
  );
};

export default HandwrittenNotes;
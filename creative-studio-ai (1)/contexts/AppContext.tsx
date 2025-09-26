
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { GeneratedContent, Module, ImagePrompt, Settings, Shortcuts, SavedNote } from '../types.ts';

const DEFAULT_SHORTCUTS: Shortcuts = {
  newWhiteboard: 'Ctrl + N',
  openGallery: 'Ctrl + G',
  whiteboardUndo: 'Ctrl + Z',
  whiteboardRedo: 'Ctrl + Y',
  toggleDictation: 'Ctrl + Space',
};

interface AppContextType {
  galleryContent: GeneratedContent[];
  addContentToGallery: (content: GeneratedContent) => void;
  imageForWhiteboard: string | null;
  setImageForWhiteboard: (url: string | null) => void;
  imageForEditor: string | null;
  setImageForEditor: (url: string | null) => void;
  promptForGenerator: string | null;
  setPromptForGenerator: (prompt: string | null) => void;
  activeModule: Module;
  setActiveModule: (module: Module) => void;
  settings: Settings;
  setSettings: (settings: Settings) => void;
  shortcuts: Shortcuts;
  setShortcuts: React.Dispatch<React.SetStateAction<Shortcuts>>;
  resetShortcuts: () => void;
  savedNotes: SavedNote[];
  addSavedNote: (note: Omit<SavedNote, 'id' | 'createdAt'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [galleryContent, setGalleryContent] = useState<GeneratedContent[]>([]);
  const [imageForWhiteboard, setImageForWhiteboard] = useState<string | null>(null);
  const [imageForEditor, setImageForEditor] = useState<string | null>(null);
  const [promptForGenerator, setPromptForGenerator] = useState<string | null>(null);
  const [activeModule, setActiveModule] = useState<Module>('image');
  const [settings, setSettings] = useState<Settings>({ font: 'font-sans', textSize: 'base' });
  
  const [shortcuts, setShortcuts] = useState<Shortcuts>(() => {
    try {
        const saved = localStorage.getItem('shortcuts');
        return saved ? JSON.parse(saved) : DEFAULT_SHORTCUTS;
    } catch {
        return DEFAULT_SHORTCUTS;
    }
  });

  const [savedNotes, setSavedNotes] = useState<SavedNote[]>(() => {
    try {
        const saved = localStorage.getItem('savedNotes');
        return saved ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
  });


  useEffect(() => {
    localStorage.setItem('shortcuts', JSON.stringify(shortcuts));
  }, [shortcuts]);

  useEffect(() => {
    localStorage.setItem('savedNotes', JSON.stringify(savedNotes));
  }, [savedNotes]);


  const resetShortcuts = () => {
    setShortcuts(DEFAULT_SHORTCUTS);
  };

  const addSavedNote = (note: Omit<SavedNote, 'id' | 'createdAt'>) => {
    const newNote: SavedNote = {
      ...note,
      id: new Date().toISOString() + Math.random(), // Add random number for better uniqueness
      createdAt: new Date().toISOString(),
    };
    setSavedNotes((prevNotes) => [newNote, ...prevNotes]);
  };

  const addContentToGallery = (content: GeneratedContent) => {
    setGalleryContent((prevContent) => [content, ...prevContent]);
  };

  return (
    <AppContext.Provider
      value={{
        galleryContent,
        addContentToGallery,
        imageForWhiteboard,
        setImageForWhiteboard,
        imageForEditor,
        setImageForEditor,
        promptForGenerator,
        setPromptForGenerator,
        activeModule,
        setActiveModule,
        settings,
        setSettings,
        shortcuts,
        setShortcuts,
        resetShortcuts,
        savedNotes,
        addSavedNote,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

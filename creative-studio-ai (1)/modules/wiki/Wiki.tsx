
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../contexts/AppContext.tsx';
import { SavedNote } from '../../types.ts';

const Wiki: React.FC = () => {
  const { savedNotes } = useAppContext();
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  const wikiNotes = useMemo(() => 
    savedNotes
      .filter(note => note.destination === 'wiki')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [savedNotes]
  );
  
  const selectedNote = useMemo(() => 
    wikiNotes.find(note => note.id === selectedNoteId),
    [wikiNotes, selectedNoteId]
  );

  // Automatically select the first note if none is selected
  useState(() => {
    if (!selectedNoteId && wikiNotes.length > 0) {
      setSelectedNoteId(wikiNotes[0].id);
    }
  });

  if (wikiNotes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-slate-500">
          <h2 className="text-2xl font-semibold">The Wiki is Empty</h2>
          <p>Go to Handwritten Notes to save your first wiki entry.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full -m-6">
      {/* Notes List Panel */}
      <div className="w-1/3 border-r border-slate-700 bg-slate-800/50 overflow-y-auto">
        <div className="p-4 border-b border-slate-700">
          <h3 className="text-xl font-bold">Wiki Entries</h3>
        </div>
        <ul>
          {wikiNotes.map(note => (
            <li key={note.id}>
              <button
                onClick={() => setSelectedNoteId(note.id)}
                className={`w-full text-left p-4 border-b border-slate-700 hover:bg-slate-700 transition-colors ${selectedNoteId === note.id ? 'bg-blue-600/30' : ''}`}
              >
                <h4 className="font-semibold text-slate-100 truncate">{note.title}</h4>
                <p className="text-sm text-slate-400">
                  {new Date(note.createdAt).toLocaleDateString()}
                </p>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Note Content Panel */}
      <div className="w-2/3 overflow-y-auto p-8">
        {selectedNote ? (
          <div className="max-w-3xl mx-auto animate-fade-in" key={selectedNote.id}>
            <h1 className="text-4xl font-bold mb-2">{selectedNote.title}</h1>
            <p className="text-slate-400 mb-8">
              Saved on {new Date(selectedNote.createdAt).toLocaleString()}
            </p>
            <div 
              className="bg-white rounded p-8"
              style={{
                backgroundImage: `linear-gradient(to bottom, transparent 49px, #d4e3ff 50px)`,
                backgroundSize: '100% 50px',
              }}
            >
              <p className="text-slate-800 font-handwriting text-3xl leading-relaxed tracking-wide whitespace-pre-wrap">
                {selectedNote.content}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500">
            <p>Select a note from the list to view its content.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wiki;
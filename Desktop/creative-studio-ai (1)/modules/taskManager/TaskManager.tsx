
import React, { useState } from 'react';
import { ImagePrompt } from '../../types.ts';
import { useAppContext } from '../../contexts/AppContext.tsx';

const ImagePromptList: React.FC = () => {
  const { setPromptForGenerator, setActiveModule } = useAppContext();
  const [prompts, setPrompts] = useState<ImagePrompt[]>([
    { id: '1', prompt: 'A hyperrealistic cat wearing a tiny wizard hat' },
    { id: '2', prompt: 'A floating island in the sky with waterfalls, Studio Ghibli style' },
  ]);
  const [newPrompt, setNewPrompt] = useState('');

  const handleAddPrompt = () => {
    if (!newPrompt.trim()) return;
    const newPromptItem: ImagePrompt = {
      id: new Date().toISOString(),
      prompt: newPrompt,
    };
    setPrompts([newPromptItem, ...prompts]);
    setNewPrompt('');
  };

  const handleUsePrompt = (prompt: string) => {
    setPromptForGenerator(prompt);
    setActiveModule('image');
  };
  
  const handleRemovePrompt = (id: string) => {
    setPrompts(prompts.filter(p => p.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={newPrompt}
          onChange={(e) => setNewPrompt(e.target.value)}
          placeholder="Add a new image idea..."
          className="flex-grow bg-slate-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyDown={(e) => e.key === 'Enter' && handleAddPrompt()}
        />
        <button
          onClick={handleAddPrompt}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
        >
          Add Prompt
        </button>
      </div>

      <div className="space-y-3">
        {prompts.map(p => (
          <div
            key={p.id}
            className="bg-slate-800 p-4 rounded-lg flex items-center justify-between"
          >
            <p className="text-lg flex-1 mr-4">{p.prompt}</p>
            <div className="flex items-center gap-2">
                <button onClick={() => handleUsePrompt(p.prompt)} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-1 px-3 rounded-md">
                    Use
                </button>
                <button onClick={() => handleRemovePrompt(p.id)} className="text-slate-500 hover:text-red-500 font-bold py-1 px-3">
                    &#x2715;
                </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImagePromptList;

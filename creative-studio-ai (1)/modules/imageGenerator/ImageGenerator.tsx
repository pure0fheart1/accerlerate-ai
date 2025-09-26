import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../contexts/AppContext.tsx';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { useUsageTracking } from '../../hooks/useUsageTracking.ts';
import { generateImage } from '../../services/geminiService.ts';
import { GeneratedContent } from '../../types.ts';
import { ImageIcon, SparklesIcon } from '../../components/Icons.tsx';
import { Modal } from '../../components/Modal.tsx';
import { PromptEnhancer } from '../../components/PromptEnhancer.tsx';
import { ImageGenerationQueue } from '../../components/ImageGenerationQueue.tsx';

// Define the queue item structure
type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
type QueueStatus = 'queued' | 'generating' | 'done' | 'error' | 'cancelled';

interface QueueItem {
  id: string;
  prompt: string;
  aspectRatio: AspectRatio;
  status: QueueStatus;
  imageUrl?: string;
}

const MAX_QUEUE_SIZE = 20;

const ImageGenerator: React.FC = () => {
  const {
      addContentToGallery,
      setImageForWhiteboard,
      setActiveModule,
      setImageForEditor,
      promptForGenerator,
      setPromptForGenerator
  } = useAppContext();
  const { user } = useAuth();
  const { trackUsage, checkUsageLimit } = useUsageTracking();
  
  const [prompt, setPrompt] = useState('A majestic lion wearing a crown, studio lighting, hyperrealistic');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [isLoading, setIsLoading] = useState(false); // Represents the queue processor state
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isEnhancerOpen, setIsEnhancerOpen] = useState(false);
  const [promptQueue, setPromptQueue] = useState<QueueItem[]>([]);
  const currentlyGeneratingIdRef = useRef<string | null>(null);


  useEffect(() => {
    if (promptForGenerator) {
        setPrompt(promptForGenerator);
        setPromptForGenerator(null); // Clear after use
    }
  }, [promptForGenerator, setPromptForGenerator]);

  // Queue Processor Effect
  useEffect(() => {
    const processNextInQueue = async () => {
      if (isLoading) return; // Processor is busy

      const nextItem = promptQueue.find(item => item.status === 'queued');
      if (!nextItem) return; // No items to process

      setIsLoading(true);
      setError(null);
      currentlyGeneratingIdRef.current = nextItem.id;

      setPromptQueue(currentQueue => 
        currentQueue.map(item => 
            item.id === nextItem.id ? { ...item, status: 'generating' } : item
        )
      );

      try {
        const images = await generateImage(nextItem.prompt, nextItem.aspectRatio);

        setPromptQueue(currentQueue => {
            const itemToUpdate = currentQueue.find(item => item.id === nextItem.id);

            // Only update if the item is still in 'generating' state (i.e., not cancelled)
            if (itemToUpdate && itemToUpdate.status === 'generating') {
                if (images && images.length > 0) {
                    const imageUrl = images[0];
                    setGeneratedImage(imageUrl); // Display the latest generated image

                    // Track usage after successful generation
                    trackUsage('imageGenerations', 1);

                    const newContent: GeneratedContent = {
                        id: new Date().toISOString(),
                        type: 'image',
                        prompt: nextItem.prompt,
                        url: imageUrl,
                        createdAt: new Date(),
                    };
                    addContentToGallery(newContent);

                    return currentQueue.map(item =>
                        item.id === nextItem.id ? { ...item, status: 'done', imageUrl } : item
                    );
                } else {
                     return currentQueue.map(item => 
                        item.id === nextItem.id ? { ...item, status: 'error' } : item
                    );
                }
            }
            return currentQueue; // If cancelled, return the queue as is
        });

      } catch (err) {
        setPromptQueue(currentQueue => {
             const itemToUpdate = currentQueue.find(item => item.id === nextItem.id);
             if (itemToUpdate && itemToUpdate.status === 'generating') {
                const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
                setError(errorMessage);
                return currentQueue.map(item => 
                    item.id === nextItem.id ? { ...item, status: 'error' } : item
                );
             }
             return currentQueue;
        });
      } finally {
        // Only unlock the processor if this was the active job and it wasn't cancelled
        if (currentlyGeneratingIdRef.current === nextItem.id) {
          setIsLoading(false); 
          currentlyGeneratingIdRef.current = null;
        }
      }
    };

    processNextInQueue();
  }, [promptQueue, isLoading, addContentToGallery]);

  const handleAddToQueue = () => {
    if (!prompt.trim() || promptQueue.length >= MAX_QUEUE_SIZE) {
      return;
    }

    // Check authentication and usage limits
    if (!user) {
      setError('Please sign in to generate images.');
      return;
    }

    if (!checkUsageLimit('imageGenerations')) {
      setError('You have reached your image generation limit. Please upgrade your plan.');
      return;
    }

    const newItem: QueueItem = {
      id: new Date().toISOString() + Math.random(),
      prompt,
      aspectRatio,
      status: 'queued',
    };
    setPromptQueue(prev => [...prev, newItem]);
    setPrompt(''); // Clear input for next prompt
    setError(null); // Clear any previous errors
  };
  
  const handleCancelGeneration = (id: string) => {
    setPromptQueue(currentQueue =>
      currentQueue.map(item =>
        item.id === id && item.status === 'generating' ? { ...item, status: 'cancelled' } : item
      )
    );

    // If we are cancelling the currently active job, unlock the processor
    if (currentlyGeneratingIdRef.current === id) {
      setIsLoading(false);
      currentlyGeneratingIdRef.current = null;
    }
  };

  const handleRemoveFromQueue = (id: string) => {
    setPromptQueue(prev => prev.filter(item => item.id !== id && item.status !== 'generating'));
  };

  const handleClearQueue = () => {
    setPromptQueue(prev => prev.filter(item => item.status === 'generating'));
  };

  const handleSendToWhiteboard = () => {
    if (generatedImage) {
      setImageForWhiteboard(generatedImage);
      setActiveModule('whiteboard');
    }
  };

  const handleSendToEditor = () => {
      if(generatedImage) {
          setImageForEditor(generatedImage);
          setActiveModule('editor');
      }
  };

  const isQueueFull = promptQueue.length >= MAX_QUEUE_SIZE;
  const buttonText = isLoading ? "Processing..." : `Add to Queue (${promptQueue.length}/${MAX_QUEUE_SIZE})`;

  return (
    <div className="flex flex-col md:flex-row gap-8 h-full">
      <div className="md:w-1/3 flex flex-col gap-4">
        <h3 className="text-2xl font-bold">Image Generation</h3>
        <div>
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="prompt" className="block text-sm font-medium text-slate-300">
              Prompt
            </label>
            <button 
              onClick={() => setIsEnhancerOpen(true)} 
              className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors"
              title="Enhance prompt with AI"
            >
              <SparklesIcon /> Enhance Prompt
            </button>
          </div>
          <textarea
            id="prompt"
            rows={5}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full bg-slate-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe the image you want to create..."
          />
        </div>
        <div>
          <label htmlFor="aspectRatio" className="block text-sm font-medium text-slate-300 mb-2">
            Aspect Ratio
          </label>
          <select
            id="aspectRatio"
            value={aspectRatio}
            onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
            className="w-full bg-slate-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1:1">1:1 (Square)</option>
            <option value="16:9">16:9 (Widescreen)</option>
            <option value="9:16">9:16 (Portrait)</option>
            <option value="4:3">4:3 (Landscape)</option>
            <option value="3:4">3:4 (Tall)</option>
          </select>
        </div>
        <button
          onClick={handleAddToQueue}
          disabled={isLoading || isQueueFull || !prompt.trim()}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-lg transition-transform active:scale-95"
        >
          {buttonText}
        </button>

        <ImageGenerationQueue queue={promptQueue} onRemove={handleRemoveFromQueue} onClear={handleClearQueue} onCancel={handleCancelGeneration} />
        
        {error && <p className="text-red-400 mt-2">{error}</p>}
      </div>
      <div className="md:w-2/3 flex-1 bg-slate-900 rounded-lg flex items-center justify-center p-4">
        {isLoading && !generatedImage && (
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
            <p className="text-lg text-slate-300">Starting the generation queue...</p>
          </div>
        )}
        {generatedImage && (
          <div className="flex flex-col items-center justify-center gap-2 h-full w-full">
            <img src={generatedImage} alt={prompt} className="max-h-[85%] max-w-full object-contain rounded-md" />
            <div className="flex gap-4 mt-2">
                <button
                    onClick={handleSendToWhiteboard}
                    className="bg-slate-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-slate-700 transition-colors"
                >
                    Send to Whiteboard
                </button>
                <button
                    onClick={handleSendToEditor}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                    Send to Editor
                </button>
            </div>
          </div>
        )}
        {!isLoading && !generatedImage && (
          <div className="text-center text-slate-500">
            <ImageIcon />
            <p className="mt-2">Your generated image will appear here.</p>
          </div>
        )}
      </div>
      <Modal isOpen={isEnhancerOpen} onClose={() => setIsEnhancerOpen(false)} title="AI Prompt Enhancer">
        <PromptEnhancer
            initialPrompt={prompt}
            onEnhance={(newPrompt) => {
                setPrompt(newPrompt);
                setIsEnhancerOpen(false);
            }}
        />
      </Modal>
    </div>
  );
};

export default ImageGenerator;
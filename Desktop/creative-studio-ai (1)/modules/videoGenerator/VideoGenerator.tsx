
import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../contexts/AppContext.tsx';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { useUsageTracking } from '../../hooks/useUsageTracking.ts';
import { startVideoGeneration, checkVideoGenerationStatus } from '../../services/geminiService.ts';
import { GeneratedContent } from '../../types.ts';
import { VideoIcon, SparklesIcon } from '../../components/Icons.tsx';
import { Modal } from '../../components/Modal.tsx';
import { PromptEnhancer } from '../../components/PromptEnhancer.tsx';

const loadingMessages = [
  "Warming up the digital director's chair...",
  "Storyboarding your vision...",
  "Rendering the first few frames...",
  "Applying cinematic color grading...",
  "Adding special effects and soundscapes...",
  "Finalizing the cut, this can take a moment...",
  "Polishing the final product...",
];

const VideoGenerator: React.FC = () => {
  const { addContentToGallery } = useAppContext();
  const { user } = useAuth();
  const { trackUsage, checkUsageLimit } = useUsageTracking();
  const [prompt, setPrompt] = useState('A neon hologram of a cat driving a futuristic car at top speed through a cyberpunk city');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [currentLoadingMessage, setCurrentLoadingMessage] = useState('');
  const [isEnhancerOpen, setIsEnhancerOpen] = useState(false);

  const operationRef = useRef<any>(null);
  // FIX: Replaced NodeJS.Timeout with `number` because setInterval in the browser returns a number, not a Timeout object.
  const pollIntervalRef = useRef<number | null>(null);
  // FIX: Replaced NodeJS.Timeout with `number` because setInterval in the browser returns a number, not a Timeout object.
  const messageIntervalRef = useRef<number | null>(null);

  const cleanupIntervals = () => {
    // FIX: Use window.clearInterval to ensure the browser's implementation is used, which expects a number.
    if (pollIntervalRef.current) window.clearInterval(pollIntervalRef.current);
    if (messageIntervalRef.current) window.clearInterval(messageIntervalRef.current);
    pollIntervalRef.current = null;
    messageIntervalRef.current = null;
  };

  useEffect(() => {
    return cleanupIntervals; // Cleanup on component unmount
  }, []);
  
  const pollStatus = async () => {
      if (!operationRef.current) return;
  
      try {
        const updatedOperation = await checkVideoGenerationStatus(operationRef.current);
        operationRef.current = updatedOperation;
  
        if (updatedOperation.done) {
          cleanupIntervals();
          const downloadLink = updatedOperation.response?.generatedVideos?.[0]?.video?.uri;
          
          if (downloadLink) {
              // The API key must be appended to the download URI
              const fetchUrl = `${downloadLink}&key=${process.env.API_KEY}`;
              
              // Fetch the video data, create a blob URL
              const response = await fetch(fetchUrl);
              if (!response.ok) {
                  throw new Error(`Failed to download video: ${response.statusText}`);
              }
              const videoBlob = await response.blob();
              const videoObjectURL = URL.createObjectURL(videoBlob);
              
              setGeneratedVideoUrl(videoObjectURL);

              // Track usage after successful generation
              trackUsage('videoGenerations', 1);

              const newContent: GeneratedContent = {
                  id: new Date().toISOString(),
                  type: 'video',
                  prompt,
                  url: videoObjectURL, // Use the object URL for gallery and viewing
                  createdAt: new Date(),
              };
              addContentToGallery(newContent);
          } else {
              setError('Video generation finished, but no video URL was found.');
          }
          setIsLoading(false); // End loading after processing is complete
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to poll or download video.');
        setIsLoading(false);
        cleanupIntervals();
      }
  };

  const handleGenerate = async () => {
    if (!prompt) {
      setError('Prompt cannot be empty.');
      return;
    }

    // Check authentication and usage limits
    if (!user) {
      setError('Please sign in to generate videos.');
      return;
    }

    if (!checkUsageLimit('videoGenerations')) {
      setError('You have reached your video generation limit. Please upgrade your plan.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedVideoUrl(null);
    setCurrentLoadingMessage(loadingMessages[0]);
    
    // Start cycling through loading messages
    let messageIndex = 1;
    // FIX: Use window.setInterval to resolve TypeScript error. It correctly returns a number in a browser environment.
    messageIntervalRef.current = window.setInterval(() => {
        setCurrentLoadingMessage(loadingMessages[messageIndex % loadingMessages.length]);
        messageIndex++;
    }, 7000);

    try {
      const initialOperation = await startVideoGeneration(prompt);
      operationRef.current = initialOperation;
      // FIX: Use window.setInterval to resolve TypeScript error. It correctly returns a number in a browser environment.
      pollIntervalRef.current = window.setInterval(pollStatus, 10000); // Poll every 10 seconds
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setIsLoading(false);
      cleanupIntervals();
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 h-full">
      <div className="md:w-1/3 flex flex-col gap-4">
        <h3 className="text-2xl font-bold">Video Generation (VEO)</h3>
        <div>
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="prompt-video" className="block text-sm font-medium text-slate-300">Prompt</label>
            <button 
              onClick={() => setIsEnhancerOpen(true)} 
              className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors"
              title="Enhance prompt with AI"
            >
              <SparklesIcon /> Enhance Prompt
            </button>
          </div>
          <textarea
            id="prompt-video"
            rows={5}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full bg-slate-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe the video you want to create..."
          />
        </div>
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-lg transition-transform active:scale-95"
        >
          {isLoading ? 'Generating...' : 'Generate Video'}
        </button>
        {error && <p className="text-red-400 mt-2">{error}</p>}
      </div>
      <div className="md:w-2/3 flex-1 bg-slate-900 rounded-lg flex items-center justify-center p-4">
        {isLoading && (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
            <p className="text-lg text-slate-300 mt-4">{currentLoadingMessage}</p>
            <p className="text-sm text-slate-500">(Video generation can take several minutes)</p>
          </div>
        )}
        {!isLoading && generatedVideoUrl && (
          <video src={generatedVideoUrl} controls autoPlay loop className="max-h-full max-w-full object-contain rounded-md" />
        )}
        {!isLoading && !generatedVideoUrl && (
          <div className="text-center text-slate-500">
            <VideoIcon />
            <p className="mt-2">Your generated video will appear here.</p>
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

export default VideoGenerator;
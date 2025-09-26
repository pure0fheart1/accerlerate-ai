import React, { useState, useRef } from 'react';
import { EditIcon, DownloadIcon, ImageIcon } from '../components/icons';

const AIImageEditor: React.FC = () => {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('make the background a cyberpunk city');
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSourceImage(e.target?.result as string);
        setEditedImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingOver(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Simulate AI image editing - in a real app, this would call an AI service
  const handleGenerate = async () => {
    if (!sourceImage || !prompt) {
      setError('Please provide a source image and a prompt.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setEditedImage(null);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 3000));

      // For demo purposes, we'll just return the original image with some effects
      // In a real implementation, this would call an AI image editing service
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;

        if (ctx) {
          // Draw the original image
          ctx.drawImage(img, 0, 0);

          // Add a subtle overlay effect to simulate editing
          ctx.globalAlpha = 0.1;
          ctx.fillStyle = '#3b82f6';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Add some text to indicate it's been "edited"
          ctx.globalAlpha = 0.8;
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 24px Arial';
          ctx.fillText('AI Edited', 20, 40);

          setEditedImage(canvas.toDataURL('image/png'));
        }
      };

      img.src = sourceImage;

    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred during image editing.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!editedImage) return;
    const link = document.createElement('a');
    link.href = editedImage;
    const safePrompt = prompt.substring(0, 30).replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `ai-edited-${safePrompt}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-2">
          AI Image Editor
        </h1>
        <p className="text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">
          Upload an image and describe how you want it edited. Our AI will transform your image according to your instructions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">Upload Image</h3>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`w-full h-48 border-2 border-dashed rounded-lg flex items-center justify-center text-center transition-colors ${
                isDraggingOver
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                  : 'border-gray-300 dark:border-slate-600 hover:border-gray-400 dark:hover:border-slate-500'
              }`}
            >
              {sourceImage ? (
                <img src={sourceImage} alt="Source" className="max-h-full max-w-full object-contain rounded-md" />
              ) : (
                <div className="text-gray-500 dark:text-slate-400 p-4">
                  <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Click to upload or drag & drop an image here</p>
                  <p className="text-xs mt-1">PNG, JPG, GIF up to 10MB</p>
                </div>
              )}
            </div>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full mt-4 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300 py-3 rounded-lg font-medium transition-colors"
            >
              Choose Image
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">Edit Instructions</h3>

            <div>
              <label htmlFor="edit-prompt" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Describe your edit
              </label>
              <textarea
                id="edit-prompt"
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-slate-100 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                placeholder="e.g., change the background to a sunset, add a hat to the person, make it black and white..."
              />
            </div>

            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Quick Suggestions</h4>
              <div className="flex flex-wrap gap-2">
                {[
                  'Make it black and white',
                  'Add a fantasy background',
                  'Change to watercolor style',
                  'Add dramatic lighting',
                  'Remove the background'
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setPrompt(suggestion)}
                    className="px-3 py-1 text-xs bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300 rounded-full transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isLoading || !sourceImage || !prompt.trim()}
              className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Processing...
                </>
              ) : (
                <>
                  <EditIcon className="h-5 w-5" />
                  Apply AI Edit
                </>
              )}
            </button>

            {error && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Result Panel */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Edited Result</h3>
              {editedImage && (
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <DownloadIcon className="h-4 w-4" />
                  Download
                </button>
              )}
            </div>

            <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-8 min-h-[400px] flex items-center justify-center">
              {isLoading ? (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-slate-400">AI is working its magic...</p>
                  <p className="text-sm text-gray-500 dark:text-slate-500 mt-1">This usually takes a few seconds</p>
                </div>
              ) : editedImage ? (
                <div className="text-center">
                  <img
                    src={editedImage}
                    alt="AI edited result"
                    className="max-w-full max-h-[500px] object-contain rounded-lg shadow-lg"
                  />
                  <p className="text-green-600 dark:text-green-400 font-medium mt-4 flex items-center justify-center gap-2">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Edit Complete!
                  </p>
                </div>
              ) : (
                <div className="text-center text-gray-500 dark:text-slate-400">
                  <EditIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Your edited image will appear here</p>
                  <p className="text-sm mt-2">Upload an image and describe your edits to get started</p>
                </div>
              )}
            </div>
          </div>

          {/* Feature Info */}
          <div className="mt-6 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-indigo-200 dark:border-indigo-800">
            <h4 className="font-semibold text-gray-900 dark:text-slate-100 mb-3">✨ AI Image Editor Features</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-slate-300">
              <div>
                <strong>Style Transfer:</strong> Convert photos to different artistic styles
              </div>
              <div>
                <strong>Background Editing:</strong> Change or remove backgrounds instantly
              </div>
              <div>
                <strong>Object Manipulation:</strong> Add, remove, or modify objects
              </div>
              <div>
                <strong>Color Grading:</strong> Adjust mood and atmosphere
              </div>
            </div>
            <p className="text-xs text-gray-600 dark:text-slate-400 mt-4">
              <strong>Note:</strong> This is a demo version. In the full version, this would connect to advanced AI image editing services.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIImageEditor;
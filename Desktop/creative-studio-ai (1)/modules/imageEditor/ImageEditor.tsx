
import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../contexts/AppContext.tsx';
import { editImage } from '../../services/geminiService.ts';
import { EditIcon } from '../../components/Icons.tsx';
import { GeneratedContent } from '../../types.ts';

const ImageEditor: React.FC = () => {
    const { imageForEditor, setImageForEditor, addContentToGallery } = useAppContext();
    const [sourceImage, setSourceImage] = useState<string | null>(null);
    const [prompt, setPrompt] = useState<string>('make the background a cyberpunk city');
    const [editedImage, setEditedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const [isSaved, setIsSaved] = useState(false);


    useEffect(() => {
        if (imageForEditor) {
            setSourceImage(imageForEditor);
            setEditedImage(null); // Clear previous edit
            setImageForEditor(null); // Consume the image from context
        }
    }, [imageForEditor, setImageForEditor]);
    
    const handleFileSelect = (file: File) => {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setSourceImage(e.target?.result as string);
                setEditedImage(null);
                setIsSaved(false);
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

    
    const handleGenerate = async () => {
        if (!sourceImage || !prompt) {
            setError('Please provide a source image and a prompt.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setEditedImage(null);
        setIsSaved(false);
        try {
            const [meta, data] = sourceImage.split(',');
            const mimeType = meta.split(';')[0].split(':')[1];
            const result = await editImage(data, mimeType, prompt);
            setEditedImage(result);

            const newContent: GeneratedContent = {
                id: new Date().toISOString(),
                type: 'image',
                prompt: `Image Edit: ${prompt}`,
                url: result,
                createdAt: new Date(),
            };
            addContentToGallery(newContent);
            setIsSaved(true);

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
        link.download = `edited-${safePrompt}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex flex-col md:flex-row gap-8 h-full">
            <div className="md:w-1/3 flex flex-col gap-4">
                <h3 className="text-2xl font-bold">AI Image Editor</h3>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Source Image</label>
                    <div 
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`w-full h-48 bg-slate-700 rounded-lg flex items-center justify-center text-center transition-colors ${isDraggingOver ? 'border-2 border-dashed border-blue-500 bg-slate-600' : 'border-2 border-transparent'}`}
                    >
                       {sourceImage ? (
                           <img src={sourceImage} alt="Source" className="max-h-full max-w-full object-contain rounded-md" />
                       ) : (
                           <p className="text-slate-400 px-4">Click button below or drag & drop an image here</p>
                       )}
                    </div>
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                    <button onClick={() => fileInputRef.current?.click()} className="w-full mt-2 bg-slate-600 text-white py-2 rounded-lg hover:bg-slate-500">
                        Upload Image
                    </button>
                </div>
                <div>
                    <label htmlFor="edit-prompt" className="block text-sm font-medium text-slate-300 mb-2">
                        Editing Prompt
                    </label>
                    <textarea
                        id="edit-prompt"
                        rows={4}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="w-full bg-slate-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., add a hat on the cat"
                    />
                </div>
                <button onClick={handleGenerate} disabled={isLoading || !sourceImage} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-lg">
                    {isLoading ? 'Editing...' : 'Apply Edit'}
                </button>
                {error && <p className="text-red-400 mt-2">{error}</p>}
            </div>
            <div className="md:w-2/3 flex-1 bg-slate-900 rounded-lg flex items-center justify-center p-4">
                 {isLoading && (
                    <div className="flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
                        <p className="text-lg text-slate-300">Applying AI magic...</p>
                    </div>
                )}
                {!isLoading && editedImage && (
                    <div className="flex flex-col items-center justify-center gap-2 h-full w-full">
                        <img src={editedImage} alt="Edited result" className="max-h-[85%] max-w-full object-contain rounded-md" />
                        <div className="flex items-center gap-4 mt-2">
                            {isSaved && <span className="text-green-400 font-semibold py-2">Saved to Gallery!</span>}
                            <button
                                onClick={handleDownload}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                            >
                                Download
                            </button>
                        </div>
                    </div>
                )}
                {!isLoading && !editedImage && (
                    <div className="text-center text-slate-500">
                        <EditIcon />
                        <p className="mt-2">Your edited image will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageEditor;
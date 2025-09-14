
import React, { useState, useRef, useEffect } from 'react';
import { editImage } from '../../services/geminiService.ts';
import { EditIcon } from '../../components/Icons.tsx';
import { useAppContext } from '../../contexts/AppContext.tsx';
import { GeneratedContent } from '../../types.ts';

const PhotoBooth: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const { addContentToGallery } = useAppContext();

    const [isCameraOn, setIsCameraOn] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [editedImage, setEditedImage] = useState<string | null>(null);
    const [prompt, setPrompt] = useState<string>('make me wear a pirate hat');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [cameraError, setCameraError] = useState<string | null>(null);

    // This effect manages the camera stream lifecycle based on the `capturedImage` state.
    useEffect(() => {
        // If an image is already captured, or the video element isn't ready, do nothing.
        if (capturedImage || !videoRef.current) {
            return;
        }

        let stream: MediaStream | null = null;
        
        const enableStream = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { width: 1280, height: 720, facingMode: 'user' } 
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    setIsCameraOn(true);
                    setCameraError(null);
                }
            } catch (err) {
                 console.error("Error accessing camera:", err);
                 setCameraError("Could not access the camera. Please check permissions and try again.");
                 setIsCameraOn(false);
            }
        };

        enableStream();

        // Cleanup function: runs when the component unmounts or when `capturedImage` changes.
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            setIsCameraOn(false);
        };
    }, [capturedImage]); // Re-run effect when `capturedImage` changes (e.g., on retake)

    const handleCapture = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (video && canvas && isCameraOn) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            // Flip the image horizontally for a mirror effect
            context?.translate(video.videoWidth, 0);
            context?.scale(-1, 1);
            context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            const dataUrl = canvas.toDataURL('image/jpeg');
            setCapturedImage(dataUrl);
            // The useEffect cleanup will turn off the camera now that `capturedImage` is set.
        }
    };

    const handleRetake = () => {
        setCapturedImage(null);
        setEditedImage(null);
        setError(null);
        // The useEffect will turn the camera back on since `capturedImage` is now null.
    };
    
    const handleGenerate = async () => {
        if (!capturedImage || !prompt) {
            setError('Please capture an image and provide a prompt.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setEditedImage(null);
        try {
            const [meta, data] = capturedImage.split(',');
            const mimeType = meta.split(';')[0].split(':')[1];
            const result = await editImage(data, mimeType, prompt);
            setEditedImage(result);

            const newContent: GeneratedContent = {
                id: new Date().toISOString(),
                type: 'image',
                prompt: `Photo Booth Edit: ${prompt}`,
                url: result,
                createdAt: new Date(),
            };
            addContentToGallery(newContent);

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
        link.download = `photobooth-${safePrompt}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex flex-col md:flex-row gap-8 h-full">
            <div className="md:w-1/3 flex flex-col gap-4">
                <h3 className="text-2xl font-bold">AI Photo Booth</h3>
                
                {/* Camera/Capture View */}
                <div className="w-full aspect-video bg-slate-700 rounded-lg flex items-center justify-center text-center overflow-hidden">
                   {cameraError ? (
                       <div className="p-4 text-red-400">
                           <p>{cameraError}</p>
                           <button onClick={() => setCapturedImage(null) /* Trigger effect to retry */} className="mt-4 px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700">Try Again</button>
                       </div>
                   ) : capturedImage ? (
                       <img src={capturedImage} alt="Captured" className="max-h-full max-w-full object-contain" />
                   ) : (
                       <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
                   )}
                </div>
                
                {/* Controls */}
                {!capturedImage ? (
                    <button onClick={handleCapture} disabled={!isCameraOn || !!cameraError} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-slate-500 disabled:cursor-not-allowed text-lg">
                        Take Picture
                    </button>
                ) : (
                    <>
                        <button onClick={handleRetake} className="w-full bg-slate-600 text-white py-2 rounded-lg hover:bg-slate-500">
                            Retake Picture
                        </button>
                        <div>
                            <label htmlFor="edit-prompt-photobooth" className="block text-sm font-medium text-slate-300 mb-2">
                                Editing Prompt
                            </label>
                            <textarea
                                id="edit-prompt-photobooth"
                                rows={3}
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                className="w-full bg-slate-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., add futuristic sunglasses"
                            />
                        </div>
                        <button onClick={handleGenerate} disabled={isLoading || !capturedImage} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-lg">
                            {isLoading ? 'Editing...' : 'Apply Edit'}
                        </button>
                    </>
                )}

                {error && <p className="text-red-400 mt-2">{error}</p>}
            </div>

            {/* Edited Image View */}
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
                         <div className="flex flex-col items-center gap-2 mt-2">
                            <span className="text-green-400 font-semibold">Saved to Gallery!</span>
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
                        <p className="mt-2">Your edited photo will appear here.</p>
                    </div>
                )}
            </div>
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
};

export default PhotoBooth;
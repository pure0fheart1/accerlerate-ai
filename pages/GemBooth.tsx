import React, { useRef, useState, useCallback } from 'react';

// Import types and utilities
interface Photo {
    id: string;
    mode: string;
    isBusy: boolean;
}

interface Mode {
    name: string;
    emoji: string;
    prompt: string;
}

// Mode definitions
const modes: Record<string, Mode> = {
    renaissance: {
        name: 'Renaissance',
        emoji: '🎨',
        prompt: 'Make the person in the photo look like a Renaissance painting.'
    },
    cartoon: {
        name: 'Cartoon',
        emoji: '😃',
        prompt: 'Transform this image into a cute simple cartoon. Use minimal lines and solid colors.'
    },
    statue: {
        name: 'Statue',
        emoji: '🏛️',
        prompt: 'Make the person look like a classical marble statue, including the clothes and eyes.'
    },
    banana: {
        name: 'Banana',
        emoji: '🍌',
        prompt: 'Make the person in the photo wear a banana costume.'
    },
    '80s': {
        name: '80s',
        emoji: '✨',
        prompt: 'Make the person in the photo look like a 1980s yearbook photo. Feel free to change the hairstyle and clothing.'
    },
    '19century': {
        name: '19th Cent.',
        emoji: '🎩',
        prompt: 'Make the photo look like a 19th century daguerreotype. Feel free to change the background to make it period appropriate and add props like Victorian clothing. Try to keep the perspective the same.'
    },
    anime: {
        name: 'Anime',
        emoji: '🍣',
        prompt: 'Make the person in the photo look like a photorealistic anime character with exaggerated features.'
    },
    psychedelic: {
        name: 'Psychedelic',
        emoji: '🌈',
        prompt: "Create a 1960s psychedelic hand-drawn poster-style illustration based on this image with bright bold solid colors and swirling shapes. Don't add any text."
    },
    '8bit': {
        name: '8-bit',
        emoji: '🎮',
        prompt: 'Transform this image into a minimalist 8-bit brightly colored cute pixel art scene on a 80x80 pixel grid.'
    },
    beard: {
        name: 'Big Beard',
        emoji: '🧔🏻',
        prompt: 'Make the person in the photo look like they have a huge beard.'
    },
    comic: {
        name: 'Comic Book',
        emoji: '💥',
        prompt: 'Transform the photo into a comic book panel with bold outlines, halftone dots, and speech bubbles.'
    },
    old: {
        name: 'Old',
        emoji: '👵🏻',
        prompt: 'Make the person in the photo look extremely old.'
    }
};

// Image data storage
const imageData = {
    inputs: {} as Record<string, string>,
    outputs: {} as Record<string, string>
};

// Gemini API function
const generateImage = async (prompt: string, inputFile: string): Promise<string> => {
    try {
        const response = await fetch('/api/gemini-vision', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt,
                image: inputFile.split(',')[1], // Remove data:image/jpeg;base64, prefix
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        return data.image; // Base64 image data
    } catch (error) {
        console.error('Error generating image:', error);
        throw error;
    }
};

const GemBooth: React.FC = () => {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [customPrompt, setCustomPrompt] = useState('');
    const [activeMode, setActiveMode] = useState(Object.keys(modes)[0]);
    const [gifInProgress, setGifInProgress] = useState(false);
    const [gifUrl, setGifUrl] = useState<string | null>(null);
    const [videoActive, setVideoActive] = useState(false);
    const [didInitVideo, setDidInitVideo] = useState(false);
    const [focusedId, setFocusedId] = useState<string | null>(null);
    const [didJustSnap, setDidJustSnap] = useState(false);
    const [hoveredMode, setHoveredMode] = useState<any>(null);
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
    const [showCustomPrompt, setShowCustomPrompt] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const modeKeys = Object.keys(modes);

    const startVideo = async () => {
        setDidInitVideo(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: 1920 }, height: { ideal: 1080 } },
                audio: false,
            });
            setVideoActive(true);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }

            const { width, height } = stream.getVideoTracks()[0].getSettings();
            const squareSize = Math.min(width || 640, height || 480);
            canvas.width = squareSize;
            canvas.height = squareSize;
        } catch (error) {
            console.error('Error accessing camera:', error);
            setDidInitVideo(false);
        }
    };

    const takePhoto = async () => {
        if (!videoRef.current || !ctx) return;

        const video = videoRef.current;
        const { videoWidth, videoHeight } = video;
        const squareSize = canvas.width;
        const sourceSize = Math.min(videoWidth, videoHeight);
        const sourceX = (videoWidth - sourceSize) / 2;
        const sourceY = (videoHeight - sourceSize) / 2;

        ctx.clearRect(0, 0, squareSize, squareSize);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(
            video,
            sourceX,
            sourceY,
            sourceSize,
            sourceSize,
            -squareSize,
            0,
            squareSize,
            squareSize
        );

        const b64 = canvas.toDataURL('image/jpeg');
        await snapPhoto(b64);
        setDidJustSnap(true);
        setTimeout(() => setDidJustSnap(false), 1000);
    };

    const snapPhoto = async (b64: string) => {
        const id = crypto.randomUUID();
        imageData.inputs[id] = b64;

        setPhotos(prev => [{ id, mode: activeMode, isBusy: true }, ...prev]);

        try {
            const prompt = activeMode === 'custom' ? customPrompt : modes[activeMode].prompt;
            const result = await generateImage(prompt, b64);
            imageData.outputs[id] = 'data:image/png;base64,' + result;

            setPhotos(prev => prev.map(photo =>
                photo.id === id ? { ...photo, isBusy: false } : photo
            ));
        } catch (error) {
            console.error('Error generating image:', error);
            // Remove the photo if generation failed
            deletePhoto(id);
        }
    };

    const deletePhoto = (id: string) => {
        setPhotos(prev => prev.filter(photo => photo.id !== id));
        delete imageData.inputs[id];
        delete imageData.outputs[id];
    };

    const downloadImage = () => {
        const a = document.createElement('a');
        a.href = gifUrl || imageData.outputs[focusedId || ''];
        a.download = `gembooth.${gifUrl ? 'gif' : 'jpg'}`;
        a.click();
    };

    const handleModeHover = useCallback((modeInfo: any, event?: React.MouseEvent) => {
        if (!modeInfo) {
            setHoveredMode(null);
            return;
        }

        setHoveredMode(modeInfo);

        if (event) {
            const rect = event.currentTarget.getBoundingClientRect();
            const tooltipTop = rect.top;
            const tooltipLeft = rect.left + rect.width / 2;

            setTooltipPosition({
                top: tooltipTop,
                left: tooltipLeft
            });
        }
    }, []);

    return (
        <div className="h-full w-full bg-black text-white font-mono">
            <style>{`
                .video {
                    overflow: hidden;
                    position: relative;
                    flex: 1;
                    background: linear-gradient(to bottom, #000, #111);
                }
                .video video {
                    display: block;
                    margin: 0 auto;
                    height: 100%;
                    max-width: 100%;
                    object-fit: cover;
                    transition: filter 0.2s;
                    transform: rotateY(180deg);
                    aspect-ratio: 1;
                }
                .flash {
                    position: absolute;
                    inset: 0;
                    background: #fff;
                    opacity: 1;
                    animation: flash 0.3s ease-out forwards;
                }
                @keyframes flash {
                    0% { opacity: 1; }
                    100% { opacity: 0; }
                }
                .custom-prompt {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: rgba(0, 0, 0, 0.8);
                    z-index: 100;
                    padding: 20px;
                    width: 90%;
                    max-width: 420px;
                    border-radius: 5px;
                }
                .video-controls {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    gap: 20px;
                }
                .mode-selector {
                    display: flex;
                    gap: 16px;
                    background: rgba(0, 0, 0, 0.8);
                    backdrop-filter: blur(10px);
                    width: 100%;
                    padding: 10px;
                    border-top: 1px solid #333;
                    overflow: auto;
                }
                .mode-button {
                    text-transform: uppercase;
                    font-size: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    filter: grayscale(1) brightness(0.7);
                    transition: all 0.2s;
                    white-space: nowrap;
                    gap: 5px;
                    position: relative;
                    background: transparent;
                    padding: 1px 7px;
                    border-radius: 3px;
                    border: none;
                    color: white;
                    cursor: pointer;
                }
                .mode-button.active {
                    filter: grayscale(0) brightness(1) !important;
                    background: #fff;
                    color: #000;
                }
                .start-button {
                    position: absolute;
                    display: flex;
                    inset: 0;
                    text-align: center;
                    font-size: 18px;
                    padding: 10px 20px;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 20px;
                    background: none;
                    border: none;
                    color: white;
                    cursor: pointer;
                }
                .shutter {
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(10px);
                    border-radius: 50%;
                    padding: 10px;
                    filter: drop-shadow(0 0 10px rgba(0, 0, 0, 0.5));
                    transition: all 0.2s;
                    border: none;
                    color: #ddd;
                    cursor: pointer;
                    font-size: 42px;
                }
                .shutter:hover {
                    scale: 1.1;
                    color: #fff;
                }
                .shutter:active {
                    scale: 0.8;
                    rotate: 10deg;
                }
                .focused-photo {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    border-radius: 5px;
                    max-width: 85%;
                    height: 80%;
                    aspect-ratio: 1;
                    filter: drop-shadow(0 0 10px rgba(0, 0, 0, 0.5));
                }
                .circle-btn {
                    position: absolute;
                    transform: translate(50%, -50%);
                    top: 0;
                    right: 0;
                    background: rgba(0, 0, 0, 0.7);
                    z-index: 1;
                    font-size: 23px;
                    padding: 5px;
                    border-radius: 50%;
                    filter: drop-shadow(0 0 10px rgba(0, 0, 0, 0.5));
                    transition: all 0.2s;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    color: white;
                    cursor: pointer;
                }
                .results {
                    display: flex;
                    position: relative;
                    height: clamp(200px, 25vh, 300px);
                    border-top: 1px solid #333;
                    padding: 15px;
                    overflow: auto;
                    background: #111;
                }
                .results ul {
                    display: flex;
                    gap: 10px;
                }
                .results li {
                    aspect-ratio: 1;
                    height: 100%;
                    transition: opacity 0.3s;
                    position: relative;
                }
                .photo-button {
                    border-radius: 5px;
                    overflow: hidden;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    width: 100%;
                    height: 100%;
                    background: none;
                    padding: 0;
                    cursor: pointer;
                }
                .delete-btn {
                    transform: scale(0) translate(25%, -25%);
                    transition: transform 0.2s;
                }
                .results li:hover .delete-btn {
                    transform: scale(1) translate(25%, -25%);
                }
                .emoji {
                    position: absolute;
                    bottom: 5px;
                    right: 5px;
                    z-index: 1;
                    font-size: 24px;
                }
                .empty-state {
                    border: 1px dashed #555;
                    border-radius: 5px;
                    padding: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    flex-direction: column;
                    gap: 10px;
                    font-size: 14px;
                }
                .busy-shimmer {
                    position: relative;
                }
                .busy-shimmer img {
                    filter: brightness(0.4);
                }
                .busy-shimmer:before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(
                        90deg,
                        transparent 0%,
                        rgba(255, 255, 255, 0.2) 25%,
                        rgba(255, 255, 255, 0.3) 50%,
                        rgba(255, 255, 255, 0.2) 75%,
                        transparent 100%
                    );
                    background-size: 200% 100%;
                    animation: shimmer 2s infinite ease-in-out;
                    z-index: 1;
                    pointer-events: none;
                }
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
                .button {
                    border: 2px solid #fff;
                    color: #fff;
                    filter: drop-shadow(0 0 10px rgba(0, 0, 0, 0.5));
                    text-transform: uppercase;
                    padding: 10px 20px;
                    border-radius: 5px;
                    background: #1e88e5;
                    transition: all 0.2s;
                    cursor: pointer;
                }
                .button:hover {
                    scale: 1.1;
                }
                .button:active {
                    scale: 0.8;
                }
                .download-button {
                    position: absolute;
                    bottom: 0;
                    left: 50%;
                    transform: translate(-50%, 50%);
                }
            `}</style>

            <main className="w-full h-full overflow-hidden flex flex-col">
                <div
                    className="video flex-1"
                    onClick={() => {
                        setGifUrl(null);
                        setFocusedId(null);
                    }}
                >
                    {showCustomPrompt && (
                        <div className="custom-prompt">
                            <button
                                className="circle-btn"
                                onClick={() => {
                                    setShowCustomPrompt(false);
                                    if (customPrompt.trim().length === 0) {
                                        setActiveMode(modeKeys[0]);
                                    }
                                }}
                            >
                                ✕
                            </button>
                            <textarea
                                placeholder="Enter a custom prompt"
                                value={customPrompt}
                                onChange={e => setCustomPrompt(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                        setShowCustomPrompt(false);
                                    }
                                }}
                                className="w-full text-sm bg-transparent text-white border-none outline-none resize-none"
                            />
                        </div>
                    )}
                    <video
                        ref={videoRef}
                        muted
                        autoPlay
                        playsInline
                        disablePictureInPicture
                    />
                    {didJustSnap && <div className="flash" />}
                    {!videoActive && (
                        <button className="start-button" onClick={startVideo}>
                            <h1 className="text-2xl">📸 GemBooth</h1>
                            <p>{didInitVideo ? 'One sec…' : 'Tap anywhere to start webcam'}</p>
                        </button>
                    )}

                    {videoActive && (
                        <div className="video-controls">
                            <button onClick={takePhoto} className="shutter">
                                📷
                            </button>

                            <ul className="mode-selector">
                                <li
                                    key="custom"
                                    onMouseEnter={e =>
                                        handleModeHover({ key: 'custom', prompt: customPrompt }, e)
                                    }
                                    onMouseLeave={() => handleModeHover(null)}
                                >
                                    <button
                                        className={`mode-button ${activeMode === 'custom' ? 'active' : ''}`}
                                        onClick={() => {
                                            setActiveMode('custom');
                                            setShowCustomPrompt(true);
                                        }}
                                    >
                                        <span>✏️</span> <p>Custom</p>
                                    </button>
                                </li>
                                {Object.entries(modes).map(([key, { name, emoji, prompt }]) => (
                                    <li
                                        key={key}
                                        onMouseEnter={e => handleModeHover({ key, prompt }, e)}
                                        onMouseLeave={() => handleModeHover(null)}
                                    >
                                        <button
                                            onClick={() => setActiveMode(key)}
                                            className={`mode-button ${key === activeMode ? 'active' : ''}`}
                                        >
                                            <span>{emoji}</span> <p>{name}</p>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {(focusedId || gifUrl) && (
                        <div className="focused-photo" onClick={e => e.stopPropagation()}>
                            <button
                                className="circle-btn"
                                onClick={() => {
                                    setGifUrl(null);
                                    setFocusedId(null);
                                }}
                            >
                                ✕
                            </button>
                            <img
                                src={gifUrl || imageData.outputs[focusedId || '']}
                                alt="photo"
                                draggable={false}
                                className="w-full h-full object-cover rounded"
                            />
                            <button className="button download-button" onClick={downloadImage}>
                                Download
                            </button>
                        </div>
                    )}
                </div>

                <div className="results">
                    <ul>
                        {photos.length
                            ? photos.map(({ id, mode, isBusy }) => (
                                <li className={isBusy ? 'busy-shimmer' : ''} key={id}>
                                    <button
                                        className="circle-btn delete-btn"
                                        onClick={() => {
                                            deletePhoto(id);
                                            if (focusedId === id) {
                                                setFocusedId(null);
                                            }
                                        }}
                                    >
                                        🗑️
                                    </button>
                                    <button
                                        className="photo-button"
                                        onClick={() => {
                                            if (!isBusy) {
                                                setFocusedId(id);
                                                setGifUrl(null);
                                            }
                                        }}
                                    >
                                        <img
                                            src={
                                                isBusy ? imageData.inputs[id] : imageData.outputs[id]
                                            }
                                            draggable={false}
                                            className="w-full h-full object-cover"
                                        />
                                        <p className="emoji">
                                            {mode === 'custom' ? '✏️' : modes[mode]?.emoji}
                                        </p>
                                    </button>
                                </li>
                            ))
                            : videoActive && (
                                <li className="empty-state" key="empty">
                                    <p className="text-2xl">
                                        👉 📷
                                    </p>
                                    Snap a photo to get started.
                                </li>
                            )}
                    </ul>
                </div>
            </main>
        </div>
    );
};

export default GemBooth;
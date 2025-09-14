import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAppContext } from '../../contexts/AppContext.tsx';
import { UndoIcon, RedoIcon, DownloadIcon, GalleryIcon, EditIcon } from '../../components/Icons.tsx';
import { GeneratedContent } from '../../types.ts';


// ====================================================================================
// Data Structures & Types
// ====================================================================================
interface Point { x: number; y: number; }
interface Path {
  points: Point[];
  color: string;
  strokeWidth: number;
}
interface WhiteboardImage {
  id: string;
  element: HTMLImageElement;
  x: number; y: number;
  width: number; height: number;
  rotation: number; // New: for rotation
}
interface TextObject {
  id: string;
  x: number; y: number;
  text: string;
  color: string;
  fontSize: number;
  fontFamily: string;
  width: number;
  rotation: number;
}
interface ViewState {
  scale: number;
  offsetX: number;
  offsetY: number;
}
type Tool = 'pen' | 'eraser' | 'pan' | 'select' | 'text';
interface HistoryState {
  paths: Path[];
  images: WhiteboardImage[];
  textObjects: TextObject[]; // New: for text
}
type SelectedObject = { id: string; type: 'image' | 'text' } | null;
type InteractionHandle = 'br' | 'bl' | 'tr' | 'tl' | 'rotate';
type Interaction = { type: 'moving'; } | { type: 'resizing'; handle: InteractionHandle } | { type: 'rotating'; } | null;


// Serializable versions for localStorage
interface SerializableWhiteboardImage {
    id: string; src: string; x: number; y: number; width: number; height: number; rotation: number;
}
interface SerializableHistoryState {
    paths: Path[];
    images: SerializableWhiteboardImage[];
    textObjects: TextObject[];
}

// ====================================================================================
// Constants
// ====================================================================================
const COLORS = ['#FFFFFF', '#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899'];
const STROKE_SIZES = [2, 5, 10, 20, 40];
const HANDLE_SIZE = 10;
const ROTATE_HANDLE_OFFSET = 30;

// ====================================================================================
// Main Whiteboard Component
// ====================================================================================
const Whiteboard: React.FC = () => {
  const { imageForWhiteboard, setImageForWhiteboard, setImageForEditor, setActiveModule, settings, addContentToGallery } = useAppContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const textInputRef = useRef<HTMLTextAreaElement>(null);

  // State
  const [history, setHistory] = useState<HistoryState[]>([{ paths: [], images: [], textObjects: [] }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const currentState = history[historyIndex];

  const [viewState, setViewState] = useState<ViewState>({ scale: 1, offsetX: 0, offsetY: 0 });
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState<string>(COLORS[0]);
  const [strokeWidth, setStrokeWidth] = useState<number>(STROKE_SIZES[1]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedObject, setSelectedObject] = useState<SelectedObject>(null);
  const [isEditingText, setIsEditingText] = useState<TextObject | null>(null);
  const [isExporting, setIsExporting] = useState(false);


  // Refs for interactions to prevent re-renders on every mouse move
  const interactionRef = useRef<Interaction>(null);
  const startPointRef = useRef<Point | null>(null);
  const isDrawingRef = useRef(false);
  const currentPathRef = useRef<Path | null>(null);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;
  const handleUndo = useCallback(() => setHistoryIndex(i => Math.max(0, i - 1)), []);
  const handleRedo = useCallback(() => setHistoryIndex(i => Math.min(history.length - 1, i + 1)), [history.length]);
  
  // ====================================================================================
  // Auto-Save & Load Logic
  // ====================================================================================
  useEffect(() => {
    const autoSave = setInterval(() => {
      if (!isLoaded || (history.length === 1 && !currentState.paths.length && !currentState.images.length && !currentState.textObjects.length)) {
        return;
      }
      const serializableHistory = history.map(state => ({
        paths: state.paths,
        textObjects: state.textObjects,
        images: state.images.map(img => ({
          id: img.id, src: img.element.src, x: img.x, y: img.y,
          width: img.width, height: img.height, rotation: img.rotation
        }))
      }));
      localStorage.setItem('whiteboardState', JSON.stringify({ history: serializableHistory, historyIndex, viewState }));
    }, 30000);
    return () => clearInterval(autoSave);
  }, [history, historyIndex, viewState, isLoaded, currentState]);

  useEffect(() => {
    const loadState = async () => {
      const savedStateJSON = localStorage.getItem('whiteboardState');
      if (savedStateJSON) {
        try {
          const savedState = JSON.parse(savedStateJSON);
          const newHistory: HistoryState[] = await Promise.all(
            savedState.history.map(async (state: SerializableHistoryState) => {
              const loadedImages = await Promise.all(
                state.images.map(imgData => new Promise<WhiteboardImage>((resolve, reject) => {
                  const img = new Image();
                  img.src = imgData.src;
                  img.onload = () => resolve({ ...imgData, element: img });
                  img.onerror = () => reject(new Error('Failed to load image'));
                }))
              );
              return { paths: state.paths, images: loadedImages, textObjects: state.textObjects || [] };
            })
          );
          setHistory(newHistory);
          setHistoryIndex(savedState.historyIndex);
          setViewState(savedState.viewState);
        } catch (error) {
          console.error("Failed to load whiteboard state:", error);
          localStorage.removeItem('whiteboardState');
        }
      }
      setIsLoaded(true);
    };
    loadState();
  }, []);

  // ====================================================================================
  // Core State & History Management
  // ====================================================================================
  const recordNewState = useCallback((newState: HistoryState) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);
  
  // Update the current state without creating a history entry (for live dragging)
  const updateCurrentState = useCallback((updater: (prevState: HistoryState) => HistoryState) => {
      const newState = updater(history[historyIndex]);
      const newHistory = [...history];
      newHistory[historyIndex] = newState;
      setHistory(newHistory);
  }, [history, historyIndex]);

  useEffect(() => {
    // When history changes via undo/redo, clear selection.
    setSelectedObject(null);
  }, [historyIndex]);

  // ====================================================================================
  // Canvas Drawing & Geometry Helpers
  // ====================================================================================
  const getCanvasPoint = useCallback((clientX: number, clientY: number): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { 
        x: (clientX - rect.left - viewState.offsetX) / viewState.scale, 
        y: (clientY - rect.top - viewState.offsetY) / viewState.scale 
    };
  }, [viewState]);

  // Gets the bounding box of a (potentially rotated) object
  const getObjectBounds = (obj: WhiteboardImage | TextObject) => {
    const w = obj.width;
    const h = 'height' in obj ? obj.height : obj.fontSize * 1.5; // Estimate height for text
    const { x, y, rotation } = obj;
    const centerX = x + w / 2;
    const centerY = y + h / 2;
    const corners = [
      { x: x, y: y }, { x: x + w, y: y }, { x: x + w, y: y + h }, { x: x, y: y + h }
    ].map(p => rotatePoint(p, { x: centerX, y: centerY }, rotation));
    
    return {
        corners,
        handlePoints: {
            br: corners[2], bl: corners[3], tr: corners[1], tl: corners[0],
            rotate: rotatePoint({x: centerX, y: y - ROTATE_HANDLE_OFFSET}, {x: centerX, y: centerY}, rotation)
        }
    }
  };
  
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    const { paths, images, textObjects } = currentState;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(viewState.offsetX, viewState.offsetY);
    ctx.scale(viewState.scale, viewState.scale);

    // Draw images
    images.forEach(img => {
      ctx.save();
      ctx.translate(img.x + img.width / 2, img.y + img.height / 2);
      ctx.rotate(img.rotation);
      ctx.drawImage(img.element, -img.width / 2, -img.height / 2, img.width, img.height);
      ctx.restore();
    });
    
    // Draw text objects
    textObjects.forEach(txt => {
      if (isEditingText?.id === txt.id) return; // Don't draw text being edited
      ctx.save();
      ctx.translate(txt.x + txt.width / 2, txt.y + (txt.fontSize * 1.2) / 2);
      ctx.rotate(txt.rotation);
      ctx.fillStyle = txt.color;
      ctx.font = `${txt.fontSize}px ${txt.fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(txt.text, 0, 0);
      ctx.restore();
    });

    // Draw paths
    const allPaths = isDrawingRef.current && currentPathRef.current ? [...paths, currentPathRef.current] : paths;
    allPaths.forEach(path => {
      ctx.beginPath();
      ctx.strokeStyle = path.color;
      ctx.lineWidth = path.strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.moveTo(path.points[0].x, path.points[0].y);
      for (let i = 1; i < path.points.length; i++) ctx.lineTo(path.points[i].x, path.points[i].y);
      ctx.stroke();
    });

    // Draw selection handles if an object is selected
    if (selectedObject && tool === 'select') {
      const obj = [...images, ...textObjects].find(o => o.id === selectedObject.id);
      if (obj) {
        const { corners, handlePoints } = getObjectBounds(obj);
        ctx.strokeStyle = '#3B82F6';
        ctx.lineWidth = 2 / viewState.scale;
        ctx.beginPath();
        ctx.moveTo(corners[0].x, corners[0].y);
        corners.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.closePath();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(corners[0].x + (corners[1].x - corners[0].x) / 2, corners[0].y + (corners[1].y - corners[0].y) / 2);
        ctx.lineTo(handlePoints.rotate.x, handlePoints.rotate.y);
        ctx.stroke();

        Object.values(handlePoints).forEach(p => {
          ctx.fillStyle = '#3B82F6';
          ctx.beginPath();
          ctx.arc(p.x, p.y, HANDLE_SIZE / 2 / viewState.scale, 0, Math.PI * 2);
          ctx.fill();
        });
      }
    }
    ctx.restore();
  }, [currentState, viewState, selectedObject, tool, isEditingText]);
  
  useEffect(redrawCanvas, [redrawCanvas]);
  
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const resizeObserver = new ResizeObserver(() => {
      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;
      redrawCanvas();
    });
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [redrawCanvas]);

  // ====================================================================================
  // Math & Hit Detection Helpers
  // ====================================================================================
  const rotatePoint = (p: Point, center: Point, angle: number): Point => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const px = p.x - center.x;
    const py = p.y - center.y;
    return {
      x: px * cos - py * sin + center.x,
      y: px * sin + py * cos + center.y
    };
  };

  const getObjectAtPoint = (p: Point): { obj: WhiteboardImage | TextObject; handle: InteractionHandle | 'body' } | null => {
    const allObjects = [...currentState.images, ...currentState.textObjects];
    for (let i = allObjects.length - 1; i >= 0; i--) {
      const obj = allObjects[i];
      const h = 'height' in obj ? obj.height : obj.fontSize * 1.5;
      const center = { x: obj.x + obj.width / 2, y: obj.y + h / 2 };
      const localPoint = rotatePoint(p, center, -obj.rotation);
      
      // Check handles first if selected
      if (selectedObject && selectedObject.id === obj.id) {
        const { handlePoints } = getObjectBounds(obj);
        for (const [key, hp] of Object.entries(handlePoints)) {
            const dist = Math.hypot(p.x - hp.x, p.y - hp.y);
            if (dist < (HANDLE_SIZE / viewState.scale)) {
                return { obj, handle: key as InteractionHandle };
            }
        }
      }

      if (localPoint.x >= obj.x && localPoint.x <= obj.x + obj.width && localPoint.y >= obj.y && localPoint.y <= obj.y + h) {
        return { obj, handle: 'body' };
      }
    }
    return null;
  };
  
  // ====================================================================================
  // Pointer/Input Event Handlers
  // ====================================================================================
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const point = getCanvasPoint(e.clientX, e.clientY);
    startPointRef.current = point;
    setSelectedObject(null); // Deselect by default

    if(isEditingText) {
        // Finish text editing if clicking outside the text area
        const textInput = textInputRef.current;
        if(textInput && !textInput.contains(e.target as Node)) {
             handleFinishTextEdit();
        }
    }
    
    switch (tool) {
      case 'select':
        const hit = getObjectAtPoint(point);
        if (hit) {
          const { obj, handle } = hit;
          setSelectedObject({ id: obj.id, type: 'height' in obj ? 'image' : 'text' });
          if (handle === 'body') interactionRef.current = { type: 'moving' };
          else if (handle === 'rotate') interactionRef.current = { type: 'rotating' };
          else interactionRef.current = { type: 'resizing', handle };

          // Handle double-click to edit text
          if (e.detail === 2 && 'text' in obj) {
              setIsEditingText(obj);
          }

        } else {
            setSelectedObject(null);
        }
        break;

      case 'text':
        const newText: TextObject = {
            id: new Date().toISOString(), text: 'New Text',
            x: point.x, y: point.y,
            color: color, fontSize: 32,
            fontFamily: settings.font, rotation: 0, width: 200 // Initial width
        };
        setIsEditingText(newText);
        break;
      
      case 'pan':
        interactionRef.current = {type: 'moving'}; // Use moving interaction for panning
        e.currentTarget.style.cursor = 'grabbing';
        break;

      case 'pen':
      case 'eraser':
        isDrawingRef.current = true;
        currentPathRef.current = {
          points: [point],
          color: tool === 'eraser' ? '#0f172a' : color,
          strokeWidth,
        };
        break;
    }
  };

  // FIX: Refactored object update logic to be type-safe. The previous implementation
  // used a variable with a union type (WhiteboardImage | TextObject) that caused a
  // TypeScript error on assignment. This version uses separate logic paths for images
  // and text objects to ensure type safety and correct state updates.
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!startPointRef.current) return;
    const point = getCanvasPoint(e.clientX, e.clientY);
    const dx = point.x - startPointRef.current.x;
    const dy = point.y - startPointRef.current.y;

    if (tool === 'pan') {
      if (interactionRef.current) {
        setViewState(v => ({...v, offsetX: v.offsetX + e.movementX, offsetY: v.offsetY + e.movementY }));
      }
      return;
    }
    
    // Live update drawing without creating history
    if (isDrawingRef.current && currentPathRef.current) {
        currentPathRef.current.points.push(point);
        redrawCanvas();
        return;
    }

    if (!selectedObject || !interactionRef.current) return;
    const { type } = interactionRef.current;

    updateCurrentState(prev => {
        let newImages = [...prev.images];
        let newTextObjects = [...prev.textObjects];
        
        if (selectedObject.type === 'image') {
            const objIndex = newImages.findIndex(o => o.id === selectedObject.id);
            if (objIndex === -1) return prev;
            
            const obj = { ...newImages[objIndex] }; // Create a copy to modify
            const center = { x: obj.x + obj.width / 2, y: obj.y + obj.height / 2 };
            
            switch (type) {
              case 'moving':
                obj.x += dx; obj.y += dy;
                break;
              case 'rotating':
                const startAngle = Math.atan2(startPointRef.current!.y - center.y, startPointRef.current!.x - center.x);
                const currentAngle = Math.atan2(point.y - center.y, point.x - center.x);
                obj.rotation += currentAngle - startAngle;
                break;
            }
            newImages[objIndex] = obj;
        } else { // type === 'text'
            const objIndex = newTextObjects.findIndex(o => o.id === selectedObject.id);
            if (objIndex === -1) return prev;

            const obj = { ...newTextObjects[objIndex] }; // Create a copy to modify
            const h = obj.fontSize * 1.5;
            const center = { x: obj.x + obj.width / 2, y: obj.y + h / 2 };
            
            switch (type) {
              case 'moving':
                obj.x += dx; obj.y += dy;
                break;
              case 'rotating':
                const startAngle = Math.atan2(startPointRef.current!.y - center.y, startPointRef.current!.x - center.x);
                const currentAngle = Math.atan2(point.y - center.y, point.x - center.x);
                obj.rotation += currentAngle - startAngle;
                break;
            }
            newTextObjects[objIndex] = obj;
        }
        
        return { ...prev, images: newImages, textObjects: newTextObjects };
    });
    startPointRef.current = point;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    
    if (tool === 'pan') {
        e.currentTarget.style.cursor = 'grab';
    }

    // If an interaction was happening, commit it to history
    if (interactionRef.current) {
      recordNewState(history[historyIndex]);
    }
    interactionRef.current = null;
    startPointRef.current = null;

    if (isDrawingRef.current) {
        isDrawingRef.current = false;
        if (currentPathRef.current && currentPathRef.current.points.length > 1) {
            recordNewState({ ...currentState, paths: [...currentState.paths, currentPathRef.current] });
        }
        currentPathRef.current = null;
    }
  };

  // ====================================================================================
  // Text Editing Logic
  // ====================================================================================
  useEffect(() => {
    if (isEditingText && textInputRef.current) {
      textInputRef.current.focus();
      textInputRef.current.value = isEditingText.text;
    }
  }, [isEditingText]);

  const handleFinishTextEdit = () => {
    if (!isEditingText) return;
    const newText = textInputRef.current?.value.trim() || '';
    
    // Measure text to set width
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    let finalWidth = isEditingText.width;
    if(ctx && newText) {
        ctx.font = `${isEditingText.fontSize}px ${isEditingText.fontFamily}`;
        finalWidth = ctx.measureText(newText).width;
    }
    
    const existingIndex = currentState.textObjects.findIndex(t => t.id === isEditingText.id);
    let newTextObjects = [...currentState.textObjects];

    if(newText) {
        const finalTextObject = { ...isEditingText, text: newText, width: finalWidth };
        if (existingIndex > -1) {
            newTextObjects[existingIndex] = finalTextObject;
        } else {
            newTextObjects.push(finalTextObject);
        }
    } else {
        // If text is empty, remove it (if it existed)
        if (existingIndex > -1) {
            newTextObjects.splice(existingIndex, 1);
        }
    }
    
    recordNewState({ ...currentState, textObjects: newTextObjects });
    setIsEditingText(null);
  };
  
  // ====================================================================================
  // Component Lifecycle & Side Effects
  // ====================================================================================
  useEffect(() => {
    if (imageForWhiteboard) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageForWhiteboard;
      img.onload = () => {
        const newImage: WhiteboardImage = {
          id: new Date().toISOString(), element: img, rotation: 0,
          x: (canvasRef.current!.width / 2 - 150 - viewState.offsetX) / viewState.scale,
          y: (canvasRef.current!.height / 2 - 150 - viewState.offsetY) / viewState.scale,
          width: 300, height: (300 * img.height) / img.width,
        };
        recordNewState({...currentState, images: [...currentState.images, newImage]});
      };
      setImageForWhiteboard(null);
    }
  }, [imageForWhiteboard, setImageForWhiteboard, viewState, recordNewState, currentState]);
  
  useEffect(() => {
    const handleShortcut = (e: Event) => {
        const detail = (e as CustomEvent).detail;
        if (detail === 'whiteboard-undo') handleUndo();
        if (detail === 'whiteboard-redo') handleRedo();
    };
    document.addEventListener('app-shortcut', handleShortcut);
    return () => document.removeEventListener('app-shortcut', handleShortcut);
  }, [handleUndo, handleRedo]);
  
  const handleClear = () => {
    recordNewState({ paths: [], images: [], textObjects: [] });
    setViewState({ scale: 1, offsetX: 0, offsetY: 0 });
    localStorage.removeItem('whiteboardState');
  };

  // ====================================================================================
  // Export & Action Handlers
  // ====================================================================================
  const exportCanvasAsImage = async (): Promise<string> => {
    const { paths, images, textObjects } = currentState;
    const hasContent = paths.length > 0 || images.length > 0 || textObjects.length > 0;
    if (!hasContent) return '';

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    paths.forEach(path => path.points.forEach(p => {
        minX = Math.min(minX, p.x); minY = Math.min(minY, p.y);
        maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y);
    }));
    
    [...images, ...textObjects].forEach(obj => {
        getObjectBounds(obj).corners.forEach(p => {
            minX = Math.min(minX, p.x); minY = Math.min(minY, p.y);
            maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y);
        });
    });

    const PADDING = 20;
    const width = maxX - minX + PADDING * 2;
    const height = maxY - minY + PADDING * 2;
    
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = width;
    offscreenCanvas.height = height;
    const ctx = offscreenCanvas.getContext('2d');
    if (!ctx) return '';
    
    ctx.fillStyle = '#0f172a'; // bg-slate-900
    ctx.fillRect(0, 0, width, height);
    ctx.translate(-minX + PADDING, -minY + PADDING);
    
    // Drawing logic copied from redrawCanvas, without viewstate transforms
    images.forEach(img => {
      ctx.save();
      ctx.translate(img.x + img.width / 2, img.y + img.height / 2);
      ctx.rotate(img.rotation);
      ctx.drawImage(img.element, -img.width / 2, -img.height / 2, img.width, img.height);
      ctx.restore();
    });
    textObjects.forEach(txt => {
      ctx.save();
      ctx.translate(txt.x + txt.width / 2, txt.y + (txt.fontSize * 1.2) / 2);
      ctx.rotate(txt.rotation);
      ctx.fillStyle = txt.color;
      ctx.font = `${txt.fontSize}px ${txt.fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(txt.text, 0, 0);
      ctx.restore();
    });
    paths.forEach(path => {
      ctx.beginPath();
      ctx.strokeStyle = path.color;
      ctx.lineWidth = path.strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      if (path.points.length > 0) ctx.moveTo(path.points[0].x, path.points[0].y);
      for (let i = 1; i < path.points.length; i++) ctx.lineTo(path.points[i].x, path.points[i].y);
      ctx.stroke();
    });

    return offscreenCanvas.toDataURL('image/png');
  };

  const handleSaveAsImage = async () => {
      setIsExporting(true);
      const dataUrl = await exportCanvasAsImage();
      if (dataUrl) {
          const link = document.createElement('a');
          link.href = dataUrl;
          link.download = `whiteboard-export-${Date.now()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      }
      setIsExporting(false);
  };
  
  const handleSendToGallery = async () => {
      setIsExporting(true);
      const dataUrl = await exportCanvasAsImage();
      if (dataUrl) {
          const newContent: GeneratedContent = {
              id: new Date().toISOString(),
              type: 'image',
              prompt: 'Whiteboard Capture',
              url: dataUrl,
              createdAt: new Date(),
          };
          addContentToGallery(newContent);
      }
      setIsExporting(false);
  };
  
  const handleSendToEditor = async () => {
      setIsExporting(true);
      const dataUrl = await exportCanvasAsImage();
      if (dataUrl) {
          setImageForEditor(dataUrl);
          setActiveModule('editor');
      }
       // No need to setIsExporting(false) as the component will unmount
  };

  // ====================================================================================
  // Render Method
  // ====================================================================================
  return (
    <div className="flex flex-row h-full w-full gap-4">
      <div ref={containerRef} className="flex-1 h-full bg-slate-900 rounded-lg overflow-hidden relative">
        <canvas
          ref={canvasRef}
          className={`w-full h-full ${tool === 'pan' ? 'cursor-grab' : tool === 'select' ? 'cursor-default' : 'cursor-crosshair'}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onPointerCancel={handlePointerUp}
        />
        {isEditingText && (
          <textarea
            ref={textInputRef}
            onBlur={handleFinishTextEdit}
            onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) handleFinishTextEdit(); }}
            className="absolute bg-transparent outline-none resize-none p-0 border-dashed border border-blue-500"
            style={{
                left: isEditingText.x * viewState.scale + viewState.offsetX,
                top: isEditingText.y * viewState.scale + viewState.offsetY,
                font: `${isEditingText.fontSize * viewState.scale}px ${isEditingText.fontFamily}`,
                color: isEditingText.color,
                width: (isEditingText.width + 20) * viewState.scale,
                height: (isEditingText.fontSize * 1.5) * viewState.scale,
                transform: `rotate(${isEditingText.rotation}rad)`,
                transformOrigin: 'top left',
            }}
          />
        )}
      </div>

       <div className="w-56 bg-slate-800 p-4 rounded-lg shadow-lg flex flex-col gap-y-6 overflow-y-auto">
          <div>
              <h4 className="font-semibold mb-3 text-slate-300 border-b border-slate-700 pb-2">Tools</h4>
              <div className="flex flex-col gap-2 mt-2">
                  <button onClick={() => setTool('select')} className={`w-full text-left px-3 py-2 rounded-md transition-colors ${tool === 'select' ? 'bg-blue-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}>Select</button>
                  <button onClick={() => setTool('text')} className={`w-full text-left px-3 py-2 rounded-md transition-colors ${tool === 'text' ? 'bg-blue-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}>Text</button>
                  <button onClick={() => setTool('pen')} className={`w-full text-left px-3 py-2 rounded-md transition-colors ${tool === 'pen' ? 'bg-blue-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}>Pen</button>
                  <button onClick={() => setTool('eraser')} className={`w-full text-left px-3 py-2 rounded-md transition-colors ${tool === 'eraser' ? 'bg-blue-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}>Eraser</button>
                  <button onClick={() => setTool('pan')} className={`w-full text-left px-3 py-2 rounded-md transition-colors ${tool === 'pan' ? 'bg-blue-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}>Pan</button>
              </div>
          </div>
          <div>
              <h4 className="font-semibold mb-3 text-slate-300 border-b border-slate-700 pb-2">Color</h4>
              <div className="flex flex-wrap gap-3 mt-2">
                  {COLORS.map(c => (
                      <button key={c} onClick={() => setColor(c)} style={{ backgroundColor: c }} className={`w-8 h-8 rounded-full transition-transform transform hover:scale-110 ${color === c && (tool === 'pen' || tool === 'text') ? 'ring-2 ring-offset-2 ring-offset-slate-800 ring-white' : ''}`} aria-label={`Color ${c}`} />
                  ))}
              </div>
          </div>
          <div>
              <h4 className="font-semibold mb-3 text-slate-300 border-b border-slate-700 pb-2">Brush Size</h4>
              <div className="flex justify-between items-center bg-slate-700 p-1 rounded-md mt-2">
                  {STROKE_SIZES.map(size => (
                      <button key={size} onClick={() => setStrokeWidth(size)} className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors ${strokeWidth === size ? 'bg-blue-600' : 'hover:bg-slate-600'}`} aria-label={`Brush size ${size}`}>
                          <div style={{ width: `${size / 1.5}px`, height: `${size / 1.5}px` }} className="bg-white rounded-full"/>
                      </button>
                  ))}
              </div>
          </div>
          <div>
              <h4 className="font-semibold mb-3 text-slate-300 border-b border-slate-700 pb-2">History</h4>
              <div className="flex gap-2 mt-2">
                  <button onClick={handleUndo} disabled={!canUndo} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-colors bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed">
                      <UndoIcon /> Undo
                  </button>
                  <button onClick={handleRedo} disabled={!canRedo} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-colors bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed">
                      Redo <RedoIcon />
                  </button>
              </div>
          </div>
          <div className="mt-auto pt-6 border-t border-slate-700">
               <h4 className="font-semibold mb-3 text-slate-300 border-b border-slate-700 pb-2">Actions</h4>
              <div className="flex flex-col gap-2 mt-2">
                   <button onClick={handleSaveAsImage} disabled={isExporting} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-colors bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed">
                       <DownloadIcon/> {isExporting ? 'Saving...' : 'Save as Image'}
                   </button>
                   <button onClick={handleSendToGallery} disabled={isExporting} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-colors bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed">
                       <GalleryIcon/> {isExporting ? 'Sending...' : 'To Gallery'}
                   </button>
                   <button onClick={handleSendToEditor} disabled={isExporting} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-colors bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed">
                       <EditIcon/> {isExporting ? 'Sending...' : 'To Editor'}
                   </button>
                   <button onClick={handleClear} className="w-full mt-4 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-semibold">
                        Clear Canvas
                   </button>
              </div>
          </div>
      </div>
    </div>
  );
};
export default Whiteboard;
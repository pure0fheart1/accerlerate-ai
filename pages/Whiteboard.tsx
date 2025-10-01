import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  UndoIcon, RedoIcon, DownloadIcon, EditIcon, XMarkIcon, CheckIcon,
  PencilIcon, TrashIcon, CursorIcon, HandIcon, TypeIcon, ImageIcon
} from '../components/icons';

// ====================================================================================
// Data Structures & Types
// ====================================================================================
interface Point { x: number; y: number; pressure?: number; }
interface Path {
  points: Point[];
  color: string;
  strokeWidth: number;
  baseStrokeWidth?: number; // For pressure sensitivity
  layerId: string;
  tool?: Tool; // Track which tool created this path
  shape?: {
    type: 'rectangle' | 'circle' | 'line' | 'arrow' | 'star' | 'heart';
    startPoint: Point;
    endPoint: Point;
    filled?: boolean;
  };
}
interface WhiteboardImage {
  id: string;
  element: HTMLImageElement;
  x: number; y: number;
  width: number; height: number;
  rotation: number;
  layerId: string;
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
  layerId: string;
}
interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
}
interface ViewState {
  scale: number;
  offsetX: number;
  offsetY: number;
}
type Tool = 'pen' | 'eraser' | 'pan' | 'select' | 'text' | 'spraycan' | 'rectangle' | 'circle' | 'line' | 'arrow' | 'star' | 'heart' | 'marker' | 'brush';
interface HistoryState {
  paths: Path[];
  images: WhiteboardImage[];
  textObjects: TextObject[];
  layers: Layer[];
  backgroundColor: string;
}
type SelectedObject = { id: string; type: 'image' | 'text' } | null;
type InteractionHandle = 'br' | 'bl' | 'tr' | 'tl' | 'rotate';
type Interaction = { type: 'moving'; } | { type: 'resizing'; handle: InteractionHandle } | { type: 'rotating'; } | null;

// Serializable versions for localStorage
interface SerializableWhiteboardImage {
  id: string; src: string; x: number; y: number; width: number; height: number; rotation: number; layerId: string;
}
interface SerializableHistoryState {
  paths: Path[];
  images: SerializableWhiteboardImage[];
  textObjects: TextObject[];
  layers: Layer[];
  backgroundColor: string;
}

// ====================================================================================
// Constants
// ====================================================================================
// Extended color palettes with full spectrum
const COLORS = [
  // Basic colors
  '#000000', '#FFFFFF', '#808080', '#C0C0C0',
  // Reds
  '#FF0000', '#DC143C', '#B22222', '#8B0000',
  // Oranges
  '#FFA500', '#FF8C00', '#FF6347', '#FF4500',
  // Yellows
  '#FFFF00', '#FFD700', '#FFA500', '#DAA520',
  // Greens
  '#00FF00', '#32CD32', '#228B22', '#006400',
  // Blues
  '#0000FF', '#4169E1', '#1E90FF', '#87CEEB',
  // Purples
  '#800080', '#9370DB', '#8A2BE2', '#4B0082',
  // Pinks
  '#FF69B4', '#FF1493', '#C71585', '#DB7093'
];

const BACKGROUND_COLORS = [
  // Light backgrounds
  '#FFFFFF', '#F8F9FA', '#F1F3F4', '#E8F0FE',
  // Warm backgrounds
  '#FFF8E1', '#FFF3E0', '#FCE4EC', '#F3E5F5',
  // Cool backgrounds
  '#E3F2FD', '#E0F2F1', '#E8F5E8', '#F1F8E9',
  // Dark backgrounds
  '#263238', '#37474F', '#455A64', '#546E7A',
  // Creative backgrounds
  '#1A1A2E', '#16213E', '#0F3460', '#533A7B'
];
const STROKE_SIZES = [2, 5, 10, 20, 40];
const HANDLE_SIZE = 10;
const ROTATE_HANDLE_OFFSET = 30;

// Custom Icons for tools (simple SVG components)
const CursorIcon: React.FC<{ className?: string }> = ({ className = "h-5 w-5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M13.64 21.97c-.16 0-.3-.07-.4-.19l-3.68-4.25-3.52 1.4c-.15.06-.32.04-.45-.05-.13-.1-.2-.25-.18-.41l1.06-8.36c.02-.17.12-.32.27-.4.15-.08.33-.07.47.02l7.83 5.24c.14.09.22.25.2.42-.01.17-.11.32-.26.39l-3.12 1.58 3.68 4.25c.08.09.11.21.09.33-.02.12-.09.23-.18.29-.11.08-.24.12-.37.12z"/>
  </svg>
);

const TypeIcon: React.FC<{ className?: string }> = ({ className = "h-5 w-5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.5 4l-1.16 4.35-.96-.26L17.66 5H6.34l1.28 3.09-.96.26L5.5 4h13m0-2H5.5c-.83 0-1.5.67-1.5 1.5 0 .15.02.3.07.43L5.23 8.27c.21.8 1.05 1.28 1.85 1.07.8-.21 1.28-1.05 1.07-1.85L7.82 7h8.36l-.33 1.49c-.21.8.27 1.64 1.07 1.85.8.21 1.64-.27 1.85-1.07L20.93 3.93c.05-.13.07-.28.07-.43 0-.83-.67-1.5-1.5-1.5z"/>
    <path d="M12 10v10h-2V10h2z"/>
  </svg>
);

const HandIcon: React.FC<{ className?: string }> = ({ className = "h-5 w-5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M13 6c0-1.1-.9-2-2-2s-2 .9-2 2v5H7c-1.1 0-2 .9-2 2v3c0 3.31 2.69 6 6 6s6-2.69 6-6V8c0-1.1-.9-2-2-2s-2 .9-2 2v3h2V8h2v8c0 2.21-1.79 4-4 4s-4-1.79-4-4v-3h2V6z"/>
  </svg>
);

const SpraycanIcon: React.FC<{ className?: string }> = ({ className = "h-5 w-5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C13.1 2 14 2.9 14 4V6H16C17.1 6 18 6.9 18 8V18C18 19.1 17.1 20 16 20H8C6.9 20 6 19.1 6 18V8C6 6.9 6.9 6 8 6H10V4C10 2.9 10.9 2 12 2ZM12 4V6H12V4ZM8 8V18H16V8H8ZM9 10H15V16H9V10ZM11 12V14H13V12H11Z"/>
    <circle cx="19" cy="4" r="1"/>
    <circle cx="20" cy="6" r="1"/>
    <circle cx="22" cy="5" r="1"/>
  </svg>
);

const RectangleIcon: React.FC<{ className?: string }> = ({ className = "h-5 w-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <rect x="3" y="6" width="18" height="12" strokeWidth="2" rx="2"/>
  </svg>
);

const CircleIcon: React.FC<{ className?: string }> = ({ className = "h-5 w-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="8" strokeWidth="2"/>
  </svg>
);

const LineIcon: React.FC<{ className?: string }> = ({ className = "h-5 w-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <line x1="4" y1="20" x2="20" y2="4" strokeWidth="2"/>
  </svg>
);

const ArrowIcon: React.FC<{ className?: string }> = ({ className = "h-5 w-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <line x1="4" y1="12" x2="20" y2="12" strokeWidth="2"/>
    <polyline points="14,6 20,12 14,18" strokeWidth="2"/>
  </svg>
);

const StarIcon: React.FC<{ className?: string }> = ({ className = "h-5 w-5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
  </svg>
);

const HeartIcon: React.FC<{ className?: string }> = ({ className = "h-5 w-5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z"/>
  </svg>
);

const MarkerIcon: React.FC<{ className?: string }> = ({ className = "h-5 w-5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M4 20H20V22H4V20ZM17 5V3C17 2.45 16.55 2 16 2H8C7.45 2 7 2.45 7 3V5H4V7H20V5H17ZM15 4V5H9V4H15ZM7 9V19H17V9H7ZM9 11H15V13H9V11ZM9 15H15V17H9V15Z"/>
  </svg>
);

const BrushIcon: React.FC<{ className?: string }> = ({ className = "h-5 w-5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M7,14C5.9,14 5,13.1 5,12C5,10.9 5.9,10 7,10C8.1,10 9,10.9 9,12C9,13.1 8.1,14 7,14ZM12.6,5.5C12.4,4.5 11.5,4.1 10.7,4.7L4.8,8.8C4,9.4 3.6,10.3 4.2,11.1L5.3,12.5C5.7,13.1 6.5,13.2 7.1,12.7L13,8.6C13.8,8 14.2,7.1 13.6,6.3L12.6,5.5ZM20.7,7.7L16.3,12.1L11.9,7.7L16.3,3.3C16.7,2.9 17.3,2.9 17.7,3.3L20.7,6.3C21.1,6.7 21.1,7.3 20.7,7.7Z"/>
  </svg>
);

// ====================================================================================
// Main Whiteboard Component
// ====================================================================================
const Whiteboard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const textInputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State
  const defaultLayer: Layer = { id: 'layer-1', name: 'Layer 1', visible: true, locked: false, opacity: 1 };
  const [history, setHistory] = useState<HistoryState[]>([{
    paths: [], images: [], textObjects: [],
    layers: [defaultLayer],
    backgroundColor: '#f1f5f9'
  }]);
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
  const [activeLayerId, setActiveLayerId] = useState<string>('layer-1');
  const [showLayerPanel, setShowLayerPanel] = useState(false);

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
        layers: state.layers,
        backgroundColor: state.backgroundColor,
        images: state.images.map(img => ({
          id: img.id, src: img.element.src, x: img.x, y: img.y,
          width: img.width, height: img.height, rotation: img.rotation, layerId: img.layerId
        }))
      }));
      localStorage.setItem('accelerate-whiteboard', JSON.stringify({ history: serializableHistory, historyIndex, viewState, activeLayerId }));
    }, 30000);
    return () => clearInterval(autoSave);
  }, [history, historyIndex, viewState, isLoaded, currentState, activeLayerId]);

  useEffect(() => {
    const loadState = async () => {
      const savedStateJSON = localStorage.getItem('accelerate-whiteboard');
      if (savedStateJSON) {
        try {
          const savedState = JSON.parse(savedStateJSON);
          const newHistory: HistoryState[] = await Promise.all(
            savedState.history.map(async (state: SerializableHistoryState) => {
              const loadedImages = await Promise.all(
                state.images.map(imgData => new Promise<WhiteboardImage>((resolve, reject) => {
                  const img = new Image();
                  img.crossOrigin = "anonymous";
                  img.src = imgData.src;
                  img.onload = () => resolve({ ...imgData, element: img });
                  img.onerror = () => reject(new Error('Failed to load image'));
                }))
              );
              return {
                paths: state.paths || [],
                images: loadedImages,
                textObjects: state.textObjects || [],
                layers: state.layers || [defaultLayer],
                backgroundColor: state.backgroundColor || '#f1f5f9'
              };
            })
          );
          setHistory(newHistory);
          setHistoryIndex(savedState.historyIndex);
          setViewState(savedState.viewState);
          setActiveLayerId(savedState.activeLayerId || 'layer-1');
        } catch (error) {
          console.error("Failed to load whiteboard state:", error);
          localStorage.removeItem('accelerate-whiteboard');
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

  const updateCurrentState = useCallback((updater: (prevState: HistoryState) => HistoryState) => {
    const newState = updater(history[historyIndex]);
    const newHistory = [...history];
    newHistory[historyIndex] = newState;
    setHistory(newHistory);
  }, [history, historyIndex]);

  useEffect(() => {
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

  // Shape drawing functions
  const drawSpraycan = (ctx: CanvasRenderingContext2D, point: Point, color: string, size: number) => {
    const numDots = Math.floor(Math.random() * 20) + 10;
    const radius = size * 2;

    ctx.fillStyle = color;
    for (let i = 0; i < numDots; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * radius;
      const x = point.x + Math.cos(angle) * distance;
      const y = point.y + Math.sin(angle) * distance;
      const dotSize = Math.random() * (size / 4) + 1;

      ctx.beginPath();
      ctx.arc(x, y, dotSize, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawRectangle = (ctx: CanvasRenderingContext2D, start: Point, end: Point, color: string, strokeWidth: number, filled: boolean = false) => {
    const x = Math.min(start.x, end.x);
    const y = Math.min(start.y, end.y);
    const width = Math.abs(end.x - start.x);
    const height = Math.abs(end.y - start.y);

    ctx.strokeStyle = color;
    ctx.lineWidth = strokeWidth;

    if (filled) {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, width, height);
    } else {
      ctx.strokeRect(x, y, width, height);
    }
  };

  const drawCircle = (ctx: CanvasRenderingContext2D, start: Point, end: Point, color: string, strokeWidth: number, filled: boolean = false) => {
    const centerX = (start.x + end.x) / 2;
    const centerY = (start.y + end.y) / 2;
    const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)) / 2;

    ctx.strokeStyle = color;
    ctx.lineWidth = strokeWidth;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);

    if (filled) {
      ctx.fillStyle = color;
      ctx.fill();
    } else {
      ctx.stroke();
    }
  };

  const drawLine = (ctx: CanvasRenderingContext2D, start: Point, end: Point, color: string, strokeWidth: number) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
  };

  const drawArrow = (ctx: CanvasRenderingContext2D, start: Point, end: Point, color: string, strokeWidth: number) => {
    // Draw line
    drawLine(ctx, start, end, color, strokeWidth);

    // Draw arrowhead
    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    const arrowLength = strokeWidth * 3;

    ctx.beginPath();
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(
      end.x - arrowLength * Math.cos(angle - Math.PI / 6),
      end.y - arrowLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(
      end.x - arrowLength * Math.cos(angle + Math.PI / 6),
      end.y - arrowLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.stroke();
  };

  const drawStar = (ctx: CanvasRenderingContext2D, start: Point, end: Point, color: string, strokeWidth: number, filled: boolean = false) => {
    const centerX = (start.x + end.x) / 2;
    const centerY = (start.y + end.y) / 2;
    const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)) / 2;
    const spikes = 5;
    const outerRadius = radius;
    const innerRadius = radius * 0.4;

    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const angle = (i * Math.PI) / spikes;
      const r = i % 2 === 0 ? outerRadius : innerRadius;
      const x = centerX + Math.cos(angle - Math.PI / 2) * r;
      const y = centerY + Math.sin(angle - Math.PI / 2) * r;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();

    ctx.strokeStyle = color;
    ctx.lineWidth = strokeWidth;

    if (filled) {
      ctx.fillStyle = color;
      ctx.fill();
    } else {
      ctx.stroke();
    }
  };

  const drawHeart = (ctx: CanvasRenderingContext2D, start: Point, end: Point, color: string, strokeWidth: number, filled: boolean = false) => {
    const centerX = (start.x + end.x) / 2;
    const centerY = (start.y + end.y) / 2;
    const size = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)) / 4;

    ctx.beginPath();
    ctx.moveTo(centerX, centerY + size / 2);

    // Left curve
    ctx.bezierCurveTo(
      centerX - size, centerY - size / 2,
      centerX - size * 2, centerY - size / 2,
      centerX - size / 2, centerY - size
    );

    // Top left arc
    ctx.arc(centerX - size / 2, centerY - size / 2, size / 2, Math.PI, 0, false);

    // Top right arc
    ctx.arc(centerX + size / 2, centerY - size / 2, size / 2, Math.PI, 0, false);

    // Right curve
    ctx.bezierCurveTo(
      centerX + size * 2, centerY - size / 2,
      centerX + size, centerY - size / 2,
      centerX, centerY + size / 2
    );

    ctx.strokeStyle = color;
    ctx.lineWidth = strokeWidth;

    if (filled) {
      ctx.fillStyle = color;
      ctx.fill();
    } else {
      ctx.stroke();
    }
  };

  const getObjectBounds = (obj: WhiteboardImage | TextObject) => {
    const w = obj.width;
    const h = 'height' in obj ? obj.height : obj.fontSize * 1.5;
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
        rotate: rotatePoint({ x: centerX, y: y - ROTATE_HANDLE_OFFSET }, { x: centerX, y: centerY }, rotation)
      }
    }
  };

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    const { paths, images, textObjects, layers, backgroundColor } = currentState;

    // Clear and fill background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(viewState.offsetX, viewState.offsetY);
    ctx.scale(viewState.scale, viewState.scale);

    // Sort layers by creation order
    const visibleLayers = layers.filter(layer => layer.visible);

    // Draw content by layer order
    visibleLayers.forEach(layer => {
      ctx.globalAlpha = layer.opacity;

      // Draw images for this layer
      images.filter(img => img.layerId === layer.id).forEach(img => {
        ctx.save();
        ctx.translate(img.x + img.width / 2, img.y + img.height / 2);
        ctx.rotate(img.rotation);
        ctx.drawImage(img.element, -img.width / 2, -img.height / 2, img.width, img.height);
        ctx.restore();
      });

      // Draw text objects for this layer
      textObjects.filter(txt => txt.layerId === layer.id).forEach(txt => {
        if (isEditingText?.id === txt.id) return;
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

      // Draw paths for this layer with pressure sensitivity
      const layerPaths = paths.filter(path => path.layerId === layer.id);
      const allPaths = isDrawingRef.current && currentPathRef.current && currentPathRef.current.layerId === layer.id
        ? [...layerPaths, currentPathRef.current] : layerPaths;

      allPaths.forEach(path => {
        if (path.points.length === 0) return;

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Handle eraser paths with destination-out composite mode
        if (path.color === '#ERASER' || path.tool === 'eraser') {
          ctx.globalCompositeOperation = 'destination-out';
          ctx.strokeStyle = 'rgba(0,0,0,1)';
          ctx.lineWidth = path.strokeWidth;
        } else {
          ctx.globalCompositeOperation = 'source-over';
          ctx.strokeStyle = path.color;
        }

        // Handle different tools
        if (path.shape) {
          // Draw shapes
          const { type, startPoint, endPoint, filled } = path.shape;
          switch (type) {
            case 'rectangle':
              drawRectangle(ctx, startPoint, endPoint, path.color, path.strokeWidth, filled);
              break;
            case 'circle':
              drawCircle(ctx, startPoint, endPoint, path.color, path.strokeWidth, filled);
              break;
            case 'line':
              drawLine(ctx, startPoint, endPoint, path.color, path.strokeWidth);
              break;
            case 'arrow':
              drawArrow(ctx, startPoint, endPoint, path.color, path.strokeWidth);
              break;
            case 'star':
              drawStar(ctx, startPoint, endPoint, path.color, path.strokeWidth, filled);
              break;
            case 'heart':
              drawHeart(ctx, startPoint, endPoint, path.color, path.strokeWidth, filled);
              break;
          }
        } else if (path.tool === 'eraser') {
          // Draw eraser path
          ctx.lineWidth = path.strokeWidth;
          ctx.beginPath();
          ctx.moveTo(path.points[0].x, path.points[0].y);
          for (let i = 1; i < path.points.length; i++) {
            ctx.lineTo(path.points[i].x, path.points[i].y);
          }
          ctx.stroke();
        } else if (path.tool === 'spraycan') {
          // Draw spraycan dots
          path.points.forEach(point => {
            drawSpraycan(ctx, point, path.color, path.strokeWidth);
          });
        } else if (path.tool === 'marker') {
          // Draw marker with transparency and wider strokes
          ctx.globalAlpha = 0.6;
          ctx.lineWidth = path.strokeWidth * 2;
          ctx.beginPath();
          ctx.moveTo(path.points[0].x, path.points[0].y);
          for (let i = 1; i < path.points.length; i++) {
            ctx.lineTo(path.points[i].x, path.points[i].y);
          }
          ctx.stroke();
          ctx.globalAlpha = 1;
        } else if (path.tool === 'brush') {
          // Draw brush with variable pressure
          if (path.baseStrokeWidth && path.points.some(p => p.pressure !== undefined)) {
            for (let i = 0; i < path.points.length - 1; i++) {
              const point = path.points[i];
              const nextPoint = path.points[i + 1];
              const pressure = point.pressure || 1;
              const width = path.baseStrokeWidth * (0.5 + pressure * 1.5);

              ctx.beginPath();
              ctx.lineWidth = width;
              ctx.moveTo(point.x, point.y);
              ctx.lineTo(nextPoint.x, nextPoint.y);
              ctx.stroke();
            }
          } else {
            ctx.lineWidth = path.strokeWidth * 1.5;
            ctx.beginPath();
            ctx.moveTo(path.points[0].x, path.points[0].y);
            for (let i = 1; i < path.points.length; i++) {
              ctx.lineTo(path.points[i].x, path.points[i].y);
            }
            ctx.stroke();
          }
        } else {
          // Standard pen drawing
          if (path.baseStrokeWidth && path.points.some(p => p.pressure !== undefined)) {
            // Draw pressure-sensitive path using multiple segments
            for (let i = 0; i < path.points.length - 1; i++) {
              const point = path.points[i];
              const nextPoint = path.points[i + 1];
              const pressure = point.pressure || 1;
              const width = path.baseStrokeWidth * (0.3 + pressure * 0.7);

              ctx.beginPath();
              ctx.lineWidth = width;
              ctx.moveTo(point.x, point.y);
              ctx.lineTo(nextPoint.x, nextPoint.y);
              ctx.stroke();
            }
          } else {
            // Draw regular path
            ctx.beginPath();
            ctx.lineWidth = path.strokeWidth;
            ctx.moveTo(path.points[0].x, path.points[0].y);
            for (let i = 1; i < path.points.length; i++) {
              ctx.lineTo(path.points[i].x, path.points[i].y);
            }
            ctx.stroke();
          }
        }
        ctx.globalCompositeOperation = 'source-over';
      });
    });

    ctx.globalAlpha = 1;

    // Draw selection handles
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

  // Handle zoom with wheel
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.1, Math.min(5, viewState.scale * scaleFactor));

    setViewState(v => ({
      ...v,
      scale: newScale,
      offsetX: mouseX - (mouseX - v.offsetX) * (newScale / v.scale),
      offsetY: mouseY - (mouseY - v.offsetY) * (newScale / v.scale),
    }));
  }, [viewState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  // ====================================================================================
  // Event Handlers
  // ====================================================================================
  const getObjectAtPoint = (p: Point): { obj: WhiteboardImage | TextObject; handle: InteractionHandle | 'body' } | null => {
    const allObjects = [...currentState.images, ...currentState.textObjects];
    for (let i = allObjects.length - 1; i >= 0; i--) {
      const obj = allObjects[i];
      const h = 'height' in obj ? obj.height : obj.fontSize * 1.5;
      const center = { x: obj.x + obj.width / 2, y: obj.y + h / 2 };
      const localPoint = rotatePoint(p, center, -obj.rotation);

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

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    // Prevent default touch behaviors that interfere with drawing
    e.preventDefault();

    // Palm rejection: ignore touch events when stylus is being used
    if (e.pointerType === 'touch' && (tool === 'pen' || tool === 'eraser')) {
      // Check if there's already a pen/stylus pointer active
      const existingStylus = document.querySelectorAll('canvas[data-stylus-active="true"]');
      if (existingStylus.length > 0) {
        return; // Ignore palm touch
      }
    }

    // Mark canvas as having active stylus for palm rejection
    if (e.pointerType === 'pen') {
      e.currentTarget.setAttribute('data-stylus-active', 'true');
    }

    // Only capture pointer for non-drawing tools to avoid stylus issues
    if (tool === 'select' || tool === 'pan') {
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch (error) {
        // Ignore capture errors on some touch devices
      }
    }

    const point = getCanvasPoint(e.clientX, e.clientY);
    startPointRef.current = point;
    setSelectedObject(null);

    if (isEditingText) {
      handleFinishTextEdit();
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

          // Enable double-click for both text and image editing/resizing
          if (e.detail === 2) {
            if ('text' in obj) {
              setIsEditingText(obj);
            } else if ('height' in obj) {
              // Image is now in resize mode - user can drag handles to resize
              // The object is already selected, so handles are visible
            }
          }
        }
        break;

      case 'text':
        const newText: TextObject = {
          id: new Date().toISOString(), text: 'New Text',
          x: point.x, y: point.y,
          color: color, fontSize: 32,
          fontFamily: 'Arial', rotation: 0, width: 200,
          layerId: activeLayerId
        };
        setIsEditingText(newText);
        break;

      case 'pan':
        interactionRef.current = { type: 'moving' };
        e.currentTarget.style.cursor = 'grabbing';
        break;

      case 'pen':
      case 'eraser':
      case 'spraycan':
      case 'marker':
      case 'brush':
        isDrawingRef.current = true;
        // Use pressure if available (stylus support)
        const pressure = e.pressure || 1;
        const adjustedStrokeWidth = strokeWidth * (0.5 + pressure * 0.5);

        currentPathRef.current = {
          points: [{ ...point, pressure }],
          color: tool === 'eraser' ? '#ERASER' : color,
          strokeWidth: adjustedStrokeWidth,
          baseStrokeWidth: strokeWidth,
          layerId: activeLayerId,
          tool: tool,
        };
        break;

      case 'rectangle':
      case 'circle':
      case 'line':
      case 'arrow':
      case 'star':
      case 'heart':
        isDrawingRef.current = true;
        currentPathRef.current = {
          points: [point],
          color: color,
          strokeWidth: strokeWidth,
          layerId: activeLayerId,
          tool: tool,
          shape: {
            type: tool as 'rectangle' | 'circle' | 'line' | 'arrow' | 'star' | 'heart',
            startPoint: point,
            endPoint: point,
            filled: false, // Could be made configurable
          },
        };
        break;
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    // Prevent default to avoid scrolling and other touch behaviors
    e.preventDefault();

    if (!startPointRef.current) return;
    const point = getCanvasPoint(e.clientX, e.clientY);
    const dx = point.x - startPointRef.current.x;
    const dy = point.y - startPointRef.current.y;

    if (tool === 'pan') {
      if (interactionRef.current) {
        setViewState(v => ({ ...v, offsetX: v.offsetX + e.movementX, offsetY: v.offsetY + e.movementY }));
      }
      return;
    }

    if (isDrawingRef.current && currentPathRef.current) {
      if (currentPathRef.current.shape) {
        // Update shape end point
        currentPathRef.current.shape.endPoint = point;
        redrawCanvas();
        return;
      } else {
        // Support pressure-sensitive drawing for stylus
        const pressure = e.pressure || 1;
        const adjustedStrokeWidth = strokeWidth * (0.5 + pressure * 0.5);

        // Update stroke width if pressure changed significantly
        if (Math.abs(adjustedStrokeWidth - currentPathRef.current.strokeWidth) > 1) {
          currentPathRef.current.strokeWidth = adjustedStrokeWidth;
        }

        currentPathRef.current.points.push({ ...point, pressure });
        redrawCanvas();
        return;
      }
    }

    if (!selectedObject || !interactionRef.current) return;
    const { type } = interactionRef.current;

    updateCurrentState(prev => {
      let newImages = [...prev.images];
      let newTextObjects = [...prev.textObjects];

      if (selectedObject.type === 'image') {
        const objIndex = newImages.findIndex(o => o.id === selectedObject.id);
        if (objIndex === -1) return prev;

        const obj = { ...newImages[objIndex] };
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
          case 'resizing':
            const { handle } = interactionRef.current;
            const distance = Math.hypot(point.x - center.x, point.y - center.y);
            const originalDistance = Math.hypot(startPointRef.current!.x - center.x, startPointRef.current!.y - center.y);
            const scaleFactor = distance / originalDistance;

            if (handle === 'br' || handle === 'tl') {
              obj.width *= scaleFactor;
              obj.height *= scaleFactor;
            } else if (handle === 'bl' || handle === 'tr') {
              obj.width *= scaleFactor;
              obj.height *= scaleFactor;
            }

            // Adjust position to keep center fixed
            obj.x = center.x - obj.width / 2;
            obj.y = center.y - obj.height / 2;
            break;
        }
        newImages[objIndex] = obj;
      } else {
        const objIndex = newTextObjects.findIndex(o => o.id === selectedObject.id);
        if (objIndex === -1) return prev;

        const obj = { ...newTextObjects[objIndex] };
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
    // Prevent default to avoid unwanted touch behaviors
    e.preventDefault();

    // Clear stylus active state for palm rejection
    if (e.pointerType === 'pen') {
      e.currentTarget.removeAttribute('data-stylus-active');
    }

    // Only release capture if we had captured it
    if (tool === 'select' || tool === 'pan') {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch (error) {
        // Ignore release errors on some touch devices
      }
    }

    if (tool === 'pan') {
      e.currentTarget.style.cursor = 'grab';
    }

    if (interactionRef.current) {
      recordNewState(history[historyIndex]);
    }
    interactionRef.current = null;
    startPointRef.current = null;

    if (isDrawingRef.current) {
      isDrawingRef.current = false;
      if (currentPathRef.current) {
        // For shapes, we need at least a start and end point
        if (currentPathRef.current.shape) {
          const { startPoint, endPoint } = currentPathRef.current.shape;
          const minDistance = 5; // Minimum distance to create a shape
          const distance = Math.sqrt(Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2));

          if (distance > minDistance) {
            recordNewState({ ...currentState, paths: [...currentState.paths, currentPathRef.current] });
          }
        } else if (currentPathRef.current.points.length > 1) {
          // For drawing tools, need multiple points
          recordNewState({ ...currentState, paths: [...currentState.paths, currentPathRef.current] });
        }
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

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    let finalWidth = isEditingText.width;
    if (ctx && newText) {
      ctx.font = `${isEditingText.fontSize}px ${isEditingText.fontFamily}`;
      finalWidth = ctx.measureText(newText).width;
    }

    const existingIndex = currentState.textObjects.findIndex(t => t.id === isEditingText.id);
    let newTextObjects = [...currentState.textObjects];

    if (newText) {
      const finalTextObject = { ...isEditingText, text: newText, width: finalWidth };
      if (existingIndex > -1) {
        newTextObjects[existingIndex] = finalTextObject;
      } else {
        newTextObjects.push(finalTextObject);
      }
    } else {
      if (existingIndex > -1) {
        newTextObjects.splice(existingIndex, 1);
      }
    }

    recordNewState({ ...currentState, textObjects: newTextObjects });
    setIsEditingText(null);
  };

  // ====================================================================================
  // File Upload Logic
  // ====================================================================================
  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = e.target?.result as string;
        img.onload = () => {
          const canvas = canvasRef.current;
          if (!canvas) return;

          // Calculate dimensions to fit the image fullscreen while maintaining aspect ratio
          const canvasWidth = canvas.width / viewState.scale;
          const canvasHeight = canvas.height / viewState.scale;
          const imageAspectRatio = img.width / img.height;
          const canvasAspectRatio = canvasWidth / canvasHeight;

          let displayWidth, displayHeight;
          if (imageAspectRatio > canvasAspectRatio) {
            // Image is wider than canvas - fit to width
            displayWidth = canvasWidth * 0.9; // 90% of canvas width for some padding
            displayHeight = displayWidth / imageAspectRatio;
          } else {
            // Image is taller than canvas - fit to height
            displayHeight = canvasHeight * 0.9; // 90% of canvas height for some padding
            displayWidth = displayHeight * imageAspectRatio;
          }

          const newImage: WhiteboardImage = {
            id: new Date().toISOString(),
            element: img,
            rotation: 0,
            x: (canvasWidth - displayWidth) / 2 - viewState.offsetX / viewState.scale,
            y: (canvasHeight - displayHeight) / 2 - viewState.offsetY / viewState.scale,
            width: displayWidth,
            height: displayHeight,
            layerId: activeLayerId,
          };
          recordNewState({ ...currentState, images: [...currentState.images, newImage] });

          // Auto-select the new image for immediate resizing capability
          setSelectedObject({ id: newImage.id, type: 'image' });
          setTool('select');
        };
      };
      reader.readAsDataURL(file);
    }
  };

  // ====================================================================================
  // Export & Clear Functions
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

    ctx.fillStyle = '#f1f5f9'; // bg-slate-100
    ctx.fillRect(0, 0, width, height);
    ctx.translate(-minX + PADDING, -minY + PADDING);

    // Draw everything
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
      if (path.points.length === 0) return;

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Handle eraser paths
      if (path.color === '#ERASER') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = path.color;
      }

      // Handle different tools for export
      if (path.shape) {
        // Draw shapes
        const { type, startPoint, endPoint, filled } = path.shape;
        switch (type) {
          case 'rectangle':
            drawRectangle(ctx, startPoint, endPoint, path.color, path.strokeWidth, filled);
            break;
          case 'circle':
            drawCircle(ctx, startPoint, endPoint, path.color, path.strokeWidth, filled);
            break;
          case 'line':
            drawLine(ctx, startPoint, endPoint, path.color, path.strokeWidth);
            break;
          case 'arrow':
            drawArrow(ctx, startPoint, endPoint, path.color, path.strokeWidth);
            break;
          case 'star':
            drawStar(ctx, startPoint, endPoint, path.color, path.strokeWidth, filled);
            break;
          case 'heart':
            drawHeart(ctx, startPoint, endPoint, path.color, path.strokeWidth, filled);
            break;
        }
      } else if (path.tool === 'spraycan') {
        // Draw spraycan dots
        path.points.forEach(point => {
          drawSpraycan(ctx, point, path.color, path.strokeWidth);
        });
      } else if (path.tool === 'marker') {
        // Draw marker with transparency
        ctx.globalAlpha = 0.6;
        ctx.lineWidth = path.strokeWidth * 2;
        ctx.beginPath();
        ctx.moveTo(path.points[0].x, path.points[0].y);
        for (let i = 1; i < path.points.length; i++) {
          ctx.lineTo(path.points[i].x, path.points[i].y);
        }
        ctx.stroke();
        ctx.globalAlpha = 1;
      } else {
        // Standard drawing
        ctx.beginPath();
        ctx.lineWidth = path.strokeWidth;
        ctx.moveTo(path.points[0].x, path.points[0].y);
        for (let i = 1; i < path.points.length; i++) {
          ctx.lineTo(path.points[i].x, path.points[i].y);
        }
        ctx.stroke();
      }
      ctx.globalCompositeOperation = 'source-over';
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

  const handleExportToGallery = async () => {
    setIsExporting(true);
    const dataUrl = await exportCanvasAsImage();
    if (dataUrl) {
      try {
        const GALLERY_STORAGE_KEY = 'ai-gallery-images';
        const stored = localStorage.getItem(GALLERY_STORAGE_KEY);
        const existingImages = stored ? JSON.parse(stored) : [];

        const newImage = {
          id: `whiteboard-${Date.now()}`,
          url: dataUrl,
          timestamp: Date.now(),
          source: 'editor' as const
        };

        existingImages.push(newImage);
        localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(existingImages));
        alert('Whiteboard exported to gallery successfully!');
      } catch (error) {
        console.error('Failed to save to gallery:', error);
        alert('Failed to save to gallery. Please try again.');
      }
    }
    setIsExporting(false);
  };

  const handleClear = () => {
    recordNewState({
      paths: [], images: [], textObjects: [],
      layers: [defaultLayer],
      backgroundColor: '#f1f5f9'
    });
    setViewState({ scale: 1, offsetX: 0, offsetY: 0 });
    setActiveLayerId('layer-1');
    localStorage.removeItem('accelerate-whiteboard');
  };

  // Layer management functions
  const addLayer = () => {
    const newLayer: Layer = {
      id: `layer-${Date.now()}`,
      name: `Layer ${currentState.layers.length + 1}`,
      visible: true,
      locked: false,
      opacity: 1
    };
    recordNewState({ ...currentState, layers: [...currentState.layers, newLayer] });
    setActiveLayerId(newLayer.id);
  };

  const deleteLayer = (layerId: string) => {
    if (currentState.layers.length <= 1) return; // Keep at least one layer

    const newState = {
      ...currentState,
      layers: currentState.layers.filter(l => l.id !== layerId),
      paths: currentState.paths.filter(p => p.layerId !== layerId),
      images: currentState.images.filter(i => i.layerId !== layerId),
      textObjects: currentState.textObjects.filter(t => t.layerId !== layerId),
    };

    recordNewState(newState);

    if (activeLayerId === layerId) {
      setActiveLayerId(newState.layers[0].id);
    }
  };

  const toggleLayerVisibility = (layerId: string) => {
    updateCurrentState(prev => ({
      ...prev,
      layers: prev.layers.map(layer =>
        layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
      )
    }));
  };

  const updateLayerOpacity = (layerId: string, opacity: number) => {
    updateCurrentState(prev => ({
      ...prev,
      layers: prev.layers.map(layer =>
        layer.id === layerId ? { ...layer, opacity } : layer
      )
    }));
  };

  const setBackgroundColor = (bgColor: string) => {
    updateCurrentState(prev => ({ ...prev, backgroundColor: bgColor }));
  };

  // ====================================================================================
  // Render
  // ====================================================================================
  return (
    <div className="flex flex-col md:flex-row gap-6 h-full max-w-full">
      {/* Main Canvas Area */}
      <div className="flex-1 min-h-0">
        <div ref={containerRef} className="w-full h-full bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden relative border border-gray-200 dark:border-slate-700">
          <canvas
            ref={canvasRef}
            className={`w-full h-full ${
              tool === 'pan' ? 'cursor-grab' :
              tool === 'select' ? 'cursor-default' :
              tool === 'text' ? 'cursor-text' :
              ['rectangle', 'circle', 'line', 'arrow', 'star', 'heart'].includes(tool) ? 'cursor-crosshair' :
              'cursor-crosshair'
            }`}
            style={{
              touchAction: 'none',  // Prevent browser touch gestures
              userSelect: 'none',   // Prevent text selection
              WebkitUserSelect: 'none',
              msUserSelect: 'none'
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onPointerCancel={handlePointerUp}
            // Additional touch event handlers for better compatibility
            onTouchStart={(e) => e.preventDefault()}
            onTouchMove={(e) => e.preventDefault()}
            onTouchEnd={(e) => e.preventDefault()}
          />
          {isEditingText && (
            <textarea
              ref={textInputRef}
              onBlur={handleFinishTextEdit}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) handleFinishTextEdit(); }}
              className="absolute bg-transparent outline-none resize-none p-0 border-dashed border-2 border-blue-500 text-gray-900 dark:text-white"
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
      </div>

      {/* Toolbar */}
      <div className="w-full md:w-72 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 space-y-6 overflow-y-auto">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">Interactive Whiteboard</h3>
          <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">
            Draw, add text, images, and create amazing visual content!
          </p>
          <p className="text-xs text-indigo-600 dark:text-indigo-400 mb-4">
            ✨ Stylus & touch optimized with pressure sensitivity & palm rejection
          </p>
        </div>

        {/* Tools */}
        <div>
          <h4 className="font-medium mb-3 text-gray-700 dark:text-slate-300 text-sm uppercase tracking-wide">Tools</h4>

          {/* Basic Tools */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              onClick={() => setTool('select')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm ${tool === 'select' ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300'}`}
            >
              <CursorIcon className="h-4 w-4" />
              Select
            </button>
            <button
              onClick={() => setTool('text')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm ${tool === 'text' ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300'}`}
            >
              <TypeIcon className="h-4 w-4" />
              Text
            </button>
          </div>

          {/* Drawing Tools */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              onClick={() => setTool('pen')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm ${tool === 'pen' ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300'}`}
            >
              <PencilIcon className="h-4 w-4" />
              Pen
            </button>
            <button
              onClick={() => setTool('brush')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm ${tool === 'brush' ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300'}`}
            >
              <BrushIcon className="h-4 w-4" />
              Brush
            </button>
            <button
              onClick={() => setTool('marker')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm ${tool === 'marker' ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300'}`}
            >
              <MarkerIcon className="h-4 w-4" />
              Marker
            </button>
            <button
              onClick={() => setTool('spraycan')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm ${tool === 'spraycan' ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300'}`}
            >
              <SpraycanIcon className="h-4 w-4" />
              Spray
            </button>
          </div>

          {/* Shape Tools */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              onClick={() => setTool('rectangle')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm ${tool === 'rectangle' ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300'}`}
            >
              <RectangleIcon className="h-4 w-4" />
              Rectangle
            </button>
            <button
              onClick={() => setTool('circle')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm ${tool === 'circle' ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300'}`}
            >
              <CircleIcon className="h-4 w-4" />
              Circle
            </button>
            <button
              onClick={() => setTool('line')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm ${tool === 'line' ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300'}`}
            >
              <LineIcon className="h-4 w-4" />
              Line
            </button>
            <button
              onClick={() => setTool('arrow')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm ${tool === 'arrow' ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300'}`}
            >
              <ArrowIcon className="h-4 w-4" />
              Arrow
            </button>
          </div>

          {/* Special Shapes */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              onClick={() => setTool('star')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm ${tool === 'star' ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300'}`}
            >
              <StarIcon className="h-4 w-4" />
              Star
            </button>
            <button
              onClick={() => setTool('heart')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm ${tool === 'heart' ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300'}`}
            >
              <HeartIcon className="h-4 w-4" />
              Heart
            </button>
          </div>

          {/* Utility Tools */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setTool('eraser')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm ${tool === 'eraser' ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300'}`}
            >
              <TrashIcon className="h-4 w-4" />
              Eraser
            </button>
            <button
              onClick={() => setTool('pan')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm ${tool === 'pan' ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300'}`}
            >
              <HandIcon className="h-4 w-4" />
              Pan
            </button>
          </div>
        </div>

        {/* Colors */}
        <div>
          <h4 className="font-medium mb-3 text-gray-700 dark:text-slate-300 text-sm uppercase tracking-wide">Colors</h4>
          <div className="grid grid-cols-6 gap-1.5 max-h-48 overflow-y-auto">
            {COLORS.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                style={{ backgroundColor: c }}
                className={`w-8 h-8 rounded-md border-2 transition-all ${color === c ? 'border-indigo-500 scale-110 shadow-md' : 'border-gray-300 dark:border-slate-600 hover:scale-105'
                  }`}
                aria-label={`Color ${c}`}
              />
            ))}
          </div>
        </div>

        {/* Brush Size */}
        <div>
          <h4 className="font-medium mb-3 text-gray-700 dark:text-slate-300 text-sm uppercase tracking-wide">Brush Size</h4>
          <div className="grid grid-cols-5 gap-1">
            {STROKE_SIZES.map(size => (
              <button
                key={size}
                onClick={() => setStrokeWidth(size)}
                className={`h-12 flex items-center justify-center rounded-md transition-colors ${strokeWidth === size ? 'bg-indigo-600' : 'bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600'
                  }`}
                aria-label={`Brush size ${size}`}
              >
                <div
                  style={{ width: `${Math.min(size, 16)}px`, height: `${Math.min(size, 16)}px` }}
                  className={`rounded-full ${strokeWidth === size ? 'bg-white' : 'bg-gray-600 dark:bg-slate-400'}`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Background Colors */}
        <div>
          <h4 className="font-medium mb-3 text-gray-700 dark:text-slate-300 text-sm uppercase tracking-wide">Background</h4>
          <div className="grid grid-cols-5 gap-1.5 max-h-32 overflow-y-auto">
            {BACKGROUND_COLORS.map(c => (
              <button
                key={c}
                onClick={() => setBackgroundColor(c)}
                style={{ backgroundColor: c }}
                className={`w-8 h-8 rounded-md border-2 transition-all ${currentState.backgroundColor === c ? 'border-indigo-500 scale-110 shadow-md' : 'border-gray-300 dark:border-slate-600 hover:scale-105'
                  }`}
                aria-label={`Background ${c}`}
              />
            ))}
          </div>
        </div>

        {/* Zoom Controls */}
        <div>
          <h4 className="font-medium mb-3 text-gray-700 dark:text-slate-300 text-sm uppercase tracking-wide">Zoom</h4>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewState(v => ({ ...v, scale: Math.max(0.1, v.scale * 0.8) }))}
              className="flex-1 px-3 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300 rounded-md text-sm font-medium"
            >
              Zoom Out
            </button>
            <span className="text-sm text-gray-600 dark:text-slate-400 min-w-[60px] text-center">
              {Math.round(viewState.scale * 100)}%
            </span>
            <button
              onClick={() => setViewState(v => ({ ...v, scale: Math.min(5, v.scale * 1.25) }))}
              className="flex-1 px-3 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300 rounded-md text-sm font-medium"
            >
              Zoom In
            </button>
          </div>
          <button
            onClick={() => setViewState({ scale: 1, offsetX: 0, offsetY: 0 })}
            className="w-full mt-2 px-3 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300 rounded-md text-sm font-medium"
          >
            Reset View
          </button>
        </div>

        {/* Layers */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-700 dark:text-slate-300 text-sm uppercase tracking-wide">Layers</h4>
            <button
              onClick={() => setShowLayerPanel(!showLayerPanel)}
              className="px-2 py-1 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300 rounded text-xs"
            >
              {showLayerPanel ? 'Hide' : 'Show'}
            </button>
          </div>

          {showLayerPanel && (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {currentState.layers.map(layer => (
                <div key={layer.id} className={`p-2 rounded border ${activeLayerId === layer.id ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-slate-600'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-slate-300 truncate">
                      {layer.name}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleLayerVisibility(layer.id)}
                        className={`p-1 rounded text-xs ${layer.visible ? 'text-indigo-600' : 'text-gray-400'}`}
                      >
                        👁
                      </button>
                      <button
                        onClick={() => setActiveLayerId(layer.id)}
                        className={`px-2 py-1 rounded text-xs ${activeLayerId === layer.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300'}`}
                      >
                        Select
                      </button>
                      {currentState.layers.length > 1 && (
                        <button
                          onClick={() => deleteLayer(layer.id)}
                          className="p-1 rounded text-xs text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="mt-1">
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.1"
                      value={layer.opacity}
                      onChange={(e) => updateLayerOpacity(layer.id, parseFloat(e.target.value))}
                      className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                      Opacity: {Math.round(layer.opacity * 100)}%
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={addLayer}
                className="w-full px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium"
              >
                Add Layer
              </button>
            </div>
          )}
        </div>

        {/* Image Upload */}
        <div>
          <h4 className="font-medium mb-3 text-gray-700 dark:text-slate-300 text-sm uppercase tracking-wide">Add Image</h4>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300 py-3 rounded-lg transition-colors text-sm font-medium"
          >
            Upload Image
          </button>
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-slate-700">
          <div className="flex gap-2">
            <button
              onClick={handleUndo}
              disabled={!canUndo}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-colors bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <UndoIcon className="h-4 w-4" />
              Undo
            </button>
            <button
              onClick={handleRedo}
              disabled={!canRedo}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-colors bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <RedoIcon className="h-4 w-4" />
              Redo
            </button>
          </div>

          <button
            onClick={handleSaveAsImage}
            disabled={isExporting}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md transition-colors bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium"
          >
            <DownloadIcon className="h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Export as Image'}
          </button>

          <button
            onClick={handleExportToGallery}
            disabled={isExporting}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md transition-colors bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium"
          >
            <ImageIcon className="h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Export to Gallery'}
          </button>

          <button
            onClick={handleClear}
            className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition-colors"
          >
            Clear Canvas
          </button>
        </div>
      </div>
    </div>
  );
};

export default Whiteboard;
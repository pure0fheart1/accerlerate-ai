
import React, { useCallback, useState, useEffect, useRef, lazy, Suspense } from 'react';
import { AppProvider, useAppContext } from './contexts/AppContext.tsx';
import { AuthProvider, useAuth } from './contexts/AuthContext.tsx';
import { WhiteboardIcon, ImageIcon, GalleryIcon, ListIcon, EditIcon, SettingsIcon, NotesIcon, VideoIcon, ChatIcon, ChevronsLeftIcon, ChevronsRightIcon, WikiIcon, AINotesIcon, CameraIcon, UserIcon } from './components/Icons.tsx';
import { Module } from './types.ts';
import AuthForm from './components/auth/AuthForm.tsx';
import UserDashboard from './components/UserDashboard.tsx';
import { Toaster } from 'react-hot-toast';

// Re-introduce React.lazy for performance optimization (code-splitting)
const Whiteboard = lazy(() => import('./modules/whiteboard/Whiteboard.tsx'));
const ImagePromptList = lazy(() => import('./modules/taskManager/TaskManager.tsx'));
const ImageGenerator = lazy(() => import('./modules/imageGenerator/ImageGenerator.tsx'));
const VideoGenerator = lazy(() => import('./modules/videoGenerator/VideoGenerator.tsx'));
const Gallery = lazy(() => import('./modules/gallery/Gallery.tsx'));
const HandwrittenNotes = lazy(() => import('./modules/handwrittenNotes/HandwrittenNotes.tsx'));
const GeminiChat = lazy(() => import('./modules/geminiChat/GeminiChat.tsx'));
const ImageEditor = lazy(() => import('./modules/imageEditor/ImageEditor.tsx'));
const Settings = lazy(() => import('./modules/settings/Settings.tsx'));
const Wiki = lazy(() => import('./modules/wiki/Wiki.tsx'));
const AINotes = lazy(() => import('./modules/aiNotes/AINotes.tsx'));
const PhotoBooth = lazy(() => import('./modules/photobooth/PhotoBooth.tsx'));


// ====================================================================================
// Loading component for Suspense
// ====================================================================================
const ModuleLoader: React.FC = () => (
  <div className="flex items-center justify-center h-full w-full">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      <p className="text-lg text-slate-400">Loading Module...</p>
    </div>
  </div>
);

// ====================================================================================
// Module Configuration (moved outside component for performance)
// ====================================================================================
const MODULES: Record<Module, { component: React.LazyExoticComponent<React.FC<{}>>; name: string; icon: JSX.Element; }> = {
  whiteboard: { component: Whiteboard, name: 'Whiteboard', icon: <WhiteboardIcon /> },
  prompts: { component: ImagePromptList, name: 'Images to Generate', icon: <ListIcon /> },
  geminiChat: { component: GeminiChat, name: 'Gemini PRO 2.5', icon: <ChatIcon /> },
  image: { component: ImageGenerator, name: 'Image Gen', icon: <ImageIcon /> },
  video: { component: VideoGenerator, name: 'Video Gen', icon: <VideoIcon /> },
  editor: { component: ImageEditor, name: 'Image Editor', icon: <EditIcon /> },
  photobooth: { component: PhotoBooth, name: 'AI Photo Booth', icon: <CameraIcon /> },
  notes: { component: HandwrittenNotes, name: 'Handwritten Notes', icon: <NotesIcon /> },
  wiki: { component: Wiki, name: 'Wiki', icon: <WikiIcon /> },
  aiNotes: { component: AINotes, name: 'AI Notes', icon: <AINotesIcon /> },
  gallery: { component: Gallery, name: 'Gallery', icon: <GalleryIcon /> },
  settings: { component: Settings, name: 'Settings', icon: <SettingsIcon /> },
};


// ====================================================================================
// Main App Content
// ====================================================================================
const AppContent: React.FC = () => {
  const { activeModule, setActiveModule, settings, shortcuts } = useAppContext();
  const { user } = useAuth();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const isResizingRef = useRef(false);
  const resizeStartRef = useRef<{x: number, width: number} | null>(null);

  const [moduleOrder, setModuleOrder] = useState<Module[]>(() => {
    const defaultOrder = Object.keys(MODULES) as Module[];
    const savedOrderJSON = localStorage.getItem('moduleOrder');
    if (!savedOrderJSON) return defaultOrder;

    try {
        const savedOrder = JSON.parse(savedOrderJSON) as Module[];
        const savedOrderSet = new Set(savedOrder);
        const defaultOrderSet = new Set(defaultOrder);

        // Check for new modules not in saved order
        const newModules = defaultOrder.filter(key => !savedOrderSet.has(key));
        // Check for removed modules that are in saved order
        const removedModules = savedOrder.filter(key => !defaultOrderSet.has(key));

        if (newModules.length > 0 || removedModules.length > 0) {
            // Reconcile: filter out removed modules and append new ones
            const reconciledOrder = savedOrder.filter(key => !removedModules.includes(key));
            reconciledOrder.push(...newModules);
            return reconciledOrder;
        }
        
        // No changes, saved order is valid
        return savedOrder;
    } catch {
        return defaultOrder;
    }
  });

  const draggedItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const MIN_WIDTH = 200;
  const MAX_WIDTH = 480;
  const COLLAPSED_WIDTH = 80;

  useEffect(() => {
    localStorage.setItem('moduleOrder', JSON.stringify(moduleOrder));
  }, [moduleOrder]);

  useEffect(() => {
    const savedWidth = localStorage.getItem('sidebarWidth');
    const savedCollapsed = localStorage.getItem('sidebarCollapsed');
    if (savedWidth) setSidebarWidth(parseInt(savedWidth, 10));
    if (savedCollapsed) setIsCollapsed(savedCollapsed === 'true');
  }, []);

  useEffect(() => {
    if (!isCollapsed) {
        localStorage.setItem('sidebarWidth', sidebarWidth.toString());
    }
    localStorage.setItem('sidebarCollapsed', isCollapsed.toString());
  }, [sidebarWidth, isCollapsed]);

  // Keyboard shortcut handler
  useEffect(() => {
    // Helper function to format a keyboard event into a consistent string
    const formatEventToString = (e: KeyboardEvent): string => {
        const parts: string[] = [];
        if (e.ctrlKey) parts.push('Ctrl');
        if (e.altKey) parts.push('Alt');
        if (e.shiftKey) parts.push('Shift');
        
        let key = e.key.toLowerCase();
        if (key === ' ') {
            key = 'Space';
        }

        if (!['control', 'alt', 'shift', 'meta'].includes(key)) {
            parts.push(key.charAt(0).toUpperCase() + key.slice(1));
        }

        // Return empty if it's just a modifier key press, to avoid empty strings in bindings
        if (parts.length > 0 && parts.length === (e.ctrlKey ? 1 : 0) + (e.altKey ? 1 : 0) + (e.shiftKey ? 1 : 0)) {
            return '';
        }

        return parts.join(' + ');
    };

    // Create a reverse map from key-combo to action for efficient lookup
    const actionMap = Object.entries(shortcuts).reduce((acc, [action, key]) => {
        if (key) acc[key] = action;
        return acc;
    }, {} as Record<string, string>);
    
    // Special handling for the alternate redo shortcut
    if (shortcuts.whiteboardRedo === 'Ctrl + Y') {
        actionMap['Ctrl + Shift + Z'] = 'whiteboardRedo';
    }

    const handleKeyDown = (e: KeyboardEvent) => {
        // Ignore shortcuts if the user is typing in an input field
        const target = e.target as HTMLElement;
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
            return;
        }

        const keyString = formatEventToString(e);
        if (!keyString) return;

        const action = actionMap[keyString];
        if (!action) return;
        
        let handled = false;

        switch (action) {
            case 'newWhiteboard':
                setActiveModule('whiteboard');
                handled = true;
                break;
            case 'openGallery':
                setActiveModule('gallery');
                handled = true;
                break;
            case 'whiteboardUndo':
                if (activeModule === 'whiteboard') {
                    document.dispatchEvent(new CustomEvent('app-shortcut', { detail: 'whiteboard-undo' }));
                    handled = true;
                }
                break;
            case 'whiteboardRedo':
                 if (activeModule === 'whiteboard') {
                    document.dispatchEvent(new CustomEvent('app-shortcut', { detail: 'whiteboard-redo' }));
                    handled = true;
                }
                break;
            case 'toggleDictation':
                if (activeModule === 'notes') {
                     document.dispatchEvent(new CustomEvent('app-shortcut', { detail: 'notes-toggle-dictation' }));
                     handled = true;
                }
                break;
        }

        if (handled) {
            e.preventDefault();
        }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
        document.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeModule, setActiveModule, shortcuts]);


  const handleMouseDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isResizingRef.current = true;
    resizeStartRef.current = { x: e.clientX, width: sidebarWidth };
    document.addEventListener('pointermove', handleMouseMove);
    document.addEventListener('pointerup', handleMouseUp);
  };

  const handleMouseMove = useCallback((e: PointerEvent) => {
    if (!isResizingRef.current || !resizeStartRef.current) return;
    const dx = e.clientX - resizeStartRef.current.x;
    let newWidth = resizeStartRef.current.width + dx;

    if (newWidth < MIN_WIDTH) newWidth = MIN_WIDTH;
    if (newWidth > MAX_WIDTH) newWidth = MAX_WIDTH;

    setSidebarWidth(newWidth);
    document.body.style.cursor = 'col-resize';
  }, []);

  const handleMouseUp = useCallback(() => {
    isResizingRef.current = false;
    resizeStartRef.current = null;
    document.removeEventListener('pointermove', handleMouseMove);
    document.removeEventListener('pointerup', handleMouseUp);
    document.body.style.cursor = 'default';
  }, [handleMouseMove]);

  const toggleCollapse = () => {
    setIsCollapsed(prev => !prev);
  };
  
  const resetWidth = () => {
    setSidebarWidth(240);
  };

  const handleDragStart = (e: React.DragEvent<HTMLButtonElement>, position: number) => {
      draggedItem.current = position;
      e.currentTarget.classList.add('dragging');
  };

  const handleDragEnter = (e: React.DragEvent<HTMLButtonElement>, position: number) => {
      dragOverItem.current = position;
      e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLButtonElement>) => {
      e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e: React.DragEvent<HTMLButtonElement>) => {
      e.currentTarget.classList.remove('drag-over');
      if (draggedItem.current === null || dragOverItem.current === null || draggedItem.current === dragOverItem.current) {
          return;
      }
      
      const newModuleOrder = [...moduleOrder];
      const [draggedItemContent] = newModuleOrder.splice(draggedItem.current, 1);
      newModuleOrder.splice(dragOverItem.current, 0, draggedItemContent);
      
      setModuleOrder(newModuleOrder);
  };

  const handleDragEnd = (e: React.DragEvent<HTMLButtonElement>) => {
      e.currentTarget.classList.remove('dragging');
      document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
      draggedItem.current = null;
      dragOverItem.current = null;
  };
  
  const ActiveComponent = MODULES[activeModule].component;

  const textSizeClasses = {
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
  };

  return (
    <div className={`flex h-screen bg-slate-900 text-slate-100 ${settings.font} ${textSizeClasses[settings.textSize]}`}>
      <aside 
        className="bg-slate-900 border-r border-slate-700 flex flex-col relative transition-all duration-300 ease-in-out"
        style={{ width: isCollapsed ? COLLAPSED_WIDTH : sidebarWidth }}
        aria-label="Sidebar"
      >
        <div className={`flex items-center p-4 h-16 flex-shrink-0 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            <h1 className="text-2xl font-bold text-blue-400 mt-2">
                {isCollapsed ? 'CS' : 'CS AI'}
            </h1>
            {!isCollapsed && user && (
                <button
                    onClick={() => setIsDashboardOpen(true)}
                    className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full border border-blue-500/30 hover:from-blue-500/30 hover:to-purple-500/30 transition-all"
                    title="User Dashboard"
                >
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <UserIcon className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-xs text-blue-400 font-medium truncate max-w-20">
                        {user.name}
                    </span>
                </button>
            )}
        </div>

        <nav className="flex-grow overflow-y-auto overflow-x-hidden px-2">
            <div className="flex flex-col space-y-2 mt-4">
                {moduleOrder.map((key, index) => {
                    const moduleKey = key as Module;
                    const { name, icon } = MODULES[moduleKey];
                    const isActive = activeModule === moduleKey;
                    return (
                        <button
                            key={key}
                            onClick={() => setActiveModule(moduleKey)}
                            title={name}
                            className={`sidebar-item flex items-center gap-4 p-3 rounded-lg transition-colors duration-200 relative ${isCollapsed ? 'justify-center' : ''} ${
                                isActive ? 'bg-slate-700 text-white' : 'hover:bg-slate-700 text-slate-400 hover:text-white'
                            }`}
                            draggable={!isCollapsed}
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragEnter={(e) => handleDragEnter(e, index)}
                            onDragLeave={handleDragLeave}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                            onDragEnd={handleDragEnd}
                        >
                             {isActive && <div className="absolute left-0 top-2 bottom-2 w-1 bg-blue-500 rounded-r-full"></div>}
                            {icon}
                            {!isCollapsed && <span className="font-medium whitespace-nowrap">{name}</span>}
                        </button>
                    );
                })}
            </div>
        </nav>
        
        <button 
            onClick={toggleCollapse} 
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-slate-700 hover:bg-blue-600 text-slate-300 hover:text-white rounded-full p-1.5 border-4 border-slate-900 transition-all"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
            {isCollapsed ? <ChevronsRightIcon className="w-5 h-5" /> : <ChevronsLeftIcon className="w-5 h-5"/>}
        </button>
        
        {!isCollapsed && (
            <div
                onPointerDown={handleMouseDown}
                onDoubleClick={resetWidth}
                className="absolute top-0 right-0 h-full w-2 cursor-col-resize group"
                title="Drag to resize. Double click to reset."
            >
              <div className="w-full h-full bg-transparent group-hover:bg-blue-500/50 transition-colors duration-300"/>
            </div>
        )}
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 p-4">
          <h2 className="text-xl font-semibold">{MODULES[activeModule].name}</h2>
        </header>
        <div className="flex-1 p-6 overflow-y-auto bg-slate-800 animate-fade-in" key={activeModule}>
          <Suspense fallback={<ModuleLoader />}>
            <ActiveComponent />
          </Suspense>
        </div>
      </main>

      {/* User Dashboard Modal */}
      <UserDashboard
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
      />
    </div>
  );
};

// Authentication wrapper component
const AuthenticatedApp: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
          <p className="text-lg text-slate-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <AuthForm />
      </div>
    );
  }

  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

const App: React.FC = () => {
  return (
    <>
      <AuthProvider>
        <AuthenticatedApp />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              border: '1px solid #334155',
            },
          }}
        />
      </AuthProvider>
    </>
  );
};

export default App;
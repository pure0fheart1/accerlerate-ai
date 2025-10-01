import React, { useState, useEffect } from 'react';
import { TrashIcon, XIcon, DownloadIcon } from '../components/icons';

interface SavedImage {
  id: string;
  url: string;
  prompt?: string;
  timestamp: number;
  source: 'generator' | 'editor';
}

const GALLERY_STORAGE_KEY = 'ai-gallery-images';

const MyGallery: React.FC = () => {
  const [images, setImages] = useState<SavedImage[]>([]);
  const [draggedImage, setDraggedImage] = useState<string | null>(null);
  const [isOverTrash, setIsOverTrash] = useState(false);
  const [selectedImage, setSelectedImage] = useState<SavedImage | null>(null);

  // Load images from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(GALLERY_STORAGE_KEY);
      if (stored) {
        const parsedImages = JSON.parse(stored);
        setImages(parsedImages);
      }
    } catch (error) {
      console.error('Failed to load gallery images:', error);
    }
  }, []);

  // Save images to localStorage
  const saveImages = (updatedImages: SavedImage[]) => {
    try {
      localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(updatedImages));
      setImages(updatedImages);
    } catch (error) {
      console.error('Failed to save gallery images:', error);
    }
  };

  // Delete image
  const deleteImage = (imageId: string) => {
    const updatedImages = images.filter(img => img.id !== imageId);
    saveImages(updatedImages);
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, imageId: string) => {
    setDraggedImage(imageId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedImage(null);
    setIsOverTrash(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleTrashDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOverTrash(true);
  };

  const handleTrashDragLeave = () => {
    setIsOverTrash(false);
  };

  const handleTrashDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedImage) {
      deleteImage(draggedImage);
    }
    setIsOverTrash(false);
  };

  // Download image
  const downloadImage = (image: SavedImage) => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = `gallery-${image.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Clear all images
  const clearGallery = () => {
    if (window.confirm('Are you sure you want to delete all images from your gallery?')) {
      saveImages([]);
    }
  };

  return (
    <div className="min-h-full flex flex-col max-w-7xl mx-auto w-full">
      {/* Header */}
      <header className="text-center mb-8 px-4">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl shadow-lg">
            <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 dark:from-purple-400 dark:via-pink-400 dark:to-indigo-400">
            My Gallery
          </h1>
        </div>
        <p className="text-xl lg:text-2xl text-gray-600 dark:text-slate-400 font-light max-w-3xl mx-auto">
          Your AI-generated and edited images collection
        </p>
      </header>

      {/* Gallery Stats & Actions */}
      <div className="flex items-center justify-between mb-6 px-4">
        <div className="text-sm text-gray-600 dark:text-slate-400">
          <span className="font-semibold text-lg text-gray-900 dark:text-slate-100">{images.length}</span> {images.length === 1 ? 'image' : 'images'}
        </div>
        {images.length > 0 && (
          <button
            onClick={clearGallery}
            className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Gallery Grid */}
      <main className="flex-grow px-4 pb-8">
        {images.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-gray-200 dark:border-slate-700 rounded-3xl">
            <svg className="h-24 w-24 text-gray-300 dark:text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xl font-medium text-gray-500 dark:text-slate-500 mb-2">Your gallery is empty</p>
            <p className="text-sm text-gray-400 dark:text-slate-600">Generated images will automatically appear here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {images.map((image) => (
              <div
                key={image.id}
                draggable
                onDragStart={(e) => handleDragStart(e, image.id)}
                onDragEnd={handleDragEnd}
                className={`group relative bg-white dark:bg-slate-700 rounded-2xl p-3 shadow-md hover:shadow-xl transition-all duration-300 cursor-move ${
                  draggedImage === image.id ? 'opacity-50 scale-95' : ''
                }`}
              >
                {/* Image */}
                <div
                  className="aspect-square overflow-hidden rounded-xl mb-3 cursor-pointer"
                  onClick={() => setSelectedImage(image)}
                >
                  <img
                    src={image.url}
                    alt={image.prompt || 'Generated image'}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>

                {/* Image Info */}
                <div className="space-y-2">
                  {image.prompt && (
                    <p className="text-xs text-gray-600 dark:text-slate-400 line-clamp-2">
                      {image.prompt}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-500">
                    <span>{new Date(image.timestamp).toLocaleDateString()}</span>
                    <span className="px-2 py-1 bg-gray-100 dark:bg-slate-600 rounded-full capitalize">
                      {image.source}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="absolute top-5 right-5 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadImage(image);
                    }}
                    className="p-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors shadow-lg"
                    title="Download image"
                  >
                    <DownloadIcon className="h-4 w-4 text-gray-700 dark:text-slate-300" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteImage(image.id);
                    }}
                    className="p-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors shadow-lg"
                    title="Delete image"
                  >
                    <XIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Trash Bin Drop Zone */}
      <div
        onDragOver={handleTrashDragOver}
        onDragLeave={handleTrashDragLeave}
        onDrop={handleTrashDrop}
        className={`fixed bottom-8 right-8 p-6 bg-white dark:bg-slate-800 border-2 border-dashed rounded-2xl shadow-2xl transition-all duration-300 ${
          isOverTrash
            ? 'border-red-500 bg-red-50 dark:bg-red-900/20 scale-110'
            : draggedImage
            ? 'border-gray-300 dark:border-slate-600 scale-100'
            : 'border-gray-200 dark:border-slate-700 scale-90 opacity-50'
        }`}
      >
        <TrashIcon className={`h-12 w-12 transition-colors ${
          isOverTrash ? 'text-red-500' : 'text-gray-400 dark:text-slate-500'
        }`} />
        <p className={`mt-2 text-sm font-medium ${
          isOverTrash ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-slate-400'
        }`}>
          Drop to delete
        </p>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh] bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors z-10"
            >
              <XIcon className="h-6 w-6 text-gray-700 dark:text-slate-300" />
            </button>
            <img
              src={selectedImage.url}
              alt={selectedImage.prompt || 'Generated image'}
              className="max-w-full max-h-[80vh] object-contain"
            />
            {selectedImage.prompt && (
              <div className="p-6 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700">
                <p className="text-sm text-gray-700 dark:text-slate-300">{selectedImage.prompt}</p>
                <div className="flex items-center gap-4 mt-4 text-xs text-gray-500 dark:text-slate-500">
                  <span>{new Date(selectedImage.timestamp).toLocaleString()}</span>
                  <span className="px-2 py-1 bg-gray-100 dark:bg-slate-700 rounded-full capitalize">
                    {selectedImage.source}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyGallery;

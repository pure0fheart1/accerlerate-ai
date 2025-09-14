
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../contexts/AppContext.tsx';
import { GeneratedContent } from '../../types.ts';

// FIX: Updated FullscreenViewer to support both image and video types.
const FullscreenViewer: React.FC<{ item: GeneratedContent; onClose: () => void }> = ({ item, onClose }) => {

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = item.url;
    // Create a safe filename from the prompt
    const extension = item.type === 'image' ? 'jpg' : 'mp4';
    const fileName = item.prompt.substring(0, 30).replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `creativestudio-${fileName}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4 transition-opacity duration-300"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="relative bg-slate-900 rounded-lg p-6 shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col gap-4 animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        {item.type === 'image' ? (
          <img 
            src={item.url} 
            alt={item.prompt} 
            className="flex-1 object-contain w-full h-auto min-h-0"
          />
        ) : (
          <video
            src={item.url}
            controls
            autoPlay
            loop
            className="flex-1 object-contain w-full h-auto min-h-0"
          />
        )}
        <p className="text-center text-slate-300 italic">{item.prompt}</p>
        <div className="flex justify-center gap-4">
            <button
                onClick={handleDownload}
                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
                Download
            </button>
            <button
                onClick={onClose}
                className="px-6 py-2 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-700 transition-colors"
                aria-label="Close viewer"
            >
                Close
            </button>
        </div>
      </div>
    </div>
  );
};

// FIX: Updated GalleryCard to render <video> elements for video content.
const GalleryCard: React.FC<{ item: GeneratedContent; onView: (item: GeneratedContent) => void }> = ({ item, onView }) => {
  return (
    <div 
      className="bg-slate-800 rounded-lg overflow-hidden group relative cursor-pointer"
      onClick={() => onView(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            onView(item);
        }
      }}
    >
      {item.type === 'image' ? (
        <img src={item.url} alt={item.prompt} className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105" />
      ) : (
        <video src={item.url} className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105" muted loop />
      )}
      <div className="absolute inset-0 bg-black bg-opacity-70 opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
        <p className="text-white text-sm line-clamp-3">{item.prompt}</p>
        <p className="text-xs text-slate-400 mt-2">{item.createdAt.toLocaleDateString()}</p>
      </div>
    </div>
  );
};

const Gallery: React.FC = () => {
  const { galleryContent } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<GeneratedContent | null>(null);

  const filteredContent = useMemo(() => {
    return galleryContent
      .filter(item => {
        return item.prompt.toLowerCase().includes(searchTerm.toLowerCase());
      });
  }, [galleryContent, searchTerm]);

  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by prompt..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {filteredContent.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredContent.map(item => (
            <GalleryCard key={item.id} item={item} onView={setSelectedItem} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-xl text-slate-500">No content found.</p>
          <p className="text-slate-600">Try generating some images!</p>
        </div>
      )}
      {selectedItem && <FullscreenViewer item={selectedItem} onClose={() => setSelectedItem(null)} />}
    </div>
  );
};

export default Gallery;
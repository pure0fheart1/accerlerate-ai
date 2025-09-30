import React from 'react';
import { XIcon } from './icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, imageUrl }) => {
  if (!isOpen || !imageUrl) return null;

  return (
    <div
      className="fixed inset-0 bg-gray-900/80 dark:bg-slate-900/90 backdrop-blur-sm flex justify-center items-center z-[9999] transition-opacity duration-300"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="relative w-full h-full max-w-5xl max-h-[90vh] p-4 flex justify-center items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 text-white bg-slate-800/80 rounded-full p-2 hover:bg-slate-700 transition-colors z-10"
          aria-label="Close fullscreen image"
        >
          <XIcon className="h-6 w-6" />
        </button>
        <img 
          src={imageUrl} 
          alt="Fullscreen generated image" 
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
        />
      </div>
    </div>
  );
};

export default Modal;
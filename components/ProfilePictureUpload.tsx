import React, { useState, useRef } from 'react';
import { UserIcon, CameraIcon, XMarkIcon } from './icons';

interface ProfilePictureUploadProps {
  currentPicture?: string;
  onPictureChange: (file: File | null) => void;
  className?: string;
}

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  currentPicture,
  onPictureChange,
  className = ''
}) => {
  const [preview, setPreview] = useState<string | null>(currentPicture || null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      onPictureChange(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemovePicture = () => {
    setPreview(null);
    onPictureChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className={`relative w-24 h-24 rounded-full overflow-hidden border-2 transition-all duration-200 cursor-pointer ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
            : 'border-gray-300 dark:border-slate-600 hover:border-indigo-400 dark:hover:border-indigo-500'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        {preview ? (
          <img
            src={preview}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
            <UserIcon className="w-10 h-10 text-gray-400 dark:text-slate-500" />
          </div>
        )}

        {/* Camera overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
          <CameraIcon className="w-6 h-6 text-white opacity-0 hover:opacity-100 transition-opacity duration-200" />
        </div>
      </div>

      {/* Remove button */}
      {preview && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleRemovePicture();
          }}
          className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors duration-200"
          title="Remove picture"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Helper text */}
      <p className="text-xs text-gray-500 dark:text-slate-400 mt-2 text-center">
        Click or drag to upload
      </p>
    </div>
  );
};

export default ProfilePictureUpload;
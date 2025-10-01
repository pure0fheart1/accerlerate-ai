/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useCallback, useRef } from 'react';
import { UploadCloudIcon } from './icons';
import { Spinner } from './Spinner';
import { Compare } from './ui/compare';
import { generateModelImage } from '../../services/geminiService';
import { getFriendlyErrorMessage } from '../../lib/utils';

interface StartScreenProps {
  onModelFinalized: (modelUrl: string) => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onModelFinalized }) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    setSelectedImage(file);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        setPreviewUrl(result);
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const handleGenerateModel = useCallback(async () => {
    if (!selectedImage) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const modelUrl = await generateModelImage(selectedImage);
      setGeneratedImageUrl(modelUrl);
    } catch (err) {
      const friendlyMessage = getFriendlyErrorMessage(err, 'Failed to generate model');
      setError(friendlyMessage);
      console.error('Error generating model:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedImage]);

  const handleFinalizeModel = useCallback(() => {
    if (generatedImageUrl) {
      onModelFinalized(generatedImageUrl);
    }
  }, [generatedImageUrl, onModelFinalized]);

  const handleReset = useCallback(() => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setGeneratedImageUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="text-center mb-8 max-w-2xl">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">
          Create Your Model for Any Look
        </h1>
        <p className="text-lg text-gray-600 mb-2">
          Upload a photo of yourself to get started with virtual try-ons
        </p>
        <p className="text-sm text-gray-500">
          For best results, use a clear photo of yourself in simple clothes with good lighting
        </p>
      </div>

      <div className="w-full max-w-4xl">
        {!previewUrl && !isLoading && (
          <div className="flex flex-col items-center">
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-white hover:bg-gray-50 transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadCloudIcon className="w-12 h-12 mb-4 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PNG, JPG or WEBP</p>
              </div>
              <input
                id="file-upload"
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
              />
            </label>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Spinner className="w-12 h-12 mb-4" />
            <p className="text-gray-600">Generating your model...</p>
            <p className="text-sm text-gray-500 mt-2">This may take a moment</p>
          </div>
        )}

        {previewUrl && !isLoading && (
          <div className="space-y-6">
            <div className="flex justify-center">
              {generatedImageUrl ? (
                <Compare
                  firstImage={previewUrl}
                  secondImage={generatedImageUrl}
                  className="w-full max-w-2xl aspect-square rounded-lg shadow-lg"
                  slideMode="drag"
                  autoplay={true}
                  autoplayDuration={3000}
                />
              ) : (
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full max-w-2xl rounded-lg shadow-lg"
                  />
                </div>
              )}
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="flex justify-center gap-4">
              {!generatedImageUrl ? (
                <>
                  <button
                    onClick={handleGenerateModel}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                  >
                    Generate Model
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Choose Different Photo
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleFinalizeModel}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Continue to Try-On
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Start Over
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

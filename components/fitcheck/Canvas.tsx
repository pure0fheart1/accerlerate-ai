/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { RotateCcwIcon, ChevronDownIcon, ChevronUpIcon, DownloadIcon } from './icons';
import { Spinner } from './Spinner';

interface CanvasProps {
  displayImageUrl: string | null;
  onStartOver: () => void;
  isLoading: boolean;
  loadingMessage: string;
  onSelectPose: (index: number) => void;
  poseInstructions: string[];
  currentPoseIndex: number;
  availablePoseKeys: string[];
}

export const Canvas: React.FC<CanvasProps> = ({
  displayImageUrl,
  onStartOver,
  isLoading,
  loadingMessage,
  onSelectPose,
  poseInstructions,
  currentPoseIndex,
  availablePoseKeys,
}) => {
  const [showPoseMenu, setShowPoseMenu] = useState(false);

  const handleSaveImage = async () => {
    if (!displayImageUrl) return;

    try {
      // Fetch the image
      const response = await fetch(displayImageUrl);
      const blob = await response.blob();

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `fitcheck-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to save image:', error);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50">
      <div className="relative w-full max-w-2xl">
        {/* Top Controls */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          {displayImageUrl && !isLoading && (
            <button
              onClick={handleSaveImage}
              className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-100 transition-colors"
              title="Save Image"
            >
              <DownloadIcon className="w-5 h-5 text-gray-700" />
            </button>
          )}
          <button
            onClick={onStartOver}
            className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-100 transition-colors"
            title="Start Over"
          >
            <RotateCcwIcon className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Canvas Area */}
        <div className="relative bg-white rounded-lg shadow-lg overflow-hidden aspect-square">
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
              <Spinner className="w-12 h-12 mb-4" />
              <p className="text-gray-600 font-medium">{loadingMessage}</p>
            </div>
          ) : displayImageUrl ? (
            <div className="relative w-full h-full">
              <img
                src={displayImageUrl}
                alt="Try-on result"
                className="w-full h-full object-contain"
              />

              {/* Pose Selection Popover */}
              {availablePoseKeys.length > 0 && (
                <div
                  className="absolute bottom-4 left-4 z-20"
                  onMouseEnter={() => setShowPoseMenu(true)}
                  onMouseLeave={() => setShowPoseMenu(false)}
                >
                  <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors">
                    <span className="text-sm font-medium text-gray-700">
                      Pose {currentPoseIndex + 1}
                    </span>
                    {showPoseMenu ? (
                      <ChevronUpIcon className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                    )}
                  </button>

                  {showPoseMenu && (
                    <div className="absolute bottom-full mb-2 left-0 min-w-[200px] bg-white rounded-lg shadow-xl border border-gray-200 py-2">
                      {poseInstructions.map((instruction, index) => {
                        const isAvailable = availablePoseKeys.includes(String(index));
                        const isCurrent = index === currentPoseIndex;

                        return (
                          <button
                            key={index}
                            onClick={() => isAvailable && onSelectPose(index)}
                            disabled={!isAvailable}
                            className={`
                              w-full px-4 py-2 text-left text-sm transition-colors
                              ${isCurrent ? 'bg-indigo-50 text-indigo-700 font-medium' : ''}
                              ${isAvailable && !isCurrent ? 'hover:bg-gray-50 text-gray-700' : ''}
                              ${!isAvailable ? 'text-gray-400 cursor-not-allowed' : 'cursor-pointer'}
                            `}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-gray-400">
                                {index + 1}
                              </span>
                              <span>{instruction}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <p className="text-gray-500">No image to display</p>
            </div>
          )}
        </div>

        {/* Info Text */}
        {displayImageUrl && !isLoading && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              {availablePoseKeys.length > 0
                ? 'Hover over the pose selector to switch poses'
                : 'Try on different outfits using the wardrobe panel'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { OutfitLayer, WardrobeItem } from '../types/fitcheck';

const DB_NAME = 'fitcheck_db';
const DB_VERSION = 1;
const IMAGE_STORE = 'images';
const STATE_STORE = 'state';

interface ImageEntry {
  id: string;
  url: string;
}

interface StateEntry {
  key: string;
  value: any;
}

let dbInstance: IDBDatabase | null = null;

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(IMAGE_STORE)) {
        db.createObjectStore(IMAGE_STORE, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(STATE_STORE)) {
        db.createObjectStore(STATE_STORE, { keyPath: 'key' });
      }
    };
  });
};

const generateImageId = (layerIndex: number, poseKey: string): string => {
  return `layer_${layerIndex}_${poseKey}`;
};

export const saveFitCheckState = async (
  modelImageUrl: string | null,
  outfitHistory: OutfitLayer[],
  currentOutfitIndex: number,
  currentPoseIndex: number,
  wardrobe: WardrobeItem[]
): Promise<void> => {
  const db = await openDB();

  // Save images to IndexedDB
  const imageTransaction = db.transaction(IMAGE_STORE, 'readwrite');
  const imageStore = imageTransaction.objectStore(IMAGE_STORE);

  // Clear old images
  await new Promise<void>((resolve, reject) => {
    const clearRequest = imageStore.clear();
    clearRequest.onsuccess = () => resolve();
    clearRequest.onerror = () => reject(clearRequest.error);
  });

  // Save model image
  if (modelImageUrl) {
    await new Promise<void>((resolve, reject) => {
      const request = imageStore.add({ id: 'model_image', url: modelImageUrl });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Save outfit images
  for (let i = 0; i < outfitHistory.length; i++) {
    const layer = outfitHistory[i];
    for (const [poseKey, imageUrl] of Object.entries(layer.poseImages)) {
      const imageId = generateImageId(i, poseKey);
      await new Promise<void>((resolve, reject) => {
        const request = imageStore.add({ id: imageId, url: imageUrl });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  }

  // Save state (without image URLs) to IndexedDB
  const stateTransaction = db.transaction(STATE_STORE, 'readwrite');
  const stateStore = stateTransaction.objectStore(STATE_STORE);

  const outfitHistoryWithoutImages = outfitHistory.map((layer, index) => ({
    garment: layer.garment,
    poseKeys: Object.keys(layer.poseImages),
    layerIndex: index
  }));

  const stateEntries: StateEntry[] = [
    { key: 'outfitHistory', value: outfitHistoryWithoutImages },
    { key: 'currentOutfitIndex', value: currentOutfitIndex },
    { key: 'currentPoseIndex', value: currentPoseIndex },
    { key: 'wardrobe', value: wardrobe },
    { key: 'hasModelImage', value: !!modelImageUrl }
  ];

  for (const entry of stateEntries) {
    await new Promise<void>((resolve, reject) => {
      const request = stateStore.put(entry);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
};

export const loadFitCheckState = async (): Promise<{
  modelImageUrl: string | null;
  outfitHistory: OutfitLayer[];
  currentOutfitIndex: number;
  currentPoseIndex: number;
  wardrobe: WardrobeItem[];
} | null> => {
  try {
    const db = await openDB();

    // Load state
    const stateTransaction = db.transaction(STATE_STORE, 'readonly');
    const stateStore = stateTransaction.objectStore(STATE_STORE);

    const getStateValue = (key: string): Promise<any> => {
      return new Promise((resolve, reject) => {
        const request = stateStore.get(key);
        request.onsuccess = () => resolve(request.result?.value);
        request.onerror = () => reject(request.error);
      });
    };

    const [outfitHistoryData, currentOutfitIndex, currentPoseIndex, wardrobe, hasModelImage] = await Promise.all([
      getStateValue('outfitHistory'),
      getStateValue('currentOutfitIndex'),
      getStateValue('currentPoseIndex'),
      getStateValue('wardrobe'),
      getStateValue('hasModelImage')
    ]);

    if (!outfitHistoryData) {
      return null;
    }

    // Load images
    const imageTransaction = db.transaction(IMAGE_STORE, 'readonly');
    const imageStore = imageTransaction.objectStore(IMAGE_STORE);

    const getImage = (id: string): Promise<string | null> => {
      return new Promise((resolve) => {
        const request = imageStore.get(id);
        request.onsuccess = () => resolve(request.result?.url || null);
        request.onerror = () => resolve(null);
      });
    };

    const modelImageUrl = hasModelImage ? await getImage('model_image') : null;

    const outfitHistory: OutfitLayer[] = await Promise.all(
      outfitHistoryData.map(async (layerData: any) => {
        const poseImages: Record<string, string> = {};

        for (const poseKey of layerData.poseKeys) {
          const imageId = generateImageId(layerData.layerIndex, poseKey);
          const imageUrl = await getImage(imageId);
          if (imageUrl) {
            poseImages[poseKey] = imageUrl;
          }
        }

        return {
          garment: layerData.garment,
          poseImages
        };
      })
    );

    return {
      modelImageUrl,
      outfitHistory,
      currentOutfitIndex: currentOutfitIndex ?? 0,
      currentPoseIndex: currentPoseIndex ?? 0,
      wardrobe: wardrobe || []
    };
  } catch (error) {
    console.error('Error loading FitCheck state:', error);
    return null;
  }
};

export const clearFitCheckState = async (): Promise<void> => {
  try {
    const db = await openDB();

    const imageTransaction = db.transaction(IMAGE_STORE, 'readwrite');
    const imageStore = imageTransaction.objectStore(IMAGE_STORE);
    await new Promise<void>((resolve, reject) => {
      const request = imageStore.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    const stateTransaction = db.transaction(STATE_STORE, 'readwrite');
    const stateStore = stateTransaction.objectStore(STATE_STORE);
    await new Promise<void>((resolve, reject) => {
      const request = stateStore.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error clearing FitCheck state:', error);
  }
};

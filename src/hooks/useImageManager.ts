import { useState, useCallback, useEffect } from 'react';

// Check if we're in a Tauri environment
const isTauri = typeof window !== 'undefined' && '__TAURI__' in window;

// Safe invoke function that handles both Tauri and web environments
const safeInvoke = async (command: string, args?: any) => {
  if (!isTauri) {
    console.warn('Tauri API not available - running in web mode');
    // Return mock data for web environment
    switch (command) {
      case 'get_all_images':
        return [];
      case 'save_image':
        return { id: 'mock-id', filename: args?.filename || 'mock.jpg' };
      case 'get_image':
        return null;
      default:
        return null;
    }
  }

  try {
    const { invoke } = await import('@tauri-apps/api/core');
    return await invoke(command, args);
  } catch (error) {
    console.error(`Failed to invoke ${command}:`, error);
    throw error;
  }
};

export interface ImageMetadata {
  id: string;
  filename: string;
  original_name: string;
  size: number;
  mime_type: string;
  created_at: string;
  file_path: string;
}

export interface ImageWithData extends ImageMetadata {
  data_url: string;
}

export function useImageManager() {
  const [images, setImages] = useState<ImageMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load images from backend on mount
  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = useCallback(async () => {
    try {
      const backendImages = await safeInvoke('get_all_images') as ImageMetadata[];
      setImages(backendImages || []);
    } catch (error) {
      console.error('Failed to load images:', error);
      setImages([]); // Set empty array on error
    }
  }, []);

  const saveImage = useCallback(async (file: File, noteId?: string): Promise<string> => {
    setIsLoading(true);
    
    try {
      // Convert file to array buffer
      const arrayBuffer = await file.arrayBuffer();
      const fileData = Array.from(new Uint8Array(arrayBuffer));
      
      // Save image via Tauri command
      const imageMetadata = await safeInvoke('save_image', {
        fileData,
        filename: file.name,
        originalName: file.name,
        mimeType: file.type,
        noteId
      }) as ImageMetadata;

      // Reload images to get updated list
      await loadImages();

      return imageMetadata.id;
    } catch (error) {
      console.error('Failed to save image:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [loadImages]);

  const getImage = useCallback(async (id: string): Promise<ImageWithData | null> => {
    try {
      const imageWithData = await safeInvoke('get_image', { id }) as ImageWithData;
      return imageWithData;
    } catch (error) {
      console.error('Failed to get image:', error);
      return null;
    }
  }, []);

  const deleteImage = useCallback(async (id: string) => {
    try {
      await safeInvoke('delete_image', { id });
      await loadImages(); // Reload images after deletion
    } catch (error) {
      console.error('Failed to delete image:', error);
      throw error;
    }
  }, [loadImages]);

  const updateImageUsage = useCallback(async (imageId: string, noteId: string, isUsed: boolean) => {
    try {
      await safeInvoke('update_image_note_association', {
        imageId,
        noteId,
        isUsed
      });
    } catch (error) {
      console.error('Failed to update image usage:', error);
      throw error;
    }
  }, []);

  const getImagesForNote = useCallback(async (noteId: string): Promise<ImageMetadata[]> => {
    try {
      const noteImages = await safeInvoke('get_images_for_note', { noteId }) as ImageMetadata[];
      return noteImages || [];
    } catch (error) {
      console.error('Failed to get images for note:', error);
      return [];
    }
  }, []);

  const getUnusedImages = useCallback((): ImageMetadata[] => {
    // This would need a backend command to get unused images
    // For now, return empty array
    return [];
  }, []);

  return {
    images,
    isLoading,
    saveImage,
    getImage,
    deleteImage,
    updateImageUsage,
    getImagesForNote,
    getUnusedImages
  };
}
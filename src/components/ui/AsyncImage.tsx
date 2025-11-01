import { useState, useEffect } from 'react';
import type { ImageWithData } from '../../hooks/useImageManager';

interface AsyncImageProps {
  imageId: string;
  alt?: string;
  getImage: (id: string) => Promise<ImageWithData | null>;
}

export function AsyncImage({ imageId, alt, getImage }: AsyncImageProps) {
  const [image, setImage] = useState<ImageWithData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadImage = async () => {
      try {
        setLoading(true);
        setError(null);
        const imageData = await getImage(imageId);
        
        if (mounted) {
          if (imageData) {
            setImage(imageData);
          } else {
            setError('Image not found');
          }
        }
      } catch (err) {
        if (mounted) {
          setError('Failed to load image');
          console.error('Failed to load image:', err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadImage();

    return () => {
      mounted = false;
    };
  }, [imageId, getImage]);

  if (loading) {
    return (
      <div className="mb-4 p-4 border border-color-text-muted/20 rounded bg-bg-primary/30 text-center">
        <div className="text-color-text-muted text-sm">
          📷 Loading image...
        </div>
      </div>
    );
  }

  if (error || !image) {
    return (
      <div className="mb-4 p-3 border border-red-400/20 rounded bg-red-500/10 text-center">
        <div className="text-red-400 text-sm">
          ❌ {error || 'Image not found'}: {alt || 'Unknown'}
        </div>
        <div className="text-xs text-red-400/70 mt-1">
          Image ID: {imageId}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4 text-center">
      <img 
        src={image.data_url} 
        alt={alt || image.original_name} 
        className="max-w-full h-auto rounded-lg shadow-sm border border-color-text-muted/20 mx-auto"
        loading="lazy"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const errorDiv = document.createElement('div');
          errorDiv.className = 'text-red-400 text-sm p-3 border border-red-400/20 rounded bg-red-500/10';
          errorDiv.textContent = `❌ Failed to load image: ${alt || image.original_name}`;
          target.parentNode?.insertBefore(errorDiv, target);
        }}
      />
    </div>
  );
}
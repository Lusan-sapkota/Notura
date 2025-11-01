import { useState } from 'react';
import { ImageMetadata } from '../../hooks/useImageManager';

interface ImageGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: ImageMetadata[];
  onDeleteImage: (imageId: string) => Promise<void>;
  onInsertImage: (imageId: string) => Promise<void>;
}

export function ImageGalleryModal({ 
  isOpen, 
  onClose, 
  images, 
  onDeleteImage,
  onInsertImage 
}: ImageGalleryModalProps) {
  const [selectedImage, setSelectedImage] = useState<ImageMetadata | null>(null);

  if (!isOpen) return null;

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-bg-surface rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-color-text-muted/20">
          <h2 className="text-lg font-semibold text-color-text">Image Gallery</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-color-primary/10 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-color-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex h-[60vh]">
          {/* Image Grid */}
          <div className="flex-1 p-4 overflow-y-auto">
            {images.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-color-text-muted">
                <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p>No images found</p>
                <p className="text-sm mt-1">Upload images to see them here</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage?.id === image.id
                        ? 'border-color-accent shadow-lg'
                        : 'border-color-text-muted/20 hover:border-color-accent/50'
                    }`}
                    onClick={() => setSelectedImage(image)}
                  >
                    <div className="aspect-square bg-bg-primary/50 flex items-center justify-center">
                      <svg className="w-12 h-12 text-color-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-end">
                      <div className="w-full p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white text-xs truncate">{image.original_name}</p>
                        <p className="text-white/70 text-xs">{formatFileSize(image.size)}</p>
                      </div>
                    </div>

                    {/* Note: Usage indicator removed since backend doesn't track this directly */}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Image Details Sidebar */}
          {selectedImage && (
            <div className="w-80 border-l border-color-text-muted/20 p-4 overflow-y-auto">
              <div className="space-y-4">
                {/* Preview */}
                <div className="aspect-square bg-bg-primary/50 rounded-lg overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center text-color-text-muted">
                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-color-text-muted">Name</label>
                    <p className="text-color-text break-all">{selectedImage.original_name}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-color-text-muted">Size</label>
                    <p className="text-color-text">{formatFileSize(selectedImage.size)}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-color-text-muted">Type</label>
                    <p className="text-color-text">{selectedImage.mime_type}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-color-text-muted">Created</label>
                    <p className="text-color-text">{new Date(selectedImage.created_at).toLocaleDateString()}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-color-text-muted">File Path</label>
                    <p className="text-color-text text-xs break-all">{selectedImage.file_path}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-4 border-t border-color-text-muted/20">
                  <button
                    onClick={() => {
                      onInsertImage(selectedImage.id);
                      onClose();
                    }}
                    className="w-full px-4 py-2 bg-color-accent text-white rounded-lg hover:bg-color-accent/80 transition-colors"
                  >
                    Insert into Note
                  </button>

                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this image? This action cannot be undone.')) {
                        onDeleteImage(selectedImage.id);
                        setSelectedImage(null);
                      }
                    }}
                    className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Delete Image
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
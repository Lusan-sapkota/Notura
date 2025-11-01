import { useState } from 'react';
import { Modal } from './Modal';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertImage: (imageMarkdown: string) => void;
  onUploadImage?: (file: File) => void;
}

export function ImageModal({ isOpen, onClose, onInsertImage, onUploadImage }: ImageModalProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [imageUrl, setImageUrl] = useState('');
  const [altText, setAltText] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onUploadImage) {
      setIsUploading(true);
      try {
        await onUploadImage(file);
        onClose();
        // Reset form
        setImageUrl('');
        setAltText('');
      } catch (error) {
        console.error('Failed to upload image:', error);
      } finally {
        setIsUploading(false);
      }
    }
    // Reset the input
    event.target.value = '';
  };

  const handleUrlInsert = () => {
    if (imageUrl.trim()) {
      const markdown = `![${altText || 'Image'}](${imageUrl.trim()})`;
      onInsertImage(markdown);
      onClose();
      // Reset form
      setImageUrl('');
      setAltText('');
    }
  };

  const handleClose = () => {
    onClose();
    // Reset form
    setImageUrl('');
    setAltText('');
    setActiveTab('upload');
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Insert Image">
      <div className="space-y-4">
        {/* Tab Navigation */}
        <div className="flex border-b border-color-text-muted/20">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'upload'
                ? 'border-color-accent text-color-accent'
                : 'border-transparent text-color-text-muted hover:text-color-text'
            }`}
          >
            Upload File
          </button>
          <button
            onClick={() => setActiveTab('url')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'url'
                ? 'border-color-accent text-color-accent'
                : 'border-transparent text-color-text-muted hover:text-color-text'
            }`}
          >
            From URL
          </button>
        </div>

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-color-text mb-2">
                Choose Image File
              </label>
              <div className="border-2 border-dashed border-color-text-muted/30 rounded-lg p-6 text-center hover:border-color-accent/50 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="image-upload"
                  disabled={isUploading}
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  <svg className="w-12 h-12 text-color-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <div className="text-color-text">
                    {isUploading ? 'Uploading...' : 'Click to upload or drag and drop'}
                  </div>
                  <div className="text-sm text-color-text-muted">
                    PNG, JPG, GIF up to 10MB
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* URL Tab */}
        {activeTab === 'url' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="image-url" className="block text-sm font-medium text-color-text mb-2">
                Image URL
              </label>
              <input
                type="url"
                id="image-url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full px-3 py-2 border border-color-text-muted/30 rounded-lg bg-bg-surface text-color-text placeholder-color-text-muted focus:outline-none focus:ring-2 focus:ring-color-accent focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="alt-text" className="block text-sm font-medium text-color-text mb-2">
                Alt Text (Optional)
              </label>
              <input
                type="text"
                id="alt-text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="Describe the image"
                className="w-full px-3 py-2 border border-color-text-muted/30 rounded-lg bg-bg-surface text-color-text placeholder-color-text-muted focus:outline-none focus:ring-2 focus:ring-color-accent focus:border-transparent"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-color-text-muted hover:text-color-text transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUrlInsert}
                disabled={!imageUrl.trim()}
                className="px-4 py-2 bg-color-accent text-white rounded-lg hover:bg-color-accent/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Insert Image
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
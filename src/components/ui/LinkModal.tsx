import { useState } from 'react';
import { Modal } from './Modal';

interface LinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (linkMarkdown: string) => void;
}

export function LinkModal({ isOpen, onClose, onConfirm }: LinkModalProps) {
  const [text, setText] = useState('Link text');
  const [url, setUrl] = useState('https://example.com');

  const generateLink = () => {
    return `[${text.trim()}](${url.trim()})`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && url.trim()) {
      onConfirm(generateLink());
      onClose();
    }
  };

  const handleClose = () => {
    setText('Link text');
    setUrl('https://example.com');
    onClose();
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const isValid = text.trim() && url.trim() && isValidUrl(url.trim());

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Link"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="link-text" className="block text-sm font-medium text-color-text mb-2">
            Link Text
          </label>
          <input
            id="link-text"
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter link text..."
            className="w-full px-3 py-2 bg-bg-primary border border-color-text-muted/20 
                       rounded text-color-text placeholder-color-text-muted 
                       focus:outline-none focus:border-color-accent focus:ring-1 focus:ring-color-accent"
            autoFocus
          />
          {!text.trim() && text.length > 0 && (
            <p className="text-red-400 text-sm mt-1">Link text cannot be empty</p>
          )}
        </div>

        <div>
          <label htmlFor="link-url" className="block text-sm font-medium text-color-text mb-2">
            URL
          </label>
          <input
            id="link-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full px-3 py-2 bg-bg-primary border border-color-text-muted/20 
                       rounded text-color-text placeholder-color-text-muted 
                       focus:outline-none focus:border-color-accent focus:ring-1 focus:ring-color-accent"
          />
          {url.trim() && !isValidUrl(url.trim()) && (
            <p className="text-red-400 text-sm mt-1">Please enter a valid URL</p>
          )}
          {!url.trim() && url.length > 0 && (
            <p className="text-red-400 text-sm mt-1">URL cannot be empty</p>
          )}
        </div>

        {/* Preview */}
        <div>
          <label className="block text-sm font-medium text-color-text mb-2">
            Preview
          </label>
          <div className="p-3 bg-bg-primary border border-color-text-muted/20 rounded">
            {isValid ? (
              <a 
                href={url.trim()} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-color-accent hover:underline"
              >
                {text.trim()}
              </a>
            ) : (
              <span className="text-color-text-muted">
                {text.trim() || 'Link text'} → {url.trim() || 'URL'}
              </span>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-color-text-muted hover:text-color-text 
                       hover:bg-color-primary/10 rounded transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isValid}
            className="px-4 py-2 bg-color-accent text-white rounded 
                       hover:bg-color-accent/80 disabled:opacity-50 
                       disabled:cursor-not-allowed transition-colors"
          >
            Create Link
          </button>
        </div>
      </form>
    </Modal>
  );
}
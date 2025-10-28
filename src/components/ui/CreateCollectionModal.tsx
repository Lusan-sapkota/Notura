import { useState } from 'react';
import { Modal } from './Modal';
import { Input } from './Input';

interface CreateCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateCollection: (name: string, description?: string, parentId?: string) => void;
  parentCollection?: { id: string; name: string } | null;
}

export function CreateCollectionModal({ 
  isOpen, 
  onClose, 
  onCreateCollection, 
  parentCollection 
}: CreateCollectionModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onCreateCollection(
        name.trim(), 
        description.trim() || undefined, 
        parentCollection?.id
      );
      
      // Reset form
      setName('');
      setDescription('');
      onClose();
    } catch (error) {
      console.error('Failed to create collection:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      title={parentCollection ? `New Collection in "${parentCollection.name}"` : 'New Collection'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="collection-name" className="block text-sm font-medium text-color-text mb-2">
            Collection Name *
          </label>
          <Input
            id="collection-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter collection name..."
            required
            autoFocus
          />
        </div>

        <div>
          <label htmlFor="collection-description" className="block text-sm font-medium text-color-text mb-2">
            Description (optional)
          </label>
          <textarea
            id="collection-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter collection description..."
            rows={3}
            className="w-full px-3 py-2 bg-bg-primary border border-color-text-muted/20 rounded-lg 
                     text-color-text placeholder-color-text-muted resize-none
                     focus:outline-none focus:ring-2 focus:ring-color-primary focus:border-transparent"
          />
        </div>

        {parentCollection && (
          <div className="p-3 bg-bg-primary rounded-lg border border-color-text-muted/20">
            <div className="flex items-center space-x-2 text-sm text-color-text-muted">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2V7z" />
              </svg>
              <span>Will be created inside: <strong className="text-color-text">{parentCollection.name}</strong></span>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-color-text-muted hover:text-color-text transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!name.trim() || isSubmitting}
            className="px-4 py-2 bg-color-primary text-white rounded-lg hover:bg-color-primary/90 
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Creating...' : 'Create Collection'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
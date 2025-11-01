import { useState } from 'react';
import { Modal } from './Modal';

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string) => void;
  parentFolderName?: string;
}

export function CreateFolderModal({ isOpen, onClose, onConfirm, parentFolderName }: CreateFolderModalProps) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onConfirm(name.trim());
      setName('');
      onClose();
    }
  };

  const handleClose = () => {
    setName('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={parentFolderName ? `New Folder in "${parentFolderName}"` : 'New Folder'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="folder-name" className="block text-sm font-medium text-color-text mb-2">
            Folder Name
          </label>
          <input
            id="folder-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter folder name..."
            className="w-full px-3 py-2 bg-bg-primary border border-color-text-muted/20 
                       rounded text-color-text placeholder-color-text-muted 
                       focus:outline-none focus:border-color-accent focus:ring-1 focus:ring-color-accent"
            autoFocus
          />
          {!name.trim() && name.length > 0 && (
            <p className="text-red-400 text-sm mt-1">Name cannot be empty</p>
          )}
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
            disabled={!name.trim()}
            className="px-4 py-2 bg-color-accent text-white rounded 
                       hover:bg-color-accent/80 disabled:opacity-50 
                       disabled:cursor-not-allowed transition-colors"
          >
            Create Folder
          </button>
        </div>
      </form>
    </Modal>
  );
}
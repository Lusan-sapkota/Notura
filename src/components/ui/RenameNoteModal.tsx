import { useState, useEffect } from 'react';
import { Modal } from './Modal';

interface RenameNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (title: string) => void;
  currentTitle: string;
}

export function RenameNoteModal({ isOpen, onClose, onConfirm, currentTitle }: RenameNoteModalProps) {
  const [title, setTitle] = useState(currentTitle);

  useEffect(() => {
    if (isOpen) {
      setTitle(currentTitle);
    }
  }, [isOpen, currentTitle]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && title.trim() !== currentTitle) {
      onConfirm(title.trim());
      onClose();
    }
  };

  const handleClose = () => {
    setTitle(currentTitle);
    onClose();
  };

  const isValid = title.trim() && title.trim() !== currentTitle;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Rename Note"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="note-title" className="block text-sm font-medium text-color-text mb-2">
            Note Title
          </label>
          <input
            id="note-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter note title..."
            className="w-full px-3 py-2 bg-bg-primary border border-color-text-muted/20 
                       rounded text-color-text placeholder-color-text-muted 
                       focus:outline-none focus:border-color-accent focus:ring-1 focus:ring-color-accent"
            autoFocus
          />
          {!title.trim() && (
            <p className="text-red-400 text-sm mt-1">Title cannot be empty</p>
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
            disabled={!isValid}
            className="px-4 py-2 bg-color-accent text-white rounded 
                       hover:bg-color-accent/80 disabled:opacity-50 
                       disabled:cursor-not-allowed transition-colors"
          >
            Rename
          </button>
        </div>
      </form>
    </Modal>
  );
}
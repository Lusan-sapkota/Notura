import { useState } from 'react';
import { Modal } from './Modal';

interface ChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (checklistMarkdown: string) => void;
}

interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export function ChecklistModal({ isOpen, onClose, onConfirm }: ChecklistModalProps) {
  const [items, setItems] = useState<ChecklistItem[]>([
    { id: '1', text: 'Task 1', checked: false },
    { id: '2', text: 'Task 2', checked: false },
    { id: '3', text: 'Completed task', checked: true }
  ]);

  const addItem = () => {
    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      text: `Task ${items.length + 1}`,
      checked: false
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, updates: Partial<ChecklistItem>) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const generateChecklist = () => {
    return items
      .map(item => `- [${item.checked ? 'x' : ' '}] ${item.text}`)
      .join('\n');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length > 0) {
      onConfirm(generateChecklist());
      onClose();
    }
  };

  const handleClose = () => {
    // Reset to defaults
    setItems([
      { id: '1', text: 'Task 1', checked: false },
      { id: '2', text: 'Task 2', checked: false },
      { id: '3', text: 'Completed task', checked: true }
    ]);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Checklist"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-color-text">
              Checklist Items
            </label>
            <button
              type="button"
              onClick={addItem}
              className="px-3 py-1 text-sm bg-color-accent text-white rounded 
                         hover:bg-color-accent/80 transition-colors"
            >
              Add Item
            </button>
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {items.map((item, index) => (
              <div key={item.id} className="flex items-center space-x-2 p-2 bg-bg-primary rounded">
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={(e) => updateItem(item.id, { checked: e.target.checked })}
                  className="w-4 h-4 text-color-accent bg-bg-surface border-color-text-muted/20 
                             rounded focus:ring-color-accent focus:ring-2"
                />
                <input
                  type="text"
                  value={item.text}
                  onChange={(e) => updateItem(item.id, { text: e.target.value })}
                  className="flex-1 px-2 py-1 bg-bg-surface border border-color-text-muted/20 
                             rounded text-color-text focus:outline-none focus:border-color-accent"
                  placeholder={`Task ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="p-1 text-red-400 hover:text-red-300 hover:bg-red-400/10 
                             rounded transition-colors"
                  disabled={items.length <= 1}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
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
            disabled={items.length === 0}
            className="px-4 py-2 bg-color-accent text-white rounded 
                       hover:bg-color-accent/80 disabled:opacity-50 
                       disabled:cursor-not-allowed transition-colors"
          >
            Create Checklist
          </button>
        </div>
      </form>
    </Modal>
  );
}
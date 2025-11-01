import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ContextMenuAction } from '../../types/notes';

interface ContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  actions: ContextMenuAction[];
  onClose: () => void;
}

export function ContextMenu({ isOpen, position, actions, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState({ x: position.x, y: position.y });

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Update position when menu opens or position changes
  useLayoutEffect(() => {
    if (!isOpen || !menuRef.current) return;

    const menu = menuRef.current;
    const rect = menu.getBoundingClientRect();
    
    let adjustedX = position.x;
    let adjustedY = position.y;
    
    // Get viewport dimensions with padding
    const viewportWidth = window.innerWidth - 16;
    const viewportHeight = window.innerHeight - 16;
    
    // Prevent horizontal cutoff
    if (position.x + rect.width > viewportWidth) {
      adjustedX = Math.max(8, position.x - rect.width);
      // If still doesn't fit, center it
      if (adjustedX < 8) {
        adjustedX = Math.max(8, (viewportWidth - rect.width) / 2);
      }
    }
    
    // Prevent vertical cutoff
    if (position.y + rect.height > viewportHeight) {
      adjustedY = Math.max(8, position.y - rect.height);
      // If still doesn't fit, position near top
      if (adjustedY < 8) {
        adjustedY = 8;
      }
    }
    
    // Final bounds check
    adjustedX = Math.max(8, Math.min(adjustedX, viewportWidth - rect.width));
    adjustedY = Math.max(8, Math.min(adjustedY, viewportHeight - rect.height));
    
    setAdjustedPosition({ x: adjustedX, y: adjustedY });
  }, [isOpen, position.x, position.y]);

  if (!isOpen) return null;

  const menuContent = (
    <div
      ref={menuRef}
      className="fixed z-[9999] bg-bg-surface border border-color-text-muted/20 rounded-lg shadow-2xl py-2 min-w-48 max-w-64 backdrop-blur-sm max-h-80 overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-100"
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
        position: 'fixed',
        zIndex: 9999,
      }}
    >
      {actions.map((action, index) => (
        <div key={action.id}>
          {action.separator && index > 0 && (
            <div className="h-px bg-color-text-muted/20 mx-2 my-1" />
          )}
          <button
            onClick={() => {
              action.action();
              onClose();
            }}
            className={`w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center space-x-3 ${
              action.destructive 
                ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300' 
                : 'text-color-text hover:bg-color-primary/10'
            }`}
          >
            {action.icon && (
              <span className="w-4 h-4 flex items-center justify-center">
                {typeof action.icon === 'function' ? action.icon() : action.icon}
              </span>
            )}
            <span className="flex-1">{action.label}</span>
          </button>
        </div>
      ))}
    </div>
  );

  // Render the context menu using a portal to ensure it's not clipped by parent containers
  return createPortal(menuContent, document.body);
}
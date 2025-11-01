import { useState, useCallback } from 'react';

export interface Tab {
  id: string;
  title: string;
  content: string;
  isDirty?: boolean;
  isActive?: boolean;
}

interface TabSystemProps {
  tabs: Tab[];
  activeTabId: string;
  onTabSelect: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onTabCreate: () => void;
  onTabRename: (tabId: string, newTitle: string) => void;
  className?: string;
}

export function TabSystem({
  tabs,
  activeTabId,
  onTabSelect,
  onTabClose,
  onTabCreate,
  onTabRename,
  className = ''
}: TabSystemProps) {
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const handleTabDoubleClick = useCallback((tab: Tab) => {
    setEditingTabId(tab.id);
    setEditingTitle(tab.title);
  }, []);

  const handleTitleSave = useCallback(() => {
    if (editingTabId && editingTitle.trim()) {
      onTabRename(editingTabId, editingTitle.trim());
    }
    setEditingTabId(null);
    setEditingTitle('');
  }, [editingTabId, editingTitle, onTabRename]);

  const handleTitleCancel = useCallback(() => {
    setEditingTabId(null);
    setEditingTitle('');
  }, []);

  return (
    <div className={`flex items-center ${className}`}>
      {/* Tabs */}
      <div className="flex items-center overflow-x-auto tab-scrollbar flex-1 min-w-0">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', tab.id);
              e.dataTransfer.effectAllowed = 'move';
            }}
            className={`group flex items-center min-w-24 max-w-48 transition-all duration-200 cursor-pointer flex-shrink-0 relative ${
              tab.id === activeTabId
                ? 'bg-color-accent/10 text-color-accent border-l-2 border-color-accent'
                : 'hover:bg-color-primary/10 text-color-text-muted hover:text-color-text'
            } rounded-t-lg mx-1`}
          >
            <button
              onClick={() => onTabSelect(tab.id)}
              onDoubleClick={() => handleTabDoubleClick(tab)}
              onContextMenu={(e) => {
                e.preventDefault();
                // Right-click context menu could be added here
              }}
              className="flex items-center space-x-2 px-3 py-1.5 min-w-0 flex-1 text-left"
            >
              {/* File Icon */}
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>

              {/* Tab Title */}
              {editingTabId === tab.id ? (
                <input
                  type="text"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onBlur={handleTitleSave}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleTitleSave();
                    if (e.key === 'Escape') handleTitleCancel();
                  }}
                  className="bg-transparent border border-color-accent rounded px-1 text-xs min-w-0 flex-1 focus:outline-none"
                  autoFocus
                />
              ) : (
                <span className="text-xs font-medium truncate min-w-0 flex-1">
                  {tab.title}
                </span>
              )}

              {/* Dirty Indicator */}
              {tab.isDirty && (
                <div className="w-1.5 h-1.5 bg-color-accent rounded-full flex-shrink-0" />
              )}
            </button>

            {/* Close Button */}
            {tabs.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTabClose(tab.id);
                }}
                className="p-0.5 rounded hover:bg-color-text-muted/20 opacity-0 group-hover:opacity-100 transition-opacity mr-1"
                title="Close tab"
              >
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Separator after tabs */}
      <div className="w-px h-6 bg-color-text-muted/20 mx-2" />

      {/* New Tab Button */}
      <button
        onClick={onTabCreate}
        className="p-1.5 hover:bg-color-primary/10 text-color-text-muted hover:text-color-text transition-colors rounded"
        title="New tab"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
}
import { useState, useCallback } from 'react';
import { useTheme } from '../../contexts';
import { NoturaLogo } from '../ui';
import { CreateCollectionModal } from '../ui/CreateCollectionModal';
import type { Collection } from '../../types';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onMobileClose?: () => void;
  isMobile?: boolean;
}

export function Sidebar({ isCollapsed, onToggleCollapse, onMobileClose, isMobile = false }: SidebarProps) {
  const { currentTheme, toggleTheme } = useTheme();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [parentCollection, setParentCollection] = useState<{ id: string; name: string } | null>(null);
  const [collections, setCollections] = useState<Collection[]>([
    {
      id: '1',
      name: 'Work Projects',
      description: 'Work-related notes and projects',
      parentId: undefined,
      color: '#3B82F6',
      icon: 'folder',
      sortOrder: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      name: 'Meeting Notes',
      description: 'Notes from meetings',
      parentId: '1',
      color: '#10B981',
      icon: 'document',
      sortOrder: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '3',
      name: 'Project Ideas',
      description: 'Ideas for future projects',
      parentId: '1',
      color: '#F59E0B',
      icon: 'document',
      sortOrder: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '4',
      name: 'Personal',
      description: 'Personal notes',
      parentId: undefined,
      color: '#EF4444',
      icon: 'folder',
      sortOrder: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);

  const handleCreateCollection = useCallback(async (name: string, description?: string, parentId?: string) => {
    // In a real app, this would call the Tauri backend
    const newCollection: Collection = {
      id: Date.now().toString(),
      name,
      description,
      parentId: parentId || undefined,
      color: '#6366F1',
      icon: 'folder',
      sortOrder: collections.filter(c => c.parentId === parentId).length + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setCollections(prev => [...prev, newCollection]);
  }, [collections]);

  const openCreateModal = useCallback((parent?: { id: string; name: string }) => {
    setParentCollection(parent || null);
    setIsCreateModalOpen(true);
  }, []);

  const handleDragStart = useCallback((e: React.DragEvent, collectionId: string) => {
    setDraggedItem(collectionId);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, collectionId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTarget(collectionId);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDropTarget(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetCollectionId: string) => {
    e.preventDefault();
    
    if (draggedItem && draggedItem !== targetCollectionId) {
      // Prevent dropping a parent into its own child
      const draggedCollection = collections.find(c => c.id === draggedItem);
      const isChildOfDragged = (id: string): boolean => {
        const collection = collections.find(c => c.id === id);
        if (!collection || !collection.parentId) return false;
        if (collection.parentId === draggedItem) return true;
        return isChildOfDragged(collection.parentId);
      };

      if (!isChildOfDragged(targetCollectionId)) {
        setCollections(prev => 
          prev.map(c => 
            c.id === draggedItem 
              ? { ...c, parentId: targetCollectionId, updatedAt: new Date() }
              : c
          )
        );
      }
    }
    
    setDraggedItem(null);
    setDropTarget(null);
  }, [draggedItem, collections]);

  const renderCollection = useCallback((collection: Collection, level: number = 0) => {
    const children = collections.filter(c => c.parentId === collection.id);
    const isFolder = children.length > 0 || collection.icon === 'folder';
    const isDragTarget = dropTarget === collection.id;
    const isDragging = draggedItem === collection.id;

    return (
      <div key={collection.id} className={`${level > 0 ? 'ml-4' : ''}`}>
        <div 
          className={`p-2 rounded-lg cursor-pointer transition-colors group relative
            ${isDragging ? 'opacity-50' : ''}
            ${isDragTarget ? 'bg-color-primary/20 border-2 border-color-primary border-dashed' : 'hover:bg-color-primary/10'}
          `}
          draggable={!isDragging}
          onDragStart={(e) => handleDragStart(e, collection.id)}
          onDragOver={(e) => handleDragOver(e, collection.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, collection.id)}
        >
          <div className="flex items-center space-x-3">
            <svg 
              className={`w-4 h-4 ${isFolder ? 'text-color-secondary' : 'text-color-primary'}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              {isFolder ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              )}
            </svg>
            <span className="text-color-text flex-1">{collection.name}</span>
            <div className="flex items-center space-x-1">
              <span className="text-xs text-color-text-muted">{children.length}</span>
              {isFolder && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openCreateModal({ id: collection.id, name: collection.name });
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-color-primary/20 transition-all"
                  title="Add subcollection"
                >
                  <svg className="w-3 h-3 text-color-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Render children */}
        {children.map(child => renderCollection(child, level + 1))}
      </div>
    );
  }, [collections, draggedItem, dropTarget, handleDragStart, handleDragOver, handleDragLeave, handleDrop, openCreateModal]);

  return (
    <aside 
      className={`
        bg-bg-surface border-r border-color-text-muted/20 
        transition-all duration-200 ease-in-out
        flex flex-col h-full
        ${isMobile ? 'w-64 sm:w-72' : ''}
        ${!isMobile && isCollapsed ? 'w-16' : ''}
        ${!isMobile && !isCollapsed ? 'w-60 lg:w-64 xl:w-72' : ''}
      `}
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-color-text-muted/20">
        <div className="flex items-center justify-between">
          {(!isCollapsed || isMobile) ? (
            <div className="flex items-center space-x-3">
              <NoturaLogo size="md" className="text-color-primary" />
              <h1 className="text-lg sm:text-xl font-bold text-color-primary">
                Notura
              </h1>
            </div>
          ) : (
            <NoturaLogo size="sm" className="text-color-primary" />
          )}
          <div className="flex items-center space-x-2">
            {isMobile && onMobileClose && (
              <button
                onClick={onMobileClose}
                className="p-2 rounded-lg hover:bg-color-primary/10 transition-colors lg:hidden"
                aria-label="Close menu"
              >
                <svg className="w-5 h-5 text-color-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            <button
              onClick={onToggleCollapse}
              className="p-2 rounded-lg hover:bg-color-primary/10 transition-colors"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <svg 
                className="w-5 h-5 text-color-text-muted" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                {isCollapsed ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Search Section */}
      {(!isCollapsed || isMobile) && (
        <div className="p-3 sm:p-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search notes..."
              className="w-full px-3 py-2 pl-10 text-sm sm:text-base bg-bg-primary border border-color-text-muted/30 rounded-lg 
                         text-color-text placeholder-color-text-muted
                         focus:outline-none focus:ring-2 focus:ring-color-accent focus:border-transparent
                         transition-colors"
            />
            <svg 
              className="absolute left-3 top-2.5 w-4 h-4 text-color-text-muted" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      )}

      {/* Collections Section */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {(!isCollapsed || isMobile) && (
          <div className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs sm:text-sm font-semibold text-color-text-muted uppercase tracking-wide">
                Collections
              </h2>
              <button 
                onClick={() => openCreateModal()}
                className="p-1 rounded hover:bg-color-primary/10 transition-colors"
                title="Add Collection"
              >
                <svg className="w-4 h-4 text-color-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-1">
              {/* All Notes */}
              <div className="p-2 rounded-lg hover:bg-color-primary/10 cursor-pointer transition-colors">
                <div className="flex items-center space-x-3">
                  <svg className="w-4 h-4 text-color-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span className="text-color-text">All Notes</span>
                  <span className="ml-auto text-xs text-color-text-muted">12</span>
                </div>
              </div>

              {/* Dynamic Collections */}
              {collections
                .filter(c => !c.parentId)
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map(collection => renderCollection(collection))
              }
            </div>

            {/* Add new folder/collection button */}
            <div className="mt-4 pt-2 border-t border-color-text-muted/20">
              <button 
                onClick={() => openCreateModal()}
                className="w-full p-2 text-sm text-color-primary hover:text-color-secondary hover:bg-color-primary/10 rounded-lg transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>New Folder</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer with Theme Toggle */}
      <div className="p-4 border-t border-color-text-muted/20">
        <button
          onClick={toggleTheme}
          className="w-full p-2 rounded-lg hover:bg-color-primary/10 transition-colors
                     flex items-center justify-center space-x-2"
          aria-label={`Switch to ${currentTheme.name === 'cyber-amber' ? 'light' : 'dark'} theme`}
        >
          {currentTheme.name === 'cyber-amber' ? (
            <>
              <svg className="w-5 h-5 text-color-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              {!isCollapsed && <span className="text-color-text-muted">Light Mode</span>}
            </>
          ) : (
            <>
              <svg className="w-5 h-5 text-color-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              {!isCollapsed && <span className="text-color-text-muted">Dark Mode</span>}
            </>
          )}
        </button>
      </div>

      {/* Create Collection Modal */}
      <CreateCollectionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateCollection={handleCreateCollection}
        parentCollection={parentCollection}
      />
    </aside>
  );
}
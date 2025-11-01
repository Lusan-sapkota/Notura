import React, { useState, useCallback } from 'react';
import { useTheme } from '../../contexts';
import { NoturaLogo, ContextMenu, CreateNoteModal, CreateFolderModal, RenameNoteModal, ConfirmationModal } from '../ui';
import { Note, Folder, ContextMenuAction } from '../../types/notes';

interface EnhancedSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onMobileClose?: () => void;
  isMobile?: boolean;
  notes: Note[];
  folders: Folder[];
  onNoteSelect: (note: Note) => void;
  onNoteCreate: (folderId?: string, title?: string, content?: string) => Note;
  onTabCreate: (note: Note) => void;
  onNoteUpdate: (noteId: string, updates: Partial<Note>) => void;
  onNoteDelete: (noteId: string) => void;
  onFolderCreate: (name?: string, parentId?: string) => Folder;
  onFolderUpdate: (folderId: string, updates: Partial<Folder>) => void;
  onFolderDelete: (folderId: string) => void;
  onFolderToggle: (folderId: string) => void;
  onNoteMove: (noteId: string, targetFolderId?: string) => void;
  onFolderMove: (folderId: string, targetParentId?: string) => void;
}

export function EnhancedSidebar({ 
  isCollapsed, 
  onToggleCollapse, 
  onMobileClose, 
  isMobile = false,
  notes,
  folders,
  onNoteSelect,
  onNoteCreate,
  onTabCreate,
  onNoteUpdate,
  onNoteDelete,
  onFolderCreate,
  onFolderUpdate,
  onFolderDelete,
  onFolderToggle,
  onNoteMove,
  onFolderMove
}: EnhancedSidebarProps) {
  const { currentTheme, toggleTheme } = useTheme();

  // Modal states
  const [createNoteModal, setCreateNoteModal] = useState<{
    isOpen: boolean;
    folderId?: string;
    folderName?: string;
  }>({
    isOpen: false,
  });

  const [createFolderModal, setCreateFolderModal] = useState<{
    isOpen: boolean;
    parentId?: string;
    parentName?: string;
  }>({
    isOpen: false,
  });

  const [renameNoteModal, setRenameNoteModal] = useState<{
    isOpen: boolean;
    note?: Note;
  }>({
    isOpen: false,
  });

  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    destructive?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    position: { x: number; y: number };
    actions: ContextMenuAction[];
  }>({
    isOpen: false,
    position: { x: 0, y: 0 },
    actions: [],
  });

  // Drag and drop state
  const [draggedItem, setDraggedItem] = useState<{ type: 'note' | 'folder'; id: string } | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'notes' | 'folders'>('notes');
  const [selectedTag, setSelectedTag] = useState<string>('');

  // Get all unique tags from notes
  const allTags = Array.from(new Set(notes.flatMap(note => note.tags))).sort();

  // Filter notes based on search and tag
  const filteredNotes = notes.filter(note => {
    const matchesSearch = searchMode === 'notes' 
      ? note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    
    const matchesTag = selectedTag === '' || note.tags.includes(selectedTag);
    
    return matchesSearch && matchesTag;
  });

  // Filter folders based on search
  const filteredFolders = folders.filter(folder => {
    return searchMode === 'folders' 
      ? folder.name.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
  });

  const handleFolderToggle = useCallback((folderId: string) => {
    onFolderToggle(folderId);
  }, [onFolderToggle]);

  const handleNoteContextMenu = useCallback((e: React.MouseEvent, note: Note) => {
    e.preventDefault();
    e.stopPropagation();
    
    const actions: ContextMenuAction[] = [
      {
        id: 'open',
        label: 'Open',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ),
        action: () => onNoteSelect(note),
      },
      {
        id: 'open-tab',
        label: 'Open in New Tab',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        ),
        action: () => onTabCreate(note),
      },
      {
        id: 'separator1',
        label: '',
        icon: '',
        action: () => {},
        separator: true,
      },
      {
        id: 'pin',
        label: note.isPinned ? 'Unpin' : 'Pin',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        ),
        action: () => {
          onNoteUpdate(note.id, { isPinned: !note.isPinned });
        },
      },
      {
        id: 'rename',
        label: 'Rename',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        ),
        action: () => {
          setRenameNoteModal({
            isOpen: true,
            note,
          });
        },
      },
      {
        id: 'duplicate',
        label: 'Duplicate',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        ),
        action: () => {
          setConfirmationModal({
            isOpen: true,
            title: 'Duplicate Note',
            message: `Are you sure you want to duplicate "${note.title}"?`,
            onConfirm: () => {
              onNoteCreate(note.folderId, `${note.title} (Copy)`, note.content);
            },
          });
        },
      },
      {
        id: 'separator2',
        label: '',
        icon: '',
        action: () => {},
        separator: true,
      },
      {
        id: 'delete',
        label: 'Delete',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        ),
        action: () => {
          setConfirmationModal({
            isOpen: true,
            title: 'Delete Note',
            message: `Are you sure you want to delete "${note.title}"? This action cannot be undone.`,
            onConfirm: () => {
              onNoteDelete(note.id);
            },
            destructive: true,
          });
        },
        destructive: true,
      },
    ];

    setContextMenu({
      isOpen: true,
      position: { x: e.clientX, y: e.clientY },
      actions,
    });
  }, [onNoteSelect, onTabCreate, onNoteUpdate, onNoteCreate, onNoteDelete]);

  const handleFolderContextMenu = useCallback((e: React.MouseEvent, folder: Folder) => {
    e.preventDefault();
    e.stopPropagation();
    
    const actions: ContextMenuAction[] = [
      {
        id: 'new-note',
        label: 'New Note',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ),
        action: () => {
          setCreateNoteModal({
            isOpen: true,
            folderId: folder.id,
            folderName: folder.name,
          });
        },
      },
      {
        id: 'new-folder',
        label: 'New Folder',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        ),
        action: () => {
          setCreateFolderModal({
            isOpen: true,
            parentId: folder.id,
            parentName: folder.name,
          });
        },
      },
      {
        id: 'separator1',
        label: '',
        icon: '',
        action: () => {},
        separator: true,
      },
      {
        id: 'rename',
        label: 'Rename',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        ),
        action: () => {
          const newName = prompt('Enter new name:', folder.name);
          if (newName && newName.trim()) {
            onFolderUpdate(folder.id, { name: newName.trim() });
          }
        },
      },
      {
        id: 'separator2',
        label: '',
        icon: '',
        action: () => {},
        separator: true,
      },
      {
        id: 'delete',
        label: 'Delete',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        ),
        action: () => {
          setConfirmationModal({
            isOpen: true,
            title: 'Delete Folder',
            message: `Are you sure you want to delete "${folder.name}" and all its contents? This action cannot be undone.`,
            onConfirm: () => {
              onFolderDelete(folder.id);
            },
            destructive: true,
          });
        },
        destructive: true,
      },
    ];

    setContextMenu({
      isOpen: true,
      position: { x: e.clientX, y: e.clientY },
      actions,
    });
  }, [onNoteCreate, onFolderCreate, onFolderUpdate, onFolderDelete]);

  // Drag and drop handlers
  const handleDragStart = useCallback((e: React.DragEvent, type: 'note' | 'folder', id: string) => {
    setDraggedItem({ type, id });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({ type, id }));
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTarget(targetId);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    
    if (draggedItem) {
      if (draggedItem.type === 'note') {
        // Move note to folder
        onNoteMove(draggedItem.id, targetId === 'root' ? undefined : targetId);
        
        // If dropped on tab area, open in new tab
        if (targetId === 'tab-area') {
          const note = notes.find(n => n.id === draggedItem.id);
          if (note) {
            onTabCreate(note);
          }
        }
      } else if (draggedItem.type === 'folder') {
        // Move folder
        onFolderMove(draggedItem.id, targetId === 'root' ? undefined : targetId);
      }
    }
    
    setDraggedItem(null);
    setDropTarget(null);
  }, [draggedItem, notes, onTabCreate, onNoteMove, onFolderMove]);

  const renderFolder = useCallback((folder: Folder, level: number = 0) => {
    const children = filteredFolders.filter(f => f.parentId === folder.id);
    const folderNotes = filteredNotes.filter(n => n.folderId === folder.id);
    const isDragTarget = dropTarget === folder.id;
    const isDragging = draggedItem?.type === 'folder' && draggedItem.id === folder.id;

    return (
      <div key={folder.id} className={`${level > 0 ? 'ml-4' : ''}`}>
        <div 
          className={`p-2 rounded-lg cursor-pointer transition-colors group relative
            ${isDragging ? 'opacity-50' : ''}
            ${isDragTarget ? 'bg-color-primary/20 border border-color-primary border-dashed' : 'hover:bg-color-primary/10'}
          `}
          draggable={!isDragging}
          onDragStart={(e) => handleDragStart(e, 'folder', folder.id)}
          onDragOver={(e) => handleDragOver(e, folder.id)}
          onDrop={(e) => handleDrop(e, folder.id)}
          onContextMenu={(e) => handleFolderContextMenu(e, folder)}
        >
          <div className="flex items-center space-x-2">
            <svg 
              className={`w-4 h-4 text-color-secondary transition-transform cursor-pointer ${
                folder.isExpanded ? 'rotate-90' : ''
              }`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              onClick={(e) => {
                e.stopPropagation();
                handleFolderToggle(folder.id);
              }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <svg className="w-4 h-4 text-color-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <span 
              className="text-color-text flex-1 cursor-pointer" 
              onClick={(e) => {
                e.stopPropagation();
                handleFolderToggle(folder.id);
              }}
            >
              {folder.name}
            </span>
            <span className="text-xs text-color-text-muted mr-1">{folderNotes.length}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCreateNoteModal({
                  isOpen: true,
                  folderId: folder.id,
                  folderName: folder.name,
                });
              }}
              className="p-1 rounded hover:bg-color-primary/20 transition-colors"
              title="New Note"
            >
              <svg className="w-3 h-3 text-color-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Render children when expanded */}
        {folder.isExpanded && (
          <div className="ml-4">
            {/* Child folders */}
            {children.map(child => renderFolder(child, level + 1))}
            
            {/* Notes in this folder */}
            {folderNotes.map(note => (
              <div
                key={note.id}
                className={`p-2 rounded-lg cursor-pointer transition-colors group hover:bg-color-primary/10 ${
                  draggedItem?.type === 'note' && draggedItem.id === note.id ? 'opacity-50' : ''
                }`}
                draggable
                onDragStart={(e) => handleDragStart(e, 'note', note.id)}
                onClick={() => onNoteSelect(note)}
                onContextMenu={(e) => handleNoteContextMenu(e, note)}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-color-primary ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-color-text flex-1 truncate">{note.title}</span>
                  {note.isPinned && (
                    <svg className="w-3 h-3 text-color-accent" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                    </svg>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }, [filteredFolders, filteredNotes, dropTarget, draggedItem, handleDragStart, handleDragOver, handleDrop, handleFolderToggle, handleFolderContextMenu, handleNoteContextMenu, onNoteSelect]);

  const rootFolders = filteredFolders.filter(f => !f.parentId);
  const rootNotes = filteredNotes.filter(n => !n.folderId);

  return (
    <>
      <aside 
        className="bg-bg-surface border-r border-color-text-muted/20 
                   transition-all duration-200 ease-in-out
                   flex flex-col h-full w-full"
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
          <div className="p-3 sm:p-4 space-y-3">
            {/* Search Bar with Mode Toggle */}
            <div className="relative">
              <input
                type="text"
                placeholder={searchMode === 'notes' ? 'Search notes...' : 'Search folders...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 pl-10 pr-12 text-sm bg-bg-primary border border-color-text-muted/30 rounded-lg 
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
              
              {/* Search Mode Toggle */}
              <button
                onClick={() => setSearchMode(searchMode === 'notes' ? 'folders' : 'notes')}
                className="absolute right-2 top-1.5 p-1 rounded hover:bg-color-primary/10 transition-colors"
                title={`Switch to ${searchMode === 'notes' ? 'folder' : 'note'} search`}
              >
                {searchMode === 'notes' ? (
                  <svg className="w-4 h-4 text-color-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-color-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Tag Filter */}
            {allTags.length > 0 && (
              <div className="relative">
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-bg-primary border border-color-text-muted/30 rounded-lg 
                             text-color-text focus:outline-none focus:ring-2 focus:ring-color-accent focus:border-transparent
                             transition-colors appearance-none cursor-pointer"
                >
                  <option value="">All tags</option>
                  {allTags.map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
                <svg 
                  className="absolute right-3 top-2.5 w-4 h-4 text-color-text-muted pointer-events-none" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 10l5 5 5-5" />
                </svg>
              </div>
            )}

            {/* Active Filters Display */}
            {(searchQuery || selectedTag) && (
              <div className="flex flex-wrap gap-2">
                {searchQuery && (
                  <div className="flex items-center space-x-1 px-2 py-1 bg-color-accent/10 text-color-accent text-xs rounded-full">
                    <span>Search: "{searchQuery}"</span>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="hover:bg-color-accent/20 rounded-full p-0.5"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
                {selectedTag && (
                  <div className="flex items-center space-x-1 px-2 py-1 bg-color-primary/10 text-color-text text-xs rounded-full">
                    <span>Tag: {selectedTag}</span>
                    <button
                      onClick={() => setSelectedTag('')}
                      className="hover:bg-color-primary/20 rounded-full p-0.5"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Notes Section */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {(!isCollapsed || isMobile) && (
            <div className="p-3 sm:p-4">
              {/* Quick Actions */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-semibold text-color-text-muted uppercase tracking-wide">
                  Notes
                </h2>
                <div className="flex items-center space-x-1">
                  <button 
                    onClick={() => {
                      setCreateNoteModal({
                        isOpen: true,
                      });
                    }}
                    className="p-1.5 rounded hover:bg-color-primary/10 transition-colors"
                    title="New Note"
                  >
                    <svg className="w-4 h-4 text-color-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => {
                      setCreateFolderModal({
                        isOpen: true,
                      });
                    }}
                    className="p-1.5 rounded hover:bg-color-primary/10 transition-colors"
                    title="New Folder"
                  >
                    <svg className="w-4 h-4 text-color-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="space-y-1">
                {/* All Notes */}
                <div className="p-2 rounded-lg hover:bg-color-primary/10 cursor-pointer transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <svg className="w-4 h-4 text-color-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <span className="text-color-text">All Notes</span>
                      <span className="text-xs text-color-text-muted">{filteredNotes.length}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const now = new Date();
                        const timestamp = now.toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        });
                        onNoteCreate(undefined, `Quick Note - ${timestamp}`);
                      }}
                      className="flex items-center space-x-1 px-2 py-1 rounded text-xs hover:bg-color-primary/20 transition-colors"
                      title="Create Quick Note"
                    >
                      <span className="text-color-text-muted">Quick</span>
                      <svg className="w-3 h-3 text-color-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Root folders */}
                {rootFolders.map(folder => renderFolder(folder))}

                {/* Root notes (notes without folder) */}
                {rootNotes.map(note => (
                  <div
                    key={note.id}
                    className={`p-2 rounded-lg cursor-pointer transition-colors group hover:bg-color-primary/10 ${
                      draggedItem?.type === 'note' && draggedItem.id === note.id ? 'opacity-50' : ''
                    }`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, 'note', note.id)}
                    onClick={() => onNoteSelect(note)}
                    onContextMenu={(e) => handleNoteContextMenu(e, note)}
                  >
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-color-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-color-text flex-1 truncate">{note.title}</span>
                      {note.isPinned && (
                        <svg className="w-3 h-3 text-color-accent" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                        </svg>
                      )}
                    </div>
                  </div>
                ))}
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
      </aside>

      {/* Context Menu */}
      <ContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        actions={contextMenu.actions}
        onClose={() => setContextMenu(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Create Note Modal */}
      <CreateNoteModal
        isOpen={createNoteModal.isOpen}
        onClose={() => setCreateNoteModal({ isOpen: false })}
        onConfirm={(title) => {
          onNoteCreate(createNoteModal.folderId, title);
        }}
        folderName={createNoteModal.folderName}
      />

      {/* Create Folder Modal */}
      <CreateFolderModal
        isOpen={createFolderModal.isOpen}
        onClose={() => setCreateFolderModal({ isOpen: false })}
        onConfirm={(name) => {
          onFolderCreate(name, createFolderModal.parentId);
        }}
        parentFolderName={createFolderModal.parentName}
      />

      {/* Rename Note Modal */}
      <RenameNoteModal
        isOpen={renameNoteModal.isOpen}
        onClose={() => setRenameNoteModal({ isOpen: false })}
        onConfirm={(title) => {
          if (renameNoteModal.note) {
            onNoteUpdate(renameNoteModal.note.id, { title });
          }
        }}
        currentTitle={renameNoteModal.note?.title || ''}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmationModal.onConfirm}
        title={confirmationModal.title}
        message={confirmationModal.message}
        destructive={confirmationModal.destructive}
        confirmText={confirmationModal.destructive ? 'Delete' : 'Confirm'}
      />
    </>
  );
}
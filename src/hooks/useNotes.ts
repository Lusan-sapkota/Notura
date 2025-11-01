import { useState, useCallback } from 'react';
import { Note, Folder } from '../types/notes';

export function useNotes() {
  // Sample data - in real app this would come from a store/API
  const [folders, setFolders] = useState<Folder[]>([
    {
      id: '1',
      name: 'Work Projects',
      color: '#3B82F6',
      icon: 'folder',
      createdAt: new Date(),
      updatedAt: new Date(),
      isExpanded: true,
    },
    {
      id: '2',
      name: 'Personal',
      color: '#EF4444',
      icon: 'folder',
      createdAt: new Date(),
      updatedAt: new Date(),
      isExpanded: false,
    },
    {
      id: '3',
      name: 'Meeting Notes',
      parentId: '1',
      color: '#10B981',
      icon: 'folder',
      createdAt: new Date(),
      updatedAt: new Date(),
      isExpanded: true,
    },
  ]);

  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      title: 'Project Roadmap',
      content: '# Project Roadmap\n\nThis is a sample note...',
      folderId: '1',
      tags: ['work', 'planning'],
      createdAt: new Date(),
      updatedAt: new Date(),
      isPinned: true,
      isArchived: false,
    },
    {
      id: '2',
      title: 'Daily Standup Notes',
      content: '# Daily Standup\n\n## Today\n- Review PRs\n- Fix bugs',
      folderId: '3',
      tags: ['meeting', 'daily'],
      createdAt: new Date(),
      updatedAt: new Date(),
      isPinned: false,
      isArchived: false,
    },
    {
      id: '3',
      title: 'Ideas for App',
      content: '# App Ideas\n\n1. Dark mode\n2. Tabs\n3. Search',
      folderId: '2',
      tags: ['ideas', 'personal'],
      createdAt: new Date(),
      updatedAt: new Date(),
      isPinned: false,
      isArchived: false,
    },
    {
      id: '4',
      title: 'Untitled Note',
      content: '',
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isPinned: false,
      isArchived: false,
    },
  ]);

  const createNote = useCallback((folderId?: string, title: string = 'Untitled Note', content: string = '') => {
    const newNote: Note = {
      id: Date.now().toString(),
      title,
      content,
      folderId,
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isPinned: false,
      isArchived: false,
    };
    
    setNotes(prev => [...prev, newNote]);
    return newNote;
  }, []);

  const updateNote = useCallback((noteId: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(note => 
      note.id === noteId 
        ? { ...note, ...updates, updatedAt: new Date() }
        : note
    ));
  }, []);

  const deleteNote = useCallback((noteId: string) => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
  }, []);

  const createFolder = useCallback((name: string = 'New Folder', parentId?: string) => {
    const newFolder: Folder = {
      id: Date.now().toString(),
      name,
      parentId,
      color: '#6366F1',
      icon: 'folder',
      createdAt: new Date(),
      updatedAt: new Date(),
      isExpanded: true,
    };
    
    setFolders(prev => [...prev, newFolder]);
    return newFolder;
  }, []);

  const updateFolder = useCallback((folderId: string, updates: Partial<Folder>) => {
    setFolders(prev => prev.map(folder => 
      folder.id === folderId 
        ? { ...folder, ...updates, updatedAt: new Date() }
        : folder
    ));
  }, []);

  const deleteFolder = useCallback((folderId: string) => {
    // Delete folder and all its children
    const getAllChildFolders = (parentId: string): string[] => {
      const children = folders.filter(f => f.parentId === parentId);
      let allChildren = children.map(f => f.id);
      children.forEach(child => {
        allChildren = [...allChildren, ...getAllChildFolders(child.id)];
      });
      return allChildren;
    };

    const foldersToDelete = [folderId, ...getAllChildFolders(folderId)];
    
    setFolders(prev => prev.filter(f => !foldersToDelete.includes(f.id)));
    setNotes(prev => prev.filter(n => !foldersToDelete.includes(n.folderId || '')));
  }, [folders]);

  const toggleFolderExpanded = useCallback((folderId: string) => {
    setFolders(prev => prev.map(folder => 
      folder.id === folderId 
        ? { ...folder, isExpanded: !folder.isExpanded }
        : folder
    ));
  }, []);

  const moveNote = useCallback((noteId: string, targetFolderId?: string) => {
    setNotes(prev => prev.map(note => 
      note.id === noteId 
        ? { ...note, folderId: targetFolderId, updatedAt: new Date() }
        : note
    ));
  }, []);

  const moveFolder = useCallback((folderId: string, targetParentId?: string) => {
    setFolders(prev => prev.map(folder => 
      folder.id === folderId 
        ? { ...folder, parentId: targetParentId, updatedAt: new Date() }
        : folder
    ));
  }, []);

  return {
    notes,
    folders,
    createNote,
    updateNote,
    deleteNote,
    createFolder,
    updateFolder,
    deleteFolder,
    toggleFolderExpanded,
    moveNote,
    moveFolder,
  };
}
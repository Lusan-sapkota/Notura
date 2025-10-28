import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Note, Collection, StorageInfo } from '../types';

// Mock data generators
export const createMockNote = (overrides: Partial<Note> = {}): Note => ({
  id: 'note-1',
  title: 'Test Note',
  content: 'This is a test note content',
  collectionId: undefined,
  tags: ['test'],
  createdAt: new Date('2025-01-01T00:00:00Z'),
  updatedAt: new Date('2025-01-01T00:00:00Z'),
  wordCount: 6,
  characterCount: 25,
  isArchived: false,
  ...overrides,
});

export const createMockCollection = (overrides: Partial<Collection> = {}): Collection => ({
  id: 'collection-1',
  name: 'Test Collection',
  description: 'A test collection',
  parentId: undefined,
  color: '#F0A500',
  icon: 'folder',
  sortOrder: 0,
  createdAt: new Date('2025-01-01T00:00:00Z'),
  updatedAt: new Date('2025-01-01T00:00:00Z'),
  ...overrides,
});

export const createMockStorageInfo = (overrides: Partial<StorageInfo> = {}): StorageInfo => ({
  totalNotes: 10,
  totalCollections: 3,
  databaseSize: 1024,
  lastBackup: new Date('2025-01-01T00:00:00Z'),
  ...overrides,
});

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialTheme?: 'cyber-amber' | 'zen-paper';
}

export const renderWithProviders = (
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) => {
  // Import ThemeProvider dynamically to avoid circular dependencies
  const { ThemeProvider } = require('../contexts');
  
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
      <ThemeProvider>
        {children}
      </ThemeProvider>
    );
  };

  return render(ui, { wrapper: Wrapper, ...options });
};

// Re-export everything from testing library
export * from '@testing-library/react';
export { renderWithProviders as render };
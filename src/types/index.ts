// Core data models
export interface Note {
  id: string;
  title: string;
  content: string;
  collectionId?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  wordCount: number;
  characterCount: number;
  isArchived: boolean;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  color?: string;
  icon?: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// Search and filtering types
export interface SearchResult {
  noteId: string;
  title: string;
  excerpt: string;
  highlights: string[];
  relevanceScore: number;
  lastModified: Date;
}

export interface SearchFilters {
  collections?: string[];
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  contentType?: 'all' | 'title' | 'content';
}

// Storage and metadata types
export interface StorageInfo {
  totalNotes: number;
  totalCollections: number;
  databaseSize: number;
  lastBackup?: Date;
}

// Theme configuration types
export type ThemeName = 'cyber-amber' | 'zen-paper';

export interface ThemeColors {
  background: string;
  surface: string;
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  textMuted: string;
}

export interface ThemeConfig {
  name: ThemeName;
  colors: ThemeColors;
}

export interface ThemeContextValue {
  currentTheme: ThemeConfig;
  toggleTheme: () => void;
  setTheme: (theme: ThemeName) => void;
}

// Component prop types
export interface NotesEditorProps {
  noteId: string;
  content: string;
  onContentChange: (content: string) => void;
  autoSave: boolean;
  showPreview: boolean;
}

export interface EditorState {
  content: string;
  wordCount: number;
  characterCount: number;
  lastSaved: Date;
  isDirty: boolean;
}

export interface CollectionTreeProps {
  collections: Collection[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onDragDrop: (noteId: string, targetCollectionId: string) => void;
}

export interface SearchEngineProps {
  query: string;
  filters: SearchFilters;
  onResultSelect: (noteId: string) => void;
  recentSearches: string[];
}

// Error handling types
export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export interface AppError {
  message: string;
  code?: string;
  details?: string;
}

// Export formats
export type ExportFormat = 'markdown' | 'json' | 'html';

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Tauri command types for frontend-backend communication
export interface TauriCommands {
  // Note operations
  create_note: (title: string, content: string, collectionId?: string) => Promise<Note>;
  update_note: (id: string, content: string) => Promise<Note>;
  delete_note: (id: string) => Promise<void>;
  get_note: (id: string) => Promise<Note>;
  get_all_notes: () => Promise<Note[]>;
  
  // Collection operations
  create_collection: (name: string, description?: string, parentId?: string) => Promise<Collection>;
  update_collection: (id: string, name: string, description?: string) => Promise<Collection>;
  delete_collection: (id: string) => Promise<void>;
  get_collection: (id: string) => Promise<Collection>;
  get_all_collections: () => Promise<Collection[]>;
  
  // Search operations
  search_notes: (query: string, filters: SearchFilters) => Promise<SearchResult[]>;
  
  // File operations
  export_notes: (format: ExportFormat, noteIds: string[]) => Promise<string>;
  import_notes: (filePath: string) => Promise<Note[]>;
  
  // Storage operations
  get_storage_info: () => Promise<StorageInfo>;
}

// Utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
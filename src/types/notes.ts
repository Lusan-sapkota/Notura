export interface Note {
  id: string;
  title: string;
  content: string;
  folderId?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  isPinned: boolean;
  isArchived: boolean;
}

export interface Folder {
  id: string;
  name: string;
  parentId?: string;
  color: string;
  icon: 'folder' | 'folder-open';
  createdAt: Date;
  updatedAt: Date;
  isExpanded: boolean;
}

export interface ContextMenuAction {
  id: string;
  label: string;
  icon: string | React.ReactElement | (() => React.ReactElement);
  action: () => void;
  separator?: boolean;
  destructive?: boolean;
}
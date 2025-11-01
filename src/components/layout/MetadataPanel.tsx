import { useState } from 'react';

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return date.toLocaleDateString();
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + sizes[i];
}

interface MetadataPanelProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobile?: boolean;
  stats?: {
    lines: number;
    words: number;
    characters: number;
    charactersNoSpaces: number;
    readingTime: number;
    paragraphs: number;
  };
  versionHistory?: Array<{
    id: string;
    content: string;
    timestamp: Date;
    description: string;
  }>;
  saveStatus?: 'saved' | 'saving' | 'unsaved';
  lastSaved?: string;
  images?: Array<{
    id: string;
    filename: string;
    originalName: string;
    size: number;
    type: string;
    createdAt: Date;
  }>;
  onShowImageGallery?: () => void;
  // Tag management props
  currentNoteTags?: string[];
  onTagAdd?: (tag: string) => void;
  onTagRemove?: (tag: string) => void;
  createdAt?: Date;
  updatedAt?: Date;
  // Import/Export props
  getActiveTab?: () => { id: string; title: string; content: string } | undefined;
  onImportNote?: (title: string, content: string) => void;
}

export function MetadataPanel({ 
  isCollapsed, 
  onToggleCollapse, 
  isMobile = false, 
  stats, 
  versionHistory, 
  saveStatus = 'saved', 
  lastSaved = '2 minutes ago',
  images = [],
  onShowImageGallery,
  currentNoteTags = [],
  onTagAdd,
  onTagRemove,
  createdAt,
  updatedAt,
  getActiveTab,
  onImportNote
}: MetadataPanelProps) {
  const [newTag, setNewTag] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  return (
    <aside 
      className={`
        ${isMobile ? 'w-full h-full' : 'bg-bg-surface border-l border-color-text-muted/20 h-full'}
        ${!isMobile ? 'transition-all duration-200 ease-in-out' : ''}
        flex flex-col
        ${!isMobile && isCollapsed ? 'w-0 overflow-hidden opacity-0' : ''}
        ${!isMobile && !isCollapsed ? 'w-64 lg:w-72 xl:w-80 opacity-100' : ''}
      `}
    >
      {/* Panel Header */}
      <div className="p-4 border-b border-color-text-muted/20">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-color-text">
            Note Details
          </h3>
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-lg hover:bg-color-primary/10 transition-colors"
            aria-label={isCollapsed ? 'Expand metadata panel' : 'Collapse metadata panel'}
          >
            <svg 
              className="w-4 h-4 text-color-text-muted" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Metadata Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-6 scrollbar-thin min-h-0" style={{ scrollbarWidth: 'thin' }}>
        {/* Save Status */}
        <div>
          <h4 className="text-sm font-semibold text-color-text-muted uppercase tracking-wide mb-3">
            Save Status
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-color-text-muted">Status</span>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  saveStatus === 'saved' ? 'bg-green-500' :
                  saveStatus === 'saving' ? 'bg-yellow-500 animate-pulse' :
                  'bg-orange-500'
                }`}></div>
                <span className="text-sm text-color-text">{
                  saveStatus === 'saved' ? 'Saved' :
                  saveStatus === 'saving' ? 'Saving...' :
                  'Unsaved'
                }</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-color-text-muted">Last saved</span>
              <span className="text-sm text-color-text">{lastSaved}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-color-text-muted">Auto-save</span>
              <span className="text-sm text-color-accent">Enabled</span>
            </div>
          </div>
        </div>

        {/* Timestamps */}
        <div>
          <h4 className="text-sm font-semibold text-color-text-muted uppercase tracking-wide mb-3">
            Timestamps
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-color-text-muted">Created</span>
              <span className="text-sm text-color-text">
                {createdAt ? formatRelativeTime(createdAt) : 'Unknown'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-color-text-muted">Modified</span>
              <span className="text-sm text-color-text">
                {updatedAt ? formatRelativeTime(updatedAt) : 'Unknown'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-color-text-muted">Last opened</span>
              <span className="text-sm text-color-text">Just now</span>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div>
          <h4 className="text-sm font-semibold text-color-text-muted uppercase tracking-wide mb-3">
            Statistics
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-color-text-muted">Lines</span>
              <span className="text-sm text-color-text font-mono">{stats?.lines || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-color-text-muted">Words</span>
              <span className="text-sm text-color-text font-mono">{stats?.words || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-color-text-muted">Characters</span>
              <span className="text-sm text-color-text font-mono">{stats?.characters || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-color-text-muted">Characters (no spaces)</span>
              <span className="text-sm text-color-text font-mono">{stats?.charactersNoSpaces || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-color-text-muted">Reading time</span>
              <span className="text-sm text-color-text">~{stats?.readingTime || 1} min</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-color-text-muted">Paragraphs</span>
              <span className="text-sm text-color-text font-mono">{stats?.paragraphs || 0}</span>
            </div>
          </div>
        </div>

        {/* Images */}
        {images.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-color-text-muted uppercase tracking-wide mb-3">
              Images ({images.length})
            </h4>
            <div className="space-y-2 mb-3">
              {images.slice(0, 3).map((image) => (
                <div key={image.id} className="flex items-center space-x-2 p-2 rounded bg-bg-primary/30">
                  <div className="w-8 h-8 bg-bg-primary rounded overflow-hidden flex-shrink-0">
                    <svg className="w-full h-full text-color-text-muted p-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-color-text truncate">{image.originalName}</p>
                    <p className="text-xs text-color-text-muted">
                      {formatFileSize(image.size)}
                    </p>
                  </div>
                </div>
              ))}
              {images.length > 3 && (
                <p className="text-xs text-color-text-muted">
                  +{images.length - 3} more images
                </p>
              )}
            </div>
            {onShowImageGallery && (
              <button 
                onClick={onShowImageGallery}
                className="text-sm text-color-primary hover:text-color-secondary transition-colors"
              >
                View all images
              </button>
            )}
          </div>
        )}

        {/* Tags */}
        <div>
          <h4 className="text-sm font-semibold text-color-text-muted uppercase tracking-wide mb-3">
            Tags ({currentNoteTags.length})
          </h4>
          
          {/* Existing Tags */}
          {currentNoteTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {currentNoteTags.map((tag, index) => (
                <div 
                  key={tag}
                  className={`flex items-center space-x-1 px-2 py-1 text-xs rounded-full ${
                    index % 3 === 0 ? 'bg-color-primary/20 text-color-primary' :
                    index % 3 === 1 ? 'bg-color-accent/20 text-color-accent' :
                    'bg-color-secondary/20 text-color-secondary'
                  }`}
                >
                  <span>{tag}</span>
                  {onTagRemove && (
                    <button
                      onClick={() => onTagRemove(tag)}
                      className="hover:bg-black/10 rounded-full p-0.5 transition-colors"
                      title={`Remove ${tag} tag`}
                    >
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add Tag Input */}
          {showTagInput ? (
            <div className="space-y-2 mb-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newTag.trim() && onTagAdd) {
                    onTagAdd(newTag.trim());
                    setNewTag('');
                    setShowTagInput(false);
                  } else if (e.key === 'Escape') {
                    setNewTag('');
                    setShowTagInput(false);
                  }
                }}
                placeholder="Enter tag name..."
                className="w-full px-2 py-1 text-xs bg-bg-primary border border-color-text-muted/30 rounded 
                           text-color-text placeholder-color-text-muted
                           focus:outline-none focus:ring-1 focus:ring-color-accent focus:border-transparent"
                autoFocus
              />
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    if (newTag.trim() && onTagAdd) {
                      onTagAdd(newTag.trim());
                      setNewTag('');
                      setShowTagInput(false);
                    }
                  }}
                  className="flex-1 px-2 py-1 bg-color-accent text-white text-xs rounded hover:bg-color-accent/80 transition-colors"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setNewTag('');
                    setShowTagInput(false);
                  }}
                  className="flex-1 px-2 py-1 bg-color-text-muted/20 text-color-text-muted text-xs rounded hover:bg-color-text-muted/30 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setShowTagInput(true)}
              className="text-sm text-color-primary hover:text-color-secondary transition-colors"
            >
              + Add tag
            </button>
          )}
        </div>

        {/* Folder */}
        <div>
          <h4 className="text-sm font-semibold text-color-text-muted uppercase tracking-wide mb-3">
            Folder
          </h4>
          <div className="flex items-center space-x-2 p-2 bg-bg-primary rounded-lg">
            <svg className="w-4 h-4 text-color-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <span className="text-sm text-color-text">Root</span>
          </div>
          <button className="text-sm text-color-primary hover:text-color-secondary transition-colors mt-2">
            Move to folder
          </button>
        </div>

        {/* Related Notes */}
        <div>
          <h4 className="text-sm font-semibold text-color-text-muted uppercase tracking-wide mb-3">
            Related Notes
          </h4>
          <div className="space-y-2">
            <div className="p-2 bg-bg-primary rounded-lg hover:bg-color-primary/10 cursor-pointer transition-colors">
              <div className="text-sm text-color-text font-medium">Getting Started Guide</div>
              <div className="text-xs text-color-text-muted mt-1">Similar content • 2 days ago</div>
            </div>
            <div className="p-2 bg-bg-primary rounded-lg hover:bg-color-primary/10 cursor-pointer transition-colors">
              <div className="text-sm text-color-text font-medium">Markdown Cheatsheet</div>
              <div className="text-xs text-color-text-muted mt-1">Similar tags • 1 week ago</div>
            </div>
            <div className="p-2 bg-bg-primary rounded-lg hover:bg-color-primary/10 cursor-pointer transition-colors">
              <div className="text-sm text-color-text font-medium">Note Organization Tips</div>
              <div className="text-xs text-color-text-muted mt-1">Similar collection • 3 days ago</div>
            </div>
            <div className="p-2 bg-bg-primary rounded-lg hover:bg-color-primary/10 cursor-pointer transition-colors">
              <div className="text-sm text-color-text font-medium">Advanced Markdown Features</div>
              <div className="text-xs text-color-text-muted mt-1">Similar content • 5 days ago</div>
            </div>
            <div className="p-2 bg-bg-primary rounded-lg hover:bg-color-primary/10 cursor-pointer transition-colors">
              <div className="text-sm text-color-text font-medium">Productivity Tips</div>
              <div className="text-xs text-color-text-muted mt-1">Similar tags • 1 week ago</div>
            </div>
          </div>
        </div>

        {/* Import/Export */}
        <div>
          <h4 className="text-sm font-semibold text-color-text-muted uppercase tracking-wide mb-3">
            Import & Export
          </h4>
          <div className="space-y-2">
            <div className="space-y-2">
              <button 
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.md,.txt,.json';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        const content = e.target?.result as string;
                        // Handle different file types
                        if (file.name.endsWith('.json')) {
                          try {
                            const data = JSON.parse(content);
                            // Handle JSON import (could be exported notes)
                            if (data.title && data.content && onImportNote) {
                              onImportNote(data.title, data.content);
                            }
                          } catch (error) {
                            console.error('Invalid JSON file');
                          }
                        } else {
                          // Handle markdown/text files
                          const title = file.name.replace(/\.(md|txt)$/, '') || 'Imported Note';
                          if (onImportNote) {
                            onImportNote(title, content);
                          }
                        }
                      };
                      reader.readAsText(file);
                    }
                  };
                  input.click();
                }}
                className="w-full px-3 py-2 text-xs bg-color-primary/10 hover:bg-color-primary/20 text-color-text rounded transition-colors flex items-center justify-center space-x-2"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                <span>Import File</span>
              </button>
              
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => {
                    // Export current note as markdown
                    const activeTab = getActiveTab?.();
                    if (activeTab) {
                      const blob = new Blob([activeTab.content], { type: 'text/markdown' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${activeTab.title}.md`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }
                  }}
                  className="px-2 py-2 text-xs bg-color-accent/10 hover:bg-color-accent/20 text-color-accent rounded transition-colors"
                >
                  Export MD
                </button>
                
                <button 
                  onClick={() => {
                    // Export current note as JSON
                    const activeTab = getActiveTab?.();
                    if (activeTab) {
                      const data = {
                        title: activeTab.title,
                        content: activeTab.content,
                        exportedAt: new Date().toISOString(),
                        format: 'notura-json-v1'
                      };
                      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${activeTab.title}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }
                  }}
                  className="px-2 py-2 text-xs bg-color-secondary/10 hover:bg-color-secondary/20 text-color-secondary rounded transition-colors"
                >
                  Export JSON
                </button>
              </div>
            </div>
            
            <div className="text-xs text-color-text-muted">
              <div className="mb-1">Import formats:</div>
              <div className="flex flex-wrap gap-1">
                <span className="px-1.5 py-0.5 bg-color-text-muted/10 rounded">.md</span>
                <span className="px-1.5 py-0.5 bg-color-text-muted/10 rounded">.txt</span>
                <span className="px-1.5 py-0.5 bg-color-text-muted/10 rounded">.json</span>
              </div>
            </div>
          </div>
        </div>

        {/* Version Info */}
        <div className="pb-4">
          <h4 className="text-sm font-semibold text-color-text-muted uppercase tracking-wide mb-3">
            Version History
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
            {versionHistory && versionHistory.length > 0 ? (
              versionHistory.slice(0, 10).map((version, index) => (
                <div 
                  key={version.id} 
                  className={`p-2 rounded-lg transition-colors ${
                    index === 0 
                      ? 'bg-color-primary/20 border border-color-primary/30' 
                      : 'bg-bg-primary hover:bg-color-primary/10 cursor-pointer'
                  }`}
                >
                  <div className="text-sm text-color-text font-medium">
                    {index === 0 ? 'Current Version' : `Version ${versionHistory.length - index}`}
                  </div>
                  <div className="text-xs text-color-text-muted mt-1">
                    {version.description} • {formatRelativeTime(version.timestamp)}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-2 bg-bg-primary rounded-lg">
                <div className="text-sm text-color-text font-medium">Current Version</div>
                <div className="text-xs text-color-text-muted mt-1">Just created</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Panel Footer */}
      <div className="p-4 border-t border-color-text-muted/20">
        <button className="w-full p-2 text-sm text-color-primary hover:text-color-secondary hover:bg-color-primary/10 rounded-lg transition-colors">
          Export Note
        </button>
      </div>
    </aside>
  );
}
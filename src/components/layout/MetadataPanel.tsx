// React import not needed with new JSX transform

interface MetadataPanelProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobile?: boolean;
}

export function MetadataPanel({ isCollapsed, onToggleCollapse, isMobile = false }: MetadataPanelProps) {
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
        {/* Timestamps */}
        <div>
          <h4 className="text-sm font-semibold text-color-text-muted uppercase tracking-wide mb-3">
            Timestamps
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-color-text-muted">Created</span>
              <span className="text-sm text-color-text">Oct 28, 2025</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-color-text-muted">Modified</span>
              <span className="text-sm text-color-text">2 minutes ago</span>
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
              <span className="text-sm text-color-text-muted">Words</span>
              <span className="text-sm text-color-text font-mono">89</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-color-text-muted">Characters</span>
              <span className="text-sm text-color-text font-mono">542</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-color-text-muted">Reading time</span>
              <span className="text-sm text-color-text">~1 min</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-color-text-muted">Paragraphs</span>
              <span className="text-sm text-color-text font-mono">4</span>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div>
          <h4 className="text-sm font-semibold text-color-text-muted uppercase tracking-wide mb-3">
            Tags
          </h4>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="px-2 py-1 bg-color-primary/20 text-color-primary text-xs rounded-full">
              welcome
            </span>
            <span className="px-2 py-1 bg-color-accent/20 text-color-accent text-xs rounded-full">
              tutorial
            </span>
            <span className="px-2 py-1 bg-color-secondary/20 text-color-secondary text-xs rounded-full">
              markdown
            </span>
          </div>
          <button className="text-sm text-color-primary hover:text-color-secondary transition-colors">
            + Add tag
          </button>
        </div>

        {/* Collection */}
        <div>
          <h4 className="text-sm font-semibold text-color-text-muted uppercase tracking-wide mb-3">
            Collection
          </h4>
          <div className="flex items-center space-x-2 p-2 bg-bg-primary rounded-lg">
            <div className="w-3 h-3 bg-color-accent rounded-full"></div>
            <span className="text-sm text-color-text">Quick Notes</span>
          </div>
          <button className="text-sm text-color-primary hover:text-color-secondary transition-colors mt-2">
            Move to collection
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

        {/* Version Info */}
        <div className="pb-4">
          <h4 className="text-sm font-semibold text-color-text-muted uppercase tracking-wide mb-3">
            Version History
          </h4>
          <div className="space-y-2">
            <div className="p-2 bg-bg-primary rounded-lg">
              <div className="text-sm text-color-text font-medium">Current Version</div>
              <div className="text-xs text-color-text-muted mt-1">Last modified 2 minutes ago</div>
            </div>
            <div className="p-2 bg-bg-primary rounded-lg hover:bg-color-primary/10 cursor-pointer transition-colors">
              <div className="text-sm text-color-text font-medium">Previous Version</div>
              <div className="text-xs text-color-text-muted mt-1">Modified 1 hour ago</div>
            </div>
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
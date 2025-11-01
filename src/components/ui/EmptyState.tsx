interface EmptyStateProps {
  onCreateNote: () => void;
  onOpenFile?: () => void;
}

export function EmptyState({ onCreateNote, onOpenFile }: EmptyStateProps) {
  return (
    <div className="flex-1 flex items-center justify-center bg-bg-primary">
      <div className="text-center max-w-md mx-auto px-6">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-color-accent/10 rounded-2xl flex items-center justify-center">
            <svg className="w-8 h-8 text-color-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-color-text mb-2">Welcome to Notura</h1>
          <p className="text-color-text-muted">
            A powerful markdown editor with enhanced features. Start by creating a new note or opening an existing one.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3 mb-8">
          <button
            onClick={onCreateNote}
            className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-color-accent hover:bg-color-accent/80 text-white rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Create New Note</span>
          </button>

          {onOpenFile && (
            <button
              onClick={onOpenFile}
              className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-color-primary/10 hover:bg-color-primary/20 text-color-text rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <span>Open File</span>
            </button>
          )}
        </div>

        {/* Features */}
        <div className="text-left space-y-4">
          <h3 className="text-lg font-semibold text-color-text mb-3">Features</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 bg-color-accent/20 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-color-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <div className="text-color-text font-medium">Real-time Preview</div>
                <div className="text-color-text-muted">See your markdown rendered as you type</div>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 bg-color-accent/20 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-color-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <div className="text-color-text font-medium">Syntax Highlighting</div>
                <div className="text-color-text-muted">Code blocks with language support</div>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 bg-color-accent/20 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-color-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <div className="text-color-text font-medium">Image Support</div>
                <div className="text-color-text-muted">Drag & drop or paste images directly</div>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 bg-color-accent/20 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-color-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <div className="text-color-text font-medium">Auto-save</div>
                <div className="text-color-text-muted">Never lose your work with automatic saving</div>
              </div>
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="mt-8 pt-6 border-t border-color-text-muted/20">
          <h4 className="text-sm font-semibold text-color-text-muted uppercase tracking-wide mb-3">
            Keyboard Shortcuts
          </h4>
          <div className="text-xs text-color-text-muted space-y-1">
            <div className="flex justify-between">
              <span>New Note</span>
              <kbd className="px-2 py-1 bg-color-text-muted/10 rounded text-color-text">Ctrl+N</kbd>
            </div>
            <div className="flex justify-between">
              <span>Save Note</span>
              <kbd className="px-2 py-1 bg-color-text-muted/10 rounded text-color-text">Ctrl+S</kbd>
            </div>
            <div className="flex justify-between">
              <span>Toggle Preview</span>
              <kbd className="px-2 py-1 bg-color-text-muted/10 rounded text-color-text">Ctrl+P</kbd>
            </div>
            <div className="flex justify-between">
              <span>Close Tab</span>
              <kbd className="px-2 py-1 bg-color-text-muted/10 rounded text-color-text">Ctrl+W</kbd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
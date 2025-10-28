import { useState, useCallback, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import 'highlight.js/styles/github-dark.css';

interface MainEditorProps {
  className?: string;
  onToggleMetadata?: () => void;
  isMetadataPanelVisible?: boolean;
}

export function MainEditor({ 
  className = '', 
  onToggleMetadata,
  isMetadataPanelVisible = true 
}: MainEditorProps) {
  const [content, setContent] = useState(`# Welcome to Notura

This is your markdown editor. You can write in **markdown** and see the results in real-time.

## Features

- **Auto-save**: Your changes are automatically saved
- **Markdown support**: Full markdown syntax support  
- **Live preview**: See your formatted text as you type
- **Collections**: Organize your notes in collections
- **Search**: Find any note instantly
- **Themes**: Switch between light and dark themes

## Code Example

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}

greet('World');
\`\`\`

Start typing to see the magic happen!`);

  const [showPreview, setShowPreview] = useLocalStorage('notura-show-preview', true);
  const [autoScroll, setAutoScroll] = useLocalStorage('notura-auto-scroll', true);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  }, []);

  const togglePreview = useCallback(() => {
    setShowPreview(prev => !prev);
  }, [setShowPreview]);

  // Auto-scroll preview based on textarea scroll position
  useEffect(() => {
    if (!autoScroll || !showPreview) return;

    const textarea = textareaRef.current;
    const preview = previewRef.current;
    
    if (!textarea || !preview) return;

    const handleScroll = () => {
      const scrollPercentage = textarea.scrollTop / (textarea.scrollHeight - textarea.clientHeight);
      const previewScrollTop = scrollPercentage * (preview.scrollHeight - preview.clientHeight);
      preview.scrollTop = previewScrollTop;
    };

    textarea.addEventListener('scroll', handleScroll);
    return () => textarea.removeEventListener('scroll', handleScroll);
  }, [autoScroll, showPreview]);
  return (
    <main className={`bg-bg-primary flex flex-col ${className}`}>
      {/* Editor Header */}
      <header className="p-3 sm:p-4 border-b border-color-text-muted/20 bg-bg-surface">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-color-text truncate">
              Untitled Note
            </h2>
            <div className="hidden sm:flex items-center space-x-2 text-xs sm:text-sm text-color-text-muted">
              <span className="hidden md:inline">Last saved: 2 minutes ago</span>
              <div className="w-1 h-1 bg-color-accent rounded-full hidden md:block"></div>
              <span className="hidden lg:inline">Auto-save enabled</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button 
              onClick={togglePreview}
              className={`p-1.5 sm:p-2 rounded-lg hover:bg-color-primary/10 transition-colors ${showPreview ? 'bg-color-primary/20' : ''}`}
              title={showPreview ? 'Hide preview' : 'Show preview'}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-color-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
            
            {showPreview && (
              <button 
                onClick={() => setAutoScroll(!autoScroll)}
                className={`relative p-1.5 sm:p-2 rounded-lg transition-all duration-200 ${
                  autoScroll 
                    ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                    : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                }`}
                title={autoScroll ? 'Auto-scroll enabled - Click to disable' : 'Auto-scroll disabled - Click to enable'}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {autoScroll ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7l4-4m0 0l4 4m-4-4v18" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                  )}
                </svg>
                {/* Status indicator dot */}
                <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${
                  autoScroll ? 'bg-green-400' : 'bg-red-400'
                }`} />
              </button>
            )}

            {onToggleMetadata && (
              <button 
                onClick={onToggleMetadata}
                className={`p-1.5 sm:p-2 rounded-lg hover:bg-color-primary/10 transition-colors ${
                  isMetadataPanelVisible ? 'bg-color-primary/20' : ''
                }`}
                aria-label={isMetadataPanelVisible ? 'Hide note details' : 'Show note details'}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-color-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMetadataPanelVisible ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  )}
                </svg>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Editor Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Editor Pane */}
        <div className={`flex flex-col ${showPreview ? 'flex-1 lg:flex-1' : 'w-full'} ${showPreview ? 'h-1/2 lg:h-full' : 'h-full'}`}>
          <div className="flex-1 p-3 sm:p-4 lg:p-6 overflow-hidden">
            <textarea
              ref={textareaRef}
              className="w-full h-full resize-none bg-transparent text-color-text 
                         placeholder-color-text-muted border-none outline-none focus:outline-none
                         font-mono text-sm sm:text-base leading-relaxed overflow-y-auto scrollbar-thin
                         selection:bg-color-primary/30"
              placeholder="Start writing your note..."
              value={content}
              onChange={handleContentChange}
              style={{ 
                boxShadow: 'none',
                border: 'none',
                outline: 'none'
              }}
            />
          </div>
          
          {/* Editor Footer */}
          <footer className="p-3 sm:p-4 border-t border-color-text-muted/20 bg-bg-surface">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm text-color-text-muted space-y-2 sm:space-y-0">
              <div className="flex items-center space-x-2 sm:space-x-4">
                <span>Words: 89</span>
                <span>Characters: 542</span>
                <span className="hidden sm:inline">Reading time: ~1 min</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Saved</span>
              </div>
            </div>
          </footer>
        </div>

        {/* Preview Pane */}
        {showPreview && (
          <div className="flex-1 border-t lg:border-t-0 lg:border-l border-color-text-muted/20 h-1/2 lg:h-full">
            <div 
              ref={previewRef}
              className="h-full p-3 sm:p-4 lg:p-6 overflow-y-auto bg-bg-surface scrollbar-thin"
            >
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight, rehypeRaw]}
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-3xl font-bold text-color-text mb-4 mt-6 first:mt-0">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-2xl font-semibold text-color-text mb-3 mt-5">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-xl font-semibold text-color-text mb-2 mt-4">
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => (
                      <p className="text-color-text mb-4 leading-relaxed">
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc list-inside text-color-text mb-4 space-y-1">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal list-inside text-color-text mb-4 space-y-1">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="text-color-text">
                        {children}
                      </li>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold text-color-text">
                        {children}
                      </strong>
                    ),
                    code: ({ node, inline, className, children, ...props }) => {
                      const match = /language-(\w+)/.exec(className || '');
                      return !inline && match ? (
                        <pre className="bg-bg-primary p-4 rounded-lg overflow-x-auto mb-4 border border-color-text-muted/20">
                          <code className={className} {...props}>
                            {children}
                          </code>
                        </pre>
                      ) : (
                        <code className="bg-bg-primary px-2 py-1 rounded text-color-accent font-mono text-sm" {...props}>
                          {children}
                        </code>
                      );
                    },
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-color-accent pl-4 italic text-color-text-muted mb-4">
                        {children}
                      </blockquote>
                    ),
                  }}
                >
                  {content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
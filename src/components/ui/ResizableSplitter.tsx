import { useState, useCallback, useRef, useEffect } from 'react';

interface ResizableSplitterProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  defaultLeftWidth?: number;
  minLeftWidth?: number;
  maxLeftWidth?: number;
  className?: string;
  storageKey?: string;
  onReset?: React.MutableRefObject<(() => void) | undefined>;
}

export function ResizableSplitter({
  leftPanel,
  rightPanel,
  defaultLeftWidth = 50,
  minLeftWidth = 20,
  maxLeftWidth = 80,
  className = '',
  storageKey = 'resizable-splitter-width',
  onReset
}: ResizableSplitterProps) {
  const [leftWidth, setLeftWidth] = useState(() => {
    if (storageKey) {
      const saved = localStorage.getItem(storageKey);
      return saved ? parseFloat(saved) : defaultLeftWidth;
    }
    return defaultLeftWidth;
  });
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    
    // Clamp the width between min and max
    const clampedWidth = Math.max(minLeftWidth, Math.min(maxLeftWidth, newLeftWidth));
    setLeftWidth(clampedWidth);
    
    // Save to localStorage
    if (storageKey) {
      localStorage.setItem(storageKey, clampedWidth.toString());
    }
  }, [isDragging, minLeftWidth, maxLeftWidth, storageKey]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Expose reset function
  useEffect(() => {
    if (onReset) {
      onReset.current = () => {
        setLeftWidth(defaultLeftWidth);
        if (storageKey) {
          localStorage.setItem(storageKey, defaultLeftWidth.toString());
        }
      };
    }
  }, [onReset, defaultLeftWidth, storageKey]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div ref={containerRef} className={`flex h-full ${className}`}>
      {/* Left Panel */}
      <div style={{ width: `${leftWidth}%` }} className="flex-shrink-0">
        {leftPanel}
      </div>

      {/* Resizable Divider */}
      <div
        className={`w-1 bg-color-text-muted/10 hover:bg-color-accent/30 cursor-col-resize transition-colors relative group ${
          isDragging ? 'bg-color-accent/50' : ''
        }`}
        onMouseDown={handleMouseDown}
      >
        {/* Visual indicator */}
        <div className="absolute inset-y-0 left-1/2 transform -translate-x-1/2 w-1 bg-color-accent/0 group-hover:bg-color-accent/50 transition-colors" />
        
        {/* Drag handle */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-0.5 h-4 bg-color-accent/60 rounded-full mx-0.5" />
          <div className="w-0.5 h-4 bg-color-accent/60 rounded-full mx-0.5" />
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 min-w-0">
        {rightPanel}
      </div>
    </div>
  );
}
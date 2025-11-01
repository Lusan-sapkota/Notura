import { useState, useCallback, useRef, useEffect } from 'react';
import { useLocalStorage } from '../../hooks';

interface ResizableSidebarProps {
  children: React.ReactNode;
  isCollapsed: boolean;
  isMobile?: boolean;
  minWidth?: number;
  maxWidth?: number;
  defaultWidth?: number;
  className?: string;
}

export function ResizableSidebar({
  children,
  isCollapsed,
  isMobile = false,
  minWidth = 200,
  maxWidth = 500,
  defaultWidth = 280,
  className = ''
}: ResizableSidebarProps) {
  const [width, setWidth] = useLocalStorage('notura-sidebar-width', defaultWidth);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isCollapsed || isMobile) return;
    
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = width;
    
    // Prevent text selection during resize
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
  }, [isCollapsed, isMobile, width]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;

    const deltaX = e.clientX - startXRef.current;
    const newWidth = Math.min(maxWidth, Math.max(minWidth, startWidthRef.current + deltaX));
    
    setWidth(newWidth);
  }, [isResizing, minWidth, maxWidth, setWidth]);

  const handleMouseUp = useCallback(() => {
    if (!isResizing) return;
    
    setIsResizing(false);
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  }, [isResizing]);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // Reset cursor when component unmounts or resizing stops
  useEffect(() => {
    return () => {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, []);

  const sidebarStyle = {
    width: isCollapsed ? (isMobile ? '0px' : '64px') : isMobile ? '280px' : `${width}px`,
    minWidth: isCollapsed ? (isMobile ? '0px' : '64px') : isMobile ? '280px' : `${minWidth}px`,
    maxWidth: isCollapsed ? (isMobile ? '0px' : '64px') : isMobile ? '280px' : `${maxWidth}px`,
  };

  return (
    <div 
      ref={sidebarRef}
      className={`relative flex-shrink-0 ${className}`}
      style={sidebarStyle}
    >
      {children}
      
      {/* Resize handle */}
      {!isCollapsed && !isMobile && (
        <div
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize 
                     hover:bg-color-accent/50 transition-colors z-10
                     ${isResizing ? 'bg-color-accent' : 'bg-transparent'}`}
          onMouseDown={handleMouseDown}
          style={{
            background: isResizing ? 'var(--color-accent)' : 'transparent',
          }}
        >
          {/* Visual indicator on hover */}
          <div className="absolute inset-0 hover:bg-color-accent/20 transition-colors" />
        </div>
      )}
    </div>
  );
}
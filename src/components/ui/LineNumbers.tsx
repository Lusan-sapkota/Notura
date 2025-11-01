import { useMemo } from 'react';

interface LineNumbersProps {
  content: string;
  lineHeight: number;
  className?: string;
}

export function LineNumbers({ content, lineHeight, className = '' }: LineNumbersProps) {
  const lineCount = useMemo(() => {
    return content.split('\n').length;
  }, [content]);

  const lineNumbers = useMemo(() => {
    return Array.from({ length: lineCount }, (_, i) => i + 1);
  }, [lineCount]);

  return (
    <div 
      className={`select-none pointer-events-none text-right pr-3 text-color-text-muted/40 font-mono text-xs leading-relaxed ${className}`}
      style={{ 
        lineHeight: `${lineHeight}px`,
        minWidth: '30px'
      }}
    >
      {lineNumbers.map((lineNum) => (
        <div key={lineNum} style={{ height: `${lineHeight}px` }}>
          {lineNum}
        </div>
      ))}
    </div>
  );
}
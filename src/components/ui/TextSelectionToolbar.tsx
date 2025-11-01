import { useState, useEffect, useRef } from 'react';
import { LanguageSelector } from './LanguageSelector';

interface TextSelectionToolbarProps {
  selectedText: string;
  selectionStart: number;
  selectionEnd: number;
  onFormatText: (format: string, language?: string) => void;
  onClose: () => void;
  position: { x: number; y: number };
}

const formatOptions = [
  { key: 'bold', label: 'Bold', icon: 'B', shortcut: '**text**' },
  { key: 'italic', label: 'Italic', icon: 'I', shortcut: '*text*' },
  { key: 'code', label: 'Code', icon: '</>', shortcut: '`text`' },
  { key: 'strikethrough', label: 'Strikethrough', icon: 'S̶', shortcut: '~~text~~' },
  { key: 'highlight', label: 'Highlight', icon: 'H', shortcut: '==text==' },
];

export function TextSelectionToolbar({
  selectedText: _selectedText,
  selectionStart: _selectionStart,
  selectionEnd: _selectionEnd,
  onFormatText,
  onClose,
  position
}: TextSelectionToolbarProps) {
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleFormatClick = (format: string) => {
    onFormatText(format);
    onClose();
  };

  const handleLanguageFormat = () => {
    onFormatText('language', selectedLanguage);
    onClose();
  };

  const handleCodeBlockFormat = () => {
    onFormatText('codeblock', selectedLanguage);
    onClose();
  };

  return (
    <div
      ref={toolbarRef}
      className="text-selection-toolbar fixed z-50 bg-bg-surface border border-color-text-muted/20 rounded-lg shadow-lg p-2"
      style={{
        left: Math.max(10, Math.min(position.x, window.innerWidth - 300)),
        top: Math.max(10, position.y - 60),
      }}
    >
      <div className="flex items-center space-x-1">
        {/* Basic formatting options */}
        {formatOptions.map((option) => (
          <button
            key={option.key}
            onClick={() => handleFormatClick(option.key)}
            className="px-2 py-1 text-sm font-medium text-color-text hover:bg-bg-primary 
                       rounded transition-colors min-w-[32px] h-8 flex items-center justify-center"
            title={`${option.label} (${option.shortcut})`}
          >
            {option.icon}
          </button>
        ))}

        {/* Divider */}
        <div className="w-px h-6 bg-color-text-muted/20 mx-1" />

        {/* Code block button */}
        <button
          onClick={handleCodeBlockFormat}
          className="px-2 py-1 text-sm text-color-text hover:bg-bg-primary rounded transition-colors"
          title="Code Block"
        >
          <span className="font-mono text-xs">{`{}`}</span>
        </button>

        {/* Language selector toggle */}
        <button
          onClick={() => setShowLanguageSelector(!showLanguageSelector)}
          className="px-2 py-1 text-sm text-color-text hover:bg-bg-primary rounded transition-colors"
          title="Set Programming Language"
        >
          <span className="font-mono text-xs">Lang</span>
        </button>

        {/* Close button */}
        <button
          onClick={onClose}
          className="px-2 py-1 text-sm text-color-text-muted hover:bg-bg-primary rounded transition-colors ml-2"
          title="Close"
        >
          ✕
        </button>
      </div>

      {/* Language selector dropdown */}
      {showLanguageSelector && (
        <div className="mt-2 pt-2 border-t border-color-text-muted/20">
          <div className="flex items-center space-x-2">
            <LanguageSelector
              selectedLanguage={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
              className="flex-1"
            />
            <button
              onClick={handleLanguageFormat}
              className="px-3 py-1 bg-color-accent text-white rounded text-sm hover:bg-color-accent/80 transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
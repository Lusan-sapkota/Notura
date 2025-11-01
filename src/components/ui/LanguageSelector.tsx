import { useState, useRef, useEffect } from 'react';

interface Language {
  code: string;
  name: string;
  icon: string;
}

const languages: Language[] = [
  { code: 'javascript', name: 'JavaScript', icon: 'JS' },
  { code: 'typescript', name: 'TypeScript', icon: 'TS' },
  { code: 'python', name: 'Python', icon: 'PY' },
  { code: 'java', name: 'Java', icon: 'JV' },
  { code: 'cpp', name: 'C++', icon: 'C+' },
  { code: 'c', name: 'C', icon: 'C' },
  { code: 'csharp', name: 'C#', icon: 'C#' },
  { code: 'php', name: 'PHP', icon: 'PHP' },
  { code: 'ruby', name: 'Ruby', icon: 'RB' },
  { code: 'go', name: 'Go', icon: 'GO' },
  { code: 'rust', name: 'Rust', icon: 'RS' },
  { code: 'swift', name: 'Swift', icon: 'SW' },
  { code: 'kotlin', name: 'Kotlin', icon: 'KT' },
  { code: 'html', name: 'HTML', icon: 'HTML' },
  { code: 'css', name: 'CSS', icon: 'CSS' },
  { code: 'scss', name: 'SCSS', icon: 'SCSS' },
  { code: 'json', name: 'JSON', icon: 'JSON' },
  { code: 'xml', name: 'XML', icon: 'XML' },
  { code: 'yaml', name: 'YAML', icon: 'YML' },
  { code: 'sql', name: 'SQL', icon: 'SQL' },
  { code: 'bash', name: 'Bash', icon: 'SH' },
  { code: 'powershell', name: 'PowerShell', icon: 'PS' },
];

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
  className?: string;
}

export function LanguageSelector({ 
  selectedLanguage, 
  onLanguageChange, 
  className = '' 
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedLang = languages.find(lang => lang.code === selectedLanguage) || languages[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-bg-surface border border-color-text-muted/20 
                   rounded-lg hover:bg-bg-primary transition-colors text-sm"
        aria-label="Select language"
      >
        <span className="text-xs font-mono bg-color-accent/20 px-1 rounded">{selectedLang.icon}</span>
        <span className="text-color-text">{selectedLang.name}</span>
        <svg 
          className={`w-4 h-4 text-color-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-bg-surface border border-color-text-muted/20 
                        rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto custom-scrollbar">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => {
                onLanguageChange(language.code);
                setIsOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-bg-primary 
                         transition-colors text-sm ${
                selectedLanguage === language.code ? 'bg-color-primary/20' : ''
              }`}
            >
              <span className="text-xs font-mono bg-color-accent/20 px-1 rounded">{language.icon}</span>
              <span className="text-color-text">{language.name}</span>
              {selectedLanguage === language.code && (
                <svg className="w-4 h-4 text-color-accent ml-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
import { useState, useRef, useEffect } from 'react';

interface Version {
  id: string;
  content: string;
  timestamp: Date;
  description: string;
}

interface VersionHistoryDropdownProps {
  versions: Version[];
  currentVersionId: string;
  onVersionSelect: (versionId: string) => void;
  className?: string;
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return date.toLocaleDateString();
}

export function VersionHistoryDropdown({
  versions,
  currentVersionId,
  onVersionSelect,
  className = ''
}: VersionHistoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentVersion = versions.find(v => v.id === currentVersionId);
  const sortedVersions = [...versions].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

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
        className={`flex items-center space-x-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
          isOpen 
            ? 'bg-color-accent/20 text-color-accent border-color-accent/50 shadow-lg' 
            : 'text-color-text hover:bg-color-accent/10 hover:text-color-accent border-color-text-muted/30'
        } border backdrop-blur-sm`}
        title="Version History"
      >
        <svg className={`w-4 h-4 transition-colors ${isOpen ? 'text-color-accent' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="hidden sm:inline">
          {currentVersion ? formatRelativeTime(currentVersion.timestamp) : 'Current'}
        </span>
        <svg 
          className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-bg-surface/95 backdrop-blur-xl border 
                        border-color-accent/20 rounded-xl shadow-2xl z-50 max-h-64 overflow-y-auto custom-scrollbar
                        ring-1 ring-color-accent/10">
          <div className="p-3">
            <div className="flex items-center space-x-2 mb-3 px-1">
              <svg className="w-4 h-4 text-color-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-bold text-color-accent uppercase tracking-wider">
                Version History
              </span>
            </div>
            {sortedVersions.slice(0, 10).map((version, index) => (
              <button
                key={version.id}
                onClick={() => {
                  onVersionSelect(version.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left p-3 rounded-lg transition-all duration-200 group ${
                  version.id === currentVersionId
                    ? 'bg-gradient-to-r from-color-accent/20 to-color-primary/20 text-color-accent border border-color-accent/30 shadow-md'
                    : 'hover:bg-gradient-to-r hover:from-color-primary/10 hover:to-color-accent/10 text-color-text hover:text-color-primary hover:shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className={`text-sm font-semibold truncate ${
                        version.id === currentVersionId ? 'text-color-accent' : 'text-color-text group-hover:text-color-primary'
                      }`}>
                        {index === 0 ? 'Current Version' : `Version ${sortedVersions.length - index}`}
                      </div>
                      {index === 0 && (
                        <span className="px-2 py-0.5 bg-color-accent/20 text-color-accent text-xs font-bold rounded-full">
                          LATEST
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-color-text-muted flex items-center space-x-2">
                      <span className="font-medium">{version.description}</span>
                      <span>•</span>
                      <span>{formatRelativeTime(version.timestamp)}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {version.id === currentVersionId ? (
                      <div className="w-6 h-6 bg-color-accent rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-6 h-6 border-2 border-color-text-muted/30 rounded-full group-hover:border-color-primary/50 transition-colors" />
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
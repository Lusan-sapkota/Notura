import { useState, useCallback, useRef } from 'react';

interface Version {
  id: string;
  content: string;
  timestamp: Date;
  description: string;
}

export function useVersionHistory(initialContent: string = '') {
  const [versions, setVersions] = useState<Version[]>(() => [
    {
      id: '1',
      content: initialContent,
      timestamp: new Date(),
      description: 'Initial version'
    }
  ]);
  
  const [currentVersionId, setCurrentVersionId] = useState('1');
  const lastSaveRef = useRef<string>(initialContent);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const saveVersion = useCallback((content: string, description?: string) => {
    // Don't save if content hasn't changed significantly
    if (content === lastSaveRef.current) return;
    
    const newVersion: Version = {
      id: Date.now().toString(),
      content,
      timestamp: new Date(),
      description: description || 'Auto-save'
    };

    setVersions(prev => [...prev, newVersion]);
    setCurrentVersionId(newVersion.id);
    lastSaveRef.current = content;
  }, []);

  const autoSave = useCallback((content: string) => {
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for auto-save
    saveTimeoutRef.current = setTimeout(() => {
      saveVersion(content, 'Auto-save');
    }, 2000); // Auto-save after 2 seconds of inactivity
  }, [saveVersion]);

  const restoreVersion = useCallback((versionId: string) => {
    const version = versions.find(v => v.id === versionId);
    if (version) {
      setCurrentVersionId(versionId);
      return version.content;
    }
    return null;
  }, [versions]);

  const getCurrentVersion = useCallback(() => {
    return versions.find(v => v.id === currentVersionId);
  }, [versions, currentVersionId]);

  const getVersionHistory = useCallback(() => {
    return versions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [versions]);

  return {
    versions: getVersionHistory(),
    currentVersionId,
    saveVersion,
    autoSave,
    restoreVersion,
    getCurrentVersion
  };
}
import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';

import { useLocalStorage, useVersionHistory } from '../../hooks';
import { useImageManager } from '../../hooks/useImageManager';
import { EditorToolbar, TextSelectionToolbar, LineNumbers, ResizableSplitter, TabSystem, RenameNoteModal, ImageGalleryModal, AsyncImage, EmptyState } from '../ui';
import type { Tab } from '../ui/TabSystem';
import 'highlight.js/styles/github-dark.css';

interface MainEditorProps {
  className?: string;
  onToggleMetadata?: () => void;
  isMetadataPanelVisible?: boolean;
  onStatsChange?: (stats: {
    lines: number;
    words: number;
    characters: number;
    charactersNoSpaces: number;
    readingTime: number;
    paragraphs: number;
  }) => void;
  onVersionHistoryChange?: (versions: Array<{
    id: string;
    content: string;
    timestamp: Date;
    description: string;
  }>) => void;
  onZenModeChange?: (zenMode: boolean) => void;
  onSaveStatusChange?: (status: 'saved' | 'saving' | 'unsaved') => void;
  onImagesChange?: (images: Array<{
    id: string;
    filename: string;
    originalName: string;
    size: number;
    type: string;
    createdAt: Date;
  }>) => void;
  // Tab system props
  tabs: Tab[];
  activeTabId: string;
  onTabCreate: () => void;
  onTabClose: (tabId: string) => void;
  onTabSelect: (tabId: string) => void;
  onTabContentUpdate: (tabId: string, content: string) => void;
  onTabTitleUpdate: (tabId: string, title: string) => void;
  onTabMarkSaved: (tabId: string) => void;
  getActiveTab: () => Tab | undefined;
}

export function MainEditor({ 
  className = '', 
  onToggleMetadata,
  isMetadataPanelVisible = true,
  onStatsChange,
  onVersionHistoryChange,
  onZenModeChange,
  onSaveStatusChange,
  onImagesChange,
  tabs,
  activeTabId,
  onTabCreate,
  onTabClose,
  onTabSelect,
  onTabContentUpdate,
  onTabTitleUpdate,
  onTabMarkSaved,
  getActiveTab
}: MainEditorProps) {
  const [content, setContent] = useState('');

  const [showPreview, setShowPreview] = useLocalStorage('notura-show-preview', true);
  const [autoScroll, setAutoScroll] = useLocalStorage('notura-auto-scroll', true);
  const [zenMode, setZenMode] = useLocalStorage('notura-zen-mode', false);

  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

  // Get active tab content
  const activeTab = getActiveTab();
  const rawTabContent = activeTab?.content || content;
  
  // Process content for preview - handle horizontal rules and other markdown formatting
  const tabContent = useMemo(() => {
    let processedContent = rawTabContent || '';
    
    // Ensure horizontal rules are properly formatted
    // Handle various horizontal rule patterns
    processedContent = processedContent.replace(/^(\s*)---+(\s*)$/gm, '\n\n---\n\n');
    processedContent = processedContent.replace(/^(\s*)\*\*\*+(\s*)$/gm, '\n\n***\n\n');
    processedContent = processedContent.replace(/^(\s*)___+(\s*)$/gm, '\n\n___\n\n');
    
    // Clean up multiple consecutive newlines
    processedContent = processedContent.replace(/\n{3,}/g, '\n\n');
    
    return processedContent;
  }, [rawTabContent]);

  // Sync content with active tab
  useEffect(() => {
    if (activeTab) {
      setContent(activeTab.content);
    }
  }, [activeTab?.id, activeTab?.content]);

  // Version history
  const {
    versions,
    currentVersionId,
    autoSave,
    restoreVersion,
    saveVersion
  } = useVersionHistory(rawTabContent);
  const [showSelectionToolbar, setShowSelectionToolbar] = useState(false);
  const [selectionInfo, setSelectionInfo] = useState({
    text: '',
    start: 0,
    end: 0,
    position: { x: 0, y: 0 }
  });
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  // Calculate statistics
  const stats = useMemo(() => {
    const lines = rawTabContent.split('\n').length;
    const words = rawTabContent.trim() ? rawTabContent.trim().split(/\s+/).length : 0;
    const characters = rawTabContent.length;
    const charactersNoSpaces = rawTabContent.replace(/\s/g, '').length;
    const readingTime = Math.max(1, Math.ceil(words / 200)); // 200 words per minute
    const paragraphs = rawTabContent.split(/\n\s*\n/).filter((p: string) => p.trim()).length;
    
    return {
      lines,
      words,
      characters,
      charactersNoSpaces,
      readingTime,
      paragraphs
    };
  }, [rawTabContent]);

  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [debouncedContent, setDebouncedContent] = useState(tabContent);
  const [showImageGallery, setShowImageGallery] = useState(false);

  // Image management
  const { 
    images, 
    saveImage, 
    getImage, 
    deleteImage, 
    updateImageUsage
  } = useImageManager();

  // Debounce content for preview to improve performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedContent(tabContent);
    }, 150); // Reduced debounce time for better responsiveness

    return () => clearTimeout(timer);
  }, [tabContent]);

  // Function to convert base64 images in content to managed images
  const convertBase64ImagesInContent = useCallback(async (content: string): Promise<string> => {
    const base64ImageRegex = /!\[([^\]]*)\]\(data:image\/([^;]+);base64,([A-Za-z0-9+/=]+)\)/g;
    let newContent = content;
    const matches = [...content.matchAll(base64ImageRegex)];
    
    for (const match of matches) {
      const [fullMatch, alt, mimeType, base64Data] = match;
      try {
        // Convert base64 to blob
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: `image/${mimeType}` });
        
        // Create a file from the blob
        const file = new File([blob], alt || 'image.png', { type: `image/${mimeType}` });
        
        // Save the image
        const imageId = await saveImage(file, activeTabId);
        
        // Replace in content
        const newImageMarkdown = `![${alt}](image://${imageId})`;
        newContent = newContent.replace(fullMatch, newImageMarkdown);
        
        await updateImageUsage(imageId, activeTabId, true);
      } catch (error) {
        console.error('Failed to convert base64 image:', error);
      }
    }
    
    return newContent;
  }, [saveImage, activeTabId, updateImageUsage]);

  const handleContentChange = useCallback(async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    
    // Auto-convert base64 images if found
    const base64ImageRegex = /!\[([^\]]*)\]\(data:image\/([^;]+);base64,([A-Za-z0-9+/=]{500,})\)/g;
    const hasBase64Images = base64ImageRegex.test(newContent);
    
    if (hasBase64Images) {
      // Convert base64 images automatically
      try {
        const convertedContent = await convertBase64ImagesInContent(newContent);
        setContent(convertedContent);
        onTabContentUpdate(activeTabId, convertedContent);
        autoSave(convertedContent);
        return; // Exit early since we've already updated content
      } catch (error) {
        console.error('Failed to auto-convert base64 images:', error);
        // Continue with original content if conversion fails
      }
    }
    
    onTabContentUpdate(activeTabId, newContent);
    setSaveStatus('unsaved');
    
    // Clear previous timeout
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }
    
    // Auto-save after a delay
    const timeoutId = setTimeout(() => {
      setSaveStatus('saving');
      autoSave(newContent);
      // Mark as saved after auto-save completes
      setTimeout(() => {
        setSaveStatus('saved');
        onTabMarkSaved(activeTabId);
      }, 500);
    }, 2000);

    setAutoSaveTimeout(timeoutId);
  }, [autoSave, activeTabId, onTabContentUpdate, onTabMarkSaved, autoSaveTimeout, convertBase64ImagesInContent]);

  const splitterResetRef = useRef<(() => void) | undefined>(undefined);

  const togglePreview = useCallback(() => {
    setShowPreview(!showPreview);
    // Reset splitter width when toggling preview
    if (splitterResetRef.current) {
      splitterResetRef.current();
    }
  }, [showPreview, setShowPreview]);

  const toggleZenMode = useCallback(() => {
    setZenMode(!zenMode);
  }, [zenMode, setZenMode]);

  const handleTextSelection = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Use a small delay to ensure selection is complete
    setTimeout(() => {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = content.substring(start, end);

      if (selectedText.length > 0) {
        const rect = textarea.getBoundingClientRect();
        
        // Simplified position calculation
        const lines = content.substring(0, start).split('\n');
        const lineHeight = 24;
        const currentLine = lines.length - 1;
        
        setSelectionInfo({
          text: selectedText,
          start,
          end,
          position: {
            x: rect.left + 100, // Simple offset from left
            y: rect.top + (currentLine * lineHeight) - textarea.scrollTop - 60
          }
        });
        setShowSelectionToolbar(true);
      } else {
        setShowSelectionToolbar(false);
      }
    }, 10);
  }, [content]);

  const handleFormatText = useCallback((format: string, language?: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = selectionInfo.start;
    const end = selectionInfo.end;
    const selectedText = selectionInfo.text;
    let formattedText = selectedText;

    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'code':
        formattedText = `\`${selectedText}\``;
        break;
      case 'strikethrough':
        formattedText = `~~${selectedText}~~`;
        break;
      case 'highlight':
        formattedText = `==${selectedText}==`;
        break;
      case 'language':
        formattedText = `\`\`\`${language || ''}\n${selectedText}\n\`\`\``;
        break;
      case 'codeblock':
        formattedText = `\`\`\`${language || ''}\n${selectedText}\n\`\`\``;
        break;
      default:
        break;
    }

    const newContent = content.substring(0, start) + formattedText + content.substring(end);
    setContent(newContent);
    
    // Focus back to textarea and set cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + formattedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, [content, selectionInfo]);

  const handleInsertText = useCallback((text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursorPos = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;
    const scrollTop = textarea.scrollTop; // Save current scroll position
    
    // Replace selected text or insert at cursor position
    const newContent = rawTabContent.substring(0, cursorPos) + text + rawTabContent.substring(selectionEnd);
    setContent(newContent);
    onTabContentUpdate(activeTabId, newContent);
    autoSave(newContent);

    // Focus back to textarea and set cursor position while preserving scroll
    setTimeout(() => {
      textarea.focus();
      textarea.scrollTop = scrollTop; // Restore scroll position
      const newCursorPos = cursorPos + text.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, [tabContent, activeTabId, onTabContentUpdate, autoSave]);

  const handleEditorScroll = useCallback(() => {
    const textarea = textareaRef.current;
    const lineNumbers = lineNumbersRef.current;
    
    if (textarea && lineNumbers) {
      lineNumbers.scrollTop = textarea.scrollTop;
    }
  }, []);

  const handleVersionSelect = useCallback((versionId: string) => {
    const restoredContent = restoreVersion(versionId);
    if (restoredContent !== null) {
      setContent(restoredContent);
    }
  }, [restoreVersion]);

  const handleImageUpload = useCallback(async (file: File) => {
    try {
      const imageId = await saveImage(file, activeTabId);
      const imageMarkdown = `![${file.name}](image://${imageId})`;
      handleInsertText(imageMarkdown);
      updateImageUsage(imageId, activeTabId, true);
    } catch (error) {
      console.error('Failed to upload image:', error);
    }
  }, [saveImage, activeTabId, handleInsertText, updateImageUsage]);

  const handleInsertImageFromGallery = useCallback(async (imageId: string) => {
    try {
      const image = await getImage(imageId);
      if (image) {
        const imageMarkdown = `![${image.original_name}](image://${imageId})`;
        handleInsertText(imageMarkdown);
        await updateImageUsage(imageId, activeTabId, true);
      }
    } catch (error) {
      console.error('Failed to insert image from gallery:', error);
    }
  }, [getImage, handleInsertText, updateImageUsage, activeTabId]);



  const handleRenameConfirm = useCallback((newTitle: string) => {
    onTabTitleUpdate(activeTabId, newTitle);
    setSaveStatus('saving');
    if (saveVersion) {
      saveVersion(rawTabContent, 'Manual save');
    }
    onTabMarkSaved(activeTabId);
    setTimeout(() => setSaveStatus('saved'), 1000);
  }, [activeTabId, onTabTitleUpdate, rawTabContent, saveVersion, onTabMarkSaved]);

  const handleManualSave = useCallback(() => {
    const activeTab = getActiveTab();
    
    // If it's an untitled note, show rename modal
    if (activeTab && activeTab.title === 'Untitled Note') {
      setShowRenameModal(true);
    } else {
      // Regular save
      setSaveStatus('saving');
      if (saveVersion) {
        saveVersion(rawTabContent, 'Manual save');
      }
      onTabMarkSaved(activeTabId);
      setTimeout(() => setSaveStatus('saved'), 1000);
    }
  }, [tabContent, saveVersion, activeTabId, onTabMarkSaved, getActiveTab]);



  const handlePaste = useCallback(async (_e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    // Let the default paste happen first, then check for base64 images
    setTimeout(async () => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      
      const content = textarea.value;
      const base64ImageRegex = /!\[([^\]]*)\]\(data:image\/([^;]+);base64,([A-Za-z0-9+/=]{500,})\)/g;
      
      if (base64ImageRegex.test(content)) {
        try {
          const convertedContent = await convertBase64ImagesInContent(content);
          if (convertedContent !== content) {
            setContent(convertedContent);
            onTabContentUpdate(activeTabId, convertedContent);
            autoSave(convertedContent);
          }
        } catch (error) {
          console.error('Failed to auto-convert pasted base64 images:', error);
        }
      }
    }, 100);
  }, [convertBase64ImagesInContent, setContent, onTabContentUpdate, activeTabId, autoSave]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      // Handle Ctrl+S for manual save
      if (e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleManualSave();
        return;
      }

      // Handle tab switching (Ctrl+Tab and Ctrl+Shift+Tab)
      if (e.key === 'Tab') {
        e.preventDefault();
        const currentIndex = tabs.findIndex(tab => tab.id === activeTabId);
        let nextIndex;
        
        if (e.shiftKey) {
          // Previous tab (Ctrl+Shift+Tab)
          nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
        } else {
          // Next tab (Ctrl+Tab)
          nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
        }
        
        if (tabs[nextIndex]) {
          onTabSelect(tabs[nextIndex].id);
        }
        return;
      }

      // Handle number keys for direct tab selection (Ctrl+1, Ctrl+2, etc.)
      const numKey = parseInt(e.key);
      if (numKey >= 1 && numKey <= 9) {
        e.preventDefault();
        const tabIndex = numKey - 1;
        if (tabs[tabIndex]) {
          onTabSelect(tabs[tabIndex].id);
        }
        return;
      }

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = rawTabContent.substring(start, end);

      if (selectedText.length > 0) {
        let formattedText = '';
        let shouldPreventDefault = true;

        switch (e.key.toLowerCase()) {
          case 'b':
            formattedText = `**${selectedText}**`;
            break;
          case 'i':
            formattedText = `*${selectedText}*`;
            break;
          case 'k':
            formattedText = `[${selectedText}](url)`;
            break;
          default:
            shouldPreventDefault = false;
        }

        if (shouldPreventDefault && formattedText) {
          e.preventDefault();
          const newContent = rawTabContent.substring(0, start) + formattedText + rawTabContent.substring(end);
          setContent(newContent);
          onTabContentUpdate(activeTabId, newContent);
          autoSave(newContent);
          
          // Set cursor position after formatting
          setTimeout(() => {
            textarea.focus();
            const newCursorPos = start + formattedText.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
          }, 0);
        }
      }
    }
  }, [tabContent, autoSave, tabs, activeTabId, onTabSelect, onTabContentUpdate, handleManualSave]);

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

  // Close selection toolbar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.text-selection-toolbar') && !target.closest('textarea')) {
        setShowSelectionToolbar(false);
      }
    };

    if (showSelectionToolbar) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSelectionToolbar]);

  // Notify parent of stats changes
  useEffect(() => {
    if (onStatsChange) {
      onStatsChange(stats);
    }
  }, [stats, onStatsChange]);

  // Notify parent of version history changes
  useEffect(() => {
    if (onVersionHistoryChange) {
      onVersionHistoryChange(versions);
    }
  }, [versions, onVersionHistoryChange]);

  // Notify parent of zen mode changes
  useEffect(() => {
    if (onZenModeChange) {
      onZenModeChange(zenMode);
    }
  }, [zenMode, onZenModeChange]);

  // Notify parent of save status changes
  useEffect(() => {
    if (onSaveStatusChange) {
      onSaveStatusChange(saveStatus);
    }
  }, [saveStatus, onSaveStatusChange]);

  // Notify parent of image changes
  useEffect(() => {
    if (onImagesChange) {
      // Convert backend ImageMetadata to frontend format
      const convertedImages = images.map(img => ({
        id: img.id,
        filename: img.filename,
        originalName: img.original_name,
        size: img.size,
        type: img.mime_type,
        createdAt: new Date(img.created_at)
      }));
      onImagesChange(convertedImages);
    }
  }, [images, onImagesChange]);
  return (
    <main className={`bg-bg-primary flex flex-col ${className}`}>
      {/* Editor Header */}
      {!zenMode && (
        <header className="p-3 sm:p-4 border-b border-color-text-muted/20 bg-bg-surface">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
            {/* Tab System in Header */}
            {!zenMode ? (
              <div className="flex-1 min-w-0">
                <TabSystem
                  tabs={tabs}
                  activeTabId={activeTabId}
                  onTabSelect={onTabSelect}
                  onTabClose={onTabClose}
                  onTabCreate={onTabCreate}
                  onTabRename={onTabTitleUpdate}
                  className="border-none bg-transparent"
                />
              </div>
            ) : (
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-color-text truncate">
                  {activeTab?.title || 'Untitled Note'}
                </h2>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Separator before controls */}
            <div className="w-px h-6 bg-color-text-muted/20 mr-2" />
            
            <button 
              onClick={toggleZenMode}
              className={`p-1.5 sm:p-2 rounded-lg hover:bg-color-primary/10 transition-colors ${zenMode ? 'bg-color-primary/20' : ''}`}
              title={zenMode ? 'Exit zen mode' : 'Enter zen mode'}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-color-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>

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

            <button 
              onClick={() => setShowImageGallery(true)}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-color-primary/10 transition-colors"
              title="Open image gallery"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-color-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>



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
      )}



      {/* Zen Mode Header */}
      {zenMode && (
        <header className="absolute top-4 right-4 z-10 flex items-center space-x-3">
          {/* Tab indicator */}
          {tabs.length > 1 && (
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-bg-surface/80 backdrop-blur-sm border border-color-text-muted/20 rounded-lg shadow-lg">
              <span className="text-xs text-color-text-muted">
                {tabs.findIndex(tab => tab.id === activeTabId) + 1} of {tabs.length}
              </span>
              <div className="text-xs text-color-text-muted">
                Ctrl+Tab
              </div>
            </div>
          )}
          
          <button 
            onClick={toggleZenMode}
            className="p-2 rounded-lg bg-bg-surface/80 backdrop-blur-sm border border-color-text-muted/20 hover:bg-color-primary/10 transition-colors shadow-lg"
            title="Exit zen mode"
          >
            <svg className="w-5 h-5 text-color-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>
      )}

      {/* Editor Toolbar */}
      {!zenMode && (
        <EditorToolbar 
          onInsertText={handleInsertText}
          onImageUpload={handleImageUpload}
          versions={versions}
          currentVersionId={currentVersionId}
          onVersionSelect={handleVersionSelect}
        />
      )}

      {/* Editor Content */}
      <div className="flex-1 overflow-hidden">
        {tabs.length === 0 ? (
          <EmptyState 
            onCreateNote={onTabCreate}
          />
        ) : showPreview ? (
          <ResizableSplitter
            leftPanel={
              <div className="flex flex-col h-full">
          <div className="flex-1 flex overflow-hidden relative">
            {/* Line Numbers */}
            <div 
              ref={lineNumbersRef}
              className="flex-shrink-0 py-3 sm:py-4 lg:py-6 pl-2 sm:pl-3 lg:pl-4 pr-2 bg-bg-surface/30 border-r border-color-text-muted/5 overflow-hidden"
              style={{ width: '45px' }}
            >
              <LineNumbers 
                content={rawTabContent} 
                lineHeight={24} 
                className="text-right"
              />
            </div>
            
            {/* Editor */}
            <div className="flex-1 py-3 sm:py-4 lg:py-6 pl-2 sm:pl-3 lg:pl-4 pr-0 overflow-hidden relative">
              <textarea
                ref={textareaRef}
                className="w-full h-full resize-none bg-transparent text-color-text 
                           placeholder-color-text-muted border-none outline-none focus:outline-none
                           font-mono text-sm sm:text-base leading-relaxed overflow-y-auto editor-scrollbar
                           selection:bg-color-primary/30 editor-textarea"
                placeholder="Start writing your note..."
                value={rawTabContent}
                onChange={handleContentChange}
                onMouseUp={handleTextSelection}
                onKeyUp={handleTextSelection}
                onSelect={handleTextSelection}
                onScroll={handleEditorScroll}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                style={{ 
                  boxShadow: 'none',
                  border: 'none',
                  outline: 'none',
                  lineHeight: '24px'
                }}
              />
            </div>
          </div>
          
          {/* Editor Footer */}
          {!zenMode && (
            <footer className="p-3 sm:p-4 border-t border-color-text-muted/20 bg-bg-surface">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm text-color-text-muted space-y-2 sm:space-y-0">
              <div className="flex items-center space-x-2 sm:space-x-4">
                <span>Lines: {stats.lines}</span>
                <span>Words: {stats.words}</span>
                <span>Characters: {stats.characters}</span>
                <span className="hidden sm:inline">Reading time: ~{stats.readingTime} min</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  (saveStatus === 'saved' && !activeTab?.isDirty) ? 'bg-green-500' :
                  saveStatus === 'saving' ? 'bg-yellow-500 animate-pulse' :
                  'bg-orange-500'
                }`}></div>
                <span>{
                  (saveStatus === 'saved' && !activeTab?.isDirty) ? 'Saved' :
                  saveStatus === 'saving' ? 'Saving...' :
                  'Unsaved'
                }</span>
              </div>
            </div>
                </footer>
                )}
              </div>
            }
            rightPanel={
            <div 
              ref={previewRef}
              className="h-full p-4 sm:p-6 lg:p-8 overflow-y-auto bg-bg-surface custom-scrollbar"
            >
              <div className="prose prose-invert max-w-none markdown-preview">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight, rehypeRaw]}
                  remarkRehypeOptions={{
                    allowDangerousHtml: true,
                  }}
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-2xl font-bold text-color-text mb-4 mt-6 first:mt-0">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-xl font-semibold text-color-text mb-3 mt-5">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-lg font-semibold text-color-text mb-2 mt-4">
                        {children}
                      </h3>
                    ),

                    ul: ({ children, className, ...props }) => {
                      const isTaskList = className?.includes('contains-task-list') || 
                                        React.Children.toArray(children).some((child: any) => 
                                          child?.props?.className?.includes('task-list-item')
                                        );
                      
                      if (isTaskList) {
                        return (
                          <ul className="text-color-text mb-3 pl-0 list-none space-y-1" {...props}>
                            {children}
                          </ul>
                        );
                      }
                      
                      return (
                        <ul className="text-color-text mb-3 pl-6 list-disc" {...props}>
                          {children}
                        </ul>
                      );
                    },
                    ol: ({ children }) => (
                      <ol className="text-color-text mb-3 pl-6 list-decimal">
                        {children}
                      </ol>
                    ),
                    li: ({ children, ...props }) => {
                      const isTaskList = props.className?.includes('task-list-item') || 
                                        (typeof children === 'object' && 
                                         React.Children.toArray(children).some((child: any) => 
                                           child?.type === 'input' && child?.props?.type === 'checkbox'
                                         ));
                      
                      if (isTaskList) {
                        return (
                          <li className="text-color-text flex items-start space-x-2 list-none mb-2 pl-0" {...props}>
                            {children}
                          </li>
                        );
                      }
                      return (
                        <li className="text-color-text mb-1">
                          {children}
                        </li>
                      );
                    },
                    strong: ({ children }) => (
                      <strong className="font-semibold text-color-text">
                        {children}
                      </strong>
                    ),
                    em: ({ children }) => (
                      <em className="italic text-color-text">
                        {children}
                      </em>
                    ),
                    del: ({ children }) => (
                      <del className="line-through text-color-text-muted">
                        {children}
                      </del>
                    ),
                    img: ({ src, alt, ...props }) => {
                      if (!src) return null;
                      
                      // Handle our custom image:// protocol
                      if (src.startsWith('image://')) {
                        const imageId = src.replace('image://', '');
                        
                        // Use a component that handles async image loading
                        return (
                          <AsyncImage 
                            imageId={imageId}
                            alt={alt}
                            getImage={getImage}
                          />
                        );
                      }
                      
                      // Handle regular URLs and base64 (legacy)
                      // Base64 images should be auto-converted, but handle them just in case
                      if (src.startsWith('data:image/')) {
                        return (
                          <div className="mb-4 text-center">
                            <img 
                              src={src} 
                              alt={alt || 'Image'} 
                              className="max-w-full h-auto rounded-lg shadow-sm border border-color-text-muted/20 mx-auto"
                              loading="lazy"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const errorDiv = document.createElement('div');
                                errorDiv.className = 'text-red-400 text-sm p-3 border border-red-400/20 rounded bg-red-500/10';
                                errorDiv.textContent = `❌ Failed to load base64 image: ${alt || 'Unknown'}`;
                                target.parentNode?.insertBefore(errorDiv, target);
                              }}
                              {...props}
                            />
                          </div>
                        );
                      }
                      
                      return (
                        <div className="mb-4 text-center">
                          <img 
                            src={src} 
                            alt={alt || 'Image'} 
                            className="max-w-full h-auto rounded-lg shadow-sm border border-color-text-muted/20 mx-auto"
                            loading="lazy"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const errorDiv = document.createElement('div');
                              errorDiv.className = 'text-red-400 text-sm p-3 border border-red-400/20 rounded bg-red-500/10';
                              errorDiv.textContent = `❌ Failed to load image: ${alt || 'Unknown'}`;
                              target.parentNode?.insertBefore(errorDiv, target);
                            }}
                            {...props}
                          />
                        </div>
                      );
                    },
                    table: ({ children }) => (
                      <div className="overflow-x-auto mb-4 rounded-lg border border-color-text-muted/30 shadow-sm">
                        <table className="min-w-full">
                          {children}
                        </table>
                      </div>
                    ),
                    thead: ({ children }) => (
                      <thead className="bg-color-accent/10 border-b border-color-accent/20">
                        {children}
                      </thead>
                    ),
                    tbody: ({ children }) => (
                      <tbody>
                        {children}
                      </tbody>
                    ),
                    tr: ({ children }) => (
                      <tr className="border-b border-color-text-muted/20">
                        {children}
                      </tr>
                    ),
                    th: ({ children }) => (
                      <th className="px-3 py-2 text-left text-color-text font-semibold border-r border-color-text-muted/20 last:border-r-0">
                        {children}
                      </th>
                    ),
                    td: ({ children }) => (
                      <td className="px-3 py-2 text-color-text border-r border-color-text-muted/20 last:border-r-0">
                        {children}
                      </td>
                    ),
                    code: ({ node, className, children, ...props }: any) => {
                      const match = /language-(\w+)/.exec(className || '');
                      const inline = props.inline;
                      return !inline && match ? (
                        <pre className="bg-bg-primary p-4 rounded-lg border border-color-text-muted/20 overflow-x-auto mb-4 shadow-sm relative">
                          {match && (
                            <div className="absolute top-2 right-3 text-xs text-color-text-muted uppercase tracking-wider opacity-60">
                              {match[1]}
                            </div>
                          )}
                          <code className={className} {...props}>
                            {children}
                          </code>
                        </pre>
                      ) : (
                        <code className="bg-bg-primary px-2 py-1 rounded text-color-accent font-mono text-sm border border-color-text-muted/20" {...props}>
                          {children}
                        </code>
                      );
                    },
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-color-accent pl-4 py-2 my-3 text-color-text italic bg-color-accent/5 rounded-r">
                        {children}
                      </blockquote>
                    ),
                    hr: () => (
                      <div className="my-8 w-full">
                        <div className="w-full border-t border-color-text/30 relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-color-text/20 to-transparent h-px"></div>
                        </div>
                      </div>
                    ),
                    // Handle text nodes that might contain horizontal rules
                    p: ({ children, ...props }) => {
                      // Check if this paragraph contains only a horizontal rule pattern
                      if (typeof children === 'string' && /^---+$/.test(children.trim())) {
                        return (
                          <div className="my-8 w-full">
                            <div className="w-full border-t border-color-text/30 relative">
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-color-text/20 to-transparent h-px"></div>
                            </div>
                          </div>
                        );
                      }
                      
                      return (
                        <p className="text-color-text mb-3 leading-relaxed" {...props}>
                          {children}
                        </p>
                      );
                    },
                    a: ({ href, children, ...props }) => (
                      <a 
                        href={href} 
                        className="text-color-accent hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                        {...props}
                      >
                        {children}
                      </a>
                    ),
                    input: ({ type, checked, disabled, ...props }) => {
                      if (type === 'checkbox') {
                        return (
                          <div className="relative flex-shrink-0 mr-2 mt-0.5">
                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={disabled}
                              readOnly
                              className="sr-only"
                              {...props}
                            />
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-200 cursor-pointer ${
                              checked 
                                ? 'bg-color-accent border-color-accent' 
                                : 'bg-bg-surface border-color-text-muted/50 hover:border-color-accent/70'
                            }`}>
                              {checked && (
                                <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          </div>
                        );
                      }
                      return <input type={type} checked={checked} disabled={disabled} {...props} />;
                    },
                  }}
                >
                  {debouncedContent}
                </ReactMarkdown>
              </div>
            </div>
            }
            storageKey="notura-editor-splitter-width"
            onReset={splitterResetRef}
          />
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex-1 flex overflow-hidden relative">
              {/* Line Numbers */}
              <div 
                ref={lineNumbersRef}
                className="flex-shrink-0 py-3 sm:py-4 lg:py-6 pl-2 sm:pl-3 lg:pl-4 pr-2 bg-bg-surface/30 border-r border-color-text-muted/5 overflow-hidden"
                style={{ width: '45px' }}
              >
                <LineNumbers 
                  content={rawTabContent} 
                  lineHeight={24} 
                  className="text-right"
                />
              </div>
              
              {/* Editor */}
              <div className="flex-1 py-3 sm:py-4 lg:py-6 pl-2 sm:pl-3 lg:pl-4 pr-0 overflow-hidden relative">
                <textarea
                  ref={textareaRef}
                  className="w-full h-full resize-none bg-transparent text-color-text 
                             placeholder-color-text-muted border-none outline-none focus:outline-none
                             font-mono text-sm sm:text-base leading-relaxed overflow-y-auto editor-scrollbar
                             selection:bg-color-primary/30"
                  placeholder="Start writing your note..."
                  value={rawTabContent}
                  onChange={handleContentChange}
                  onMouseUp={handleTextSelection}
                  onKeyUp={handleTextSelection}
                  onSelect={handleTextSelection}
                  onScroll={handleEditorScroll}
                  onKeyDown={handleKeyDown}
                  onPaste={handlePaste}
                  style={{ 
                    boxShadow: 'none',
                    border: 'none',
                    outline: 'none',
                    lineHeight: '24px'
                  }}
                />
              </div>
            </div>
            
            {/* Editor Footer */}
            {!zenMode && (
              <footer className="p-3 sm:p-4 border-t border-color-text-muted/20 bg-bg-surface">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm text-color-text-muted space-y-2 sm:space-y-0">
                  <div className="flex items-center space-x-2 sm:space-x-4">
                    <span>Lines: {stats.lines}</span>
                    <span>Words: {stats.words}</span>
                    <span>Characters: {stats.characters}</span>
                    <span className="hidden sm:inline">Reading time: ~{stats.readingTime} min</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      (saveStatus === 'saved' && !activeTab?.isDirty) ? 'bg-green-500' :
                      saveStatus === 'saving' ? 'bg-yellow-500 animate-pulse' :
                      'bg-orange-500'
                    }`}></div>
                    <span>{
                      (saveStatus === 'saved' && !activeTab?.isDirty) ? 'Saved' :
                      saveStatus === 'saving' ? 'Saving...' :
                      'Unsaved'
                    }</span>
                  </div>
                </div>
              </footer>
            )}
          </div>
        )}
      </div>

      {/* Text Selection Toolbar */}
      {showSelectionToolbar && (
        <TextSelectionToolbar
          selectedText={selectionInfo.text}
          selectionStart={selectionInfo.start}
          selectionEnd={selectionInfo.end}
          onFormatText={handleFormatText}
          onClose={() => setShowSelectionToolbar(false)}
          position={selectionInfo.position}
        />
      )}

      {/* Rename Note Modal */}
      <RenameNoteModal
        isOpen={showRenameModal}
        onClose={() => setShowRenameModal(false)}
        onConfirm={handleRenameConfirm}
        currentTitle={getActiveTab()?.title || 'Untitled Note'}
      />

      {/* Image Gallery Modal */}
      <ImageGalleryModal
        isOpen={showImageGallery}
        onClose={() => setShowImageGallery(false)}
        images={images}
        onDeleteImage={deleteImage}
        onInsertImage={handleInsertImageFromGallery}
      />
    </main>
  );
}
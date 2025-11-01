import React, { useState, useCallback } from 'react';
import { EnhancedSidebar } from './EnhancedSidebar';
import { MainEditor } from './MainEditor';
import { MetadataPanel } from './MetadataPanel';
import { ResizableSidebar } from '../ui';
import { useLocalStorage, useTabs, useNotes } from '../../hooks';
import { Note } from '../../types/notes';

interface AppLayoutProps {
  children?: React.ReactNode;
}

export function AppLayout({ children: _children }: AppLayoutProps) {
  // Responsive defaults: sidebar collapsed on mobile, metadata panel collapsed on tablet and below
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useLocalStorage('notura-sidebar-collapsed', false);
  const [isMetadataPanelCollapsed, setIsMetadataPanelCollapsed] = useLocalStorage('notura-metadata-collapsed', false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useLocalStorage('notura-mobile-menu', false);
  
  const [stats, setStats] = useState({
    lines: 0,
    words: 0,
    characters: 0,
    charactersNoSpaces: 0,
    readingTime: 1,
    paragraphs: 0
  });

  const [versionHistory, setVersionHistory] = useState<Array<{
    id: string;
    content: string;
    timestamp: Date;
    description: string;
  }>>([]);

  const [zenMode, setZenMode] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [images, setImages] = useState<Array<{
    id: string;
    filename: string;
    originalName: string;
    size: number;
    type: string;
    createdAt: Date;
  }>>([]);

  // Notes management
  const {
    notes,
    folders,
    createNote,
    updateNote,
    deleteNote,
    createFolder,
    updateFolder,
    deleteFolder,
    toggleFolderExpanded,
    moveNote,
    moveFolder,
  } = useNotes();

  // Tab system integration
  const {
    tabs,
    activeTabId,
    createTab,
    closeTab,
    selectTab,
    updateTabContent,
    updateTabTitle,
    markTabSaved,
    getActiveTab
  } = useTabs();

  // Sidebar handlers
  const handleNoteSelect = useCallback((note: Note) => {
    // Check if note is already open in a tab
    const existingTab = tabs.find(tab => tab.title === note.title);
    if (existingTab) {
      selectTab(existingTab.id);
    } else {
      // Create new tab with note content
      const tabId = createTab(note.title, note.content);
      selectTab(tabId);
    }
  }, [tabs, selectTab, createTab]);

  const handleNoteCreate = useCallback((folderId?: string, title?: string, content?: string) => {
    // Create a new note in the data store
    const newNote = createNote(folderId, title || 'Untitled Note', content || '');
    
    // Create a new tab for the new note
    const tabId = createTab(newNote.title, newNote.content);
    
    // Select the new tab
    selectTab(tabId);
    
    return newNote;
  }, [createNote, createTab, selectTab]);

  const handleTabCreate = useCallback((note: Note) => {
    // Always create a new tab for the note
    const tabId = createTab(note.title, note.content);
    selectTab(tabId);
  }, [createTab, selectTab]);

  // Tag management handlers
  const handleTagAdd = useCallback((tag: string) => {
    const activeTab = getActiveTab();
    if (activeTab) {
      // Find the corresponding note and update its tags
      const note = notes.find(n => n.title === activeTab.title);
      if (note && !note.tags.includes(tag)) {
        updateNote(note.id, { tags: [...note.tags, tag] });
      }
    }
  }, [getActiveTab, notes, updateNote]);

  const handleTagRemove = useCallback((tag: string) => {
    const activeTab = getActiveTab();
    if (activeTab) {
      // Find the corresponding note and update its tags
      const note = notes.find(n => n.title === activeTab.title);
      if (note) {
        updateNote(note.id, { tags: note.tags.filter(t => t !== tag) });
      }
    }
  }, [getActiveTab, notes, updateNote]);

  // Import handler
  const handleImportNote = useCallback((title: string, content: string) => {
    const newNote = createNote(undefined, title, content);
    const tabId = createTab(newNote.title, newNote.content);
    selectTab(tabId);
  }, [createNote, createTab, selectTab]);

  // Get current note tags
  const getCurrentNoteTags = useCallback(() => {
    const activeTab = getActiveTab();
    if (activeTab) {
      const note = notes.find(n => n.title === activeTab.title);
      return note?.tags || [];
    }
    return [];
  }, [getActiveTab, notes]);

  // Get current note dates
  const getCurrentNoteDates = useCallback(() => {
    const activeTab = getActiveTab();
    if (activeTab) {
      const note = notes.find(n => n.title === activeTab.title);
      return {
        createdAt: note?.createdAt,
        updatedAt: note?.updatedAt
      };
    }
    return {};
  }, [getActiveTab, notes]);

  return (
    <div className="flex h-screen bg-bg-primary text-color-text overflow-hidden">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Responsive behavior */}
      {!zenMode && (
        <ResizableSidebar
          isCollapsed={isSidebarCollapsed}
          isMobile={isMobileMenuOpen}
          className={`
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0
            fixed lg:relative
            z-50 lg:z-auto
            transition-transform duration-300 ease-in-out
            h-full
          `}
        >
          <EnhancedSidebar
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            onMobileClose={() => setIsMobileMenuOpen(false)}
            isMobile={false}
            notes={notes}
            folders={folders}
            onNoteSelect={handleNoteSelect}
            onNoteCreate={handleNoteCreate}
            onTabCreate={handleTabCreate}
            onNoteUpdate={updateNote}
            onNoteDelete={deleteNote}
            onFolderCreate={createFolder}
            onFolderUpdate={updateFolder}
            onFolderDelete={deleteFolder}
            onFolderToggle={toggleFolderExpanded}
            onNoteMove={moveNote}
            onFolderMove={moveFolder}
          />
        </ResizableSidebar>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex min-w-0 relative">
        {/* Mobile Menu Button */}
        {!zenMode && (
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden fixed top-4 left-4 z-30 p-2 rounded-lg bg-bg-surface border border-color-text-muted/20 hover:bg-color-primary/10 transition-colors"
            aria-label="Open menu"
          >
            <svg className="w-5 h-5 text-color-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        {/* Desktop Sidebar Toggle - Only show when sidebar is collapsed */}
        {!zenMode && isSidebarCollapsed && (
          <button
            onClick={() => setIsSidebarCollapsed(false)}
            className="hidden lg:block fixed top-4 left-4 z-30 p-2 rounded-lg bg-bg-surface border border-color-text-muted/20 hover:bg-color-primary/10 transition-colors"
            aria-label="Open sidebar"
          >
            <svg className="w-5 h-5 text-color-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        {/* Main Editor */}
        <MainEditor
          className="flex-1 min-w-0"
          onToggleMetadata={() => setIsMetadataPanelCollapsed(!isMetadataPanelCollapsed)}
          isMetadataPanelVisible={!isMetadataPanelCollapsed}
          onStatsChange={setStats}
          onVersionHistoryChange={setVersionHistory}
          onZenModeChange={setZenMode}
          onSaveStatusChange={setSaveStatus}
          onImagesChange={setImages}
          tabs={tabs}
          activeTabId={activeTabId}
          onTabCreate={() => createTab('Untitled Note', '')}
          onTabClose={closeTab}
          onTabSelect={selectTab}
          onTabContentUpdate={updateTabContent}
          onTabTitleUpdate={updateTabTitle}
          onTabMarkSaved={markTabSaved}
          getActiveTab={getActiveTab}
        />

        {/* Metadata Panel - Show on large screens and above */}
        {!zenMode && (
          <div className="hidden lg:block h-full">
            <MetadataPanel
              isCollapsed={isMetadataPanelCollapsed}
              onToggleCollapse={() => setIsMetadataPanelCollapsed(!isMetadataPanelCollapsed)}
              stats={stats}
              versionHistory={versionHistory}
              saveStatus={saveStatus}
              images={images}
              currentNoteTags={getCurrentNoteTags()}
              onTagAdd={handleTagAdd}
              onTagRemove={handleTagRemove}
              {...getCurrentNoteDates()}
              getActiveTab={getActiveTab}
              onImportNote={handleImportNote}
            />
          </div>
        )}

        {/* Collapsed Metadata Panel Indicator - Only on desktop */}
        {!zenMode && isMetadataPanelCollapsed && (
          <div className="hidden lg:block w-1 bg-color-primary/20 hover:bg-color-primary/40 transition-colors cursor-pointer relative group"
            onClick={() => setIsMetadataPanelCollapsed(false)}>
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-color-primary text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                Show Details
              </div>
            </div>
          </div>
        )}

        {/* Mobile/Tablet Metadata Panel - Slide up from bottom */}
        {!zenMode && !isMetadataPanelCollapsed && (
          <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 bg-bg-surface border-t border-color-text-muted/20 max-h-[60vh] overflow-y-auto scrollbar-thin transform transition-transform duration-300 ease-in-out" style={{ scrollbarWidth: 'thin' }}>
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-color-text">Note Details</h3>
                <button
                  onClick={() => setIsMetadataPanelCollapsed(true)}
                  className="p-1 rounded hover:bg-color-primary/10 transition-colors"
                >
                  <svg className="w-5 h-5 text-color-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <MetadataPanel
                isCollapsed={false}
                onToggleCollapse={() => setIsMetadataPanelCollapsed(true)}
                isMobile={true}
                stats={stats}
                versionHistory={versionHistory}
                saveStatus={saveStatus}
                images={images}
                currentNoteTags={getCurrentNoteTags()}
                onTagAdd={handleTagAdd}
                onTagRemove={handleTagRemove}
                {...getCurrentNoteDates()}
                getActiveTab={getActiveTab}
                onImportNote={handleImportNote}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
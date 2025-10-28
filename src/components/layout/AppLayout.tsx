import React from 'react';
import { Sidebar } from './Sidebar';
import { MainEditor } from './MainEditor';
import { MetadataPanel } from './MetadataPanel';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface AppLayoutProps {
  children?: React.ReactNode;
}

export function AppLayout({ children: _children }: AppLayoutProps) {
  // Responsive defaults: sidebar collapsed on mobile, metadata panel collapsed on tablet and below
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useLocalStorage('notura-sidebar-collapsed', false);
  const [isMetadataPanelCollapsed, setIsMetadataPanelCollapsed] = useLocalStorage('notura-metadata-collapsed', false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useLocalStorage('notura-mobile-menu', false);

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
      <div className={`
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
        fixed lg:relative
        z-50 lg:z-auto
        transition-transform duration-300 ease-in-out
        h-full
      `}>
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onMobileClose={() => setIsMobileMenuOpen(false)}
          isMobile={false}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex min-w-0 relative">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-30 p-2 rounded-lg bg-bg-surface border border-color-text-muted/20 hover:bg-color-primary/10 transition-colors"
          aria-label="Open menu"
        >
          <svg className="w-5 h-5 text-color-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Desktop Sidebar Toggle - Only show when sidebar is collapsed */}
        {isSidebarCollapsed && (
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
        />

        {/* Metadata Panel - Show on large screens and above */}
        <div className="hidden lg:block h-full">
          <MetadataPanel
            isCollapsed={isMetadataPanelCollapsed}
            onToggleCollapse={() => setIsMetadataPanelCollapsed(!isMetadataPanelCollapsed)}
          />
        </div>

        {/* Collapsed Metadata Panel Indicator - Only on desktop */}
        {isMetadataPanelCollapsed && (
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
        {!isMetadataPanelCollapsed && (
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
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
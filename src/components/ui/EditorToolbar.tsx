import { useState } from 'react';
import { ImageModal } from './ImageModal';
import { InstructionsModal } from './InstructionsModal';
import { TableModal } from './TableModal';
import { ChecklistModal } from './ChecklistModal';
import { QuoteModal } from './QuoteModal';
import { LinkModal } from './LinkModal';
import { VersionHistoryDropdown } from './VersionHistoryDropdown';

interface EditorToolbarProps {
  onInsertText: (text: string) => void;
  onImageUpload?: (file: File) => void;
  versions?: Array<{
    id: string;
    content: string;
    timestamp: Date;
    description: string;
  }>;
  currentVersionId?: string;
  onVersionSelect?: (versionId: string) => void;
  className?: string;
}



export function EditorToolbar({ 
  onInsertText, 
  onImageUpload,
  versions = [], 
  currentVersionId = '', 
  onVersionSelect,
  className = '' 
}: EditorToolbarProps) {
  const [showImageModal, setShowImageModal] = useState(false);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);

  const handleQuickInsert = (text: string) => {
    onInsertText(text);
  };

  const handleImageInsert = (imageMarkdown: string) => {
    onInsertText(`${imageMarkdown}`);
    setShowImageModal(false);
  };



  return (
    <>
      <div className={`flex items-center space-x-2 p-2 bg-bg-surface/80 backdrop-blur-sm border-b border-color-text-muted/20 ${className}`}>
        {/* Quick insert buttons */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowTableModal(true);
          }}
          className="flex items-center space-x-1 px-3 py-2 text-sm text-color-text 
                     hover:bg-bg-primary rounded transition-colors border border-transparent
                     hover:border-color-text-muted/20 active:bg-color-primary/20"
          title="Table"
          type="button"
        >
          <span>Table</span>
        </button>

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowChecklistModal(true);
          }}
          className="flex items-center space-x-1 px-3 py-2 text-sm text-color-text 
                     hover:bg-bg-primary rounded transition-colors border border-transparent
                     hover:border-color-text-muted/20 active:bg-color-primary/20"
          title="Checklist"
          type="button"
        >
          <span>Checklist</span>
        </button>

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowQuoteModal(true);
          }}
          className="flex items-center space-x-1 px-3 py-2 text-sm text-color-text 
                     hover:bg-bg-primary rounded transition-colors border border-transparent
                     hover:border-color-text-muted/20 active:bg-color-primary/20"
          title="Quote"
          type="button"
        >
          <span>Quote</span>
        </button>

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleQuickInsert('---');
          }}
          className="flex items-center space-x-1 px-3 py-2 text-sm text-color-text 
                     hover:bg-bg-primary rounded transition-colors border border-transparent
                     hover:border-color-text-muted/20 active:bg-color-primary/20"
          title="Divider"
          type="button"
        >
          <span>Divider</span>
        </button>

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowLinkModal(true);
          }}
          className="flex items-center space-x-1 px-3 py-2 text-sm text-color-text 
                     hover:bg-bg-primary rounded transition-colors border border-transparent
                     hover:border-color-text-muted/20 active:bg-color-primary/20"
          title="Link"
          type="button"
        >
          <span>Link</span>
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-color-text-muted/20" />

        {/* Image upload button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowImageModal(true);
          }}
          className="flex items-center space-x-1 px-3 py-2 text-sm text-color-text 
                     hover:bg-bg-primary rounded transition-colors border border-transparent
                     hover:border-color-text-muted/20 active:bg-color-primary/20"
          title="Insert Image"
          type="button"
        >
          <span>Image</span>
        </button>

        {/* Version History */}
        {versions.length > 0 && onVersionSelect && (
          <>
            <div className="w-px h-6 bg-color-text-muted/20" />
            <VersionHistoryDropdown
              versions={versions}
              currentVersionId={currentVersionId}
              onVersionSelect={onVersionSelect}
            />
          </>
        )}

        {/* Instructions button */}
        <div className="flex-1" />
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowInstructionsModal(true);
          }}
          className="flex items-center space-x-1 px-3 py-2 text-sm text-color-text 
                     hover:bg-bg-primary rounded transition-colors border border-transparent
                     hover:border-color-text-muted/20 active:bg-color-primary/20"
          title="View markdown instructions and shortcuts"
          type="button"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="hidden sm:inline">Help</span>
        </button>
      </div>

      {/* Image upload modal */}
      <ImageModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        onInsertImage={handleImageInsert}
        onUploadImage={onImageUpload}
      />

      {/* Instructions modal */}
      <InstructionsModal
        isOpen={showInstructionsModal}
        onClose={() => setShowInstructionsModal(false)}
      />

      {/* Table modal */}
      <TableModal
        isOpen={showTableModal}
        onClose={() => setShowTableModal(false)}
        onConfirm={onInsertText}
      />

      {/* Checklist modal */}
      <ChecklistModal
        isOpen={showChecklistModal}
        onClose={() => setShowChecklistModal(false)}
        onConfirm={onInsertText}
      />

      {/* Quote modal */}
      <QuoteModal
        isOpen={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
        onConfirm={onInsertText}
      />

      {/* Link modal */}
      <LinkModal
        isOpen={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        onConfirm={onInsertText}
      />
    </>
  );
}
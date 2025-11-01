import { Modal } from './Modal';

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InstructionsModal({ isOpen, onClose }: InstructionsModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Markdown Instructions & Shortcuts"
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto">
        {/* Basic Formatting */}
        <section>
          <h3 className="text-lg font-semibold text-color-text mb-3">Basic Formatting</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center p-2 bg-bg-primary rounded">
              <span className="text-color-text-muted">Bold text</span>
              <code className="text-color-accent">**bold** or Ctrl+B</code>
            </div>
            <div className="flex justify-between items-center p-2 bg-bg-primary rounded">
              <span className="text-color-text-muted">Italic text</span>
              <code className="text-color-accent">*italic* or Ctrl+I</code>
            </div>
            <div className="flex justify-between items-center p-2 bg-bg-primary rounded">
              <span className="text-color-text-muted">Strikethrough</span>
              <code className="text-color-accent">~~strikethrough~~</code>
            </div>
            <div className="flex justify-between items-center p-2 bg-bg-primary rounded">
              <span className="text-color-text-muted">Inline code</span>
              <code className="text-color-accent">`code`</code>
            </div>
            <div className="flex justify-between items-center p-2 bg-bg-primary rounded">
              <span className="text-color-text-muted">Highlight</span>
              <code className="text-color-accent">==highlight==</code>
            </div>
          </div>
        </section>

        {/* Headings */}
        <section>
          <h3 className="text-lg font-semibold text-color-text mb-3">Headings</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center p-2 bg-bg-primary rounded">
              <span className="text-color-text-muted">Heading 1</span>
              <code className="text-color-accent"># Heading 1</code>
            </div>
            <div className="flex justify-between items-center p-2 bg-bg-primary rounded">
              <span className="text-color-text-muted">Heading 2</span>
              <code className="text-color-accent">## Heading 2</code>
            </div>
            <div className="flex justify-between items-center p-2 bg-bg-primary rounded">
              <span className="text-color-text-muted">Heading 3</span>
              <code className="text-color-accent">### Heading 3</code>
            </div>
          </div>
        </section>

        {/* Lists */}
        <section>
          <h3 className="text-lg font-semibold text-color-text mb-3">Lists</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center p-2 bg-bg-primary rounded">
              <span className="text-color-text-muted">Unordered list</span>
              <code className="text-color-accent">- Item or * Item</code>
            </div>
            <div className="flex justify-between items-center p-2 bg-bg-primary rounded">
              <span className="text-color-text-muted">Ordered list</span>
              <code className="text-color-accent">1. Item</code>
            </div>
            <div className="flex justify-between items-center p-2 bg-bg-primary rounded">
              <span className="text-color-text-muted">Task list</span>
              <code className="text-color-accent">- [ ] Task or - [x] Done</code>
            </div>
          </div>
        </section>

        {/* Links and Images */}
        <section>
          <h3 className="text-lg font-semibold text-color-text mb-3">Links & Images</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center p-2 bg-bg-primary rounded">
              <span className="text-color-text-muted">Link</span>
              <code className="text-color-accent">[text](url) or Ctrl+K</code>
            </div>
            <div className="flex justify-between items-center p-2 bg-bg-primary rounded">
              <span className="text-color-text-muted">Image</span>
              <code className="text-color-accent">![alt](url)</code>
            </div>
            <div className="flex justify-between items-center p-2 bg-bg-primary rounded">
              <span className="text-color-text-muted">Auto link</span>
              <code className="text-color-accent">https://example.com</code>
            </div>
          </div>
        </section>

        {/* Code Blocks */}
        <section>
          <h3 className="text-lg font-semibold text-color-text mb-3">Code Blocks</h3>
          <div className="space-y-2 text-sm">
            <div className="p-2 bg-bg-primary rounded">
              <span className="text-color-text-muted block mb-1">Code block:</span>
              <code className="text-color-accent block">```language<br />code here<br />```</code>
            </div>
            <div className="p-2 bg-bg-primary rounded">
              <span className="text-color-text-muted block mb-1">Supported languages:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {['javascript', 'python', 'java', 'cpp', 'html', 'css', 'json', 'sql', 'bash', 'typescript'].map(lang => (
                  <span key={lang} className="px-2 py-1 bg-color-primary/20 rounded text-xs text-color-accent">{lang}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Tables */}
        <section>
          <h3 className="text-lg font-semibold text-color-text mb-3">Tables</h3>
          <div className="p-2 bg-bg-primary rounded text-sm">
            <code className="text-color-accent block whitespace-pre">
{`| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Row 1    | Data     | Data     |
| Row 2    | Data     | Data     |`}
            </code>
          </div>
        </section>

        {/* Other Elements */}
        <section>
          <h3 className="text-lg font-semibold text-color-text mb-3">Other Elements</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center p-2 bg-bg-primary rounded">
              <span className="text-color-text-muted">Blockquote</span>
              <code className="text-color-accent">&gt; Quote text</code>
            </div>
            <div className="flex justify-between items-center p-2 bg-bg-primary rounded">
              <span className="text-color-text-muted">Horizontal rule</span>
              <code className="text-color-accent">--- or ***</code>
            </div>
            <div className="flex justify-between items-center p-2 bg-bg-primary rounded">
              <span className="text-color-text-muted">Line break</span>
              <code className="text-color-accent">Two spaces + Enter</code>
            </div>
          </div>
        </section>

        {/* Keyboard Shortcuts */}
        <section>
          <h3 className="text-lg font-semibold text-color-text mb-3">Keyboard Shortcuts</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center p-2 bg-bg-primary rounded">
              <span className="text-color-text-muted">Save note</span>
              <code className="text-color-accent">Ctrl+S</code>
            </div>
            <div className="flex justify-between items-center p-2 bg-bg-primary rounded">
              <span className="text-color-text-muted">Switch tabs</span>
              <code className="text-color-accent">Ctrl+Tab / Ctrl+Shift+Tab</code>
            </div>
            <div className="flex justify-between items-center p-2 bg-bg-primary rounded">
              <span className="text-color-text-muted">Direct tab access</span>
              <code className="text-color-accent">Ctrl+1, Ctrl+2, etc.</code>
            </div>
            <div className="flex justify-between items-center p-2 bg-bg-primary rounded">
              <span className="text-color-text-muted">Toggle zen mode</span>
              <code className="text-color-accent">Click zen icon</code>
            </div>
          </div>
        </section>

        {/* Tips */}
        <section>
          <h3 className="text-lg font-semibold text-color-text mb-3">Pro Tips</h3>
          <div className="space-y-2 text-sm text-color-text-muted">
            <div className="p-2 bg-bg-primary rounded">
              • Select text to see formatting options in the floating toolbar
            </div>
            <div className="p-2 bg-bg-primary rounded">
              • Use the toolbar buttons for quick insertion of tables, checklists, etc.
            </div>
            <div className="p-2 bg-bg-primary rounded">
              • Drag and drop images directly into the editor
            </div>
            <div className="p-2 bg-bg-primary rounded">
              • Auto-scroll keeps preview in sync with editor position
            </div>
            <div className="p-2 bg-bg-primary rounded">
              • Version history automatically saves your work every few seconds
            </div>
          </div>
        </section>
      </div>
    </Modal>
  );
}
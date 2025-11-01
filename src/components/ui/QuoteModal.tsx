import { useState } from 'react';
import { Modal } from './Modal';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (quoteMarkdown: string) => void;
}

export function QuoteModal({ isOpen, onClose, onConfirm }: QuoteModalProps) {
  const [quote, setQuote] = useState('This is a blockquote\nIt can span multiple lines');
  const [author, setAuthor] = useState('');

  const generateQuote = () => {
    const lines = quote.split('\n').map(line => `> ${line}`).join('\n');
    if (author.trim()) {
      return `${lines}\n>\n> — ${author.trim()}`;
    }
    return lines;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quote.trim()) {
      onConfirm(generateQuote());
      onClose();
    }
  };

  const handleClose = () => {
    setQuote('This is a blockquote\nIt can span multiple lines');
    setAuthor('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Quote"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="quote-text" className="block text-sm font-medium text-color-text mb-2">
            Quote Text
          </label>
          <textarea
            id="quote-text"
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
            placeholder="Enter your quote here..."
            rows={4}
            className="w-full px-3 py-2 bg-bg-primary border border-color-text-muted/20 
                       rounded text-color-text placeholder-color-text-muted 
                       focus:outline-none focus:border-color-accent focus:ring-1 focus:ring-color-accent
                       resize-none"
            autoFocus
          />
          {!quote.trim() && (
            <p className="text-red-400 text-sm mt-1">Quote text cannot be empty</p>
          )}
        </div>

        <div>
          <label htmlFor="quote-author" className="block text-sm font-medium text-color-text mb-2">
            Author (Optional)
          </label>
          <input
            id="quote-author"
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Author name..."
            className="w-full px-3 py-2 bg-bg-primary border border-color-text-muted/20 
                       rounded text-color-text placeholder-color-text-muted 
                       focus:outline-none focus:border-color-accent focus:ring-1 focus:ring-color-accent"
          />
        </div>

        {/* Preview */}
        <div>
          <label className="block text-sm font-medium text-color-text mb-2">
            Preview
          </label>
          <div className="p-3 bg-bg-primary border border-color-text-muted/20 rounded">
            <blockquote className="border-l-4 border-color-accent pl-4 italic text-color-text-muted">
              {quote.split('\n').map((line, index) => (
                <div key={index}>{line}</div>
              ))}
              {author.trim() && (
                <>
                  <div className="mt-2"></div>
                  <div>— {author.trim()}</div>
                </>
              )}
            </blockquote>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-color-text-muted hover:text-color-text 
                       hover:bg-color-primary/10 rounded transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!quote.trim()}
            className="px-4 py-2 bg-color-accent text-white rounded 
                       hover:bg-color-accent/80 disabled:opacity-50 
                       disabled:cursor-not-allowed transition-colors"
          >
            Create Quote
          </button>
        </div>
      </form>
    </Modal>
  );
}
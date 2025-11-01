import { useState } from 'react';
import { Modal } from './Modal';

interface TableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (tableMarkdown: string) => void;
}

export function TableModal({ isOpen, onClose, onConfirm }: TableModalProps) {
  const [rows, setRows] = useState(3);
  const [columns, setColumns] = useState(3);
  const [headers, setHeaders] = useState<string[]>(['Column 1', 'Column 2', 'Column 3']);
  const [data, setData] = useState<string[][]>([
    ['Row 1', 'Data', 'Data'],
    ['Row 2', 'Data', 'Data']
  ]);

  const handleRowsChange = (newRows: number) => {
    setRows(newRows);
    const newData = [...data];
    while (newData.length < newRows - 1) {
      newData.push(new Array(columns).fill('Data'));
    }
    while (newData.length > newRows - 1) {
      newData.pop();
    }
    setData(newData);
  };

  const handleColumnsChange = (newColumns: number) => {
    setColumns(newColumns);
    const newHeaders = [...headers];
    while (newHeaders.length < newColumns) {
      newHeaders.push(`Column ${newHeaders.length + 1}`);
    }
    while (newHeaders.length > newColumns) {
      newHeaders.pop();
    }
    setHeaders(newHeaders);

    const newData = data.map(row => {
      const newRow = [...row];
      while (newRow.length < newColumns) {
        newRow.push('Data');
      }
      while (newRow.length > newColumns) {
        newRow.pop();
      }
      return newRow;
    });
    setData(newData);
  };

  const handleHeaderChange = (index: number, value: string) => {
    const newHeaders = [...headers];
    newHeaders[index] = value;
    setHeaders(newHeaders);
  };

  const handleDataChange = (rowIndex: number, colIndex: number, value: string) => {
    const newData = [...data];
    newData[rowIndex][colIndex] = value;
    setData(newData);
  };

  const generateTable = () => {
    const headerRow = `| ${headers.join(' | ')} |`;
    const separatorRow = `|${headers.map(() => '----------').join('|')}|`;
    const dataRows = data.map(row => `| ${row.join(' | ')} |`).join('\n');
    
    return `${headerRow}\n${separatorRow}\n${dataRows}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(generateTable());
    onClose();
  };

  const handleClose = () => {
    // Reset to defaults
    setRows(3);
    setColumns(3);
    setHeaders(['Column 1', 'Column 2', 'Column 3']);
    setData([
      ['Row 1', 'Data', 'Data'],
      ['Row 2', 'Data', 'Data']
    ]);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Table"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Table dimensions */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-color-text mb-2">
              Rows
            </label>
            <input
              type="number"
              min="2"
              max="10"
              value={rows}
              onChange={(e) => handleRowsChange(parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-bg-primary border border-color-text-muted/20 
                         rounded text-color-text focus:outline-none focus:border-color-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-color-text mb-2">
              Columns
            </label>
            <input
              type="number"
              min="2"
              max="6"
              value={columns}
              onChange={(e) => handleColumnsChange(parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-bg-primary border border-color-text-muted/20 
                         rounded text-color-text focus:outline-none focus:border-color-accent"
            />
          </div>
        </div>

        {/* Headers */}
        <div>
          <label className="block text-sm font-medium text-color-text mb-2">
            Headers
          </label>
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {headers.map((header, index) => (
              <input
                key={index}
                type="text"
                value={header}
                onChange={(e) => handleHeaderChange(index, e.target.value)}
                className="px-2 py-1 bg-bg-primary border border-color-text-muted/20 
                           rounded text-sm text-color-text focus:outline-none focus:border-color-accent"
                placeholder={`Header ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Data rows */}
        <div>
          <label className="block text-sm font-medium text-color-text mb-2">
            Data
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {data.map((row, rowIndex) => (
              <div key={rowIndex} className="grid gap-2" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                {row.map((cell, colIndex) => (
                  <input
                    key={colIndex}
                    type="text"
                    value={cell}
                    onChange={(e) => handleDataChange(rowIndex, colIndex, e.target.value)}
                    className="px-2 py-1 bg-bg-primary border border-color-text-muted/20 
                               rounded text-sm text-color-text focus:outline-none focus:border-color-accent"
                    placeholder="Data"
                  />
                ))}
              </div>
            ))}
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
            className="px-4 py-2 bg-color-accent text-white rounded 
                       hover:bg-color-accent/80 transition-colors"
          >
            Create Table
          </button>
        </div>
      </form>
    </Modal>
  );
}
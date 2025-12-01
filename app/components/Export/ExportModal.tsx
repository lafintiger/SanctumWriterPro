'use client';

import React, { useState } from 'react';
import { 
  X, 
  Download, 
  FileText,
  FileType,
  File,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store/useAppStore';
import { 
  exportDocument, 
  ExportFormat, 
  EXPORT_FORMATS, 
  ExportOptions 
} from '@/lib/utils/exportDocument';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const { currentDocument, showToast } = useAppStore();
  
  const [format, setFormat] = useState<ExportFormat>('pdf');
  const [title, setTitle] = useState(currentDocument?.name.replace(/\.md$/, '') || 'Document');
  const [author, setAuthor] = useState('');
  const [includeTitle, setIncludeTitle] = useState(true);
  const [pageSize, setPageSize] = useState<'A4' | 'Letter'>('A4');
  const [isExporting, setIsExporting] = useState(false);
  
  // Update title when document changes
  React.useEffect(() => {
    if (currentDocument) {
      setTitle(currentDocument.name.replace(/\.md$/, ''));
    }
  }, [currentDocument]);
  
  if (!isOpen) return null;
  
  const handleExport = async () => {
    if (!currentDocument) {
      showToast('No document to export', 'error');
      return;
    }
    
    setIsExporting(true);
    
    try {
      const options: ExportOptions = {
        title,
        author: author || undefined,
        includeTitle,
        pageSize,
      };
      
      await exportDocument(currentDocument.content, format, options);
      showToast(`Exported as ${format.toUpperCase()}`, 'success');
      onClose();
    } catch (error) {
      showToast(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setIsExporting(false);
    }
  };
  
  const getFormatIcon = (f: ExportFormat) => {
    switch (f) {
      case 'pdf': return <FileText className="w-5 h-5" />;
      case 'docx': return <FileType className="w-5 h-5" />;
      default: return <File className="w-5 h-5" />;
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-sidebar-bg border border-border rounded-lg w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-accent" />
            <h3 className="text-lg font-semibold text-text-primary">Export Document</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-border rounded text-text-secondary hover:text-text-primary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Format selection */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Format
            </label>
            <div className="grid grid-cols-2 gap-2">
              {EXPORT_FORMATS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFormat(f.value)}
                  className={cn(
                    'flex items-center gap-2 p-3 rounded border text-left transition-colors',
                    format === f.value
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-border hover:border-accent/50 text-text-primary'
                  )}
                >
                  {getFormatIcon(f.value)}
                  <div>
                    <div className="text-sm font-medium">{f.label}</div>
                    <div className="text-xs text-text-secondary">{f.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Document Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-editor-bg border border-border rounded text-text-primary focus:outline-none focus:border-accent"
            />
          </div>
          
          {/* Author */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Author (optional)
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Your name"
              className="w-full px-3 py-2 bg-editor-bg border border-border rounded text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent"
            />
          </div>
          
          {/* Options */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeTitle}
                onChange={(e) => setIncludeTitle(e.target.checked)}
                className="w-4 h-4 rounded border-border text-accent focus:ring-accent"
              />
              <span className="text-sm text-text-primary">Include title page</span>
            </label>
          </div>
          
          {/* Page size (for PDF) */}
          {format === 'pdf' && (
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Page Size
              </label>
              <div className="flex gap-2">
                {(['A4', 'Letter'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => setPageSize(size)}
                    className={cn(
                      'px-4 py-2 rounded border text-sm transition-colors',
                      pageSize === size
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border text-text-primary hover:border-accent/50'
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex justify-end gap-2 px-4 py-3 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary border border-border rounded hover:bg-border transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting || !currentDocument}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-accent hover:bg-accent/80 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}


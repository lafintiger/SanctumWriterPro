'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  File, 
  Folder, 
  FolderOpen,
  Plus,
  RefreshCw,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store/useAppStore';
import { FileNode, Document } from '@/types';

interface FileItemProps {
  node: FileNode;
  depth: number;
  onSelect: (node: FileNode) => void;
  selectedPath: string | null;
}

function FileItem({ node, depth, onSelect, selectedPath }: FileItemProps) {
  const [isExpanded, setIsExpanded] = useState(depth < 2);
  const isSelected = selectedPath === node.path;
  const isDirectory = node.type === 'directory';

  const handleClick = () => {
    if (isDirectory) {
      setIsExpanded(!isExpanded);
    } else {
      onSelect(node);
    }
  };

  return (
    <div>
      <div
        className={cn(
          'file-item flex items-center gap-1 px-2 py-1 cursor-pointer text-sm',
          isSelected && !isDirectory && 'active'
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={handleClick}
      >
        {isDirectory ? (
          <>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-text-secondary flex-shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 text-text-secondary flex-shrink-0" />
            )}
            {isExpanded ? (
              <FolderOpen className="w-4 h-4 text-accent flex-shrink-0" />
            ) : (
              <Folder className="w-4 h-4 text-accent flex-shrink-0" />
            )}
          </>
        ) : (
          <>
            <span className="w-4" />
            <FileText className="w-4 h-4 text-text-secondary flex-shrink-0" />
          </>
        )}
        <span className={cn(
          'truncate',
          isSelected && !isDirectory ? 'text-text-primary' : 'text-text-secondary'
        )}>
          {node.name}
        </span>
      </div>
      
      {isDirectory && isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <FileItem
              key={child.path}
              node={child}
              depth={depth + 1}
              onSelect={onSelect}
              selectedPath={selectedPath}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileTree() {
  const { files, setFiles, currentDocument, openDocument, showToast } = useAppStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loadFiles = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/files');
      if (response.ok) {
        const data = await response.json();
        setFiles(data.files);
      }
    } catch (error) {
      console.error('Failed to load files:', error);
      showToast('Failed to load files', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [setFiles, showToast]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const handleSelectFile = useCallback(async (node: FileNode) => {
    if (node.type === 'directory') return;

    try {
      const response = await fetch(`/api/files/${node.path}`);
      if (response.ok) {
        const data = await response.json();
        const doc: Document = {
          path: data.path,
          name: data.name,
          content: data.content,
          isDirty: false,
        };
        openDocument(doc);
      }
    } catch (error) {
      console.error('Failed to open file:', error);
      showToast('Failed to open file', 'error');
    }
  }, [openDocument, showToast]);

  const handleCreateFile = useCallback(async () => {
    if (!newFileName.trim()) {
      setIsCreating(false);
      return;
    }

    const fileName = newFileName.endsWith('.md') ? newFileName : `${newFileName}.md`;

    try {
      const response = await fetch('/api/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: fileName }),
      });

      if (response.ok) {
        const data = await response.json();
        await loadFiles();
        
        const doc: Document = {
          path: data.path,
          name: data.name,
          content: data.content,
          isDirty: false,
        };
        openDocument(doc);
        showToast(`Created ${fileName}`, 'success');
      } else {
        const error = await response.json();
        showToast(error.error || 'Failed to create file', 'error');
      }
    } catch (error) {
      console.error('Failed to create file:', error);
      showToast('Failed to create file', 'error');
    }

    setIsCreating(false);
    setNewFileName('');
  }, [newFileName, loadFiles, openDocument, showToast]);

  return (
    <div className="h-full flex flex-col bg-sidebar-bg">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
          Files
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsCreating(true)}
            className="p-1 hover:bg-border rounded text-text-secondary hover:text-text-primary"
            title="New File"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={loadFiles}
            className={cn(
              'p-1 hover:bg-border rounded text-text-secondary hover:text-text-primary',
              isLoading && 'animate-spin'
            )}
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* New file input */}
      {isCreating && (
        <div className="px-2 py-2 border-b border-border">
          <input
            type="text"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateFile();
              if (e.key === 'Escape') {
                setIsCreating(false);
                setNewFileName('');
              }
            }}
            onBlur={handleCreateFile}
            placeholder="filename.md"
            className="w-full px-2 py-1 text-sm bg-editor-bg border border-border rounded focus:border-accent focus:outline-none"
            autoFocus
          />
        </div>
      )}

      {/* File list */}
      <div className="flex-1 overflow-auto py-1">
        {files.length === 0 ? (
          <div className="px-3 py-4 text-sm text-text-secondary text-center">
            <File className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No files yet</p>
            <p className="text-xs mt-1">Click + to create one</p>
          </div>
        ) : (
          files.map((node) => (
            <FileItem
              key={node.path}
              node={node}
              depth={0}
              onSelect={handleSelectFile}
              selectedPath={currentDocument?.path || null}
            />
          ))
        )}
      </div>
    </div>
  );
}


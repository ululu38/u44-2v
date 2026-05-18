'use client';

import React, { useState, useRef, useEffect } from 'react';

interface TextBlockProps {
  id: string;
  type: 'p' | 'h1' | 'h2' | 'h3';
  content: string;
  marginTop: number;
  marginBottom: number;
  onUpdate: (updates: Partial<{ content: string; marginTop: number; marginBottom: number; type: 'p' | 'h1' | 'h2' | 'h3' }>) => void;
  onRemove: () => void;
}

const TextBlock: React.FC<TextBlockProps> = ({ 
  type, content, marginTop, marginBottom, onUpdate, onRemove 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isDragging, setIsDragging] = useState<'top' | 'bottom' | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const startMargin = useRef(0);

  // Sync content with ref
  useEffect(() => {
    if (contentRef.current && contentRef.current.innerHTML !== content) {
      contentRef.current.innerHTML = content;
    }
  }, [content]);

  // --- Margin Drag Logic ---
  const handleDragStart = (e: React.MouseEvent, pos: 'top' | 'bottom') => {
    e.preventDefault();
    setIsDragging(pos);
    startY.current = e.clientY;
    startMargin.current = pos === 'top' ? marginTop : marginBottom;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const delta = e.clientY - startY.current;
      const newMargin = Math.max(0, startMargin.current + (isDragging === 'top' ? delta : -delta));
      
      if (isDragging === 'top') {
        onUpdate({ marginTop: Math.round(newMargin) });
      } else {
        onUpdate({ marginBottom: Math.round(newMargin) });
      }
    };

    const handleMouseUp = () => setIsDragging(null);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, onUpdate]);

  const getTagClass = () => {
    switch (type) {
      case 'h1': return 'text-4xl font-extrabold text-white leading-tight';
      case 'h2': return 'text-3xl font-bold text-gray-100';
      case 'h3': return 'text-2xl font-bold text-gray-200';
      default: return 'text-lg leading-relaxed text-gray-300';
    }
  };

  return (
    <div 
      className={`group relative transition-all duration-200 rounded-lg ${isFocused ? 'ring-2 ring-blue-500/50 bg-blue-500/5' : 'hover:bg-white/5'}`}
      style={{ 
        marginTop: `${marginTop}px`, 
        marginBottom: `${marginBottom}px`,
        padding: '8px 12px'
      }}
      onClick={() => setIsFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsFocused(false);
        }
      }}
    >
      {/* Margin Handles (Visible on Focus) */}
      {isFocused && (
        <>
          <div 
            onMouseDown={(e) => handleDragStart(e, 'top')}
            className="absolute top-0 left-0 right-0 h-1 cursor-ns-resize hover:bg-blue-500/40 z-20 flex items-center justify-center group/h"
          >
            <div className="hidden group-hover/h:block bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded -top-6 absolute font-bold">
              Margin Top: {marginTop}px
            </div>
          </div>
          <div 
            onMouseDown={(e) => handleDragStart(e, 'bottom')}
            className="absolute bottom-0 left-0 right-0 h-1 cursor-ns-resize hover:bg-blue-500/40 z-20 flex items-center justify-center group/h"
          >
            <div className="hidden group-hover/h:block bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded -bottom-6 absolute font-bold">
              Margin Bottom: {marginBottom}px
            </div>
          </div>
        </>
      )}

      {/* Block Actions */}
      <div className="absolute -left-12 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
        <button 
          type="button"
          onClick={onRemove}
          className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded transition-all"
        >
          <span className="material-symbols-outlined text-sm">delete</span>
        </button>
      </div>

      <div
        ref={contentRef}
        contentEditable
        onInput={(e) => onUpdate({ content: e.currentTarget.innerHTML })}
        className={`outline-none min-h-[1.5em] ${getTagClass()}`}
        placeholder={type === 'p' ? 'Start typing...' : 'Heading...'}
        onKeyDown={(e) => {
          if (e.key === 'Backspace') {
            // If content is empty or just whitespace/single BR, remove block
            const text = contentRef.current?.textContent?.trim() || '';
            const html = contentRef.current?.innerHTML || '';
            if (!text && (!html || html === '<br>' || html === '<div><br></div>')) {
              e.preventDefault();
              onRemove();
            }
            return;
          }
          if (e.key === 'Enter') {
            const selection = window.getSelection();
            const anchorNode = selection?.anchorNode;
            if (anchorNode) {
              const parent = anchorNode.nodeType === Node.TEXT_NODE ? anchorNode.parentElement : anchorNode as HTMLElement;
              if (parent?.closest('li')) {
                // Let default behavior handle <li> creation
                return;
              }
            }
            e.preventDefault();
            document.execCommand('insertLineBreak');
          }
        }}
      />

      {/* Toolbar for Text Type */}
      {isFocused && (
        <div className="absolute -top-12 left-0 flex items-center gap-1 bg-gray-900 border border-gray-700 rounded-lg p-1 shadow-xl z-30 scale-90 origin-left">
          {(['p', 'h1', 'h2', 'h3'] as const).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => onUpdate({ type: t })}
              className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${type === t ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TextBlock;

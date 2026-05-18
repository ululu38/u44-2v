'use client';

import React, { useRef } from 'react';

interface FloatingToolbarProps {
  selection: {
    visible: boolean;
    bold: boolean;
    italic: boolean;
    underline: boolean;
    blockType: string;
    align: string;
  };
  onClose: () => void;
  onFormatBlock: (tag: string) => void;
}

const FloatingToolbar: React.FC<FloatingToolbarProps> = ({ selection: sel }) => {
  const toolbarRef = useRef<HTMLDivElement>(null);

  if (!sel.visible) return null;

  const btnBase = 'px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:bg-white/20 active:scale-95 flex items-center gap-1';
  const btnActive = 'bg-blue-600 text-white shadow-lg shadow-blue-500/30';
  const btnInactive = 'text-white/80 hover:text-white';

  const format = (cmd: string, val: string = '') => {
    document.execCommand(cmd, false, val);
  };

  const createLink = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    
    const range = sel.getRangeAt(0);
    const selectedText = range.toString().trim();
    
    const url = prompt('ป้อนลิงก์ (URL):', 'https://');
    if (!url || !url.trim()) return;
    
    const href = /^(https?:\/\/)/i.test(url.trim()) ? url.trim() : `https://${url.trim()}`;
    const displayText = selectedText || href;
    
    const linkHtml = `<a href="${href}" target="_blank" class="text-blue-400 hover:text-blue-300 underline transition-colors cursor-pointer pointer-events-auto" rel="noopener noreferrer">${displayText}</a>`;
    document.execCommand('insertHTML', false, linkHtml);
    
    // Trigger editor content synchronization
    document.dispatchEvent(new Event('input', { bubbles: true }));
  };

  const isBlockActive = (tag: string) => {
    const val = (sel.blockType || 'p').toLowerCase();
    return val === tag || val === `<${tag}>` || (tag === 'p' && (val === 'div' || val === 'body' || val === ''));
  };

  return (
    <div
      ref={toolbarRef}
      className="pointer-events-auto"
      onMouseDown={(e) => e.preventDefault()}
    >
      <div className="flex items-center gap-1 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl px-3 py-2 backdrop-blur-md">
        {/* Inline Styles */}
        <button type="button" onClick={() => format('bold')} className={`${btnBase} ${sel.bold ? btnActive : btnInactive}`} title="Bold">
          <span className="material-symbols-outlined text-sm">format_bold</span>
        </button>
        <button type="button" onClick={() => format('italic')} className={`${btnBase} ${sel.italic ? btnActive : btnInactive}`} title="Italic">
          <span className="material-symbols-outlined text-sm">format_italic</span>
        </button>
        <button type="button" onClick={() => format('underline')} className={`${btnBase} ${sel.underline ? btnActive : btnInactive}`} title="Underline">
          <span className="material-symbols-outlined text-sm">format_underlined</span>
        </button>
        <button type="button" onClick={createLink} className={`${btnBase} ${btnInactive}`} title="Insert Link">
          <span className="material-symbols-outlined text-sm">link</span>
        </button>

        <div className="w-[1px] h-6 bg-gray-700 mx-1" />

        {/* Block Types */}
        <button type="button" onClick={() => format('formatBlock', 'h1')} className={`${btnBase} ${isBlockActive('h1') ? btnActive : btnInactive}`}>
          H1
        </button>
        <button type="button" onClick={() => format('formatBlock', 'h2')} className={`${btnBase} ${isBlockActive('h2') ? btnActive : btnInactive}`}>
          H2
        </button>
        <button type="button" onClick={() => format('formatBlock', 'h3')} className={`${btnBase} ${isBlockActive('h3') ? btnActive : btnInactive}`}>
          H3
        </button>
        <button type="button" onClick={() => format('formatBlock', 'p')} className={`${btnBase} ${isBlockActive('p') ? btnActive : btnInactive}`}>
          P
        </button>

        <div className="w-[1px] h-6 bg-gray-700 mx-1" />

        {/* Lists */}
        <button type="button" onClick={() => format('insertUnorderedList')} className={`${btnBase} ${isBlockActive('ul') ? btnActive : btnInactive}`} title="Bullet List">
          <span className="material-symbols-outlined text-sm">format_list_bulleted</span>
        </button>
        <button type="button" onClick={() => format('insertOrderedList')} className={`${btnBase} ${isBlockActive('ol') ? btnActive : btnInactive}`} title="Numbered List">
          <span className="material-symbols-outlined text-sm">format_list_numbered</span>
        </button>

        <div className="w-[1px] h-6 bg-gray-700 mx-1" />

        {/* Text Alignments */}
        <button type="button" onClick={() => format('justifyLeft')} className={`${btnBase} ${sel.align === 'left' ? btnActive : btnInactive}`} title="Align Left">
          <span className="material-symbols-outlined text-sm">format_align_left</span>
        </button>
        <button type="button" onClick={() => format('justifyCenter')} className={`${btnBase} ${sel.align === 'center' ? btnActive : btnInactive}`} title="Align Center">
          <span className="material-symbols-outlined text-sm">format_align_center</span>
        </button>
        <button type="button" onClick={() => format('justifyRight')} className={`${btnBase} ${sel.align === 'right' ? btnActive : btnInactive}`} title="Align Right">
          <span className="material-symbols-outlined text-sm">format_align_right</span>
        </button>
      </div>
    </div>
  );
};

export default FloatingToolbar;

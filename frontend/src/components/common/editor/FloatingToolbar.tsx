'use client';

import React from 'react';

interface FloatingToolbarProps {
  selection: {
    visible: boolean;
    bold: boolean;
    italic: boolean;
    underline: boolean;
    blockType: string;
    align: string;
    isUl: boolean;
    isOl: boolean;
  };
  imageAlign?: 'left' | 'center' | 'right';
  onImageAlign?: (align: 'left' | 'center' | 'right') => void;
  onFormat: (cmd: string, val?: string) => void;
}

const FloatingToolbar: React.FC<FloatingToolbarProps> = ({ selection: sel, imageAlign, onImageAlign, onFormat }) => {

  if (!sel.visible) return null;

  const btnBase = 'px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:bg-white/20 active:scale-95 flex items-center gap-1';
  const btnActive = 'bg-blue-600 text-white shadow-lg shadow-blue-500/30';
  const btnInactive = 'text-white/80 hover:text-white';

  const createLink = () => {
    onFormat('createLink');
  };

  const isBlockActive = (tag: string) => {
    const val = (sel.blockType || 'p').toLowerCase();
    return val === tag || val === `<${tag}>` || (tag === 'p' && (val === 'div' || val === 'body' || val === ''));
  };

  return (
    <div
      className="pointer-events-auto"
      onMouseDown={(e) => e.preventDefault()}
    >
      <div className="flex items-center gap-1 bg-gray-900 px-3 py-2 backdrop-blur-md w-max min-w-max">
        {/* Inline Styles */}
        <button type="button" onClick={() => onFormat('bold')} className={`${btnBase} ${sel.bold ? btnActive : btnInactive}`} title="Bold">
          <span className="material-symbols-outlined text-sm">format_bold</span>
        </button>
        <button type="button" onClick={() => onFormat('italic')} className={`${btnBase} ${sel.italic ? btnActive : btnInactive}`} title="Italic">
          <span className="material-symbols-outlined text-sm">format_italic</span>
        </button>
        <button type="button" onClick={() => onFormat('underline')} className={`${btnBase} ${sel.underline ? btnActive : btnInactive}`} title="Underline">
          <span className="material-symbols-outlined text-sm">format_underlined</span>
        </button>
        <button type="button" onClick={createLink} className={`${btnBase} ${btnInactive}`} title="Insert Link">
          <span className="material-symbols-outlined text-sm">link</span>
        </button>

        <div className="w-[1px] h-6 bg-gray-700 mx-1" />

        {/* Block Types */}
        <button type="button" onClick={() => onFormat('formatBlock', 'h1')} className={`${btnBase} ${isBlockActive('h1') ? btnActive : btnInactive}`}>
          H1
        </button>
        <button type="button" onClick={() => onFormat('formatBlock', 'h2')} className={`${btnBase} ${isBlockActive('h2') ? btnActive : btnInactive}`}>
          H2
        </button>
        <button type="button" onClick={() => onFormat('formatBlock', 'h3')} className={`${btnBase} ${isBlockActive('h3') ? btnActive : btnInactive}`}>
          H3
        </button>
        <button type="button" onClick={() => onFormat('formatBlock', 'p')} className={`${btnBase} ${isBlockActive('p') ? btnActive : btnInactive}`}>
          P
        </button>

        <div className="w-[1px] h-6 bg-gray-700 mx-1" />

        {/* Lists */}
        <button type="button" onClick={() => onFormat('insertUnorderedList')} className={`${btnBase} ${sel.isUl ? btnActive : btnInactive}`} title="Bullet List">
          <span className="material-symbols-outlined text-sm">format_list_bulleted</span>
        </button>
        <button type="button" onClick={() => onFormat('insertOrderedList')} className={`${btnBase} ${sel.isOl ? btnActive : btnInactive}`} title="Numbered List">
          <span className="material-symbols-outlined text-sm">format_list_numbered</span>
        </button>

        <div className="w-[1px] h-6 bg-gray-700 mx-1" />

        {/* Image Align (แสดงเมื่อ select รูป) หรือ Text Align (ปกติ) */}
        {imageAlign !== undefined && onImageAlign ? (
          <>
            {(['left', 'center', 'right'] as const).map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => onImageAlign(a)}
                className={`${btnBase} ${imageAlign === a ? btnActive : btnInactive}`}
                title={`Align Image ${a}`}
              >
                <span className="material-symbols-outlined text-sm">format_align_{a}</span>
              </button>
            ))}
          </>
        ) : (
          <>
            <button type="button" onClick={() => onFormat('justifyLeft')} className={`${btnBase} ${sel.align === 'left' ? btnActive : btnInactive}`} title="Align Left">
              <span className="material-symbols-outlined text-sm">format_align_left</span>
            </button>
            <button type="button" onClick={() => onFormat('justifyCenter')} className={`${btnBase} ${sel.align === 'center' ? btnActive : btnInactive}`} title="Align Center">
              <span className="material-symbols-outlined text-sm">format_align_center</span>
            </button>
            <button type="button" onClick={() => onFormat('justifyRight')} className={`${btnBase} ${sel.align === 'right' ? btnActive : btnInactive}`} title="Align Right">
              <span className="material-symbols-outlined text-sm">format_align_right</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default FloatingToolbar;

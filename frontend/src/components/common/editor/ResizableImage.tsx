'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

interface ResizableImageProps {
  id: string;
  src: string;
  width: string;
  textAlign: string;
  shadow: string;
  radius: string;
  marginTop: number;
  marginBottom: number;
  onUpdate: (updates: Partial<{ width: string; textAlign: string; shadow: string; radius: string; marginTop: number; marginBottom: number }>) => void;
  onRemove: () => void;
}

const ResizableImage: React.FC<ResizableImageProps> = ({ 
  src, width, textAlign, shadow, radius, marginTop, marginBottom, onUpdate, onRemove 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isDraggingMargin, setIsDraggingMargin] = useState<'top' | 'bottom' | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const startW = useRef(0);
  const startMargin = useRef(0);
  const activeHandle = useRef<string>('');

  // --- Resize logic ---
  const onResizeStart = (e: React.MouseEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    activeHandle.current = handle;
    startX.current = e.clientX;
    startW.current = containerRef.current?.offsetWidth || 0;
  };

  // --- Margin drag logic ---
  const onMarginDragStart = (e: React.MouseEvent, pos: 'top' | 'bottom') => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingMargin(pos);
    startY.current = e.clientY;
    startMargin.current = pos === 'top' ? marginTop : marginBottom;
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (isResizing) {
        const dx = e.clientX - startX.current;
        const parentW = containerRef.current?.parentElement?.offsetWidth || 800;
        let newW = startW.current;
        if (activeHandle.current === 'se' || activeHandle.current === 'ne') newW += dx * 2;
        else newW -= dx * 2;
        const pct = Math.round((Math.max(100, Math.min(newW, parentW)) / parentW) * 100);
        onUpdate({ width: `${pct}%` });
      }
      if (isDraggingMargin) {
        const dy = e.clientY - startY.current;
        const val = Math.max(0, startMargin.current + (isDraggingMargin === 'top' ? dy : -dy));
        if (isDraggingMargin === 'top') onUpdate({ marginTop: Math.round(val) });
        else onUpdate({ marginBottom: Math.round(val) });
      }
    };
    const onUp = () => {
      setIsResizing(false);
      setIsDraggingMargin(null);
    };

    if (isResizing || isDraggingMargin) {
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isResizing, isDraggingMargin, onUpdate]);

  const getShadowStyle = () => {
    if (shadow === 'soft') return '0 10px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.1)';
    if (shadow === 'hard') return '0 20px 40px -5px rgba(0,0,0,0.3), 0 10px 15px -6px rgba(0,0,0,0.2)';
    return 'none';
  };

  const alignClass = textAlign === 'center' ? 'mx-auto' : textAlign === 'right' ? 'ml-auto mr-0' : 'mr-auto ml-0';

  return (
    <div 
      className={`relative group transition-all duration-200 py-4 ${isFocused ? 'ring-2 ring-blue-500/30 bg-blue-500/5 rounded-xl' : 'hover:bg-white/5 rounded-xl'}`}
      style={{ marginTop: `${marginTop}px`, marginBottom: `${marginBottom}px` }}
      onClick={() => setIsFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsFocused(false);
      }}
    >
      {/* Margin Handles */}
      {isFocused && (
        <>
          <div onMouseDown={(e) => onMarginDragStart(e, 'top')} className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-blue-500/30 z-20" />
          <div onMouseDown={(e) => onMarginDragStart(e, 'bottom')} className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-blue-500/30 z-20" />
        </>
      )}

      {/* Block Controls */}
      <div className="absolute -left-12 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2">
        <button type="button" onClick={onRemove} className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all">
          <span className="material-symbols-outlined text-sm">delete</span>
        </button>
      </div>

      {/* Image Container */}
      <div 
        ref={containerRef}
        className={`relative inline-block transition-all duration-300 ${alignClass}`}
        style={{ width, borderRadius: radius, boxShadow: getShadowStyle() }}
      >
        <img src={src} alt="" className="w-full h-auto block" style={{ borderRadius: radius }} draggable={false} />

        {isFocused && (
          <>
            {/* Resize border */}
            <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none" style={{ borderRadius: radius }} />
            
            {/* Corner Handles */}
            {['nw', 'ne', 'sw', 'se'].map(h => (
              <div
                key={h}
                onMouseDown={(e) => onResizeStart(e, h)}
                className={`absolute w-3 h-3 bg-white border-2 border-blue-500 rounded-full shadow-md hover:scale-150 transition-transform z-30 cursor-${h === 'nw' || h === 'se' ? 'nwse' : 'nesw'}-resize
                  ${h === 'nw' ? '-top-1.5 -left-1.5' : h === 'ne' ? '-top-1.5 -right-1.5' : h === 'sw' ? '-bottom-1.5 -left-1.5' : '-bottom-1.5 -right-1.5'}
                `}
              />
            ))}

            {/* Design Toolbar */}
            <div className="absolute -top-14 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl px-2 py-1.5 z-40">
              {(['left', 'center', 'right'] as const).map(a => (
                <button key={a} type="button" onClick={() => onUpdate({ textAlign: a })} className={`p-1.5 rounded-md transition-colors ${textAlign === a ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10'}`}>
                  <span className="material-symbols-outlined text-sm">format_align_{a}</span>
                </button>
              ))}
              <div className="w-[1px] h-5 bg-gray-600 mx-1" />
              <button type="button" onClick={() => onUpdate({ shadow: shadow === 'none' ? 'soft' : shadow === 'soft' ? 'hard' : 'none' })} className="px-2 py-1 rounded text-[10px] font-bold text-white bg-white/10 hover:bg-white/20">Shadow</button>
              <button type="button" onClick={() => onUpdate({ radius: radius === '0px' ? '12px' : radius === '12px' ? '999px' : '0px' })} className="px-2 py-1 rounded text-[10px] font-bold text-white bg-white/10 hover:bg-white/20">Round</button>
              <div className="w-[1px] h-5 bg-gray-200/20 mx-1" />
              <span className="text-[10px] font-bold text-blue-400">{width}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ResizableImage;

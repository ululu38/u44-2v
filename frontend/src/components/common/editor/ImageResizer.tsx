'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

interface ImageResizerProps {
  /** The <figure> element wrapping the image */
  figure: HTMLElement;
  /** The canvas/editor div that ImageResizer is positioned relative to */
  canvasRef: React.RefObject<HTMLDivElement>;
  /** Called whenever a style change should be persisted */
  onUpdate: () => void;
}

/** Corner handle directions for resize */
type HandleDir = 'se' | 'sw' | 'ne' | 'nw' | 'e' | 'w';

const ImageResizer: React.FC<ImageResizerProps> = ({ figure, canvasRef, onUpdate }) => {
  const img = figure.querySelector('img') as HTMLImageElement | null;

  /* ---------- overlay position (tracks figure) ---------- */
  const [box, setBox] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  const refreshBox = useCallback(() => {
    if (!canvasRef.current || !figure) return;
    const cRect = canvasRef.current.getBoundingClientRect();
    const fRect = figure.getBoundingClientRect();
    setBox({
      top: fRect.top - cRect.top,
      left: fRect.left - cRect.left,
      width: fRect.width,
      height: fRect.height,
    });
  }, [figure, canvasRef]);

  useEffect(() => {
    refreshBox();
    const ro = new ResizeObserver(() => requestAnimationFrame(refreshBox));
    ro.observe(figure);
    if (canvasRef.current) ro.observe(canvasRef.current);
    window.addEventListener('resize', refreshBox);
    return () => { ro.disconnect(); window.removeEventListener('resize', refreshBox); };
  }, [refreshBox, figure, canvasRef]);

  /* ---------- drag-resize state ---------- */
  const dragging = useRef<{ dir: HandleDir; startX: number; startW: number; parentW: number } | null>(null);

  const startResize = (e: React.MouseEvent, dir: HandleDir) => {
    e.preventDefault();
    e.stopPropagation();
    const parentW = canvasRef.current?.offsetWidth ?? 1;
    dragging.current = {
      dir,
      startX: e.clientX,
      startW: figure.offsetWidth,
      parentW,
    };
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const { dir, startX, startW, parentW } = dragging.current;
      const dx = e.clientX - startX;
      // east handles grow right, west handles grow left (invert)
      const sign = dir.includes('e') ? 1 : -1;
      const newW = Math.min(parentW, Math.max(80, startW + sign * dx));
      figure.style.width = `${(newW / parentW) * 100}%`;
      requestAnimationFrame(refreshBox);
      onUpdate();
    };
    const onUp = () => { dragging.current = null; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [figure, refreshBox, onUpdate]);

  /* ---------- style controls (radius + shadow + margin + alignment) ---------- */
  const getInitialRadius = () => {
    if (!img) return 12;
    const v = parseInt(img.style.borderRadius || window.getComputedStyle(img).borderRadius);
    return isNaN(v) ? 12 : v;
  };
  const getInitialShadow = () => {
    if (!img) return 25;
    const bs = img.style.boxShadow || window.getComputedStyle(img).boxShadow;
    if (!bs || bs === 'none') return 0;
    const m = bs.match(/px\s+(-?\d+)px\s+(\d+)px/);
    return m ? parseInt(m[2]) : 25;
  };
  const getInitialMargin = () => {
    if (!figure) return 32;
    const style = window.getComputedStyle(figure);
    const v = parseInt(style.marginTop);
    return isNaN(v) ? 32 : v;
  };
  const getInitialAlign = () => {
    if (!figure) return 'center';
    const ml = figure.style.marginLeft;
    const mr = figure.style.marginRight;
    if (ml === '0px' && mr === 'auto') return 'left';
    if (ml === 'auto' && mr === '0px') return 'right';
    return 'center';
  };

  const [radius, setRadius] = useState(getInitialRadius);
  const [shadow, setShadow] = useState(getInitialShadow);
  const [margin, setMargin] = useState(getInitialMargin);
  const [align, setAlign] = useState<'left' | 'center' | 'right'>(getInitialAlign);

  // Sync range slider values when switching figure/image targets
  useEffect(() => {
    setRadius(getInitialRadius());
    setShadow(getInitialShadow());
    setMargin(getInitialMargin());
    setAlign(getInitialAlign());
  }, [figure, img]);

  const applyRadius = (val: number) => {
    setRadius(val);
    if (img) { img.style.borderRadius = `${val}px`; onUpdate(); }
  };

  const applyShadow = (val: number) => {
    setShadow(val);
    if (img) {
      img.style.boxShadow = val === 0
        ? 'none'
        : `0 ${Math.round(val * 0.4)}px ${val}px -${Math.round(val * 0.2)}px rgba(0,0,0,0.18)`;
      onUpdate();
    }
  };

  const applyMargin = (val: number) => {
    setMargin(val);
    figure.style.marginTop = `${val}px`;
    figure.style.marginBottom = `${val}px`;
    requestAnimationFrame(refreshBox);
    onUpdate();
  };

  const applyAlign = (value: 'left' | 'center' | 'right') => {
    setAlign(value);
    if (value === 'left') {
      figure.style.marginLeft = '0px';
      figure.style.marginRight = 'auto';
      figure.style.textAlign = 'left';
    } else if (value === 'right') {
      figure.style.marginLeft = 'auto';
      figure.style.marginRight = '0px';
      figure.style.textAlign = 'right';
    } else {
      figure.style.marginLeft = 'auto';
      figure.style.marginRight = 'auto';
      figure.style.textAlign = 'center';
    }
    requestAnimationFrame(refreshBox);
    onUpdate();
  };

  if (!box) return null;

  /* ---------- render ---------- */
  const handleCls =
    'absolute w-3 h-3 bg-white border-2 border-blue-500 rounded-full shadow-md cursor-pointer z-20 pointer-events-auto hover:bg-blue-400 transition-colors';

  const panelTop = box.top >= 72 ? box.top - 64 : box.top + box.height + 8;

  return (
    <>
      {/* Outline overlay */}
      <div
        className="absolute z-10 pointer-events-none margin-handle-container"
        style={{ top: box.top, left: box.left, width: box.width, height: box.height }}
      >
        <div className="absolute inset-0 border-2 border-blue-500/50 rounded-lg ring-4 ring-blue-500/10 pointer-events-none" />

        {/* Margin handles */}
        <div
          className="absolute -top-1 left-0 right-0 h-2 bg-blue-500/10 cursor-ns-resize pointer-events-auto hover:bg-blue-500/50 transition-colors"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const startY = e.clientY;
            const style = window.getComputedStyle(figure);
            const startM = parseInt(style.marginTop) || 0;
            const onMove = (ev: MouseEvent) => {
              const val = Math.max(0, startM + ev.clientY - startY);
              figure.style.marginTop = `${val}px`;
              setMargin(val);
              refreshBox();
              onUpdate();
            };
            const onUp = () => {
              window.removeEventListener('mousemove', onMove);
              window.removeEventListener('mouseup', onUp);
            };
            window.addEventListener('mousemove', onMove);
            window.addEventListener('mouseup', onUp);
          }}
        />
        <div
          className="absolute -bottom-1 left-0 right-0 h-2 bg-blue-500/10 cursor-ns-resize pointer-events-auto hover:bg-blue-500/50 transition-colors"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const startY = e.clientY;
            const style = window.getComputedStyle(figure);
            const startM = parseInt(style.marginBottom) || 0;
            const onMove = (ev: MouseEvent) => {
              const val = Math.max(0, startM - (ev.clientY - startY));
              figure.style.marginBottom = `${val}px`;
              setMargin(val);
              refreshBox();
              onUpdate();
            };
            const onUp = () => {
              window.removeEventListener('mousemove', onMove);
              window.removeEventListener('mouseup', onUp);
            };
            window.addEventListener('mousemove', onMove);
            window.addEventListener('mouseup', onUp);
          }}
        />

        {/* Corner + edge resize handles */}
        <div onMouseDown={(e) => startResize(e, 'nw')} className={`${handleCls} -top-1.5 -left-1.5 cursor-nw-resize`} />
        <div onMouseDown={(e) => startResize(e, 'ne')} className={`${handleCls} -top-1.5 -right-1.5 cursor-ne-resize`} />
        <div onMouseDown={(e) => startResize(e, 'sw')} className={`${handleCls} -bottom-1.5 -left-1.5 cursor-sw-resize`} />
        <div onMouseDown={(e) => startResize(e, 'se')} className={`${handleCls} -bottom-1.5 -right-1.5 cursor-se-resize`} />

        {/* Side resize handles */}
        <div
          onMouseDown={(e) => startResize(e, 'e')}
          className="absolute top-1/2 -right-2 -translate-y-1/2 w-4 h-14 flex items-center justify-center cursor-ew-resize pointer-events-auto group"
        >
          <div className="w-1.5 h-10 bg-blue-500/40 group-hover:bg-blue-500 rounded-full transition-colors" />
        </div>
        <div
          onMouseDown={(e) => startResize(e, 'w')}
          className="absolute top-1/2 -left-2 -translate-y-1/2 w-4 h-14 flex items-center justify-center cursor-ew-resize pointer-events-auto group"
        >
          <div className="w-1.5 h-10 bg-blue-500/40 group-hover:bg-blue-500 rounded-full transition-colors" />
        </div>
      </div>

      {/* Floating style controls panel */}
      <div
        className="absolute z-30 pointer-events-auto image-resizer-panel"
        style={{ top: panelTop, left: box.left + box.width / 2 - 270, minWidth: 540 }}
        onMouseDown={(e) => {
          // If we clicked an input range slider or button, allow the mouse events to behave properly
          const targetTagName = (e.target as HTMLElement).tagName;
          if (targetTagName === 'INPUT' || targetTagName === 'BUTTON' || (e.target as HTMLElement).closest('button')) {
            e.stopPropagation();
            return;
          }
          // Prevent other clicks from taking focus from editor canvas
          e.preventDefault();
        }}
      >
        <div className="flex items-center gap-3 bg-gray-900/95 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl px-5 py-3">
          {/* Radius */}
          <div className="flex flex-col gap-1 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Radius</span>
              <span className="text-[10px] font-mono text-blue-400">{radius}px</span>
            </div>
            <input
              type="range" min={0} max={120} value={radius}
              onChange={(e) => applyRadius(Number(e.target.value))}
              className="w-full h-1.5 rounded-full cursor-pointer accent-blue-500"
            />
          </div>

          <div className="w-px h-8 bg-white/10 shrink-0" />

          {/* Shadow */}
          <div className="flex flex-col gap-1 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Shadow</span>
              <span className="text-[10px] font-mono text-blue-400">{shadow}px</span>
            </div>
            <input
              type="range" min={0} max={80} value={shadow}
              onChange={(e) => applyShadow(Number(e.target.value))}
              className="w-full h-1.5 rounded-full cursor-pointer accent-blue-500"
            />
          </div>

          <div className="w-px h-8 bg-white/10 shrink-0" />

          {/* Margin */}
          <div className="flex flex-col gap-1 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Margin</span>
              <span className="text-[10px] font-mono text-blue-400">{margin}px</span>
            </div>
            <input
              type="range" min={0} max={120} value={margin}
              onChange={(e) => applyMargin(Number(e.target.value))}
              className="w-full h-1.5 rounded-full cursor-pointer accent-blue-500"
            />
          </div>

          <div className="w-px h-8 bg-white/10 shrink-0" />

          {/* Alignment */}
          <div className="flex flex-col gap-1 shrink-0">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center mb-1">Align</span>
            <div className="flex bg-white/5 rounded-xl p-0.5 border border-white/5">
              <button
                type="button"
                onClick={() => applyAlign('left')}
                className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${
                  align === 'left'
                    ? 'bg-blue-600 text-white shadow-md scale-105'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                title="Align Left"
              >
                <span className="material-symbols-outlined text-[16px]">format_align_left</span>
              </button>
              <button
                type="button"
                onClick={() => applyAlign('center')}
                className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${
                  align === 'center'
                    ? 'bg-blue-600 text-white shadow-md scale-105'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                title="Align Center"
              >
                <span className="material-symbols-outlined text-[16px]">format_align_center</span>
              </button>
              <button
                type="button"
                onClick={() => applyAlign('right')}
                className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${
                  align === 'right'
                    ? 'bg-blue-600 text-white shadow-md scale-105'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                title="Align Right"
              >
                <span className="material-symbols-outlined text-[16px]">format_align_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ImageResizer;

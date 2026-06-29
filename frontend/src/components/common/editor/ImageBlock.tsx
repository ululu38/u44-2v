'use client';

import React, { useState, useRef, useEffect } from 'react';

interface ImageBlockProps {
  src: string;
  metadata: any;
  onUpdate: (metadata: any) => void;
}

const ImageBlock: React.FC<ImageBlockProps> = ({ src, metadata, onUpdate }) => {
  const [isResizing, setIsResizing] = useState(false);
  const [activeHandle, setActiveHandle] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const textAlign = metadata?.textAlign || 'center';
  const width = metadata?.width || '100%';
  const shadow = metadata?.shadow || 'none';
  const radius = metadata?.radius || '8px';

  const handleResizeStart = (e: React.MouseEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setActiveHandle(handle);
    startX.current = e.clientX;
    if (imgRef.current) {
      startWidth.current = imgRef.current.offsetWidth;
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const deltaX = e.clientX - startX.current;
      const containerWidth = containerRef.current?.offsetWidth || 1;
      
      let newWidthPx = startWidth.current;
      if (activeHandle === 'se' || activeHandle === 'ne') {
        newWidthPx += deltaX * 2;
      } else {
        newWidthPx -= deltaX * 2;
      }

      newWidthPx = Math.max(100, Math.min(newWidthPx, containerWidth));
      const newWidthPercent = (newWidthPx / containerWidth) * 100;
      
      onUpdate({ ...metadata, width: `${newWidthPercent}%` });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setActiveHandle(null);
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, activeHandle, metadata, onUpdate]);

  const getAlignmentClass = () => {
    if (textAlign === 'center') return 'mx-auto';
    if (textAlign === 'right') return 'ml-auto mr-0';
    return 'mr-auto ml-0';
  };

  const getShadowStyle = () => {
    if (shadow === 'soft') return '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)';
    if (shadow === 'hard') return '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.2)';
    return 'none';
  };

  return (
    <div ref={containerRef} className="w-full my-12 relative group py-4">
      <div 
        className={`relative inline-block transition-all duration-300 ${isResizing ? 'ring-2 ring-blue-500' : ''} ${getAlignmentClass()}`}
        style={{ 
          width, 
          boxShadow: getShadowStyle(),
          borderRadius: radius,
        }}
      >
        <img 
          ref={imgRef}
          src={src} 
          alt={metadata?.alt || ''} 
          className="w-full h-auto block transition-all duration-300"
          style={{ borderRadius: radius }}
          draggable={false}
        />

        {/* Canva-style Resize Handles */}
        <div className={`absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity ${isResizing ? 'opacity-100' : ''}`}>
          <div className="absolute inset-0 border-2 border-blue-500 pointer-events-none" style={{ borderRadius: radius }} />
          
          {['nw', 'ne', 'sw', 'se'].map((handle) => (
            <div
              key={handle}
              onMouseDown={(e) => handleResizeStart(e, handle)}
              className={`
                absolute pointer-events-auto w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow-lg cursor-${handle === 'nw' || handle === 'se' ? 'nwse' : 'nesw'}-resize
                ${handle === 'nw' ? '-top-2 -left-2' : ''}
                ${handle === 'ne' ? '-top-2 -right-2' : ''}
                ${handle === 'sw' ? '-bottom-2 -left-2' : ''}
                ${handle === 'se' ? '-bottom-2 -right-2' : ''}
                hover:scale-125 transition-transform z-20
              `}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageBlock;

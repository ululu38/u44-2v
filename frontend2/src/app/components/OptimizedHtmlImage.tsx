'use client';

import React, { useMemo } from 'react';
import { CachedImage } from './CachedImage';
import { getImageUrl } from '@/lib/utils/image';

interface OptimizedHtmlImageProps {
  src: string;
  alt: string;
  title?: string;
  width?: number | null;
  height?: number | null;
  className?: string;
}

export function OptimizedHtmlImage({
  src,
  alt,
  title,
  width = null,
  height = null,
  className = '',
}: OptimizedHtmlImageProps) {
  const { fullSrc, aspectRatio } = useMemo(() => {
    // Convert relative URLs to absolute using getImageUrl
    const fullUrl = getImageUrl(src) || src;

    // Determine dimensions: if not provided, use 1200x675 (16:9)
    const w = width || 1200;
    const h = height || 675;
    const ratio = w / h;

    return {
      fullSrc: fullUrl,
      aspectRatio: ratio,
    };
  }, [src, width, height]);

  return (
    <figure className={`my-8 w-full overflow-hidden rounded-xl border border-neutral-800 ${className}`}>
      <div
        className="relative w-full bg-neutral-900"
        style={{ paddingBottom: `${(1 / aspectRatio) * 100}%` }}
      >
        <CachedImage
          src={fullSrc}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
      {alt && (
        <figcaption className="mt-3 text-center text-sm text-neutral-400 pb-2">
          {alt}
        </figcaption>
      )}
    </figure>
  );
}

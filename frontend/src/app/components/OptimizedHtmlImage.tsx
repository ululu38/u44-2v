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
  const { fullSrc, hasDimensions, aspectRatio } = useMemo(() => {
    // Convert relative URLs to absolute using getImageUrl
    const fullUrl = getImageUrl(src) || src;

    const hasDims = !!(width && height);
    const ratio = hasDims ? (width! / height!) : 1.777;

    return {
      fullSrc: fullUrl,
      hasDimensions: hasDims,
      aspectRatio: ratio,
    };
  }, [src, width, height]);

  if (!hasDimensions) {
    return (
      <figure className={`my-8 w-full overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/10 ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={fullSrc}
          alt={alt}
          title={title}
          className="w-full h-auto block"
          loading="lazy"
        />
        {alt && alt.toLowerCase() !== 'image' && (
          <figcaption className="mt-3 text-center text-sm text-neutral-400 pb-2">
            {alt}
          </figcaption>
        )}
      </figure>
    );
  }

  return (
    <figure className={`my-8 w-full overflow-hidden rounded-xl border border-neutral-800 ${className}`}>
      <div
        className="relative w-full bg-neutral-900"
        style={{ paddingBottom: `${(1 / aspectRatio) * 100}%` }}
      >
        <CachedImage
          src={fullSrc}
          alt={alt}
          className="!absolute inset-0 w-full h-full object-cover "
        />
      </div>
      {alt && alt.toLowerCase() !== 'image' && (
        <figcaption className="mt-3 text-center text-sm text-neutral-400 pb-2">
          {alt}
        </figcaption>
      )}
    </figure>
  );
}

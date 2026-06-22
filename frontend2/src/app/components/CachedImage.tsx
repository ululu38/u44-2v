'use client';

import React, { useState, useEffect, useRef } from 'react';

interface CachedImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  skeletonClassName?: string;
  /** Rendered when src is null/undefined or fetch fails */
  fallback?: React.ReactNode;
  /** Set to true for images above-the-fold to avoid lazy loading */
  priority?: boolean;
}

export function CachedImage({
  src,
  alt,
  className,
  skeletonClassName,
  fallback,
  priority = false,
}: CachedImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Reset states when source URL changes
  useEffect(() => {
    setLoaded(false);
    setError(false);
  }, [src]);

  // Check if image is already cached/loaded by the browser (crucial for SSR hydration)
  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      setLoaded(true);
    }
  }, [src]);

  const showPlaceholder = !src || error;

  // Inherit object-fit from the parent className if specified, default to object-cover
  const isContain = className?.includes('object-contain');
  const fitClass = isContain ? 'object-contain' : 'object-cover';

  return (
    <div className={`relative overflow-hidden ${className ?? ''}`}>
      {/* Skeleton overlay — shown while loading */}
      {src && !loaded && !error && (
        <div
          className={`absolute inset-0 z-[1] ${skeletonClassName ?? 'animate-shimmer bg-neutral-900'}`}
        />
      )}

      {/* Fallback when error or no src */}
      {showPlaceholder && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-900 text-neutral-600">
          {fallback ?? (
            <span className="material-icons-outlined text-2xl">image</span>
          )}
        </div>
      )}

      {/* Image — rendered immediately for parallel browser downloading and rendering */}
      {src && !error && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`absolute inset-0 w-full h-full ${fitClass} transition-opacity duration-300 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
        />
      )}
    </div>
  );
}

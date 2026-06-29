import Image from 'next/image';
import React, { useMemo } from 'react';


interface OptimizedHtmlImageProps {
  src: string;
  alt: string;
  title?: string;
  width?: number | null;
  height?: number | null;
  className?: string;
  loading?: 'lazy' | 'eager';
}

/**
 * OptimizedHtmlImage: Renders optimized images from parsed HTML
 * 
 * Features:
 * - Converts relative URLs to absolute (prepends API URL)
 * - Smart aspect ratio detection (16:9 if dimensions unknown)
 * - Responsive image sizing with srcset
 * - Lazy loading by default
 * - Fallback dimensions for unknown images
 */
export default function OptimizedHtmlImage({
  src,
  alt,
  title,
  width = null,
  height = null,
  className = '',
  loading = 'lazy',
}: OptimizedHtmlImageProps) {
  const { fullSrc, aspectRatio, finalWidth, finalHeight } = useMemo(() => {
    // Convert relative URLs to absolute
    const baseUrl = process.env.NEXT_PUBLIC_IMAGE_URL;
    const fullUrl = src.startsWith('http') ? src : `${baseUrl}${src}`;

    // Determine dimensions: if not provided, use 1200x675 (16:9)
    const w = width || 1200;
    const h = height || 675;
    const ratio = w / h;

    return {
      fullSrc: fullUrl,
      aspectRatio: ratio,
      finalWidth: w,
      finalHeight: h,
    };
  }, [src, width, height]);

  const priority = loading === 'eager';

  return (
    <figure className={`my-4 w-full overflow-hidden rounded-lg ${className}`}>
      <div
        className="relative w-full overflow-hidden bg-slate-100"
        style={{
          paddingBottom: `${(1 / aspectRatio) * 100}%`,
        }}
      >
        <Image
          src={fullSrc}
          alt={alt}
          title={title || alt}
          width={finalWidth}
          height={finalHeight}
          priority={priority}
          loading={loading}
          className="absolute inset-0 h-full w-full object-cover"
          sizes="(max-width: 640px) 100vw,
                 (max-width: 1024px) 90vw,
                 (max-width: 1280px) 85vw,
                 1200px"
          onError={(e) => {
            // Graceful fallback if image fails to load
            console.warn(`Failed to load image: ${fullSrc}`);
          }}
        />
      </div>
      {alt && (
        <figcaption className="mt-2 text-center text-sm text-gray-600">
          {alt}
        </figcaption>
      )}
    </figure>
  );
}

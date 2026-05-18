import Image from 'next/image';
import React from 'react';

interface OptimizedImageProps {
  src: string;
  webpSrc?: string | null;
  alt: string;
  width?: number | null;
  height?: number | null;
  blurDataURL?: string | null;
  className?: string;
  priority?: boolean;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  webpSrc,
  alt,
  width,
  height,
  blurDataURL,
  className = '',
  priority = false,
  objectFit = 'cover',
}) => {
  // Construct the full URL if it's a relative path from the backend
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const fullSrc = src.startsWith('http') ? src : `${baseUrl}${src}`;
  
  return (
    <div className={`relative ${className}`}>
      <Image
        src={fullSrc}
        alt={alt || 'Image'}
        width={width || 1200}
        height={height || 630}
        placeholder={blurDataURL ? 'blur' : 'empty'}
        blurDataURL={blurDataURL || undefined}
        priority={priority}
        className={`transition-opacity duration-300 w-full h-full`}
        style={{ objectFit }}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  );
};


export default OptimizedImage;

'use client';

import { useImageCache } from '@/app/hooks/useImageCache';

interface CachedImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  style?: React.CSSProperties;
  /** แสดง Skeleton ระหว่างโหลด */
  skeletonClassName?: string;
  /** Fallback element เมื่อไม่มีรูป */
  fallback?: React.ReactNode;
}

/**
 * Component สำหรับแสดงรูปภาพที่ถูก cache เป็น Blob URL ตลอด Session
 * เมื่อผู้ใช้เปลี่ยนหน้าแล้วกลับมา รูปจะแสดงทันทีโดยไม่ต้อง fetch ใหม่
 */
export function CachedImage({
  src,
  alt,
  className,
  width,
  height,
  style,
  skeletonClassName,
  fallback,
}: CachedImageProps) {
  const { data: blobUrl, isLoading, isError } = useImageCache(src);

  if (!src) {
    return <>{fallback ?? null}</>;
  }

  // หากโหลดสำเร็จ ใช้ Blob URL
  if (blobUrl) {
    return (
      <img
        src={blobUrl}
        alt={alt}
        className={className}
        width={width}
        height={height}
        style={style}
      />
    );
  }

  // หาก fetch ไม่สำเร็จ (เช่น ติด CORS) ให้ fallback ไปใช้ src ตรงๆ
  if (isError) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        width={width}
        height={height}
        style={style}
      />
    );
  }

  // ระหว่างรอโหลด
  return (
    <div
      className={skeletonClassName ?? 'animate-pulse bg-white/5 w-full h-full'}
      style={{ width, height, ...style }}
      aria-hidden="true"
    />
  );

}

import { useQuery } from '@tanstack/react-query';

/**
 * ดึงรูปภาพจาก URL แล้วแปลงเป็น Blob URL สำหรับ cache ใน memory
 */
async function fetchImageAsBlob(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch image: ${url}`);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

/**
 * Hook สำหรับ cache รูปภาพเป็น Blob URL ตลอด Session
 * - staleTime: Infinity → ไม่ re-fetch อัตโนมัติ
 * - gcTime: Infinity   → ไม่ garbage collect cache
 */
export function useImageCache(imageUrl: string | null | undefined) {
  return useQuery<string>({
    queryKey: ['image-cache', imageUrl],
    queryFn: () => fetchImageAsBlob(imageUrl!),
    enabled: !!imageUrl,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 1,
  });
}

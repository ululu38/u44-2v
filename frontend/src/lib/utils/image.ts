
const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_URL || 'http://localhost:8080';

/**
 * Ensures that all image URLs point to the dedicated image server (port 8080 by default).
 */
export function getImageUrl(path?: string | null): string | null {
  if (!path) return null;
  
  // Fix legacy absolute URLs saved in database that point to wrong localhost ports
  if (path.startsWith('http://localhost:3000') || path.startsWith('http://localhost:4000')) {
    path = path.replace(/^http:\/\/localhost:\d+/, '');
  }
  
  if (path.startsWith('http')) return path;
  
  // Ensure path starts with a slash
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${IMAGE_BASE_URL}${cleanPath}`;
}

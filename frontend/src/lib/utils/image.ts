
const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_URL;

/**
 * Ensures that all image URLs point to the dedicated image server (port 8080 by default).
 */
export function getImageUrl(path?: string | null): string | null {
  if (!path) return null;
  
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  // Fix absolute URLs saved in database that point to other domains (API/Site)
  if (apiUrl && path.startsWith(apiUrl)) {
    path = path.substring(apiUrl.length);
  } else if (siteUrl && path.startsWith(siteUrl)) {
    path = path.substring(siteUrl.length);
  }
  
  if (path.startsWith('http')) return path;
  
  // Ensure path starts with a slash
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${IMAGE_BASE_URL}${cleanPath}`;
}

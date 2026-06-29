/**
 * Client-side fetch hook with smart caching and deduplication
 * 
 * Features:
 * - Request deduplication (in-flight requests)
 * - Stale-while-revalidate pattern
 * - Local cache with TTL
 * - Prevents duplicate infinite scroll fetches
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // milliseconds
}

const clientCache = new Map<string, CacheEntry<any>>();
const inFlightRequests = new Map<string, Promise<any>>();

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
const STALE_TTL = 30 * 60 * 1000; // 30 minutes (stale-while-revalidate)

/**
 * Check if cache entry is fresh or stale
 */
function isFresh<T>(entry: CacheEntry<T>): boolean {
  return Date.now() - entry.timestamp < entry.ttl;
}

function isStale<T>(entry: CacheEntry<T>): boolean {
  return Date.now() - entry.timestamp < STALE_TTL;
}

/**
 * Client-side cached fetch with deduplication
 */
export async function clientCachedFetch<T = any>(
  url: string,
  options: RequestInit & { cacheTTL?: number } = {}
): Promise<T> {
  const { cacheTTL = DEFAULT_TTL, ...fetchOptions } = options;

  // Check if data is fresh in cache
  const cached = clientCache.get(url);
  if (cached && isFresh(cached)) {
    return cached.data as T;
  }

  // Return in-flight request if exists
  if (inFlightRequests.has(url)) {
    return inFlightRequests.get(url)!;
  }

  // Create new request
  const promise = fetchData<T>(url, fetchOptions, cacheTTL);
  inFlightRequests.set(url, promise);

  promise
    .then(() => {
      // Keep promise in cache for deduplication for a brief moment
      setTimeout(() => inFlightRequests.delete(url), 100);
    })
    .catch(() => {
      inFlightRequests.delete(url);
    });

  return promise;
}

async function fetchData<T = any>(
  url: string,
  options: RequestInit,
  cacheTTL: number
): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=1800',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`Fetch error: ${response.status}`);
  }

  const data = (await response.json()) as T;

  // Store in client cache
  clientCache.set(url, {
    data,
    timestamp: Date.now(),
    ttl: cacheTTL,
  });

  return data;
}

/**
 * Clear specific cache entry
 */
export function clearCache(url?: string): void {
  if (url) {
    clientCache.delete(url);
  } else {
    clientCache.clear();
  }
}

/**
 * Prefetch a URL (useful for preloading related posts)
 */
export function prefetch(url: string): void {
  clientCachedFetch(url).catch(console.error);
}

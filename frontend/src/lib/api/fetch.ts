
/**
 * API Utility Layer with Smart Caching
 * 
 * Implements:
 * - Request deduplication (prevents duplicate concurrent requests)
 * - Stale-while-revalidate pattern
 * - ISR (Incremental Static Regeneration) support
 * - Cache revalidation strategies
 */

const requestCache = new Map<string, Promise<any>>();

interface FetchOptions {
  revalidate?: number | false; // ISR revalidation time in seconds, or false to disable
  tags?: string[]; // Cache tags for on-demand revalidation
  bypassCache?: boolean; // Force fresh fetch
}

/**
 * Smart fetch with deduplication and caching
 * 
 * @param url - Endpoint URL
 * @param options - Caching options
 * @returns Cached or fresh response
 */
export async function cachedFetch<T = any>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const { revalidate = 3600, tags = [], bypassCache = false } = options;

  // Skip cache if explicitly requested
  if (bypassCache) {
    return fetchData<T>(url, revalidate, tags);
  }

  // Return existing request if already in flight
  if (requestCache.has(url)) {
    return requestCache.get(url)!;
  }

  // Create new request
  const promise = fetchData<T>(url, revalidate, tags);
  requestCache.set(url, promise);

  // Clean up cache after request completes
  promise.finally(() => {
    requestCache.delete(url);
  });

  return promise;
}

async function fetchData<T = any>(
  url: string,
  revalidate: number | false,
  tags: string[]
): Promise<T> {
  const fetchOptions: RequestInit = {
    next: {
      revalidate: revalidate === false ? 0 : revalidate,
      tags,
    },
  };

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

/**
 * Fetch a single post by ID
 * Uses ISR with 1-hour revalidation
 */
export async function getPost(postId: number) {
  return cachedFetch(
    `${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}`,
    {
      revalidate: 3600, // 1 hour
      tags: [`post-${postId}`, 'posts'],
      bypassCache: false, // Use cache
    }
  );
}

/**
 * Fetch posts list with pagination
 * Uses shorter cache for fresher content
 */
export async function getPosts(page: number = 1, limit: number = 6, filters: Record<string, any> = {}) {
  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    status: '1',
    fields: 'postId,title,slug,tags,contentText,createdAt,thumbnailMedia,clients',
    thumbSize: 'thumb',
    ...filters,
  });

  return cachedFetch(
    `${process.env.NEXT_PUBLIC_API_URL}/posts?${queryParams.toString()}`,
    {
      revalidate: 300, // 5 minutes for posts list
      tags: ['posts', 'posts-list'],
      bypassCache: false,
    }
  );
}

/**
 * Search posts by keyword
 * Lower cache for fresh search results
 */
export async function searchPosts(
  keyword: string,
  page: number = 1,
  limit: number = 6,
  tag?: string
) {
  const filters: Record<string, any> = {};
  if (keyword) filters.q = keyword;
  if (tag && tag !== 'all') filters.tag = tag;

  return getPosts(page, limit, filters);
}

/**
 * Clear specific cache tags (for on-demand revalidation)
 * Call this when content is updated in admin
 */
export async function revalidatePostCache(postId?: number) {
  // In production, call this from your admin panel when posts are updated
  // This would trigger Next.js ISR to revalidate at request time
  if (postId) {
    // Tag-based revalidation: `revalidatePath()` or webhook
  }
}

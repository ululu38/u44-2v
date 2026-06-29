// ─── Constants ────────────────────────────────────────────────────────────────
export const API_BASE = 'http://localhost:4000';
export const IMAGE_BASE = 'http://localhost:8080';
export const SEARCH_LIMIT = 9;

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ThumbnailMedia {
  id?: number;
  urlFull?: string;
  urlThumb?: string;
  urlMini?: string;
  blurHash?: string;
  width?: number;
  height?: number;
}

export interface Client {
  clientId: number;
  name: string;
}

export interface Post {
  postId: number;
  title: string;
  slug?: string;
  tags?: string[];
  createdAt: string;
  status?: number;
  relevanceScore?: number;
  thumbnailMedia?: ThumbnailMedia | null;
  clients?: Client[];
  contentText?: string;
}

export interface SearchMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  query?: string;
}

export interface SearchResponse {
  data: Post[];
  meta: SearchMeta;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function imgUrl(p?: string | null): string | null {
  if (!p) return null;
  return p.startsWith('http') ? p : `${IMAGE_BASE}${p}`;
}

export function formatDate(s: string): string {
  try {
    return new Date(s).toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

// ─── Fetch ────────────────────────────────────────────────────────────────────
export async function fetchSearchPosts({
  pageParam = 1,
  keyword,
}: {
  pageParam?: number;
  keyword: string;
}): Promise<SearchResponse> {
  const params = new URLSearchParams({
    q: keyword || ' ', // /search requires q; space = list all
    page: String(pageParam),
    limit: String(SEARCH_LIMIT),
    fields: 'title,slug,tags,createdAt,thumbnailMedia:thumb,clients',
  });

  const res = await fetch(`${API_BASE}/posts?${params}`);
  if (!res.ok) {
    throw new Error(`Search failed: ${res.status}`);
  }
  return res.json();
}

export async function fetchSearchRecommendations(keyword: string): Promise<Post[]> {
  if (!keyword || keyword.trim() === '') return [];
  const params = new URLSearchParams({
    q: keyword.trim(),
    limit: '5',
    fields: 'title,slug,createdAt,thumbnailMedia:mini',
  });

  const res = await fetch(`${API_BASE}/posts?${params}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch recommendations: ${res.status}`);
  }
  const data: SearchResponse = await res.json();
  return data.data;
}

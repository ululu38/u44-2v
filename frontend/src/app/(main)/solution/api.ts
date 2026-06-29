import { API_BASE, Post, SearchResponse } from '../search/api';

const SOLUTION_TAG = 'Solution';

export async function fetchHeroSolutions(): Promise<Post[]> {
  const params = new URLSearchParams({
    page: '1',
    limit: '8',
    tag: SOLUTION_TAG,
    status: '1',
    fields: 'postId,title,slug,tags,contentText,createdAt,thumbnailMedia,clients',
    thumbSize: 'thumb',
  });

  const res = await fetch(`${API_BASE}/posts?${params}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch hero solutions: ${res.status}`);
  }
  const data: SearchResponse = await res.json();
  return data.data || [];
}

export async function fetchSolutionPosts({
  pageParam = 1,
  category,
}: {
  pageParam?: number;
  category: string;
}): Promise<SearchResponse> {
  const params = new URLSearchParams({
    page: String(pageParam),
    limit: '12',
    tag: SOLUTION_TAG,
    status: '1',
    fields: 'postId,title,slug,tags,createdAt,thumbnailMedia,clients',
    thumbSize: 'thumb',
  });
  if (category !== 'All') {
    params.append('q', category);
  }

  const res = await fetch(`${API_BASE}/posts?${params}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch solutions for category "${category}": ${res.status}`);
  }
  return res.json();
}

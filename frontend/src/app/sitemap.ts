import { MetadataRoute } from 'next';


export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const API = process.env.NEXT_PUBLIC_API_URL;
  // Use NEXT_PUBLIC_SITE_URL if available, otherwise default to localhost or production domain
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL;

  // Static routes
  const staticRoutes = [
    '',
    '/aboutus',
    '/article',
    '/contactus',
    '/project',
    '/solution',
    '/partner',
    '/client',
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  try {
    // Fetch dynamic posts (articles, projects, solutions)
    const res = await fetch(`${API}/posts?page=1&limit=1000`);
    if (res.ok) {
      const json = await res.json();
      const posts = json.data || [];
      
      const dynamicRoutes = posts.map((post: any) => ({
        url: `${BASE_URL}/posts/${post.slug || post.postId}`,
        lastModified: new Date(post.updatedAt || post.createdAt || new Date()),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }));
      
      return [...staticRoutes, ...dynamicRoutes];
    }
  } catch (error) {
    console.error('Error fetching posts for sitemap:', error);
  }

  return staticRoutes;
}

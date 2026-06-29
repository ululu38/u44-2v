import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { Suspense } from 'react';
import Sqids from 'sqids';
import { ImageSlider } from '@/app/components/ImageSlider';
import { ShareActions } from '@/app/components/ShareActions';
import { SafeHtmlRenderer } from '@/app/components/SafeHtmlRenderer';
import { getImageUrl } from '@/lib/utils/image';

const sqids = new Sqids({ minLength: 5 });

async function getPostForMetadata(slug: string) {
  const parts = slug.split('-');
  const encodedId = parts.pop();
  if (!encodedId) return null;

  const ids = sqids.decode(encodedId);
  if (ids.length === 0) return null;

  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Cookie'] = `access_token=${token}`;
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${ids[0]}`, {
    headers,
    cache: 'no-store', // Important: no cache for admin preview
  });

  if (!res.ok) return null;
  return res.json();
}

/**
 * Fetch post with NO caching for admin preview
 */
async function getPost(slug: string) {
  const parts = slug.split('-');
  const encodedId = parts.pop();
  if (!encodedId) return null;

  const ids = sqids.decode(encodedId);
  if (ids.length === 0) return null;

  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Cookie'] = `access_token=${token}`;
  }

  // NO CACHE
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${ids[0]}`, {
    headers,
    cache: 'no-store',
  });

  if (!res.ok) return null;
  return res.json();
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostForMetadata(slug);
  if (!post) return { title: 'Post Not Found' };

  const siteUrl = 'https://u44tech.com';
  const cleanDesc = post.content ? post.content.replace(/<[^>]*>/g, '').substring(0, 160) : '';

  return {
    title: `[PREVIEW] ${post.title}`,
    description: cleanDesc,
  };
}

export default function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={
      <main className="container mx-auto px-4 py-12 max-w-4xl min-h-screen">
        <div className="mt-8 md:mt-16 animate-pulse">
          <div className="h-4 bg-neutral-900 rounded w-1/4 mb-6" />
          <div className="h-12 bg-neutral-900 rounded w-3/4 mb-6" />
          <div className="h-4 bg-neutral-900 rounded w-1/3 mb-10" />
          <div className="aspect-[16/9] bg-neutral-900 rounded-2xl w-full mb-12" />
          <div className="space-y-4">
            <div className="h-4 bg-neutral-900 rounded w-full" />
            <div className="h-4 bg-neutral-900 rounded w-5/6" />
            <div className="h-4 bg-neutral-900 rounded w-4/5" />
          </div>
        </div>
      </main>
    }>
      <PostContent params={params} />
    </Suspense>
  );
}

async function PostContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <main className="container mx-auto px-4 py-12 max-w-4xl min-h-screen">
      
      <div className="bg-amber-500/20 border border-amber-500/50 text-amber-500 px-4 py-2 rounded-lg mb-8 font-bold flex items-center justify-center gap-2">
        <span className="material-icons-outlined">visibility</span>
        โหมด Preview (ข้อมูลจะไม่อัพเดทลง Cache และสามารถดู Draft ได้)
      </div>

      <article className="mt-8 md:mt-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <header className="mb-8">
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag: string) => (
                <span key={tag} className="text-xs font-bold tracking-widest uppercase px-3 py-1 bg-neutral-900 border border-neutral-800 text-neutral-400 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black mb-6 text-neutral-100 leading-[1.1] uppercase tracking-tight">
            {post.title}
          </h1>
          
          <div className="flex items-center text-neutral-400 text-sm gap-6 font-medium border-t border-neutral-800 pt-6 mt-6">
            <span className="flex items-center gap-2">
              <span className="material-icons-outlined text-lg text-neutral-500">calendar_month</span>
              {new Date(post.createdAt).toLocaleDateString('th-TH', { 
                year: 'numeric', month: 'long', day: 'numeric' 
              })}
            </span>
            <span className="flex items-center gap-2 bg-neutral-800 px-2 py-1 rounded">
              Status: {post.status}
            </span>
          </div>
          
          <ShareActions postId={post.postId} postTitle={post.title} views={post.views || 0} />
        </header>

        {post.sliderImages && post.sliderImages.length > 0 && (
          <ImageSlider images={post.sliderImages} title={post.title} />
        )}

        <SafeHtmlRenderer 
          html={post.content} 
          className="prose prose-invert prose-lg max-w-none prose-img:rounded-xl prose-a:text-blue-400 hover:prose-a:text-blue-300 prose-img:!m-0 mt-12 break-words overflow-x-hidden"
        />
      </article>
    </main>
  );
}

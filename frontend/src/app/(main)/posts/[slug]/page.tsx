import { Metadata } from 'next';
import { notFound } from 'next/navigation';
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

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${ids[0]}`, {
    headers,
    next: {
      revalidate: 60,
      tags: [`post-${ids[0]}`, 'posts'],
    },
  });

  if (!res.ok) return null;
  return res.json();
}

/**
 * Fetch post with ISR caching (1 hour revalidation)
 */
async function getPost(slug: string) {
  const parts = slug.split('-');
  const encodedId = parts.pop();
  if (!encodedId) return null;

  const ids = sqids.decode(encodedId);
  if (ids.length === 0) return null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // ISR: Cache for 1 minute
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${ids[0]}`, {
    headers,
    next: {
      revalidate: 60,
      tags: [`post-${ids[0]}`, 'posts'],
    },
  });

  if (!res.ok) return null;
  return res.json();
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostForMetadata(slug);
  if (!post || post.status !== 1) return { title: 'Post Not Found' };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://u44.co.th';
  const imageUrl = (post.thumbnailMedia && getImageUrl(post.thumbnailMedia.urlFull)) || `${siteUrl}/default-share.jpg`;
  
  const cleanDesc = post.content ? post.content.replace(/<[^>]*>/g, '').substring(0, 160) : '';

  return {
    title: post.title,
    description: cleanDesc,
    alternates: {
      canonical: `${siteUrl}/posts/${slug}`,
    },
    openGraph: {
      title: post.title,
      description: cleanDesc,
      url: `${siteUrl}/posts/${slug}`,
      siteName: 'U44Tech',
      type: 'article',
      publishedTime: post.createdAt,
      images: [{
        url: imageUrl,
        width: post.thumbnailMedia?.width || 1200,
        height: post.thumbnailMedia?.height || 630,
        alt: post.title,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: cleanDesc,
      images: [imageUrl],
    },
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
  if (!post || post.status !== 1) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://u44.co.th';
  const imageUrl = (post.thumbnailMedia && getImageUrl(post.thumbnailMedia.urlFull)) || '';
  const cleanDesc = post.content ? post.content.replace(/<[^>]*>/g, '').substring(0, 160) : '';

  // JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: post.title,
    image: imageUrl ? [imageUrl] : [],
    datePublished: post.createdAt,
    dateModified: post.updatedAt || post.createdAt,
    author: {
      '@type': 'Organization',
      name: 'U44Tech Team',
      url: `${siteUrl}/aboutus`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'U44Tech',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`,
      },
    },
    description: cleanDesc,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/posts/${slug}`,
    },
  };

  return (
    <main className="container mx-auto px-4 py-12 max-w-4xl min-h-screen">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <article className="mt-8 md:mt-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <header className="mb-8">
          {/* Tags */}
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
          </div>
          
          <ShareActions postId={post.postId} postTitle={post.title} views={post.views || 0} />
        </header>

        {post.sliderImages && post.sliderImages.length > 0 && (
          <ImageSlider images={post.sliderImages} title={post.title} />
        )}

        {/* Prose formatting using @tailwindcss/typography */}
        <SafeHtmlRenderer 
          html={post.content} 
          className="prose prose-invert prose-lg max-w-none prose-img:rounded-xl prose-a:text-blue-400 hover:prose-a:text-blue-300 prose-img:!m-0 mt-12 break-words overflow-x-hidden"
        />
      </article>
    </main>
  );
}

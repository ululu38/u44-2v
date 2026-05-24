import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import Sqids from 'sqids';
import OptimizedImage from '@/components/common/OptimizedImage';
import ImageSlider from '@/components/common/ImageSlider';
import ShareActions from '@/components/common/ShareActions';


const sqids = new Sqids({ minLength: 5 });

async function getPost(slug: string) {
  const parts = slug.split('-');
  const encodedId = parts.pop();
  if (!encodedId) return null;

  const ids = sqids.decode(encodedId);
  if (ids.length === 0) return null;

  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  const headers: Record<string, string> = {};
  if (token) {
    headers['Cookie'] = `access_token=${token}`;
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${ids[0]}`, {
    cache: 'no-store',
    headers
  });

  if (!res.ok) return null;
  return res.json();
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: 'Post Not Found' };

  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const siteUrl = 'https://u44tech.com'; // แก้เป็น URL จริงของคุณ
  const imageUrl = post.thumbnailMedia ? `${baseUrl}${post.thumbnailMedia.urlFull}` : `${siteUrl}/default-share.jpg`;
  
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

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const siteUrl = 'https://u44tech.com';
  const imageUrl = post.thumbnailMedia ? `${baseUrl}${post.thumbnailMedia.urlFull}` : '';

  const cleanDesc = post.content ? post.content.replace(/<[^>]*>/g, '').substring(0, 160) : '';

  // JSON-LD สำหรับ Google Rich Results
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
      url: `${siteUrl}/about`,
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
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Add JSON-LD to the page */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <article className="mt-20">
        <header className="mb-8">
          <h1 className="text-4xl md:text-6xl font-black mb-6 text-foreground leading-tight uppercase tracking-tighter">
            {post.title}
          </h1>
          <div className="flex items-center text-foreground/50 text-sm gap-6 font-medium">
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-secondary">calendar_month</span>
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


        <div 
          className="prose prose-lg max-w-none text-foreground/80 leading-relaxed mt-12"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />


      </article>
    </div>
  );
}


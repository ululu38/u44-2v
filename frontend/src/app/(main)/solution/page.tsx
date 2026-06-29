import { Metadata } from 'next';
import { Suspense } from 'react';
import SolutionPageContent from './SolutionPageContent';

export const metadata: Metadata = {
  title: 'Our Solutions | U FORTY FOUR',
  description: 'U FORTY FOUR Technology Solutions - Software Development, Network Security, IT Infrastructure and services.',
  openGraph: {
    images: ['/images/U44-icon-133x123.png'],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/images/U44-icon-133x123.png'],
  },
};

function GridSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[3/2] rounded-2xl bg-white/5 border border-white/5 overflow-hidden"
          >
            <div className="w-full h-full bg-gradient-to-br from-white/5 to-transparent" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SolutionPage() {
  return (
    <div className="w-full space-y-10">
      {/* Static header - streams in immediately */}
      {/* <div className="max-w-7xl mx-auto px-6 text-center space-y-3">
        <h1
          className="text-4xl md:text-5xl font-extrabold tracking-tight text-white"
          style={{
            textShadow: '0 0 30px rgba(255,255,255,0.15), 0 0 60px rgba(255,255,255,0.1)',
          }}
        >
          โซลูชันของเรา
        </h1>
        <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-neutral-600 mx-auto rounded-full" />
        <p className="text-neutral-400 text-sm md:text-base max-w-xl mx-auto">
          ออกแบบ พัฒนา และดูแลระบบเทคโนโลยีสารสนเทศแบบครบวงจร
        </p>
      </div> */}

      {/* Suspense boundary for dynamic content */}
      <Suspense fallback={<GridSkeleton />}>
        <SolutionPageContent />
      </Suspense>
    </div>
  );
}

import type { NextConfig } from "next";

// Disable image optimization for localhost (dev), enable for production
const isLocalhost = process.env.NEXT_PUBLIC_API_URL?.includes('localhost') ?? true;

const nextConfig: NextConfig = {
  // ISR revalidation for on-demand updates
  onDemandEntries: {
    maxInactiveAge: 60000,
    pagesBufferLength: 5,
  },

  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/uploads/:path*`,
      },
      {
        source: '/images/:path*',
        destination: `https://u44tech.com/images/:path*`,
      }
    ];
  },

  images: {
    // Disable optimization for localhost (dev) to avoid SSRF warnings
    // Enable optimization in production
    unoptimized: isLocalhost,

    // Define remote image sources for Next.js Image optimization
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '4000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'u44tech.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.u44tech.com',
        pathname: '/**',
      },
    ],

    // Optimization settings (for production)
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    // Cache strategy: 365 days
    minimumCacheTTL: 31536000,
  },

  // Experimental features for better performance
  experimental: {
    // Enable optimized font loading
    optimizePackageImports: ["@radix-ui/react-*"],
  },
};

export default nextConfig;

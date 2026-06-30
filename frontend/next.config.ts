import type { NextConfig } from "next";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const imageUrl = process.env.NEXT_PUBLIC_IMAGE_URL || 'http://localhost:8080';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://u44.co.th';

const parseRemotePattern = (urlStr: string) => {
  try {
    const url = new URL(urlStr);
    return {
      protocol: url.protocol.replace(':', '') as 'http' | 'https',
      hostname: url.hostname,
      port: url.port || undefined,
      pathname: '/**',
    };
  } catch (e) {
    return null;
  }
};

const apiPattern = parseRemotePattern(apiUrl);
const imagePattern = parseRemotePattern(imageUrl);
const sitePattern = parseRemotePattern(siteUrl);

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: apiUrl,
    NEXT_PUBLIC_IMAGE_URL: imageUrl,
    NEXT_PUBLIC_SITE_URL: siteUrl,
    NEXT_PUBLIC_CONTACT_TEL: process.env.NEXT_PUBLIC_CONTACT_TEL || '02-211-1122',
    NEXT_PUBLIC_CONTACT_MOBILE: process.env.NEXT_PUBLIC_CONTACT_MOBILE || '085-666-1111',
    NEXT_PUBLIC_CONTACT_EMAIL: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'info@u44tech.com',
    NEXT_PUBLIC_CONTACT_WEBSITE: process.env.NEXT_PUBLIC_CONTACT_WEBSITE || 'u44tech.com',
    NEXT_PUBLIC_CONTACT_FACEBOOK: process.env.NEXT_PUBLIC_CONTACT_FACEBOOK || 'https://www.facebook.com/profile.php?id=61555566792786',
    NEXT_PUBLIC_CONTACT_FACEBOOK_LABEL: process.env.NEXT_PUBLIC_CONTACT_FACEBOOK_LABEL || 'U44 Technology Solutions',
    NEXT_PUBLIC_CONTACT_LINE: process.env.NEXT_PUBLIC_CONTACT_LINE || 'https://line.me/R/ti/p/@u44tech',
    NEXT_PUBLIC_CONTACT_LINE_LABEL: process.env.NEXT_PUBLIC_CONTACT_LINE_LABEL || '@u44tech',
    NEXT_PUBLIC_CONTACT_ADDRESS: process.env.NEXT_PUBLIC_CONTACT_ADDRESS || '8 Udomsuk 44 Bangna-Neua, Bangna, Bangkok 10260',
  },
  cacheComponents: true, // Preserve component state across navigations (Next.js 16+)
  images: {
    remotePatterns: [
      ...(imagePattern ? [imagePattern] : []),
      ...(apiPattern ? [apiPattern] : []),
      ...(sitePattern ? [sitePattern] : []),
      // Fallbacks for production domains
      {
        protocol: 'https',
        hostname: 'u44.co.th',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.u44.co.th',
        pathname: '/**',
      }
    ],
  },
  async headers() {
    return [
      {
        source: '/posts/:slug*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  },
};

export default nextConfig;


import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true, // Preserve component state across navigations (Next.js 16+)
};

export default nextConfig;

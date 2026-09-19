import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: { buildActivity: false },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
};

export default nextConfig;


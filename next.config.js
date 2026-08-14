/**
 * 7000 Solutions Platform v3.0
 * next.config.js — manual PWA support via public/sw.js (no next-pwa dependency,
 * which is incompatible with Next.js 14.2 App Router builds).
 */
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
};

module.exports = nextConfig;

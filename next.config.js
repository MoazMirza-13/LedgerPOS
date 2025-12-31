/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'umydihoolimrobjxmujl.supabase.co',
        port: ''
      },
      {
        protocol: 'https',
        hostname: 'idaxofzrdxwzzgvsltdg.supabase.co',
        port: ''
      }
    ]
  },
  transpilePackages: ['geist']
};

module.exports = nextConfig;

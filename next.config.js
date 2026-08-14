/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'leafsolar.ng' },
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
    ],
  },
  experimental: {
    serverActions: { bodySizeLimit: '32mb' },
  },
  async redirects() {
    return [{ source: '/shop', destination: '/products', permanent: true }];
  },
};
module.exports = nextConfig;

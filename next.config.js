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
    return [
      { source: '/shop', destination: '/products', permanent: true },
      { source: '/solar-installation', destination: '/solar-installation-ibadan', permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: '/demo/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' }],
      },
    ];
  },
};
module.exports = nextConfig;

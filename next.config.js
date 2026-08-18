/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
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
      { source: '/product/:path*', destination: '/products', permanent: true },
      { source: '/product-category/:path*', destination: '/products', permanent: true },
      { source: '/solar-installation', destination: '/solar-installation-ibadan', permanent: true },
      { source: '/solar-packages', destination: '/packages', permanent: true },
      { source: '/about-us', destination: '/about', permanent: true },
      { source: '/contact-us', destination: '/contact', permanent: true },
    ];
  },
  async headers() {
    return [
      {
        // Security headers applied to every route.
        // CSP was validated with a headless-browser audit across all key routes
        // (15 routes + interactions, zero violations) on 17 Aug 2026 before enforcement.
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://leafsolar.ng https://*.public.blob.vercel-storage.com",
              "font-src 'self' data:",
              "connect-src 'self'",
              "frame-src 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'self'",
              'upgrade-insecure-requests',
            ].join('; '),
          },
        ],
      },
      {
        source: '/demo/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' }],
      },
    ];
  },
};
module.exports = nextConfig;

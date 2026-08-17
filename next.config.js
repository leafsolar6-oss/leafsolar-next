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
    ];
  },
  async headers() {
    return [
      {
        // Security headers applied to every route.
        // CSP ships in Report-Only first: browse the site with the console open,
        // confirm zero violations, then rename the header to enforce it.
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Content-Security-Policy-Report-Only',
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

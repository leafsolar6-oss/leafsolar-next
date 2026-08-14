import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://leafsolar.ng';
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/demo', '/demo/', '/admin/', '/checkout', '/api/'],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}

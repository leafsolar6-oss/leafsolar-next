import { MetadataRoute } from 'next';
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://leafsolar.ng';
  return ['', '/packages', '/products', '/about', '/contact', '/blog', '/demo'].map(p => ({
    url: base + p, lastModified: new Date(), changeFrequency: 'weekly', priority: p === '' ? 1 : 0.7,
  }));
}

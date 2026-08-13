import type { MetadataRoute } from 'next';
import { products } from '@/lib/data';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://leafsolar.ng';
  const now = new Date();

  const pages = ['', '/packages', '/products', '/about', '/contact', '/blog'].map(path => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === '' || path === '/products' ? 'weekly' as const : 'monthly' as const,
    priority: path === '' ? 1 : path === '/products' || path === '/packages' ? 0.9 : 0.7,
  }));

  const productPages = products.map(product => ({
    url: `${base}/products/${product.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...pages, ...productPages];
}

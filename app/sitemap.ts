import type { MetadataRoute } from 'next';
import { getProducts } from '@/lib/catalog-store';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://leafsolar.ng';
  const now = new Date();

  const pages = [
    '', '/packages', '/products', '/solar-calculator', '/about', '/contact', '/blog', '/privacy',
    '/shipping-delivery', '/returns', '/warranty', '/solar-installation-policy',
  ].map(path => ({
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

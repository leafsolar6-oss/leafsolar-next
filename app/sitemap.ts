import type { MetadataRoute } from 'next';
import { getProducts } from '@/lib/catalog-store';
import { activeCategories } from '@/lib/categories';
import { solarGuides } from '@/lib/solar-guides';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://leafsolar.ng').replace(/\/$/, '');
const contentUpdated = new Date('2026-08-14T00:00:00+01:00');

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();
  const staticRoutes = [
    '/',
    '/products',
    '/home-appliances-ibadan',
    '/solar-products',
    '/solar-installation-ibadan',
    '/packages',
    '/solar-calculator',
    '/blog',
    '/about',
    '/contact',
    '/shipping-delivery',
    '/returns',
    '/warranty',
    '/solar-installation-policy',
    '/privacy',
  ];

  return [
    ...staticRoutes.map(route => ({ url: `${siteUrl}${route}`, lastModified: contentUpdated })),
    ...solarGuides.map(guide => ({ url: `${siteUrl}/blog/${guide.slug}`, lastModified: new Date(`${guide.updated}T00:00:00+01:00`) })),
    ...activeCategories(products).map(category => ({ url: `${siteUrl}/products/category/${category.slug}`, lastModified: contentUpdated })),
    ...products.map(product => ({ url: `${siteUrl}/products/${product.slug}` })),
  ];
}

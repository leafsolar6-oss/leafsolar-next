import type { Product } from '@/lib/data';

/**
 * Static category landing pages (/products/category/<slug>) are derived from the
 * live catalogue: every categoryLabel with at least one active product gets a
 * page, a sitemap entry, and internal links. Slugs are stable ASCII forms of the
 * human-readable category labels.
 */
export function categorySlug(label: string): string {
  return label
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export type CatalogueCategory = { label: string; slug: string; department: Product['department']; count: number };

export function activeCategories(products: Product[]): CatalogueCategory[] {
  const counts = new Map<string, { department: Product['department']; count: number }>();
  for (const product of products) {
    const existing = counts.get(product.categoryLabel);
    counts.set(product.categoryLabel, { department: product.department, count: (existing?.count || 0) + 1 });
  }
  return [...counts.entries()]
    .map(([label, meta]) => ({ label, slug: categorySlug(label), department: meta.department, count: meta.count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

export function categoryHref(label: string): string {
  return `/products/category/${categorySlug(label)}`;
}

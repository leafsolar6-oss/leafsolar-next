import type { Product } from '@/lib/data';

/**
 * Shared, pure product-filter logic used by both the server-rendered
 * /products page (to detect zero-result filter URLs) and the client-side
 * ProductsExplorer so the two can never drift apart.
 *
 * Empty/absent values mean "no constraint" — mirroring the explorer defaults:
 * category 'All', department 'all', brand 'All', availability 'all'.
 */
export type ProductFilters = {
  q?: string;
  c?: string;
  d?: string;
  b?: string;
  min?: string;
  max?: string;
  a?: string;
};

export function hasActiveProductFilters(filters: ProductFilters): boolean {
  return Boolean(filters.q || filters.c || filters.d || filters.b || filters.min || filters.max || filters.a);
}

export function filterProducts(products: Product[], filters: ProductFilters): Product[] {
  const query = filters.q || '';
  const category = filters.c || 'All';
  const department = filters.d || 'all';
  const brand = filters.b || 'All';
  const minPrice = filters.min || '';
  const maxPrice = filters.max || '';
  const availability = filters.a || 'all';
  const searchTerms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const minimum = minPrice === '' ? null : Number(minPrice);
  const maximum = maxPrice === '' ? null : Number(maxPrice);
  return products.filter(product => {
    if (department !== 'all' && product.department !== department) return false;
    if (category !== 'All' && product.categoryLabel !== category) return false;
    if (brand !== 'All' && product.brand !== brand) return false;
    if (availability === 'in' && !product.inStock) return false;
    if (availability === 'out' && product.inStock) return false;
    if (minimum !== null && Number.isFinite(minimum) && product.price < minimum) return false;
    if (maximum !== null && Number.isFinite(maximum) && product.price > maximum) return false;
    const searchable = `${product.name} ${product.brand} ${product.categoryLabel} ${product.sku}`.toLowerCase();
    if (searchTerms.length > 0 && !searchTerms.every(term => searchable.includes(term))) return false;
    return true;
  });
}

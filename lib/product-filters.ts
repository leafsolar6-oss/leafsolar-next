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

  const passesNonSearchFilters = (product: Product) => {
    if (department !== 'all' && product.department !== department) return false;
    if (category !== 'All' && product.categoryLabel !== category) return false;
    if (brand !== 'All' && product.brand !== brand) return false;
    if (availability === 'in' && !product.inStock) return false;
    if (availability === 'out' && product.inStock) return false;
    if (minimum !== null && Number.isFinite(minimum) && product.price < minimum) return false;
    if (maximum !== null && Number.isFinite(maximum) && product.price > maximum) return false;
    return true;
  };

  // A term can match directly, or via its leading characters — this keeps
  // plurals and single-character typos ("ovens" -> "oven", "micowave" variants) working.
  const termVariants = (term: string) => (term.length > 3 ? [term, term.slice(0, -1)] : [term]);
  const termMatches = (term: string, searchable: string) =>
    termVariants(term).some((variant) => variant.length > 1 && searchable.includes(variant));

  const searchableOf = (product: Product) =>
    `${product.name} ${product.brand} ${product.categoryLabel} ${product.sku}`.toLowerCase();

  const strict = products.filter(
    (product) => passesNonSearchFilters(product) && searchTerms.every((term) => termMatches(term, searchableOf(product))),
  );
  if (strict.length > 0 || searchTerms.length === 0) return strict;

  // Smart fallback: nothing matched every word, so rank by how many words (and where) matched.
  // "microwave oven" with no combined match still surfaces every microwave and every oven.
  return products
    .filter(passesNonSearchFilters)
    .map((product) => {
      const searchable = searchableOf(product);
      const name = product.name.toLowerCase();
      let score = 0;
      for (const term of searchTerms) {
        if (!termMatches(term, searchable)) continue;
        score += name.includes(term) ? 4 : 2;
      }
      return { product, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.product.id - b.product.id)
    .map((entry) => entry.product);
}

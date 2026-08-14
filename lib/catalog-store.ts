import 'server-only';

import { db, hasDatabase } from '@/lib/db';
import { products as fallbackProducts, type Product } from '@/lib/data';

type ProductRow = {
  id: number | string;
  slug: string;
  name: string;
  sku: string | null;
  brand: string | null;
  category: string;
  category_label: string;
  department: Product['department'];
  base_price: number | string;
  compare_at_price: number | string | null;
  image_url: string;
  image_alt: string | null;
  description: string | null;
  specifications: unknown;
  gallery_urls: unknown;
  track_inventory: boolean;
  stock_quantity: number | string | null;
  low_stock_threshold: number | string | null;
  manual_in_stock: boolean;
  is_active: boolean;
  product_featured: boolean;
  offer_id: number | string | null;
  offer_title: string | null;
  offer_badge: string | null;
  offer_price: number | string | null;
  offer_ends_at: string | null;
  offer_featured: boolean | null;
};

function numberOrNull(value: number | string | null) {
  return value === null ? null : Number(value);
}

function jsonValue(value: unknown) {
  if (typeof value !== 'string') return value;
  try { return JSON.parse(value) as unknown; } catch { return null; }
}

function productGallery(value: unknown) {
  const parsed = jsonValue(value);
  return Array.isArray(parsed) ? parsed.filter(item => typeof item === 'string' && item.length > 0).slice(0, 8) : [];
}

function productSpecifications(value: unknown) {
  const parsed = jsonValue(value);
  if (!Array.isArray(parsed)) return [];
  return parsed.flatMap(item => {
    if (!item || typeof item !== 'object') return [];
    const name = 'name' in item && typeof item.name === 'string' ? item.name.trim() : '';
    const specificationValue = 'value' in item && typeof item.value === 'string' ? item.value.trim() : '';
    return name && specificationValue ? [{ name, value: specificationValue }] : [];
  }).slice(0, 30);
}

function rowToProduct(row: ProductRow): Product {
  const basePrice = Number(row.base_price);
  const offerPrice = numberOrNull(row.offer_price);
  const stockQuantity = numberOrNull(row.stock_quantity);
  const inStock = row.is_active && (row.track_inventory ? (stockQuantity || 0) > 0 : row.manual_in_stock);
  const compareAt = numberOrNull(row.compare_at_price);

  return {
    id: Number(row.id),
    slug: row.slug,
    name: row.name,
    sku: row.sku || '',
    brand: row.brand || 'Leaf Solar',
    category: row.category,
    categoryLabel: row.category_label,
    department: row.department,
    price: offerPrice ?? basePrice,
    oldPrice: offerPrice !== null ? basePrice : compareAt,
    onSale: offerPrice !== null || (compareAt !== null && compareAt > basePrice),
    image: row.image_url,
    imageAlt: row.image_alt || row.name,
    description: row.description || '',
    inStock,
    gallery: productGallery(row.gallery_urls),
    specifications: productSpecifications(row.specifications),
    basePrice,
    trackInventory: row.track_inventory,
    stockQuantity,
    lowStockThreshold: numberOrNull(row.low_stock_threshold),
    offerId: row.offer_id === null ? null : Number(row.offer_id),
    offerTitle: row.offer_title,
    offerBadge: row.offer_badge,
    offerEndsAt: row.offer_ends_at,
    offerFeatured: Boolean(row.offer_featured),
    featured: row.product_featured,
  };
}

const productSelect = `
  SELECT
    p.id, p.slug, p.name, p.sku, p.brand, p.category, p.category_label,
    p.department, p.base_price, p.compare_at_price, p.image_url, p.image_alt,
    p.description, p.specifications, p.gallery_urls,
    p.track_inventory, p.stock_quantity, p.low_stock_threshold,
    p.manual_in_stock, p.is_active, p.is_featured AS product_featured,
    offer.id AS offer_id, offer.title AS offer_title, offer.badge AS offer_badge,
    offer.sale_price AS offer_price, offer.ends_at AS offer_ends_at,
    offer.featured AS offer_featured
  FROM products p
  LEFT JOIN LATERAL (
    SELECT o.id, o.title, o.badge, o.sale_price, o.ends_at, o.featured
    FROM offers o
    WHERE o.product_id = p.id
      AND o.is_active = true
      AND o.starts_at <= NOW()
      AND (o.ends_at IS NULL OR o.ends_at > NOW())
    ORDER BY o.featured DESC, o.starts_at DESC, o.id DESC
    LIMIT 1
  ) offer ON true
`;

async function queryProducts(whereSql = '', values: unknown[] = []) {
  const sql = db();
  const rows = await sql.query(`${productSelect} ${whereSql}`, values) as ProductRow[];
  return rows.map(rowToProduct);
}

export async function getProducts(options: { includeInactive?: boolean; allowFallback?: boolean } = {}) {
  const allowFallback = options.allowFallback !== false;
  if (!hasDatabase()) {
    if (!allowFallback) throw new Error('The product database is not configured.');
    return fallbackProducts;
  }
  try {
    return await queryProducts(`${options.includeInactive ? '' : 'WHERE p.is_active = true'} ORDER BY p.sort_order ASC, p.id ASC`);
  } catch (error) {
    if (!allowFallback) throw error;
    console.error('Inventory database catalogue query failed; using the bundled catalogue.', error);
    return fallbackProducts;
  }
}

export async function getProductBySlug(slug: string) {
  if (!hasDatabase()) return fallbackProducts.find(product => product.slug === slug) || null;
  try {
    const products = await queryProducts('WHERE p.slug = $1 AND p.is_active = true LIMIT 1', [slug]);
    return products[0] || null;
  } catch (error) {
    console.error('Inventory database product query failed; using the bundled catalogue.', error);
    return fallbackProducts.find(product => product.slug === slug) || null;
  }
}

export async function getProductsByIds(ids: number[]) {
  const uniqueIds = [...new Set(ids)];
  if (uniqueIds.length === 0) return [];
  if (!hasDatabase()) return fallbackProducts.filter(product => uniqueIds.includes(product.id));
  try {
    return await queryProducts('WHERE p.id = ANY($1::bigint[]) AND p.is_active = true', [uniqueIds]);
  } catch (error) {
    console.error('Inventory database pricing query failed; using the bundled catalogue.', error);
    return fallbackProducts.filter(product => uniqueIds.includes(product.id));
  }
}

/** Checkout must fail closed: browser-submitted items are priced only from PostgreSQL. */
export async function getAuthoritativeProductsByIds(ids: number[], options: { includeInactive?: boolean } = {}) {
  const uniqueIds = [...new Set(ids)];
  if (uniqueIds.length === 0) return [];
  if (!hasDatabase()) throw new Error('The product database is not configured.');
  return queryProducts(
    `WHERE p.id = ANY($1::bigint[]) ${options.includeInactive ? '' : 'AND p.is_active = true'}`,
    [uniqueIds],
  );
}

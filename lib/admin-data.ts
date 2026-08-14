import 'server-only';

import { db } from '@/lib/db';

export type ProductSpecification = { name: string; value: string };

export type AdminProduct = {
  id: number;
  slug: string;
  name: string;
  sku: string;
  brand: string;
  category: string;
  categoryLabel: string;
  department: 'electronics' | 'solar' | 'packages';
  basePrice: number;
  compareAtPrice: number | null;
  effectivePrice: number;
  imageUrl: string;
  imageAlt: string;
  galleryUrls: string[];
  specifications: ProductSpecification[];
  description: string;
  trackInventory: boolean;
  stockQuantity: number | null;
  lowStockThreshold: number | null;
  manualInStock: boolean;
  isActive: boolean;
  isFeatured: boolean;
  activeOfferId: number | null;
  activeOfferTitle: string | null;
  createdAt: string;
  updatedAt: string;
};

type ProductRow = {
  id: number | string; slug: string; name: string; sku: string; brand: string;
  category: string; category_label: string; department: AdminProduct['department'];
  base_price: number | string; compare_at_price: number | string | null; effective_price: number | string;
  image_url: string; image_alt: string; gallery_urls: unknown; specifications: unknown;
  description: string; track_inventory: boolean;
  stock_quantity: number | string | null; low_stock_threshold: number | string | null;
  manual_in_stock: boolean; is_active: boolean; is_featured: boolean;
  active_offer_id: number | string | null; active_offer_title: string | null;
  created_at: string; updated_at: string;
};

function parseJson(value: unknown) {
  if (typeof value !== 'string') return value;
  try { return JSON.parse(value) as unknown; } catch { return null; }
}

function stringArray(value: unknown) {
  const parsed = parseJson(value);
  return Array.isArray(parsed) ? parsed.filter(item => typeof item === 'string') as string[] : [];
}

function specifications(value: unknown): ProductSpecification[] {
  const parsed = parseJson(value);
  if (!Array.isArray(parsed)) return [];
  return parsed.flatMap(item => {
    if (!item || typeof item !== 'object') return [];
    const name = 'name' in item && typeof item.name === 'string' ? item.name : '';
    const specificationValue = 'value' in item && typeof item.value === 'string' ? item.value : '';
    return name && specificationValue ? [{ name, value: specificationValue }] : [];
  });
}

function mapProduct(row: ProductRow): AdminProduct {
  return {
    id: Number(row.id), slug: row.slug, name: row.name, sku: row.sku, brand: row.brand,
    category: row.category, categoryLabel: row.category_label, department: row.department,
    basePrice: Number(row.base_price), compareAtPrice: row.compare_at_price === null ? null : Number(row.compare_at_price),
    effectivePrice: Number(row.effective_price), imageUrl: row.image_url, imageAlt: row.image_alt,
    galleryUrls: stringArray(row.gallery_urls), specifications: specifications(row.specifications),
    description: row.description, trackInventory: row.track_inventory,
    stockQuantity: row.stock_quantity === null ? null : Number(row.stock_quantity),
    lowStockThreshold: row.low_stock_threshold === null ? null : Number(row.low_stock_threshold),
    manualInStock: row.manual_in_stock, isActive: row.is_active, isFeatured: row.is_featured,
    activeOfferId: row.active_offer_id === null ? null : Number(row.active_offer_id),
    activeOfferTitle: row.active_offer_title, createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

const selectProducts = `
  SELECT p.*,
    COALESCE(active_offer.sale_price, p.base_price) AS effective_price,
    active_offer.id AS active_offer_id,
    active_offer.title AS active_offer_title
  FROM products p
  LEFT JOIN LATERAL (
    SELECT id, title, sale_price
    FROM offers o
    WHERE o.product_id = p.id AND o.is_active = true
      AND o.starts_at <= NOW() AND (o.ends_at IS NULL OR o.ends_at > NOW())
    ORDER BY o.featured DESC, o.starts_at DESC, o.id DESC LIMIT 1
  ) active_offer ON true
`;

export async function getAdminProducts() {
  const rows = await db().query(`${selectProducts} ORDER BY p.updated_at DESC, p.id DESC`) as ProductRow[];
  return rows.map(mapProduct);
}

export async function getAdminProduct(id: number) {
  const rows = await db().query(`${selectProducts} WHERE p.id = $1 LIMIT 1`, [id]) as ProductRow[];
  return rows[0] ? mapProduct(rows[0]) : null;
}

export async function getDashboardStats() {
  const [stats] = await db()`
    SELECT
      COUNT(*) FILTER (WHERE is_active)::int AS active_products,
      COUNT(*) FILTER (WHERE is_active AND track_inventory AND stock_quantity <= COALESCE(low_stock_threshold, 0) AND stock_quantity > 0)::int AS low_stock,
      COUNT(*) FILTER (WHERE is_active AND ((track_inventory AND stock_quantity = 0) OR (NOT track_inventory AND NOT manual_in_stock)))::int AS out_of_stock,
      COALESCE(SUM(base_price * stock_quantity) FILTER (WHERE is_active AND track_inventory), 0)::bigint AS stock_value,
      COUNT(*) FILTER (WHERE track_inventory)::int AS tracked_products
    FROM products
  ` as { active_products: number; low_stock: number; out_of_stock: number; stock_value: number | string; tracked_products: number }[];
  const [offerStats] = await db()`
    SELECT COUNT(*)::int AS active_offers FROM offers
    WHERE is_active = true AND starts_at <= NOW() AND (ends_at IS NULL OR ends_at > NOW())
  ` as { active_offers: number }[];
  const [orderStats] = await db()`
    SELECT COUNT(*)::int AS paid_orders, COALESCE(SUM(amount), 0)::bigint AS paid_revenue
    FROM fulfilled_orders
  ` as { paid_orders: number; paid_revenue: number | string }[];
  const [quoteStats] = await db()`
    SELECT COUNT(*) FILTER (WHERE status = 'requested')::int AS pending_quotes FROM delivery_quotes
  ` as { pending_quotes: number }[];
  return {
    ...stats,
    stock_value: Number(stats.stock_value),
    active_offers: Number(offerStats.active_offers),
    paid_orders: Number(orderStats.paid_orders),
    paid_revenue: Number(orderStats.paid_revenue),
    pending_quotes: Number(quoteStats.pending_quotes),
  };
}

export type AdminOffer = {
  id: number; productId: number; productName: string; productImage: string;
  basePrice: number; title: string; badge: string; salePrice: number;
  startsAt: string; endsAt: string | null; featured: boolean; isActive: boolean;
  status: 'Current' | 'Scheduled' | 'Ended' | 'Paused';
};

type OfferRow = {
  id: number | string; product_id: number | string; product_name: string; product_image: string;
  base_price: number | string; title: string; badge: string; sale_price: number | string;
  starts_at: string; ends_at: string | null; featured: boolean; is_active: boolean;
};

export async function getAdminOffers() {
  const rows = await db()`
    SELECT o.*, p.name AS product_name, p.image_url AS product_image, p.base_price
    FROM offers o JOIN products p ON p.id = o.product_id
    ORDER BY o.is_active DESC, o.starts_at DESC, o.id DESC
  ` as OfferRow[];
  const now = Date.now();
  return rows.map(row => {
    const starts = new Date(row.starts_at).getTime();
    const ends = row.ends_at ? new Date(row.ends_at).getTime() : null;
    const status: AdminOffer['status'] = !row.is_active ? 'Paused' : starts > now ? 'Scheduled' : ends !== null && ends <= now ? 'Ended' : 'Current';
    return {
      id: Number(row.id), productId: Number(row.product_id), productName: row.product_name,
      productImage: row.product_image, basePrice: Number(row.base_price), title: row.title,
      badge: row.badge, salePrice: Number(row.sale_price), startsAt: row.starts_at,
      endsAt: row.ends_at, featured: row.featured, isActive: row.is_active, status,
    };
  });
}

export type InventoryMovement = {
  id: number; productId: number; productName: string; sku: string;
  changeQuantity: number; quantityAfter: number | null; reason: string;
  reference: string | null; createdAt: string;
};

export async function getInventoryMovements(limit = 100) {
  const rows = await db()`
    SELECT m.id, m.product_id, p.name AS product_name, p.sku,
      m.change_quantity, m.quantity_after, m.reason, m.reference, m.created_at
    FROM inventory_movements m JOIN products p ON p.id = m.product_id
    ORDER BY m.created_at DESC LIMIT ${limit}
  ` as Array<{ id: number | string; product_id: number | string; product_name: string; sku: string; change_quantity: number; quantity_after: number | null; reason: string; reference: string | null; created_at: string }>;
  return rows.map(row => ({
    id: Number(row.id), productId: Number(row.product_id), productName: row.product_name,
    sku: row.sku, changeQuantity: Number(row.change_quantity),
    quantityAfter: row.quantity_after === null ? null : Number(row.quantity_after),
    reason: row.reason, reference: row.reference, createdAt: row.created_at,
  }));
}

export const orderStatuses = ['paid', 'processing', 'ready', 'dispatched', 'delivered'] as const;
export type OrderStatus = typeof orderStatuses[number];

export type AdminOrderItem = {
  id: number;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type AdminOrder = {
  reference: string;
  amount: number;
  subtotal: number;
  deliveryAmount: number;
  deliveryKind: string | null;
  customerEmail: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  notes: string;
  paymentChannel: string;
  paidAt: string;
  fulfilledAt: string;
  updatedAt: string;
  status: OrderStatus;
  items: AdminOrderItem[];
  quoteCode: string | null;
  trackingReference: string;
  fulfilmentNotes: string;
};

type OrderRow = {
  reference: string; amount: number | string; subtotal: number | string | null; delivery_amount: number | string; delivery_kind: string | null;
  customer_email: string; customer_first_name: string | null; customer_last_name: string | null;
  customer_phone: string | null; delivery_address: string | null; delivery_city: string | null;
  delivery_state: string | null; customer_notes: string | null; payment_channel: string | null;
  paid_at: string | null; fulfilled_at: string; updated_at: string; status: OrderStatus;
  items_json: unknown; delivery_quote_code: string | null; tracking_reference: string | null; fulfilment_notes: string | null;
};

function orderItems(value: unknown): AdminOrderItem[] {
  const parsed = parseJson(value);
  if (!Array.isArray(parsed)) return [];
  return parsed.flatMap(item => {
    if (!item || typeof item !== 'object') return [];
    const source = item as Record<string, unknown>;
    return [{
      id: Number(source.id || 0), name: String(source.name || 'Legacy order item'), sku: String(source.sku || ''),
      quantity: Number(source.quantity || 0), unitPrice: Number(source.unitPrice || 0), lineTotal: Number(source.lineTotal || 0),
    }];
  });
}

function mapOrder(row: OrderRow): AdminOrder {
  return {
    reference: row.reference, amount: Number(row.amount), subtotal: Number(row.subtotal ?? row.amount),
    deliveryAmount: Number(row.delivery_amount || 0), deliveryKind: row.delivery_kind, customerEmail: row.customer_email,
    firstName: row.customer_first_name || '', lastName: row.customer_last_name || '', phone: row.customer_phone || '',
    address: row.delivery_address || '', city: row.delivery_city || '', state: row.delivery_state || '', notes: row.customer_notes || '',
    paymentChannel: row.payment_channel || 'Paystack', paidAt: row.paid_at || row.fulfilled_at,
    fulfilledAt: row.fulfilled_at, updatedAt: row.updated_at, status: row.status || 'paid',
    items: orderItems(row.items_json), quoteCode: row.delivery_quote_code,
    trackingReference: row.tracking_reference || '', fulfilmentNotes: row.fulfilment_notes || '',
  };
}

const selectOrders = `
  SELECT reference, amount, subtotal, delivery_amount, delivery_kind, customer_email,
    customer_first_name, customer_last_name, customer_phone,
    delivery_address, delivery_city, delivery_state, customer_notes,
    payment_channel, paid_at, fulfilled_at, updated_at, status,
    items_json, delivery_quote_code, tracking_reference, fulfilment_notes
  FROM fulfilled_orders
`;

export async function getAdminOrders(filters: { q?: string; status?: string; limit?: number } = {}) {
  const query = (filters.q || '').trim();
  const status = orderStatuses.includes(filters.status as OrderStatus) ? filters.status! : '';
  const conditions: string[] = [];
  const values: unknown[] = [];
  if (query) {
    values.push(`%${query}%`);
    conditions.push(`(reference ILIKE $${values.length} OR customer_email ILIKE $${values.length} OR COALESCE(customer_first_name, '') ILIKE $${values.length} OR COALESCE(customer_last_name, '') ILIKE $${values.length} OR COALESCE(customer_phone, '') ILIKE $${values.length})`);
  }
  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }
  values.push(Math.min(Math.max(filters.limit || 250, 1), 1000));
  const rows = await db().query(`${selectOrders} ${conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''} ORDER BY fulfilled_at DESC LIMIT $${values.length}`, values) as OrderRow[];
  return rows.map(mapOrder);
}

export async function getAdminOrder(reference: string) {
  const rows = await db().query(`${selectOrders} WHERE reference = $1 LIMIT 1`, [reference]) as OrderRow[];
  return rows[0] ? mapOrder(rows[0]) : null;
}

export type AdminDeliveryQuote = {
  id: number; code: string; token: string; status: string;
  firstName: string; lastName: string; email: string; phone: string;
  address: string; city: string; state: string; customerNotes: string;
  items: Array<{ id: number; quantity: number }>;
  subtotal: number; deliveryAmount: number | null; adminNotes: string;
  paymentReference: string | null; createdAt: string; updatedAt: string;
};

export async function getAdminDeliveryQuotes(filters: { code?: string; status?: string } = {}) {
  const rows = await db()`
    SELECT * FROM delivery_quotes
    ORDER BY CASE status WHEN 'requested' THEN 0 WHEN 'approved' THEN 1 WHEN 'payment_ready' THEN 2 ELSE 3 END, created_at DESC
    LIMIT 300
  ` as Array<Record<string, unknown>>;
  return rows.map(row => ({
    id: Number(row.id), code: String(row.code), token: String(row.public_token), status: String(row.status),
    firstName: String(row.customer_first_name), lastName: String(row.customer_last_name), email: String(row.customer_email),
    phone: String(row.customer_phone), address: String(row.delivery_address), city: String(row.delivery_city), state: String(row.delivery_state),
    customerNotes: String(row.customer_notes || ''),
    items: (Array.isArray(parseJson(row.items_json)) ? parseJson(row.items_json) : []) as Array<{ id: number; quantity: number }>,
    subtotal: Number(row.subtotal), deliveryAmount: row.delivery_amount === null ? null : Number(row.delivery_amount),
    adminNotes: String(row.admin_notes || ''), paymentReference: row.payment_reference ? String(row.payment_reference) : null,
    createdAt: String(row.created_at), updatedAt: String(row.updated_at),
  })).filter(quote => (!filters.code || quote.code === filters.code) && (!filters.status || quote.status === filters.status));
}

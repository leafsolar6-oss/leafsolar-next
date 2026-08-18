'use server';

import { put } from '@vercel/blob';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireAdmin } from '@/lib/admin-auth';
import { db } from '@/lib/db';

function money(value: FormDataEntryValue | null) {
  const normalized = String(value || '').replace(/[₦,\s]/g, '');
  return normalized ? Number(normalized) : null;
}

function integer(value: FormDataEntryValue | null) {
  const normalized = String(value || '').trim();
  return normalized === '' ? null : Number(normalized);
}

function checked(formData: FormData, name: string) {
  return formData.get(name) === 'on' || formData.get(name) === 'true';
}

function slugify(value: string) {
  return value.toLowerCase().trim().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 100);
}

function lagosDate(value: string) {
  if (!value) return null;
  const date = new Date(`${value}:00+01:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function refreshStore() {
  revalidatePath('/');
  revalidatePath('/products');
  revalidatePath('/products/[slug]', 'page');
  revalidatePath('/products/category/[category]', 'page');
  revalidatePath('/gallery');
  revalidatePath('/home-appliances-ibadan');
  revalidatePath('/solar-products');
  revalidatePath('/packages');
  revalidatePath('/solar-calculator');
  revalidatePath('/sitemap.xml');
  revalidatePath('/product-feed.xml');
  revalidatePath('/google-merchant-feed.xml');
}

const productSchema = z.object({
  name: z.string().trim().min(2).max(180),
  sku: z.string().trim().max(80),
  brand: z.string().trim().min(1).max(80),
  category: z.string().trim().min(1).max(100),
  categoryLabel: z.string().trim().min(1).max(100),
  department: z.enum(['electronics', 'solar', 'packages']),
  basePrice: z.number().int().positive().max(2_000_000_000),
  compareAtPrice: z.number().int().positive().max(2_000_000_000).nullable(),
  description: z.string().trim().min(10).max(5000),
  imageAlt: z.string().trim().max(220),
  trackInventory: z.boolean(),
  stockQuantity: z.number().int().min(0).max(1_000_000).nullable(),
  lowStockThreshold: z.number().int().min(0).max(1_000_000).nullable(),
  manualInStock: z.boolean(),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
});

async function uploadProductImage(file: File) {
  if (file.size > 4 * 1024 * 1024) throw new Error('Each product image must be 4 MB or smaller.');
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Use JPG, PNG or WebP product images.');
  const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-');
  const blob = await put(`products/${Date.now()}-${safeName}`, file, { access: 'public', addRandomSuffix: true });
  return blob.url;
}

async function productImage(formData: FormData, fallback: string) {
  const file = formData.get('imageFile');
  if (!(file instanceof File) || file.size === 0) return fallback;
  return uploadProductImage(file);
}

function parseSpecifications(value: FormDataEntryValue | null) {
  const lines = String(value || '').split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  if (lines.length > 30) throw new Error('Add no more than 30 specification rows.');
  return lines.map(line => {
    const separator = line.indexOf(':');
    if (separator < 1 || separator === line.length - 1) throw new Error(`Use “Name: Value” for each specification. Check: ${line}`);
    const name = line.slice(0, separator).trim();
    const specificationValue = line.slice(separator + 1).trim();
    if (name.length > 80 || specificationValue.length > 240) throw new Error('A specification name or value is too long.');
    return { name, value: specificationValue };
  });
}

async function productGallery(formData: FormData) {
  const existingValue = String(formData.get('existingGallery') || '[]');
  let existing: string[] = [];
  try {
    const parsed = JSON.parse(existingValue) as unknown;
    if (Array.isArray(parsed)) existing = parsed.filter(item => typeof item === 'string').slice(0, 8);
  } catch { /* ignore malformed hidden input */ }
  if (checked(formData, 'clearGallery')) existing = [];
  const files = formData.getAll('galleryFiles').filter((item): item is File => item instanceof File && item.size > 0);
  if (files.length > 6 || existing.length + files.length > 8) throw new Error('A product can have up to eight additional gallery images.');
  const uploaded = await Promise.all(files.map(uploadProductImage));
  return [...existing, ...uploaded];
}

export async function saveProductAction(formData: FormData) {
  await requireAdmin();
  const productId = integer(formData.get('productId'));
  const parsed = productSchema.safeParse({
    name: String(formData.get('name') || ''),
    sku: String(formData.get('sku') || ''),
    brand: String(formData.get('brand') || ''),
    category: String(formData.get('category') || ''),
    categoryLabel: String(formData.get('categoryLabel') || ''),
    department: String(formData.get('department') || ''),
    basePrice: money(formData.get('basePrice')),
    compareAtPrice: money(formData.get('compareAtPrice')),
    description: String(formData.get('description') || ''),
    imageAlt: String(formData.get('imageAlt') || ''),
    trackInventory: checked(formData, 'trackInventory'),
    stockQuantity: integer(formData.get('stockQuantity')),
    lowStockThreshold: integer(formData.get('lowStockThreshold')),
    manualInStock: checked(formData, 'manualInStock'),
    isActive: checked(formData, 'isActive'),
    isFeatured: checked(formData, 'isFeatured'),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || 'Check the product details.');
  const values = parsed.data;
  if (values.trackInventory && values.stockQuantity === null) throw new Error('Enter a stock quantity for tracked inventory.');
  if (values.compareAtPrice !== null && values.compareAtPrice <= values.basePrice) throw new Error('The previous price must be greater than the regular price.');

  const sql = db();
  let slug = slugify(String(formData.get('slug') || values.name));
  if (!slug) slug = `product-${Date.now()}`;
  const conflicts = await sql`SELECT id FROM products WHERE slug = ${slug} AND (${productId}::bigint IS NULL OR id <> ${productId}) LIMIT 1`;
  if (conflicts.length) slug = `${slug}-${Date.now().toString().slice(-5)}`;
  const imageUrl = await productImage(formData, String(formData.get('existingImage') || ''));
  if (!imageUrl) throw new Error('Upload a product image.');
  const specifications = parseSpecifications(formData.get('specifications'));
  const galleryUrls = await productGallery(formData);

  if (productId !== null) {
    const previous = await sql`SELECT stock_quantity FROM products WHERE id = ${productId} LIMIT 1` as { stock_quantity: number | null }[];
    if (!previous[0]) throw new Error('Product not found.');
    await sql`
      UPDATE products SET
        slug=${slug}, name=${values.name}, sku=${values.sku}, brand=${values.brand},
        category=${values.category}, category_label=${values.categoryLabel}, department=${values.department},
        base_price=${values.basePrice}, compare_at_price=${values.compareAtPrice}, image_url=${imageUrl},
        image_alt=${values.imageAlt || values.name}, description=${values.description},
        specifications=${JSON.stringify(specifications)}::jsonb, gallery_urls=${JSON.stringify(galleryUrls)}::jsonb,
        track_inventory=${values.trackInventory}, stock_quantity=${values.trackInventory ? values.stockQuantity : null},
        low_stock_threshold=${values.trackInventory ? (values.lowStockThreshold ?? 2) : null},
        manual_in_stock=${values.manualInStock}, is_active=${values.isActive}, is_featured=${values.isFeatured}, updated_at=NOW()
      WHERE id=${productId}
    `;
    if (values.trackInventory && Number(previous[0].stock_quantity || 0) !== values.stockQuantity) {
      const before = Number(previous[0].stock_quantity || 0);
      await sql`
        INSERT INTO inventory_movements (product_id, change_quantity, quantity_after, reason)
        VALUES (${productId}, ${(values.stockQuantity || 0) - before}, ${values.stockQuantity}, 'Manual product update')
      `;
    }
    refreshStore();
    revalidatePath(`/admin/products/${productId}`);
    redirect(`/admin/products/${productId}?saved=1`);
  }

  const inserted = await sql`
    INSERT INTO products (
      slug, name, sku, brand, category, category_label, department, base_price,
      compare_at_price, image_url, image_alt, description, specifications, gallery_urls, track_inventory,
      stock_quantity, low_stock_threshold, manual_in_stock, is_active, is_featured
    ) VALUES (
      ${slug}, ${values.name}, ${values.sku}, ${values.brand}, ${values.category},
      ${values.categoryLabel}, ${values.department}, ${values.basePrice}, ${values.compareAtPrice},
      ${imageUrl}, ${values.imageAlt || values.name}, ${values.description},
      ${JSON.stringify(specifications)}::jsonb, ${JSON.stringify(galleryUrls)}::jsonb, ${values.trackInventory},
      ${values.trackInventory ? values.stockQuantity : null}, ${values.trackInventory ? (values.lowStockThreshold ?? 2) : null},
      ${values.manualInStock}, ${values.isActive}, ${values.isFeatured}
    ) RETURNING id
  ` as { id: number | string }[];
  const newId = Number(inserted[0].id);
  if (values.trackInventory && (values.stockQuantity || 0) > 0) {
    await sql`INSERT INTO inventory_movements (product_id, change_quantity, quantity_after, reason) VALUES (${newId}, ${values.stockQuantity}, ${values.stockQuantity}, 'Opening stock')`;
  }
  refreshStore();
  redirect(`/admin/products/${newId}?created=1`);
}

export async function archiveProductAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get('productId'));
  if (!Number.isSafeInteger(id)) throw new Error('Invalid product.');
  await db()`UPDATE products SET is_active = false, updated_at = NOW() WHERE id = ${id}`;
  refreshStore();
  revalidatePath('/admin/products');
  redirect('/admin/products?archived=1');
}

export async function adjustInventoryAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get('productId'));
  const change = Number(formData.get('changeQuantity'));
  const reason = String(formData.get('reason') || '').trim();
  if (!Number.isSafeInteger(id) || !Number.isSafeInteger(change) || change === 0 || Math.abs(change) > 100000) throw new Error('Enter a valid non-zero stock adjustment.');
  if (reason.length < 3 || reason.length > 160) throw new Error('Enter a short reason for this stock adjustment.');
  const updated = await db().query(`
    WITH changed AS (
      UPDATE products SET stock_quantity = stock_quantity + $2, updated_at = NOW()
      WHERE id = $1 AND track_inventory = true AND stock_quantity + $2 >= 0
      RETURNING id, stock_quantity
    )
    INSERT INTO inventory_movements (product_id, change_quantity, quantity_after, reason)
    SELECT id, $2, stock_quantity, $3 FROM changed
    RETURNING quantity_after
  `, [id, change, reason]) as Array<{ quantity_after: number }>;
  if (!updated[0]) throw new Error('The adjustment is invalid or would make stock negative.');
  refreshStore();
  revalidatePath('/admin/inventory');
  redirect(`/admin/products/${id}?stock=1`);
}

const offerSchema = z.object({
  productId: z.number().int().positive(),
  title: z.string().trim().min(2).max(100),
  badge: z.string().trim().min(1).max(30),
  salePrice: z.number().int().positive(),
  startsAt: z.date(),
  endsAt: z.date().nullable(),
  featured: z.boolean(),
});

export async function createOfferAction(formData: FormData) {
  await requireAdmin();
  const start = lagosDate(String(formData.get('startsAt') || '')) || new Date();
  const endValue = String(formData.get('endsAt') || '');
  const parsed = offerSchema.safeParse({
    productId: Number(formData.get('productId')),
    title: String(formData.get('title') || ''),
    badge: String(formData.get('badge') || 'Sale'),
    salePrice: money(formData.get('salePrice')),
    startsAt: start,
    endsAt: endValue ? lagosDate(endValue) : null,
    featured: checked(formData, 'featured'),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || 'Check the offer details.');
  const offer = parsed.data;
  if (offer.endsAt && offer.endsAt <= offer.startsAt) throw new Error('The offer end time must be after its start time.');
  const sql = db();
  const products = await sql`SELECT base_price FROM products WHERE id = ${offer.productId} AND is_active = true LIMIT 1` as { base_price: number }[];
  if (!products[0]) throw new Error('Choose an active product.');
  if (offer.salePrice >= Number(products[0].base_price)) throw new Error('The offer price must be lower than the regular product price.');
  const overlap = await sql`
    SELECT id FROM offers
    WHERE product_id = ${offer.productId} AND is_active = true
      AND tstzrange(starts_at, COALESCE(ends_at, 'infinity'::timestamptz), '[)')
        && tstzrange(${offer.startsAt.toISOString()}::timestamptz, COALESCE(${offer.endsAt?.toISOString() || null}::timestamptz, 'infinity'::timestamptz), '[)')
    LIMIT 1
  `;
  if (overlap.length) throw new Error('This product already has an active or scheduled offer during those dates.');
  await sql`
    INSERT INTO offers (product_id, title, badge, sale_price, starts_at, ends_at, featured)
    VALUES (${offer.productId}, ${offer.title}, ${offer.badge}, ${offer.salePrice}, ${offer.startsAt.toISOString()}, ${offer.endsAt?.toISOString() || null}, ${offer.featured})
  `;
  refreshStore();
  revalidatePath('/admin/offers');
  redirect('/admin/offers?created=1');
}

export async function toggleOfferAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get('offerId'));
  if (!Number.isSafeInteger(id)) throw new Error('Invalid offer.');
  await db()`UPDATE offers SET is_active = NOT is_active, updated_at = NOW() WHERE id = ${id}`;
  refreshStore();
  revalidatePath('/admin/offers');
}

export async function endOfferAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get('offerId'));
  if (!Number.isSafeInteger(id)) throw new Error('Invalid offer.');
  await db()`UPDATE offers SET ends_at = NOW(), is_active = false, updated_at = NOW() WHERE id = ${id}`;
  refreshStore();
  revalidatePath('/admin/offers');
}

const fulfilmentStatuses = ['paid', 'processing', 'ready', 'dispatched', 'delivered'] as const;

export async function updateOrderFulfilmentAction(formData: FormData) {
  await requireAdmin();
  const reference = String(formData.get('reference') || '').trim();
  const status = String(formData.get('status') || '').trim();
  const trackingReference = String(formData.get('trackingReference') || '').trim();
  const fulfilmentNotes = String(formData.get('fulfilmentNotes') || '').trim();
  if (!/^[A-Za-z0-9._=-]{6,100}$/.test(reference)) throw new Error('Invalid order reference.');
  if (!fulfilmentStatuses.includes(status as typeof fulfilmentStatuses[number])) throw new Error('Invalid fulfilment status.');
  if (trackingReference.length > 160 || fulfilmentNotes.length > 1000) throw new Error('Tracking reference or fulfilment notes are too long.');

  const result = await db().query(`
    UPDATE fulfilled_orders
    SET status = $2, tracking_reference = NULLIF($3, ''), fulfilment_notes = $4, updated_at = NOW()
    WHERE reference = $1
    RETURNING reference
  `, [reference, status, trackingReference, fulfilmentNotes]) as Array<{ reference: string }>;
  if (!result.length) throw new Error('Order not found.');
  revalidatePath('/admin');
  revalidatePath('/admin/orders');
  revalidatePath(`/admin/orders/${encodeURIComponent(reference)}`);
}

export async function updateDeliveryQuoteAction(formData: FormData) {
  await requireAdmin();
  const quoteId = Number(formData.get('quoteId'));
  const intent = String(formData.get('intent') || 'approve');
  const adminNotes = String(formData.get('adminNotes') || '').trim();
  if (!Number.isInteger(quoteId) || quoteId < 1) throw new Error('Invalid delivery quote.');
  if (adminNotes.length > 1000) throw new Error('Quote notes are too long.');

  if (intent === 'cancel') {
    const rows = await db().query(`
      UPDATE delivery_quotes SET status = 'cancelled', admin_notes = $2, updated_at = NOW()
      WHERE id = $1 AND status IN ('requested', 'approved') RETURNING code
    `, [quoteId, adminNotes]) as Array<{ code: string }>;
    if (!rows.length) throw new Error('This quote can no longer be cancelled.');
  } else {
    const deliveryAmount = money(formData.get('deliveryAmount'));
    if (deliveryAmount === null || !Number.isSafeInteger(deliveryAmount) || deliveryAmount < 0) {
      throw new Error('Enter a valid delivery amount in naira.');
    }
    const rows = await db().query(`
      UPDATE delivery_quotes
      SET status = 'approved', delivery_amount = $2, admin_notes = $3,
          approved_at = COALESCE(approved_at, NOW()), updated_at = NOW()
      WHERE id = $1 AND status IN ('requested', 'approved') RETURNING code
    `, [quoteId, deliveryAmount, adminNotes]) as Array<{ code: string }>;
    if (!rows.length) throw new Error('Only requested or approved quotes can be updated.');
  }
  revalidatePath('/admin');
  revalidatePath('/admin/delivery-quotes');
}

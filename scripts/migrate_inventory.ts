import { loadEnvFile } from 'node:process';
import { neon } from '@neondatabase/serverless';
import catalogue from '../lib/catalog.json';
import type { Product } from '../lib/data';

try { loadEnvFile('.env.local'); } catch { /* Vercel supplies environment variables directly. */ }

const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!url) throw new Error('DATABASE_URL is required.');
const sql = neon(url);
const products = catalogue as Product[];
const weeklyOfferIds = new Set([1121, 1161, 1192, 1272, 1381, 1401]);
const bestsellerIds = new Set([1121, 1168, 1192, 1255, 1310, 1381, 1401, 1463]);

async function main() {
await sql`
  CREATE TABLE IF NOT EXISTS admin_users (
    id BIGSERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`;

await sql`
  CREATE TABLE IF NOT EXISTS admin_login_codes (
    id BIGSERIAL PRIMARY KEY,
    admin_user_id BIGINT NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    code_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    consumed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`;
await sql`CREATE INDEX IF NOT EXISTS admin_login_codes_user_created_idx ON admin_login_codes(admin_user_id, created_at DESC)`;

await sql`
  CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    sku TEXT NOT NULL DEFAULT '',
    brand TEXT NOT NULL DEFAULT 'Leaf Solar',
    category TEXT NOT NULL,
    category_label TEXT NOT NULL,
    department TEXT NOT NULL CHECK (department IN ('electronics', 'solar', 'packages')),
    base_price INTEGER NOT NULL CHECK (base_price > 0),
    compare_at_price INTEGER CHECK (compare_at_price IS NULL OR compare_at_price > 0),
    image_url TEXT NOT NULL,
    image_alt TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    track_inventory BOOLEAN NOT NULL DEFAULT false,
    stock_quantity INTEGER CHECK (stock_quantity IS NULL OR stock_quantity >= 0),
    low_stock_threshold INTEGER CHECK (low_stock_threshold IS NULL OR low_stock_threshold >= 0),
    manual_in_stock BOOLEAN NOT NULL DEFAULT true,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    sort_order INTEGER NOT NULL DEFAULT 1000,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT tracked_stock_required CHECK (track_inventory = false OR stock_quantity IS NOT NULL)
  )
`;
await sql`CREATE INDEX IF NOT EXISTS products_active_department_idx ON products(is_active, department)`;
await sql`CREATE INDEX IF NOT EXISTS products_category_idx ON products(category_label)`;
await sql`CREATE INDEX IF NOT EXISTS products_sku_idx ON products(sku)`;

await sql`
  CREATE TABLE IF NOT EXISTS offers (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    badge TEXT NOT NULL DEFAULT 'Sale',
    sale_price INTEGER NOT NULL CHECK (sale_price > 0),
    starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ends_at TIMESTAMPTZ,
    featured BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (ends_at IS NULL OR ends_at > starts_at)
  )
`;
await sql`CREATE INDEX IF NOT EXISTS offers_product_schedule_idx ON offers(product_id, is_active, starts_at, ends_at)`;

await sql`
  CREATE TABLE IF NOT EXISTS inventory_movements (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    change_quantity INTEGER NOT NULL,
    quantity_after INTEGER,
    reason TEXT NOT NULL,
    reference TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`;
await sql`CREATE INDEX IF NOT EXISTS inventory_movements_product_created_idx ON inventory_movements(product_id, created_at DESC)`;

await sql`
  CREATE TABLE IF NOT EXISTS fulfilled_orders (
    reference TEXT PRIMARY KEY,
    amount INTEGER NOT NULL,
    customer_email TEXT NOT NULL,
    fulfilled_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`;

await sql`
  INSERT INTO admin_users (email, name)
  VALUES ('leafsolar6@gmail.com', 'Leaf Solar Owner')
  ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, is_active = true, updated_at = NOW()
`;

for (let index = 0; index < products.length; index++) {
  const product = products[index];
  const isWeeklyOffer = weeklyOfferIds.has(product.id) && Boolean(product.oldPrice && product.oldPrice > product.price);
  const basePrice = isWeeklyOffer ? product.oldPrice! : product.price;
  const compareAtPrice = isWeeklyOffer ? null : product.oldPrice || null;
  await sql`
    INSERT INTO products (
      id, slug, name, sku, brand, category, category_label, department,
      base_price, compare_at_price, image_url, image_alt, description,
      track_inventory, stock_quantity, low_stock_threshold, manual_in_stock,
      is_active, is_featured, sort_order
    ) VALUES (
      ${product.id}, ${product.slug}, ${product.name}, ${product.sku || ''},
      ${product.brand || 'Leaf Solar'}, ${product.category}, ${product.categoryLabel},
      ${product.department}, ${basePrice}, ${compareAtPrice}, ${product.image},
      ${product.imageAlt || product.name}, ${product.description || ''}, false,
      NULL, NULL, ${product.inStock}, true, ${bestsellerIds.has(product.id)}, ${index}
    )
    ON CONFLICT (id) DO UPDATE SET
      slug = EXCLUDED.slug,
      name = EXCLUDED.name,
      sku = EXCLUDED.sku,
      brand = EXCLUDED.brand,
      category = EXCLUDED.category,
      category_label = EXCLUDED.category_label,
      department = EXCLUDED.department,
      image_url = EXCLUDED.image_url,
      image_alt = EXCLUDED.image_alt,
      description = EXCLUDED.description,
      sort_order = EXCLUDED.sort_order,
      updated_at = NOW()
  `;

  if (isWeeklyOffer) {
    await sql`
      INSERT INTO offers (product_id, title, badge, sale_price, starts_at, featured, is_active)
      SELECT ${product.id}, 'Weekly offer', 'Sale', ${product.price}, NOW(), true, true
      WHERE NOT EXISTS (
        SELECT 1 FROM offers WHERE product_id = ${product.id} AND title = 'Weekly offer'
      )
    `;
  }
}

await sql`SELECT setval(pg_get_serial_sequence('products', 'id'), GREATEST((SELECT MAX(id) FROM products), 1), true)`;

const [{ product_count }] = await sql`SELECT COUNT(*)::int AS product_count FROM products`;
const [{ offer_count }] = await sql`SELECT COUNT(*)::int AS offer_count FROM offers`;
console.log(`Inventory database ready: ${product_count} products, ${offer_count} offers, one owner account.`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});

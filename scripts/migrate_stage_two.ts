import { neon } from '@neondatabase/serverless';
import { loadEnvFile } from 'node:process';

try { loadEnvFile('.env.local'); } catch { /* CI and Vercel provide environment variables directly. */ }

const databaseUrl = process.env.DATABASE_URL?.trim();
if (!databaseUrl) throw new Error('DATABASE_URL is required.');

const sql = neon(databaseUrl);

async function migrate() {
  await sql.query(`
    ALTER TABLE products
      ADD COLUMN IF NOT EXISTS specifications jsonb NOT NULL DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS gallery_urls jsonb NOT NULL DEFAULT '[]'::jsonb
  `);

  await sql.query(`
    ALTER TABLE fulfilled_orders
      ADD COLUMN IF NOT EXISTS subtotal bigint,
      ADD COLUMN IF NOT EXISTS delivery_amount bigint NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS delivery_kind text,
      ADD COLUMN IF NOT EXISTS customer_first_name text,
      ADD COLUMN IF NOT EXISTS customer_last_name text,
      ADD COLUMN IF NOT EXISTS customer_phone text,
      ADD COLUMN IF NOT EXISTS delivery_address text,
      ADD COLUMN IF NOT EXISTS delivery_city text,
      ADD COLUMN IF NOT EXISTS delivery_state text,
      ADD COLUMN IF NOT EXISTS customer_notes text,
      ADD COLUMN IF NOT EXISTS payment_channel text,
      ADD COLUMN IF NOT EXISTS paid_at timestamptz,
      ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'paid',
      ADD COLUMN IF NOT EXISTS items_json jsonb NOT NULL DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS delivery_quote_code text,
      ADD COLUMN IF NOT EXISTS tracking_reference text,
      ADD COLUMN IF NOT EXISTS fulfilment_notes text NOT NULL DEFAULT '',
      ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT NOW()
  `);
  await sql.query(`UPDATE fulfilled_orders SET subtotal = amount WHERE subtotal IS NULL`);
  await sql.query(`CREATE INDEX IF NOT EXISTS fulfilled_orders_status_date_idx ON fulfilled_orders (status, fulfilled_at DESC)`);
  await sql.query(`CREATE INDEX IF NOT EXISTS fulfilled_orders_email_idx ON fulfilled_orders (LOWER(customer_email))`);

  await sql.query(`
    CREATE TABLE IF NOT EXISTS delivery_quotes (
      id bigserial PRIMARY KEY,
      code text NOT NULL UNIQUE,
      public_token text NOT NULL UNIQUE,
      status text NOT NULL DEFAULT 'requested',
      customer_first_name text NOT NULL,
      customer_last_name text NOT NULL,
      customer_email text NOT NULL,
      customer_phone text NOT NULL,
      delivery_address text NOT NULL,
      delivery_city text NOT NULL,
      delivery_state text NOT NULL,
      customer_notes text NOT NULL DEFAULT '',
      items_json jsonb NOT NULL,
      subtotal bigint NOT NULL CHECK (subtotal > 0),
      delivery_amount bigint CHECK (delivery_amount >= 0),
      admin_notes text NOT NULL DEFAULT '',
      payment_reference text UNIQUE,
      payment_url text,
      approved_at timestamptz,
      paid_at timestamptz,
      created_at timestamptz NOT NULL DEFAULT NOW(),
      updated_at timestamptz NOT NULL DEFAULT NOW()
    )
  `);
  await sql.query(`CREATE INDEX IF NOT EXISTS delivery_quotes_status_date_idx ON delivery_quotes (status, created_at DESC)`);
  await sql.query(`CREATE INDEX IF NOT EXISTS delivery_quotes_email_idx ON delivery_quotes (LOWER(customer_email))`);

  const [summary] = await sql.query(`
    SELECT
      (SELECT COUNT(*)::int FROM products) AS products,
      (SELECT COUNT(*)::int FROM fulfilled_orders) AS orders,
      (SELECT COUNT(*)::int FROM delivery_quotes) AS delivery_quotes
  `) as Array<{ products: number; orders: number; delivery_quotes: number }>;
  console.log('Stage-two schema is ready:', summary);
}

migrate().catch(error => {
  console.error(error);
  process.exitCode = 1;
});

import { readFile, writeFile } from 'node:fs/promises';
import { loadEnvFile } from 'node:process';
import { neon } from '@neondatabase/serverless';

type CatalogueProduct = {
  id: number;
  name: string;
  brand: string;
  categoryLabel: string;
  department: 'electronics' | 'solar' | 'packages';
  description: string;
};

try { loadEnvFile('.env.local'); } catch { /* CI and Vercel provide environment variables directly. */ }

const unsupportedDescription = /^(Brand new, sealed – full manufacturer warranty\.|.+\b(?:Professional installation|Installation) included\. (?:5-year|13-month) warranty\.)/i;

function truthfulDescription(product: CatalogueProduct) {
  if (product.department === 'packages') {
    return `${product.name} is a catalogue starting point for solar planning. Final components, supported loads, installation scope, site requirements, timing and product-specific warranty terms require a Leaf Solar assessment and written confirmation before purchase.`;
  }
  return `${product.name} is listed in Leaf Solar’s ${product.categoryLabel} catalogue. Confirm current availability, product-specific specifications and applicable warranty terms with Leaf Solar before purchase.`;
}

async function updateBundledCatalogue() {
  const cataloguePath = new URL('../lib/catalog.json', import.meta.url);
  const products = JSON.parse(await readFile(cataloguePath, 'utf8')) as CatalogueProduct[];
  let changed = 0;
  for (const product of products) {
    if (!unsupportedDescription.test(product.description)) continue;
    product.description = truthfulDescription(product);
    changed += 1;
  }
  if (changed) await writeFile(cataloguePath, `${JSON.stringify(products, null, 2)}\n`);
  return { changed, total: products.length };
}

async function updateDatabaseCatalogue() {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) throw new Error('DATABASE_URL is required.');
  const sql = neon(databaseUrl);
  const updated = await sql.query(`
    UPDATE products
    SET description = CASE
      WHEN department = 'packages' THEN
        name || ' is a catalogue starting point for solar planning. Final components, supported loads, installation scope, site requirements, timing and product-specific warranty terms require a Leaf Solar assessment and written confirmation before purchase.'
      ELSE
        name || ' is listed in Leaf Solar’s ' || category_label || ' catalogue. Confirm current availability, product-specific specifications and applicable warranty terms with Leaf Solar before purchase.'
    END,
    updated_at = NOW()
    WHERE description LIKE 'Brand new, sealed – full manufacturer warranty.%'
       OR description ~* '(Professional installation|Installation) included\\. (5-year|13-month) warranty\\.$'
    RETURNING id
  `) as Array<{ id: number | string }>;
  return updated.length;
}

async function main() {
  const bundled = await updateBundledCatalogue();
  const databaseChanged = await updateDatabaseCatalogue();
  console.log('Unsupported catalogue claims sanitized:', { bundledChanged: bundled.changed, databaseChanged, products: bundled.total });
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});

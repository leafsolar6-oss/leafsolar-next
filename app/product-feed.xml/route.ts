import { getProducts } from '@/lib/catalog-store';

export const dynamic = 'force-dynamic';

function xml(value: unknown) {
  return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function absoluteHttpUrl(value: string, base: string) {
  try {
    const url = new URL(value, `${base}/`);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
}

export async function GET() {
  const products = await getProducts({ allowFallback: false });
  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'https://leafsolar.ng').replace(/\/$/, '');
  const items = products.flatMap(product => {
    const primaryImage = absoluteHttpUrl(product.image, base);
    if (!primaryImage) return [];
    const additionalImages = (product.gallery || []).map(image => absoluteHttpUrl(image, base)).filter((image): image is string => Boolean(image)).map(image => `<g:additional_image_link>${xml(image)}</g:additional_image_link>`).join('');
    return [`<item><g:id>${xml(product.sku || product.id)}</g:id><title>${xml(product.name)}</title><description>${xml(product.description)}</description><link>${xml(`${base}/products/${product.slug}`)}</link><g:image_link>${xml(primaryImage)}</g:image_link>${additionalImages}<g:availability>${product.inStock ? 'in_stock' : 'out_of_stock'}</g:availability><g:price>${product.price.toFixed(2)} NGN</g:price><g:brand>${xml(product.brand)}</g:brand><g:product_type>${xml(`${product.department} > ${product.categoryLabel}`)}</g:product_type></item>`];
  }).join('');
  const body = `<?xml version="1.0" encoding="UTF-8"?><rss xmlns:g="http://base.google.com/ns/1.0" version="2.0"><channel><title>Leaf Solar product catalogue</title><link>${xml(`${base}/products`)}</link><description>Current Leaf Solar online catalogue prices and availability.</description>${items}</channel></rss>`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=0, s-maxage=900, stale-while-revalidate=3600' } });
}

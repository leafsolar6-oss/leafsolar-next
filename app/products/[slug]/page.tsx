import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import ProductGallery from '@/components/ProductGallery';
import ProductPurchaseActions from '@/components/cart/ProductPurchaseActions';
import { formatNaira, productBadge, site, whatsappUrl } from '@/lib/data';
import { getProducts } from '@/lib/catalog-store';

export const dynamic = 'force-dynamic';

function absoluteHttpUrl(value: string, baseUrl: string) {
  try {
    const url = new URL(value, `${baseUrl}/`);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const products = await getProducts();
  const product = products.find(item => item.slug === slug);
  if (!product) return {};
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://leafsolar.ng').replace(/\/$/, '');
  const imageUrl = absoluteHttpUrl(product.image, baseUrl);
  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      url: `/products/${product.slug}`,
      type: 'website',
      title: product.name,
      description: product.description,
      ...(imageUrl ? { images: [{ url: imageUrl, alt: product.imageAlt }] } : {}),
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const products = await getProducts();
  const product = products.find(item => item.slug === slug);
  if (!product) return notFound();

  const related = products.filter(item => item.categoryLabel === product.categoryLabel && item.id !== product.id).slice(0, 4);
  const collection = product.department === 'solar'
    ? { name: 'Solar products', href: '/solar-products' }
    : product.department === 'packages'
      ? { name: 'Solar packages', href: '/packages' }
      : { name: 'Home appliances', href: '/home-appliances-ibadan' };
  const badge = productBadge(product);
  const saving = product.oldPrice ? product.oldPrice - product.price : 0;
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://leafsolar.ng').replace(/\/$/, '');
  const productUrl = `${baseUrl}/products/${product.slug}`;
  const images = [product.image, ...(product.gallery || []).filter(image => image !== product.image)];
  const structuredImages = images.flatMap(image => {
    const url = absoluteHttpUrl(image, baseUrl);
    return url ? [url] : [];
  });
  const productStructuredData = {
    '@context': 'https://schema.org', '@type': 'Product', name: product.name, description: product.description,
    sku: product.sku || undefined, category: product.categoryLabel, brand: { '@type': 'Brand', name: product.brand }, ...(structuredImages.length > 0 ? { image: structuredImages } : {}), url: productUrl,
    offers: { '@type': 'Offer', url: productUrl, priceCurrency: 'NGN', price: product.price, availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock', seller: { '@type': 'Store', '@id': `${baseUrl}/#store`, name: site.name } },
  };
  const breadcrumbStructuredData = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: collection.name, item: `${baseUrl}${collection.href}` },
      { '@type': 'ListItem', position: 3, name: product.name, item: productUrl },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productStructuredData).replace(/</g, '\\u003c') }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData).replace(/</g, '\\u003c') }} />
      <section className="border-b border-gray-100 bg-white">
        <div className="container-wide py-8 sm:py-12">
          <nav className="scrollbar-none flex items-center gap-2 overflow-x-auto whitespace-nowrap text-xs font-semibold text-gray-500" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-leaf-700">Home</Link><span>/</span><Link href={collection.href} className="hover:text-leaf-700">{collection.name}</Link><span>/</span><span className="max-w-52 truncate text-gray-800">{product.name}</span>
          </nav>

          <div className="mt-6 grid items-start gap-8 lg:grid-cols-[1.03fr_.97fr] lg:gap-14">
            <div>
              <ProductGallery name={product.name} imageAlt={product.imageAlt} images={images} badge={badge} saving={saving} />
              <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {['Secure Paystack', 'Free in Ibadan', 'Quote elsewhere', 'WhatsApp support'].map((item, index) => (
                  <div key={item} className={`${index === 3 ? 'hidden sm:flex' : 'flex'} min-h-16 items-center justify-center rounded-xl border border-gray-100 bg-white px-2 text-center text-[10px] font-bold text-gray-600`}>✓&nbsp; {item}</div>
                ))}
              </div>
            </div>

            <div className="lg:pt-3">
              <p className="text-xs font-extrabold uppercase tracking-[.15em] text-leaf-700">{product.brand} · {product.categoryLabel}</p>
              <h1 className="mt-3 font-display text-3xl font-black leading-[1.08] text-gray-950 sm:text-5xl">{product.name}</h1>
              {product.sku && <p className="mt-3 text-xs text-gray-400">SKU: {product.sku}</p>}
              <div className="mt-6 flex flex-wrap items-end gap-x-3 gap-y-1">
                <span className="font-display text-3xl font-black text-leaf-700 sm:text-4xl">{formatNaira(product.price)}</span>
                {product.oldPrice && <span className="pb-1 text-base text-gray-400 line-through">{formatNaira(product.oldPrice)}</span>}
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs font-bold"><i className={`h-2 w-2 rounded-full ${product.inStock ? 'bg-emerald-500' : 'bg-red-500'}`} /><span className={product.inStock ? 'text-emerald-700' : 'text-red-700'}>{product.inStock ? 'In stock — ready to order' : 'Currently out of stock'}</span></div>

              <p className="mt-6 text-base leading-7 text-gray-600">{product.description}</p>

              <div className="my-7 h-px bg-gray-100" />
              <ProductPurchaseActions product={product} />
              <a href={whatsappUrl(`Hello Leaf Solar! I want to order the ${product.name} listed at ${formatNaira(product.price)}. Please confirm availability.`)} className="btn mt-3 w-full rounded-xl border border-[#25D366]/30 bg-[#edfff3] text-[#167a38] hover:bg-[#e0fbea]">
                <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.5 9.6 9.6 0 0 1-4-.9L3 21l1.7-4.5A8.5 8.5 0 1 1 21 11.5Z"/><path d="M9 9.5c.4 2.5 2 4.1 4.5 4.5"/></svg>
                Order or ask on WhatsApp
              </a>

              <div className="mt-6 overflow-hidden rounded-2xl border border-gray-100">
                <div className="grid grid-cols-[42px_1fr] gap-3 border-b border-gray-100 p-4"><span className="grid h-9 w-9 place-items-center rounded-lg bg-leaf-50 text-leaf-700"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h11v10H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></svg></span><span><b className="block text-sm">Free delivery in Ibadan</b><small className="text-xs text-gray-500">Addresses outside Ibadan require an owner-approved delivery quote before payment.</small></span></div>
                <div className="grid grid-cols-[42px_1fr] gap-3 p-4"><span className="grid h-9 w-9 place-items-center rounded-lg bg-leaf-50 text-leaf-700"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3 5 6v5c0 4.6 2.8 8 7 10 4.2-2 7-5.4 7-10V6l-7-3Z"/><path d="m9 12 2 2 4-4"/></svg></span><span><b className="block text-sm">Confirm product-specific warranty</b><small className="text-xs text-gray-500">Warranty coverage and terms vary. Ask Leaf Solar to confirm the applicable terms before purchase.</small></span></div>
              </div>
              <p className="mt-4 text-[11px] leading-relaxed text-gray-400">The website checks current catalogue pricing and availability before opening Paystack. Never transfer money to an account not confirmed through Leaf Solar&apos;s official contact channels.</p>
            </div>
          </div>
        </div>
      </section>

      {Boolean(product.specifications?.length) && <section className="border-b border-gray-100 bg-white py-10 sm:py-14"><div className="container-wide"><div className="max-w-4xl"><p className="eyebrow">Confirmed details</p><h2 className="section-title mt-2">Product specifications</h2><dl className="mt-6 overflow-hidden rounded-2xl border border-gray-200">{product.specifications!.map((specification, index) => <div key={`${specification.name}-${index}`} className="grid gap-1 border-b border-gray-100 px-4 py-4 last:border-b-0 sm:grid-cols-[minmax(160px,.7fr)_1.3fr] sm:gap-6 sm:px-5"><dt className="text-sm font-extrabold text-gray-700">{specification.name}</dt><dd className="text-sm leading-6 text-gray-600">{specification.value}</dd></div>)}</dl></div></div></section>}

      {related.length > 0 && (
        <section className="bg-[#f5f6f2] py-12 sm:py-16">
          <div className="container-wide">
            <div className="flex items-end justify-between gap-4"><div><p className="eyebrow">More to consider</p><h2 className="section-title mt-2">Related products</h2></div><Link href={`/products?c=${encodeURIComponent(product.categoryLabel)}`} className="hidden text-sm font-extrabold text-leaf-700 sm:block">View category →</Link></div>
            <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">{related.map(item => <ProductCard key={item.id} product={item} />)}</div>
          </div>
        </section>
      )}
    </>
  );
}

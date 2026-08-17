import type { Metadata } from 'next';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { getProducts } from '@/lib/catalog-store';
import { categoryHref } from '@/lib/categories';

const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://leafsolar.ng').replace(/\/$/, '');

// Cached at the edge; refreshed from the database at most once a minute.
export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Home Appliances & Electronics in Ibadan',
  description: 'Browse Leaf Solar home appliances and electronics in Ibadan, including TVs, refrigerators, air conditioners, washing machines, kitchen appliances, fans and audio products.',
  alternates: { canonical: '/home-appliances-ibadan' },
  openGraph: { url: '/home-appliances-ibadan', type: 'website', title: 'Home Appliances & Electronics in Ibadan', description: 'Browse Leaf Solar home-appliance and electronics listings in Ibadan.', images: ['/leaf-solar-og.jpg'] },
};

const categoryOrder = [
  'Televisions',
  'Fridges & Freezers',
  'Air Conditioners',
  'Washers & Dryers',
  'Kitchen & Cooking',
  'Fans & Coolers',
  'Audio & Sound',
  'Water & Dispensers',
  'Generators & Power',
];

const categoryIntros: Record<string, string> = {
  Televisions: 'Browse listed television sizes and models, then open each product page for the current catalogue description, price and availability.',
  'Fridges & Freezers': 'Compare listed refrigerators and freezers using the product-specific information available on each catalogue page.',
  'Air Conditioners': 'Explore split, portable and floor-standing air-conditioner listings where represented in the current catalogue.',
  'Washers & Dryers': 'Browse washing machines, dryers and washer-dryer listings from the current appliance range.',
  'Kitchen & Cooking': 'Find listed cookers, microwaves, air fryers and other kitchen appliances in one category.',
  'Fans & Coolers': 'Review standing, tower, rechargeable and cooling-product listings where currently available.',
  'Audio & Sound': 'Browse soundbars, speakers and other listed audio products.',
  'Water & Dispensers': 'See listed water dispensers and water-heating appliances.',
  'Generators & Power': 'Browse listed generators and backup-power products outside the dedicated solar-equipment collection.',
};

export default async function HomeAppliancesIbadanPage() {
  const electronics = (await getProducts()).filter(product => product.department === 'electronics');
  const availableCategories = categoryOrder.filter(category => electronics.some(product => product.categoryLabel === category || product.category === category));
  const featuredProducts = availableCategories.flatMap(category => electronics.filter(product => product.categoryLabel === category || product.category === category).slice(0, 4));
  const pageUrl = `${baseUrl}/home-appliances-ibadan`;
  const collectionStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': pageUrl,
    name: 'Home appliances and electronics in Ibadan',
    description: 'Leaf Solar catalogue collection of home appliances and electronics in Ibadan.',
    url: pageUrl,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: featuredProducts.length,
      itemListElement: featuredProducts.map((product, index) => ({
        '@type': 'ListItem', position: index + 1, name: product.name, url: `${baseUrl}/products/${product.slug}`,
      })),
    },
  };
  const breadcrumbStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Home appliances in Ibadan', item: pageUrl },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionStructuredData).replace(/</g, '\\u003c') }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData).replace(/</g, '\\u003c') }} />

      <section className="border-b border-gray-100 bg-[#f5f6f2]">
        <div className="container-wide py-12 sm:py-16">
          <nav className="flex items-center gap-2 text-xs font-semibold text-gray-500" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span className="text-gray-900">Home appliances in Ibadan</span></nav>
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div><p className="eyebrow">Leaf Solar appliance catalogue</p><h1 className="mt-3 max-w-4xl font-display text-4xl font-black leading-[1.04] sm:text-6xl">Home appliances and electronics in Ibadan.</h1><p className="mt-5 max-w-3xl text-base leading-8 text-gray-600 sm:text-lg">Browse a curated catalogue of TVs, refrigerators, air conditioners, washing machines, kitchen appliances, fans, audio products and backup-power equipment with current listed prices and availability.</p></div>
            <div className="flex gap-5"><div><b className="block font-display text-3xl font-black text-leaf-700">{electronics.length}</b><span className="text-xs text-gray-500">appliance listings</span></div><div className="border-l border-gray-300 pl-5"><b className="block font-display text-3xl font-black text-leaf-700">{availableCategories.length}</b><span className="text-xs text-gray-500">categories</span></div></div>
          </div>
          <div className="mt-8 flex flex-wrap gap-3"><Link href="/products?d=electronics" className="btn btn-primary">Shop all appliances</Link><Link href="/contact" className="btn border border-gray-300 bg-white text-gray-800 hover:border-leaf-400">Ask about a product</Link></div>
        </div>
      </section>

      <main className="container-wide py-12 sm:py-16">
        <nav className="scrollbar-none flex gap-2 overflow-x-auto pb-2" aria-label="Appliance categories">{availableCategories.map(category => <a key={category} href={`#${category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} className="shrink-0 rounded-full border border-gray-200 px-4 py-2 text-xs font-extrabold text-gray-700 hover:border-leaf-300 hover:text-leaf-700">{category}</a>)}</nav>

        <div className="mt-10 space-y-16">
          {availableCategories.map(category => {
            const items = electronics.filter(product => product.categoryLabel === category || product.category === category);
            const id = category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            return <section key={category} id={id} className="scroll-mt-44"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div className="max-w-3xl"><p className="eyebrow">{items.length} {items.length === 1 ? 'product' : 'products'} listed</p><h2 className="section-title mt-2">{category}</h2><p className="mt-3 text-sm leading-7 text-gray-600">{categoryIntros[category]}</p></div><Link href={categoryHref(category)} className="shrink-0 text-sm font-extrabold text-leaf-700">View the category →</Link></div><div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{items.slice(0, 4).map(product => <ProductCard key={product.id} product={product} />)}</div></section>;
          })}
        </div>

        <section className="mt-16 grid gap-6 rounded-3xl bg-leaf-900 p-7 text-white sm:grid-cols-3 sm:p-10">
          <div><p className="text-xs font-black uppercase tracking-[.15em] text-sun-400">Ibadan delivery</p><h2 className="mt-2 font-display text-xl font-black">Free within Ibadan</h2><p className="mt-3 text-sm leading-6 text-white/65">Store orders delivered within Ibadan have free delivery. Timing is arranged for each order.</p></div>
          <div><p className="text-xs font-black uppercase tracking-[.15em] text-sun-400">Other destinations</p><h2 className="mt-2 font-display text-xl font-black">Quote before payment</h2><p className="mt-3 text-sm leading-6 text-white/65">Addresses outside Ibadan require an approved delivery quotation before Paystack payment.</p></div>
          <div><p className="text-xs font-black uppercase tracking-[.15em] text-sun-400">Product terms</p><h2 className="mt-2 font-display text-xl font-black">Confirm for each item</h2><p className="mt-3 text-sm leading-6 text-white/65">Availability and warranty coverage can vary. Check the product page and confirm applicable terms before purchase.</p></div>
        </section>
      </main>
    </>
  );
}

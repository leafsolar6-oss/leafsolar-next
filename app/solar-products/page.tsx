import type { Metadata } from 'next';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { getProducts } from '@/lib/catalog-store';

const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://leafsolar.ng').replace(/\/$/, '');

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Solar Panels, Inverters & Batteries in Ibadan',
  description: 'Browse Leaf Solar listings for solar panels, lithium batteries and hybrid inverters in Ibadan, then compare package starting points or request a project quotation.',
  alternates: { canonical: '/solar-products' },
  openGraph: { url: '/solar-products', type: 'website', title: 'Solar Panels, Inverters & Batteries in Ibadan', description: 'Browse Leaf Solar solar-equipment listings and connect component choices to a confirmed system design.', images: ['/leaf-solar-og.jpg'] },
};

const groups = [
  { category: 'Solar Panels', id: 'solar-panels', title: 'Solar panels', description: 'Compare the panel models currently listed in the Leaf Solar catalogue. Final array quantity and layout depend on system-input limits, energy needs and the installation site.' },
  { category: 'Solar Batteries', id: 'solar-batteries', title: 'Solar batteries', description: 'Browse listed energy-storage options. Confirm usable-energy assumptions, charging compatibility, installation requirements and product-specific warranty terms before choosing.' },
  { category: 'Inverters', id: 'solar-inverters', title: 'Solar inverters', description: 'Review listed inverter equipment as part of a complete design. Output, solar input, charging, battery compatibility and starting demand all need to match the intended load.' },
];

export default async function SolarProductsPage() {
  const products = (await getProducts()).filter(product => product.department === 'solar');
  const pageUrl = `${baseUrl}/solar-products`;
  const collectionStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': pageUrl,
    name: 'Solar panels, inverters and batteries in Ibadan',
    description: 'Leaf Solar catalogue listings for solar panels, batteries and inverters.',
    url: pageUrl,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: products.length,
      itemListElement: products.map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: product.name,
        url: `${baseUrl}/products/${product.slug}`,
      })),
    },
  };
  const breadcrumbStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Solar products', item: pageUrl },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionStructuredData).replace(/</g, '\\u003c') }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData).replace(/</g, '\\u003c') }} />

      <section className="border-b border-gray-100 bg-[#f4f1e8]">
        <div className="container-wide py-12 sm:py-16">
          <nav className="flex items-center gap-2 text-xs font-semibold text-gray-500" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span className="text-gray-900">Solar products</span></nav>
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div><p className="eyebrow">Solar equipment catalogue</p><h1 className="mt-3 max-w-4xl font-display text-4xl font-black leading-[1.04] sm:text-6xl">Solar panels, inverters and batteries in Ibadan.</h1><p className="mt-5 max-w-3xl text-base leading-8 text-gray-600 sm:text-lg">Browse currently listed solar equipment, then connect component choices to your appliance load, battery needs, site conditions and the confirmed limits of the complete system.</p></div>
            <div className="flex gap-5"><div><b className="block font-display text-3xl font-black text-leaf-700">{products.length}</b><span className="text-xs text-gray-500">equipment listings</span></div><div className="border-l border-gray-300 pl-5"><b className="block font-display text-3xl font-black text-leaf-700">3</b><span className="text-xs text-gray-500">equipment groups</span></div></div>
          </div>
          <div className="mt-8 flex flex-wrap gap-3"><Link href="/packages" className="btn btn-primary">Compare solar packages</Link><Link href="/solar-installation-ibadan" className="btn border border-gray-300 bg-white text-gray-800 hover:border-leaf-400">Plan an installation</Link></div>
        </div>
      </section>

      <main className="container-wide py-12 sm:py-16">
        <nav className="scrollbar-none flex gap-2 overflow-x-auto pb-2" aria-label="Solar equipment sections">{groups.map(group => <a key={group.id} href={`#${group.id}`} className="shrink-0 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-extrabold text-gray-700 hover:border-leaf-300 hover:text-leaf-700">{group.title}</a>)}</nav>

        <div className="mt-10 space-y-16">
          {groups.map(group => {
            const items = products.filter(product => product.categoryLabel === group.category);
            if (items.length === 0) return null;
            return <section key={group.id} id={group.id} className="scroll-mt-44"><div className="max-w-3xl"><p className="eyebrow">{items.length} catalogue {items.length === 1 ? 'listing' : 'listings'}</p><h2 className="section-title mt-2">{group.title}</h2><p className="mt-4 text-sm leading-7 text-gray-600">{group.description}</p></div><div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">{items.map(product => <ProductCard key={product.id} product={product} />)}</div></section>;
          })}
        </div>

        <section className="mt-16 grid gap-5 rounded-3xl bg-leaf-900 p-7 text-white sm:grid-cols-[1fr_auto] sm:items-center sm:p-10"><div><p className="text-xs font-black uppercase tracking-[.16em] text-sun-400">Components must work together</p><h2 className="mt-2 font-display text-2xl font-black sm:text-3xl">Choose equipment from a confirmed system design.</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-white/65">A product listing does not by itself confirm runtime, compatibility or installation scope. Use actual appliance and site information when requesting a quotation.</p></div><div className="flex flex-wrap gap-3 sm:justify-end"><Link href="/solar-calculator" className="btn bg-white text-gray-950 hover:bg-sun-400">Use the calculator</Link><Link href="/contact" className="btn border border-white/20 bg-white/5 text-white hover:bg-white/10">Ask Leaf Solar</Link></div></section>

        <section className="mt-14 grid gap-5 md:grid-cols-3">
          {[
            { title: 'How equipment works together', text: 'Learn the different roles of panels, inverters, batteries and installation protection.', href: '/blog/solar-panels-inverters-batteries-explained' },
            { title: 'Lithium vs tubular batteries', text: 'Compare compatibility, usable energy, maintenance and project-fit questions.', href: '/blog/lithium-vs-tubular-battery-nigeria' },
            { title: 'How to size a solar system', text: 'Build a realistic load list before choosing equipment or a package starting point.', href: '/blog/how-to-size-solar-system-nigeria' },
          ].map(item => <Link key={item.href} href={item.href} className="rounded-2xl border border-gray-200 p-6 transition hover:border-leaf-300 hover:bg-leaf-50"><h2 className="font-display text-xl font-black text-gray-950">{item.title}</h2><p className="mt-3 text-sm leading-6 text-gray-600">{item.text}</p><span className="mt-5 inline-flex text-sm font-extrabold text-leaf-700">Read guide →</span></Link>)}
        </section>
      </main>
    </>
  );
}

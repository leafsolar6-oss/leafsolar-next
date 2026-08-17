import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ProductsExplorer from '@/components/ProductsExplorer';
import { getProducts } from '@/lib/catalog-store';
import { filterProducts, hasActiveProductFilters } from '@/lib/product-filters';

export const dynamic = 'force-dynamic';

type ProductSearchParams = { q?: string; c?: string; d?: string; sort?: string; b?: string; min?: string; max?: string; a?: string };

export async function generateMetadata({ searchParams }: { searchParams: Promise<ProductSearchParams> }): Promise<Metadata> {
  const params = await searchParams;
  const isFiltered = Object.values(params).some(value => Boolean(value));
  return {
    title: 'Shop Electronics, Appliances & Solar',
    description: 'Shop TVs, refrigerators, air conditioners, washers, kitchen appliances and solar equipment from Leaf Solar in Ibadan, with solar package starting points for assessment.',
    alternates: { canonical: '/products' },
    openGraph: { url: '/products', type: 'website', title: 'Shop Electronics, Appliances & Solar', description: 'Browse Leaf Solar electronics, home appliances, solar equipment and package starting points.', images: ['/leaf-solar-og.jpg'] },
    ...(isFiltered ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function Products({ searchParams }: { searchParams: Promise<ProductSearchParams> }) {
  const [params, products] = await Promise.all([searchParams, getProducts()]);
  // Zero-result search/filter URLs must return a real 404, not a 200 "No products"
  // page — Google classifies those as soft 404s and they pollute indexing reports.
  if (hasActiveProductFilters(params) && filterProducts(products, params).length === 0) {
    notFound();
  }
  const categoryCount = new Set(products.map(product => product.category)).size;
  return (
    <>
      <section className="border-b border-gray-100 bg-[#f5f6f2]">
        <div className="container-wide py-10 sm:py-14">
          <nav className="mb-4 flex items-center gap-2 text-xs font-semibold text-gray-500"><Link href="/" className="hover:text-leaf-700">Home</Link><span>/</span><span className="text-gray-800">Shop</span></nav>
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div><p className="eyebrow">Curated · searchable · checkout ready</p><h1 className="mt-2 max-w-4xl font-display text-4xl font-black leading-tight sm:text-5xl">Shop electronics, home appliances and solar</h1><p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-600 sm:text-base">Browse Leaf Solar&apos;s curated catalogue with listed prices, catalogue availability and direct support from Ibadan.</p></div>
            <div className="flex gap-5 text-sm"><div><b className="block font-display text-2xl font-black text-leaf-700">{products.length}</b><span className="text-xs text-gray-500">selected products</span></div><div className="border-l border-gray-200 pl-5"><b className="block font-display text-2xl font-black text-leaf-700">{categoryCount}</b><span className="text-xs text-gray-500">categories</span></div></div>
          </div>
        </div>
      </section>

      <section className="container-wide py-9 sm:py-12">
        <ProductsExplorer products={products} initial={params} key={`${params.q || ''}|${params.c || ''}|${params.d || ''}|${params.sort || ''}|${params.b || ''}|${params.min || ''}|${params.max || ''}|${params.a || ''}`} />
      </section>

      <section className="border-t border-gray-100 bg-[#f5f6f2] py-10 sm:py-14">
        <div className="container-wide grid gap-5 md:grid-cols-3">
          <Link href="/home-appliances-ibadan" className="rounded-2xl border border-gray-200 bg-white p-6 transition hover:border-leaf-300"><p className="eyebrow">Local collection</p><h2 className="mt-2 font-display text-xl font-black">Home appliances in Ibadan</h2><p className="mt-3 text-sm leading-6 text-gray-600">Browse televisions, refrigerators, air conditioners, washing machines and more by category.</p><span className="mt-5 inline-flex text-sm font-extrabold text-leaf-700">Explore appliances →</span></Link>
          <Link href="/solar-products" className="rounded-2xl border border-gray-200 bg-white p-6 transition hover:border-leaf-300"><p className="eyebrow">Solar equipment</p><h2 className="mt-2 font-display text-xl font-black">Panels, batteries and inverters</h2><p className="mt-3 text-sm leading-6 text-gray-600">Review current equipment listings and connect each choice to a confirmed system design.</p><span className="mt-5 inline-flex text-sm font-extrabold text-leaf-700">Explore solar products →</span></Link>
          <Link href="/solar-installation-ibadan" className="rounded-2xl border border-gray-200 bg-white p-6 transition hover:border-leaf-300"><p className="eyebrow">Project planning</p><h2 className="mt-2 font-display text-xl font-black">Solar installation in Ibadan</h2><p className="mt-3 text-sm leading-6 text-gray-600">See how load information, site details and a written scope shape a solar project.</p><span className="mt-5 inline-flex text-sm font-extrabold text-leaf-700">Plan an installation →</span></Link>
        </div>
      </section>
    </>
  );
}

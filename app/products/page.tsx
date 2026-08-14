import Link from 'next/link';
import ProductsExplorer from '@/components/ProductsExplorer';
import { getProducts } from '@/lib/catalog-store';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Shop Electronics, Appliances & Solar',
  description: 'Shop TVs, refrigerators, air conditioners, washers, kitchen appliances and solar equipment from Leaf Solar in Ibadan, with solar package starting points for assessment.',
  alternates: { canonical: '/products' },
};

export default async function Products({ searchParams }: { searchParams: Promise<{ q?: string; c?: string; d?: string; sort?: string; b?: string; min?: string; max?: string; a?: string }> }) {
  const [params, products] = await Promise.all([searchParams, getProducts()]);
  const categoryCount = new Set(products.map(product => product.category)).size;
  return (
    <>
      <section className="border-b border-gray-100 bg-[#f5f6f2]">
        <div className="container-wide py-10 sm:py-14">
          <nav className="mb-4 flex items-center gap-2 text-xs font-semibold text-gray-500"><Link href="/" className="hover:text-leaf-700">Home</Link><span>/</span><span className="text-gray-800">Shop</span></nav>
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div><p className="eyebrow">Curated · searchable · checkout ready</p><h1 className="mt-2 max-w-4xl font-display text-4xl font-black leading-tight sm:text-5xl">Electronics, appliances &amp; solar</h1><p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-600 sm:text-base">A curated selection from Leaf Solar&apos;s range, with listed prices, catalogue availability and direct local support.</p></div>
            <div className="flex gap-5 text-sm"><div><b className="block font-display text-2xl font-black text-leaf-700">{products.length}</b><span className="text-xs text-gray-500">selected products</span></div><div className="border-l border-gray-200 pl-5"><b className="block font-display text-2xl font-black text-leaf-700">{categoryCount}</b><span className="text-xs text-gray-500">categories</span></div></div>
          </div>
        </div>
      </section>

      <section className="container-wide py-9 sm:py-12">
        <ProductsExplorer products={products} initial={params} key={`${params.q || ''}|${params.c || ''}|${params.d || ''}|${params.sort || ''}|${params.b || ''}|${params.min || ''}|${params.max || ''}|${params.a || ''}`} />
      </section>
    </>
  );
}

import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { products, Product } from '@/lib/data';

export const metadata = {
  title: 'Products',
  description: 'Shop genuine solar inverters, lithium batteries, solar panels and home appliances from Leaf Solar in Ibadan.',
};

const categories = ['All', 'Inverter', 'Battery', 'Solar Panel', 'Appliance'] as const;

export default async function Products({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const { c } = await searchParams;
  const requested = c || 'All';
  const active = categories.includes(requested as (typeof categories)[number]) ? requested : 'All';
  const list: Product[] = active === 'All' ? products : products.filter(product => product.category === active);

  return (
    <>
      <section className="border-b border-gray-100 bg-[#f5f6f2]">
        <div className="container-x py-14 md:py-20">
          <p className="eyebrow">Genuine &amp; warrantied</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold md:text-5xl">Products for a better-powered home</h1>
          <p className="mt-4 max-w-2xl text-lg text-gray-600">Browse current solar equipment and energy-efficient appliances. Contact us to confirm stock and arrange delivery.</p>
        </div>
      </section>

      <section className="container-x py-12">
        <div className="flex flex-wrap gap-2" aria-label="Product categories">
          {categories.map(category => (
            <Link
              key={category}
              href={category === 'All' ? '/products' : `/products?c=${encodeURIComponent(category)}`}
              className={`rounded-full border px-4 py-2.5 text-sm font-semibold transition ${active === category ? 'border-gray-950 bg-gray-950 text-white' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-950'}`}
              aria-current={active === category ? 'page' : undefined}
            >
              {category}
            </Link>
          ))}
        </div>

        <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map(product => <ProductCard key={product.slug} product={product} />)}
        </div>
      </section>
    </>
  );
}

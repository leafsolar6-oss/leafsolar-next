import Link from 'next/link';
import { products, formatNaira, Product } from '@/lib/data';

export const metadata = { title: 'Products' };

const cats = ['All','Inverter','Battery','Solar Panel','Appliance','Charger'] as const;

export default function Products({ searchParams }: { searchParams: { c?: string } }) {
  const active = (searchParams.c || 'All') as string;
  const list: Product[] = active === 'All' ? products : products.filter(p => p.category === active);
  return (
    <section className="container-x py-14">
      <h1 className="font-display text-4xl font-extrabold">All products</h1>
      <p className="mt-2 text-gray-600">Genuine, warrantied equipment — delivered nationwide.</p>
      <div className="mt-6 flex flex-wrap gap-2">
        {cats.map(c => (
          <Link key={c} href={c==='All'?'/products':`/products?c=${encodeURIComponent(c)}`}
            className={`rounded-full px-4 py-2 text-sm font-semibold border ${active===c ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-700 hover:border-gray-900'}`}>{c}</Link>
        ))}
      </div>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {list.map(p => (
          <Link key={p.slug} href={`/products/${p.slug}`} className="group rounded-2xl bg-white p-4 border border-gray-100 hover:shadow-lg transition">
            <div className={`aspect-square rounded-xl bg-gradient-to-br ${p.image} mb-4 flex items-center justify-center text-3xl font-bold text-white/90`}>{p.brand[0]}</div>
            <div className="text-xs uppercase tracking-wider text-gray-500">{p.brand} · {p.category}</div>
            <div className="mt-1 font-semibold leading-snug">{p.name}</div>
            <div className="mt-1 text-xs text-amber-500">{'★'.repeat(Math.round(p.rating))} <span className="text-gray-400">{p.rating.toFixed(1)}</span></div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-lg font-extrabold text-leaf-700">{formatNaira(p.price)}</span>
              {p.oldPrice && <span className="text-xs text-gray-400 line-through">{formatNaira(p.oldPrice)}</span>}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

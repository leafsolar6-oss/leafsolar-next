import Link from 'next/link';
import { products, formatNaira } from '@/lib/data';
import { notFound } from 'next/navigation';

export async function generateStaticParams() { return products.map(p => ({ slug: p.slug })); }

export default function ProductPage({ params }: { params: { slug: string } }) {
  const p = products.find(x => x.slug === params.slug);
  if (!p) return notFound();
  const related = products.filter(x => x.category === p.category && x.slug !== p.slug).slice(0, 3);
  return (
    <section className="container-x py-12">
      <Link href="/products" className="text-sm text-leaf-700 font-semibold">← Back to products</Link>
      <div className="mt-4 grid gap-10 md:grid-cols-2">
        <div className={`aspect-square rounded-3xl bg-gradient-to-br ${p.image} flex items-center justify-center text-7xl font-bold text-white/90`}>{p.brand[0]}</div>
        <div>
          <div className="text-sm uppercase tracking-wider text-gray-500">{p.brand} · {p.category}</div>
          <h1 className="font-display text-3xl font-extrabold mt-1">{p.name}</h1>
          <div className="mt-1 text-amber-500">{'★'.repeat(Math.round(p.rating))} <span className="text-gray-400">{p.rating.toFixed(1)}</span></div>
          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-4xl font-extrabold text-leaf-700">{formatNaira(p.price)}</span>
            {p.oldPrice && <span className="text-gray-400 line-through">{formatNaira(p.oldPrice)}</span>}
          </div>
          <p className="mt-5 text-gray-700 leading-relaxed">{p.description}</p>
          <ul className="mt-6 space-y-2 text-sm text-gray-700">
            <li className="flex gap-2"><span className="text-leaf-600">✓</span> In stock — ships same day in Lagos/Abuja</li>
            <li className="flex gap-2"><span className="text-leaf-600">✓</span> Manufacturer warranty included</li>
            <li className="flex gap-2"><span className="text-leaf-600">✓</span> Free delivery on orders above ₦200,000</li>
            <li className="flex gap-2"><span className="text-leaf-600">✓</span> Pay on delivery available</li>
          </ul>
          <div className="mt-8 flex gap-3">
            <a href="https://wa.me/2348000000000" className="btn btn-primary flex-1">Buy on WhatsApp</a>
            <Link href="/contact" className="btn btn-outline">Request callback</Link>
          </div>
        </div>
      </div>
      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="font-display text-2xl font-bold mb-5">Related {p.category.toLowerCase()}s</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map(r => (
              <Link key={r.slug} href={`/products/${r.slug}`} className="rounded-2xl border p-4 hover:shadow-md">
                <div className={`aspect-square rounded-xl bg-gradient-to-br ${r.image} mb-3 flex items-center justify-center text-2xl font-bold text-white/90`}>{r.brand[0]}</div>
                <div className="text-xs text-gray-500">{r.brand}</div>
                <div className="font-semibold">{r.name}</div>
                <div className="mt-1 font-extrabold text-leaf-700">{formatNaira(r.price)}</div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

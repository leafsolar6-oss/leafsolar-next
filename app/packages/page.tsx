import Link from 'next/link';
import { packages, formatNaira } from '@/lib/data';

export const metadata = { title: 'Solar Packages' };

export default function Packages() {
  return (
    <section className="container-x py-14">
      <h1 className="font-display text-4xl font-extrabold">Solar packages</h1>
      <p className="mt-2 max-w-2xl text-gray-600">All packages include delivery, professional installation, changeover, and 1-year of free maintenance.</p>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {packages.map(p => (
          <div key={p.slug} id={p.slug} className={`rounded-3xl border p-8 ${p.highlight ? 'border-leaf-600 ring-2 ring-leaf-600/20' : 'border-gray-200'}`}>
            {p.highlight && <span className="mb-2 inline-block rounded-full bg-leaf-600 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">Most popular</span>}
            <div className="font-display text-2xl font-bold">{p.name}</div>
            <div className="text-gray-500">{p.tagline}</div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-leaf-700">{formatNaira(p.price)}</span>
              <span className="text-sm text-gray-500">or from {formatNaira(Math.round(p.price/12))}/mo</span>
            </div>
            <div className="mt-1 text-sm text-gray-500">{p.capacity}</div>
            <ul className="mt-6 space-y-3 text-gray-700">
              {p.includes.map(x => <li key={x} className="flex gap-2"><span className="text-leaf-600">✓</span>{x}</li>)}
            </ul>
            <div className="mt-8 flex gap-3">
              <Link href={`/contact?pkg=${p.slug}`} className="btn btn-primary flex-1">Choose this package</Link>
              <a href="https://wa.me/2348000000000" className="btn btn-outline">WhatsApp</a>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-10 rounded-2xl bg-gray-50 p-6 text-sm text-gray-600">
        Need something bigger? <Link href="/contact" className="text-leaf-700 font-semibold">Talk to an engineer →</Link> We design 10kVA–100kVA systems for homes, estates, and businesses.
      </div>
    </section>
  );
}

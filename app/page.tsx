import Link from 'next/link';
import { packages, products, formatNaira } from '@/lib/data';

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-leaf-700 via-leaf-600 to-emerald-500 text-white">
        <div className="absolute inset-0 opacity-20" style={{backgroundImage:'radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 60%, white 1px, transparent 1px)', backgroundSize:'40px 40px'}}/>
        <div className="container-x relative grid items-center gap-10 py-16 md:grid-cols-2 md:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
              🔥 FREE same-day delivery till Dec 2026
            </span>
            <h1 className="font-display mt-4 text-4xl font-extrabold leading-tight md:text-6xl">
              Light up your home with clean, reliable solar.
            </h1>
            <p className="mt-4 max-w-lg text-white/90 md:text-lg">
              Genuine LG, Hisense, Maxi, Mora & Deye. Solar packages from <b>{formatNaira(1200000)}</b>, installed by certified engineers — backed by 24/7 support.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/packages" className="btn bg-white text-leaf-700 hover:bg-gray-100">Explore packages</Link>
              <Link href="/contact" className="btn border border-white/40 text-white hover:bg-white/10">Talk to an engineer</Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-6 text-sm text-white/90">
              <div><b className="text-white text-lg">12,000+</b><br/>installations</div>
              <div><b className="text-white text-lg">5-year</b><br/>warranty</div>
              <div><b className="text-white text-lg">24/7</b><br/>support</div>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/3] rounded-3xl bg-gradient-to-br from-amber-200 to-orange-400 shadow-2xl p-8 flex items-center justify-center">
              <svg width="180" height="180" viewBox="0 0 24 24" fill="none" stroke="#7c2d12" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4"/>
                <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>
              </svg>
            </div>
            <div className="absolute -bottom-6 -left-6 hidden md:block rounded-2xl bg-white p-4 text-gray-900 shadow-xl">
              <div className="text-xs text-gray-500">Starter package from</div>
              <div className="text-2xl font-extrabold text-leaf-700">{formatNaira(1200000)}</div>
            </div>
          </div>
        </div>
      </section>

      {/* BRANDS */}
      <section className="border-y border-gray-100 bg-gray-50">
        <div className="container-x flex flex-wrap items-center justify-center gap-x-10 gap-y-3 py-6 text-sm font-semibold uppercase tracking-wider text-gray-500">
          <span>LG</span><span>Hisense</span><span>Deye</span><span>Mora</span><span>Maxi</span><span>Blue Carbon</span>
        </div>
      </section>

      {/* PACKAGES */}
      <section className="container-x py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-display text-3xl font-extrabold md:text-4xl">Solar packages</h2>
            <p className="mt-2 text-gray-600">Pick a size — we handle the rest: design, delivery, installation, warranty.</p>
          </div>
          <Link href="/packages" className="hidden md:inline-flex btn btn-outline text-sm">See all</Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {packages.map(p => (
            <Link key={p.slug} href={`/packages#${p.slug}`} className={`rounded-2xl border p-6 transition hover:shadow-xl ${p.highlight ? 'border-leaf-600 ring-2 ring-leaf-600/20' : 'border-gray-200'}`}>
              {p.highlight && <span className="mb-2 inline-block rounded-full bg-leaf-600 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white">Most popular</span>}
              <div className="font-display text-xl font-bold">{p.name}</div>
              <div className="mt-1 text-sm text-gray-500">{p.tagline}</div>
              <div className="mt-4 text-2xl font-extrabold text-leaf-700">{formatNaira(p.price)}</div>
              <div className="mt-1 text-xs text-gray-500">{p.capacity}</div>
              <ul className="mt-4 space-y-2 text-sm text-gray-700">
                {p.includes.slice(0,3).map(x => <li key={x} className="flex gap-2"><span className="text-leaf-600">✓</span>{x}</li>)}
              </ul>
            </Link>
          ))}
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="bg-gray-50 py-16">
        <div className="container-x">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-display text-3xl font-extrabold md:text-4xl">Shop products</h2>
              <p className="mt-2 text-gray-600">Inverters, batteries, panels, and energy-efficient appliances.</p>
            </div>
            <Link href="/products" className="hidden md:inline-flex btn btn-outline text-sm">View catalog</Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.slice(0,4).map(p => (
              <Link key={p.slug} href={`/products/${p.slug}`} className="group rounded-2xl bg-white p-4 shadow-sm hover:shadow-lg transition">
                <div className={`aspect-square rounded-xl bg-gradient-to-br ${p.image} mb-4 flex items-center justify-center text-3xl font-bold text-white/90`}>{p.brand[0]}</div>
                <div className="text-xs uppercase tracking-wider text-gray-500">{p.brand} · {p.category}</div>
                <div className="mt-1 font-semibold leading-snug">{p.name}</div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-lg font-extrabold text-leaf-700">{formatNaira(p.price)}</span>
                  {p.oldPrice && <span className="text-xs text-gray-400 line-through">{formatNaira(p.oldPrice)}</span>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* WHY */}
      <section className="container-x py-16">
        <h2 className="font-display text-3xl font-extrabold md:text-4xl text-center">Why Nigerians choose Leaf Solar</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            {t:'Genuine products',d:'Every item is sourced directly from authorized distributors — no tokunbo, no clones.'},
            {t:'Certified engineers',d:'Our installation teams are COREN-registered and trained on every brand we sell.'},
            {t:'Pay small-small',d:'Flexible payment plans and partner financing — spread the cost over 6–12 months.'},
          ].map(x => (
            <div key={x.t} className="rounded-2xl border border-gray-100 p-6">
              <div className="h-10 w-10 rounded-xl bg-leaf-50 text-leaf-700 flex items-center justify-center mb-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6 9 17l-5-5"/></svg>
              </div>
              <div className="font-display text-xl font-bold">{x.t}</div>
              <p className="mt-2 text-gray-600">{x.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-x pb-20">
        <div className="rounded-3xl bg-gray-900 p-10 md:p-14 text-white text-center">
          <h2 className="font-display text-3xl md:text-4xl font-extrabold">Ready to say goodbye to generator noise?</h2>
          <p className="mt-3 text-white/80">Get a free site assessment and a quote within 24 hours.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/contact" className="btn bg-leaf-500 hover:bg-leaf-600">Request a quote</Link>
            <a href="https://wa.me/2348000000000" className="btn border border-white/30 hover:bg-white/10">WhatsApp us</a>
          </div>
        </div>
      </section>
    </>
  );
}

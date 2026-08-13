import Image from 'next/image';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { packages, products, formatNaira, site, whatsappUrl } from '@/lib/data';

const benefits = [
  {
    title: 'Genuine, sealed products',
    description: 'Original LG, Hisense, Maxi, Deye and other trusted brands, supplied with manufacturer warranty.',
    icon: 'shield',
  },
  {
    title: 'Professional solar installation',
    description: 'From load assessment to installation, protection and handover, our team handles the complete job.',
    icon: 'sun',
  },
  {
    title: 'Fast delivery in Ibadan',
    description: 'Order before noon for same-day delivery where available. Free delivery in Ibadan until December 2026.',
    icon: 'truck',
  },
];

function BenefitIcon({ name }: { name: string }) {
  if (name === 'sun') {
    return <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></svg>;
  }
  if (name === 'truck') {
    return <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 6h11v10H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></svg>;
  }
  return <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 3 5 6v5c0 4.6 2.8 8 7 10 4.2-2 7-5.4 7-10V6l-7-3Z"/><path d="m9 12 2 2 4-4"/></svg>;
}

export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden bg-[#10261a] text-white">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 15% 15%, #5ebd7d 0, transparent 26%), radial-gradient(circle at 85% 80%, #d5a928 0, transparent 22%)' }} />
        <div className="container-x relative grid items-center gap-12 py-14 lg:grid-cols-[1.02fr_.98fr] lg:py-20">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-bold uppercase tracking-[0.13em] text-leaf-100 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-sun-400" />
              Solar power &amp; genuine appliances
            </span>
            <h1 className="mt-6 font-display text-5xl font-extrabold leading-[1.03] tracking-tight sm:text-6xl lg:text-7xl">
              Power your home.<br/><span className="text-sun-400">Upgrade your life.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/75">
              Complete solar systems, professional installation and genuine home appliances—all from one trusted team in Ibadan.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/packages" className="btn bg-sun-400 text-gray-950 hover:bg-sun-500">Explore solar packages</Link>
              <a href={whatsappUrl('Hello Leaf Solar! I would like help choosing a product or solar package.')} className="btn border border-white/25 bg-white/5 text-white hover:bg-white/10">Chat on WhatsApp</a>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/70">
              <span className="inline-flex items-center gap-2"><b className="text-leaf-300">✓</b> Fouani Authorized Dealer</span>
              <span className="inline-flex items-center gap-2"><b className="text-leaf-300">✓</b> {site.rcNumber}</span>
              <span className="inline-flex items-center gap-2"><b className="text-leaf-300">✓</b> Manufacturer warranty</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:mx-0">
            <div className="relative aspect-[1.18/1] overflow-hidden rounded-[2rem] bg-white shadow-2xl shadow-black/20">
              <Image
                src="/images/hero-appliances.jpg"
                alt="A selection of home appliances sold by Leaf Solar"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 text-white">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-white/70">Home &amp; business</p>
                  <p className="mt-1 font-display text-xl font-bold">One company. Power + appliances.</p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-5 -left-3 rounded-2xl bg-white px-5 py-4 text-gray-950 shadow-xl sm:-left-6">
              <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Solar packages from</div>
              <div className="mt-1 text-2xl font-extrabold text-leaf-700">{formatNaira(1200000)}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-gray-100 bg-white">
        <div className="container-x flex flex-wrap items-center justify-center gap-x-10 gap-y-4 py-6 text-sm font-extrabold uppercase tracking-[0.16em] text-gray-400">
          <span className="text-gray-950">LG</span><span>Hisense</span><span>Deye</span><span>Jinko</span><span>Maxi</span><span>Pylontech</span>
        </div>
      </section>

      <section className="container-x py-20">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Built around your needs</p>
            <h2 className="section-title mt-2">Solar packages for every stage</h2>
            <p className="mt-3 max-w-2xl text-gray-600">Choose a starting point and we’ll confirm your load, design the system and handle professional installation.</p>
          </div>
          <Link href="/packages" className="hidden shrink-0 sm:inline-flex btn btn-outline text-sm">See all packages</Link>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {packages.map((p, index) => (
            <Link key={p.slug} href={`/packages#${p.slug}`} className={`group relative overflow-hidden rounded-3xl border p-6 transition duration-300 hover:-translate-y-1 hover:shadow-xl ${p.highlight ? 'border-leaf-600 bg-leaf-50/60 ring-1 ring-leaf-600/20' : 'border-gray-200 bg-white'}`}>
              <div className="flex items-start justify-between gap-3">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">0{index + 1}</span>
                {p.highlight && <span className="rounded-full bg-leaf-700 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">Popular</span>}
              </div>
              <h3 className="mt-5 font-display text-xl font-bold">{p.name}</h3>
              <p className="mt-1 min-h-10 text-sm text-gray-500">{p.tagline}</p>
              <div className="mt-5 text-2xl font-extrabold text-gray-950">{formatNaira(p.price)}</div>
              <div className="mt-1 text-xs font-medium text-leaf-700">{p.capacity}</div>
              <ul className="mt-5 space-y-2 text-sm text-gray-600">
                {p.includes.slice(0, 3).map(item => <li key={item} className="flex gap-2"><span className="text-leaf-600">✓</span>{item}</li>)}
              </ul>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-leaf-700">View package <span className="transition group-hover:translate-x-1">→</span></span>
            </Link>
          ))}
        </div>
        <Link href="/packages" className="mt-6 sm:hidden btn btn-outline w-full">See all packages</Link>
      </section>

      <section className="bg-[#f5f6f2] py-20">
        <div className="container-x">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="eyebrow">Current catalogue</p>
              <h2 className="section-title mt-2">Popular products</h2>
              <p className="mt-3 text-gray-600">Brand-new, sealed equipment and appliances with manufacturer warranty.</p>
            </div>
            <Link href="/products" className="hidden shrink-0 sm:inline-flex btn btn-dark text-sm">View full catalogue</Link>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.slice(0, 4).map(product => <ProductCard key={product.slug} product={product} />)}
          </div>
          <Link href="/products" className="mt-7 sm:hidden btn btn-dark w-full">View full catalogue</Link>
        </div>
      </section>

      <section className="container-x py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Why Leaf Solar</p>
          <h2 className="section-title mt-2">Straightforward service. No stories.</h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {benefits.map(item => (
            <div key={item.title} className="rounded-3xl border border-gray-100 bg-white p-7 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-leaf-50 text-leaf-700"><BenefitIcon name={item.icon} /></div>
              <h3 className="mt-6 font-display text-xl font-bold">{item.title}</h3>
              <p className="mt-3 leading-relaxed text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-x pb-20">
        <div className="relative overflow-hidden rounded-[2rem] bg-leaf-700 px-6 py-12 text-center text-white sm:px-12 md:py-16">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full border-[50px] border-white/5" />
          <div className="absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-sun-400/10" />
          <div className="relative mx-auto max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-leaf-100">Free consultation</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold md:text-5xl">Not sure what your home needs?</h2>
            <p className="mx-auto mt-4 max-w-xl text-white/75">Tell us what you want to power. We’ll recommend the right system and provide a clear quote.</p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link href="/contact" className="btn bg-white text-leaf-700 hover:bg-gray-100">Request a quote</Link>
              <a href={whatsappUrl('Hello Leaf Solar! Please help me size a solar system for my home or business.')} className="btn border border-white/25 text-white hover:bg-white/10">WhatsApp {site.phone}</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

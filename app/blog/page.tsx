import type { Metadata } from 'next';
import Link from 'next/link';
import { solarGuides } from '@/lib/solar-guides';

export const metadata: Metadata = {
  title: 'Solar Guides for Homes & Businesses in Nigeria',
  description: 'Practical Leaf Solar guides on system sizing, batteries, solar installation costs, appliance loads, panels and inverters for Nigerian homes and businesses.',
  alternates: { canonical: '/blog' },
  openGraph: { url: '/blog', type: 'website', title: 'Solar Guides for Homes & Businesses in Nigeria', description: 'Practical Leaf Solar guides on sizing, batteries, components, appliance loads and installation quotations.', images: ['/leaf-solar-og.jpg'] },
};

export default function BlogPage() {
  const [featured, ...guides] = solarGuides;
  return (
    <>
      <section className="border-b border-gray-100 bg-[#f4f1e8]">
        <div className="container-x py-14 sm:py-20">
          <nav className="mb-6 flex items-center gap-2 text-xs font-semibold text-gray-500"><Link href="/">Home</Link><span>/</span><span className="text-gray-900">Solar guides</span></nav>
          <p className="eyebrow">Leaf Solar learning centre</p>
          <h1 className="mt-3 max-w-4xl font-display text-4xl font-black leading-[1.04] sm:text-6xl">Practical solar guides for homes and businesses.</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-gray-600">Understand appliance loads, batteries, panels, inverters and installation quotations before choosing a system. These guides explain the decisions without replacing a confirmed site design.</p>
        </div>
      </section>

      <main className="container-x py-12 sm:py-16 lg:py-20">
        <Link href={`/blog/${featured.slug}`} className="group grid overflow-hidden rounded-3xl bg-leaf-900 text-white lg:grid-cols-[1.1fr_.9fr]">
          <div className="p-7 sm:p-10 lg:p-12">
            <p className="text-xs font-black uppercase tracking-[.16em] text-sun-400">Featured · {featured.readTime}</p>
            <h2 className="mt-4 max-w-2xl font-display text-3xl font-black leading-tight sm:text-5xl">{featured.title}</h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/70">{featured.description}</p>
            <span className="btn mt-7 bg-white text-gray-950 transition group-hover:bg-sun-400">Read the sizing guide →</span>
          </div>
          <div className="relative min-h-64 overflow-hidden bg-[#173e29] p-8 sm:p-10">
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full border-[48px] border-white/5" />
            <div className="relative grid h-full content-center gap-3">
              {['Appliance load', 'Simultaneous demand', 'Battery storage', 'Solar array', 'Site conditions'].map((item, index) => <div key={item} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sun-400 font-display text-sm font-black text-gray-950">{index + 1}</span><b className="text-sm text-white/85">{item}</b></div>)}
            </div>
          </div>
        </Link>

        <section className="mt-14 sm:mt-18">
          <div><p className="eyebrow">Learn before you choose</p><h2 className="section-title mt-2">More solar planning guides</h2></div>
          <div className="mt-7 grid gap-5 md:grid-cols-2">
            {guides.map(guide => (
              <article key={guide.slug} className="flex flex-col rounded-3xl border border-gray-200 bg-white p-6 transition hover:border-leaf-200 hover:shadow-lg sm:p-8">
                <div className="flex flex-wrap items-center gap-3 text-[10px] font-black uppercase tracking-[.14em] text-gray-400"><span className="text-leaf-700">{guide.eyebrow}</span><span>·</span><span>{guide.readTime}</span></div>
                <h3 className="mt-4 font-display text-2xl font-black leading-tight text-gray-950 sm:text-3xl"><Link href={`/blog/${guide.slug}`} className="hover:text-leaf-700">{guide.title}</Link></h3>
                <p className="mt-4 flex-1 text-sm leading-7 text-gray-600">{guide.description}</p>
                <Link href={`/blog/${guide.slug}`} className="mt-6 inline-flex text-sm font-extrabold text-leaf-700">Read the guide →</Link>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16 grid gap-5 rounded-3xl bg-[#f5f6f2] p-7 sm:grid-cols-[1fr_auto] sm:items-center sm:p-10">
          <div><p className="eyebrow">Put the guidance to work</p><h2 className="mt-2 font-display text-2xl font-black sm:text-3xl">Build an indicative appliance-load estimate.</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-gray-600">Use the free calculator for early planning, then share actual appliance and site information when requesting a final design.</p></div>
          <div className="flex flex-wrap gap-3 sm:justify-end"><Link href="/solar-calculator" className="btn btn-primary">Use the calculator</Link><Link href="/contact" className="btn border border-gray-300 bg-white text-gray-800 hover:border-leaf-400">Request a quote</Link></div>
        </section>
      </main>
    </>
  );
}

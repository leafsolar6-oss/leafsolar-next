import Link from 'next/link';
import { packages, formatNaira, whatsappUrl } from '@/lib/data';

export const metadata = {
  title: 'Solar Packages',
  description: 'Explore professionally installed solar packages for homes and businesses in Nigeria, starting from ₦1.2 million.',
};

export default function Packages() {
  return (
    <>
      <section className="relative overflow-hidden bg-[#10261a] text-white">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border-[60px] border-white/5" />
        <div className="container-x relative py-16 md:py-20">
          <p className="text-xs font-extrabold uppercase tracking-[.18em] text-leaf-300">Complete solar solutions</p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-extrabold md:text-6xl">Reliable power, sized around your life.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/70">These packages are practical starting points. We confirm your appliances and usage before finalizing the equipment, protection and installation plan.</p>
          <div className="mt-7 flex flex-wrap gap-3 text-sm text-white/75">
            <span className="rounded-full border border-white/15 px-4 py-2">Professional installation</span>
            <span className="rounded-full border border-white/15 px-4 py-2">Protective devices included</span>
            <span className="rounded-full border border-white/15 px-4 py-2">Payment plans available</span>
          </div>
        </div>
      </section>

      <section className="container-x py-16 md:py-20">
        <div className="grid gap-6 md:grid-cols-2">
          {packages.map((packageItem, index) => (
            <article key={packageItem.slug} id={packageItem.slug} className={`scroll-mt-32 rounded-3xl border p-7 md:p-9 ${packageItem.highlight ? 'border-leaf-600 bg-leaf-50/50 ring-2 ring-leaf-600/15' : 'border-gray-200 bg-white'}`}>
              <div className="flex items-start justify-between gap-4">
                <span className="text-xs font-extrabold uppercase tracking-[.18em] text-gray-400">Package 0{index + 1}</span>
                {packageItem.highlight && <span className="rounded-full bg-leaf-700 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">Most popular</span>}
              </div>
              <h2 className="mt-5 font-display text-3xl font-bold">{packageItem.name}</h2>
              <p className="mt-1 text-gray-500">{packageItem.tagline}</p>
              <div className="mt-6 flex flex-wrap items-end gap-x-3 gap-y-1">
                <span className="text-4xl font-extrabold text-leaf-700">{formatNaira(packageItem.price)}</span>
                <span className="pb-1 text-sm text-gray-500">starting price</span>
              </div>
              <p className="mt-2 text-sm font-semibold text-gray-700">{packageItem.capacity}</p>

              <div className="my-7 h-px bg-gray-200" />
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Package includes</p>
              <ul className="mt-4 grid gap-3 text-gray-700 sm:grid-cols-2">
                {packageItem.includes.map(item => <li key={item} className="flex gap-2"><span className="font-bold text-leaf-600">✓</span><span>{item}</span></li>)}
              </ul>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href={`/contact?pkg=${packageItem.slug}`} className="btn btn-primary flex-1">Request this package</Link>
                <a href={whatsappUrl(`Hello Leaf Solar! I would like a quote for the ${packageItem.name} package.`)} className="btn btn-outline">Ask on WhatsApp</a>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 rounded-3xl bg-gray-950 p-8 text-white md:flex md:items-center md:justify-between md:gap-10 md:p-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.16em] text-leaf-300">Commercial &amp; industrial</p>
            <h2 className="mt-2 font-display text-2xl font-bold">Need more than 5kVA?</h2>
            <p className="mt-2 max-w-2xl text-white/65">We also design larger lithium, commercial and industrial systems for offices, hospitality, schools and other facilities.</p>
          </div>
          <Link href="/contact" className="btn mt-6 shrink-0 bg-white text-gray-950 hover:bg-gray-100 md:mt-0">Talk to our team</Link>
        </div>

        <p className="mt-6 text-xs leading-relaxed text-gray-500">Package prices are starting estimates and may change with final load assessment, site conditions, component selection and market pricing. A written quotation confirms the final scope.</p>
      </section>
    </>
  );
}

import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { formatNaira, packagesFromProducts, shopCategoriesFromProducts, site, whatsappUrl } from '@/lib/data';
import { getProducts } from '@/lib/catalog-store';

// Serve cached HTML at the edge and refresh from the database at most once a minute.
// Checkout pricing remains database-authoritative, so displayed prices can lag by at most 60s.
export const revalidate = 60;

export const metadata: Metadata = {
  title: { absolute: 'Solar Installation & Appliances in Ibadan | Leaf Solar' },
  description: 'Plan a solar installation or shop solar equipment, electronics and home appliances from Leaf Solar in Ibadan. Free delivery within Ibadan; quotes elsewhere.',
  alternates: { canonical: '/' },
  openGraph: {
    url: '/',
    title: 'Solar Installation & Appliances in Ibadan | Leaf Solar',
    description: 'Solar planning, equipment, electronics and home appliances from Leaf Solar in Ibadan.',
    images: [{ url: '/leaf-solar-og.jpg', width: 1200, height: 630, alt: 'Leaf Solar — solar, electronics and appliances in Ibadan' }],
  },
};

const popularSearches = [
  { href: '/products?q=TV%2032', label: '32-inch TVs' },
  { href: '/products?q=inverter%20AC', label: 'Inverter ACs' },
  { href: '/products?q=air%20fryer', label: 'Air fryers' },
  { href: '/products?q=washing%20machine', label: 'Washing machines' },
  { href: '/products?q=battery', label: 'Lithium batteries' },
  { href: '/products?q=solar%20panel', label: 'Solar panels' },
];

const trustItems = [
  { icon: 'truck', title: 'Free delivery in Ibadan', text: 'Owner-approved quotes elsewhere' },
  { icon: 'shield', title: 'Warranty information', text: 'Confirm applicable terms before purchase' },
  { icon: 'card', title: 'Secure Paystack checkout', text: 'Pay safely online with verified confirmation' },
  { icon: 'headset', title: 'Real local support', text: 'Call or WhatsApp our team' },
];

function TrustIcon({ name }: { name: string }) {
  if (name === 'truck') return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 6h11v10H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></svg>;
  if (name === 'card') return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h3"/></svg>;
  if (name === 'headset') return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 14v-2a8 8 0 0 1 16 0v2"/><path d="M4 14a2 2 0 0 1 2-2h2v7H6a2 2 0 0 1-2-2v-3Zm16 0a2 2 0 0 0-2-2h-2v7h2a2 2 0 0 0 2-2v-3ZM16 19c0 1.1-.9 2-2 2h-2"/></svg>;
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 3 5 6v5c0 4.6 2.8 8 7 10 4.2-2 7-5.4 7-10V6l-7-3Z"/><path d="m9 12 2 2 4-4"/></svg>;
}

export default async function Home() {
  const products = await getProducts();
  const packages = packagesFromProducts(products);
  const shopCategories = shopCategoriesFromProducts(products);
  const electronicsCount = products.filter(product => product.department === 'electronics').length;
  const weeklyOffers = products.filter(product => product.onSale && product.offerFeatured).slice(0, 6);
  const featuredProducts = products.filter(product => product.featured).slice(0, 8);
  const series = ['Tubular', 'Lithium', 'Commercial', 'Industrial'].flatMap(name => {
    const list = packages.filter(item => item.series === name);
    return list.length > 0 ? [{ name, count: list.length, from: Math.min(...list.map(item => item.price)), href: `/packages?series=${name.toLowerCase()}` }] : [];
  });

  return (
    <>
      <section className="bg-[#f5f6f2] py-4 sm:py-6">
        <div className="container-wide grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(280px,.78fr)]">
          <div className="relative min-h-[510px] overflow-hidden rounded-[1.5rem] bg-[#113e24] text-white sm:min-h-[560px] lg:min-h-[520px]">
            <div className="absolute inset-0 opacity-60" style={{ backgroundImage: 'radial-gradient(circle at 5% 5%, rgba(87,188,111,.45), transparent 30%), radial-gradient(circle at 82% 80%, rgba(250,204,21,.18), transparent 35%)' }} />
            <div className="relative grid h-full lg:grid-cols-[.92fr_1.08fr]">
              <div className="z-10 flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-12 lg:py-14">
                <span className="inline-flex w-fit items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-[10px] font-extrabold uppercase tracking-[.16em] text-leaf-100 ring-1 ring-white/10">
                  <i className="h-2 w-2 rounded-full bg-sun-400" /> Solar · Electronics · Appliances in Ibadan
                </span>
                <h1 className="mt-6 max-w-xl font-display text-4xl font-black leading-[.98] tracking-[-.045em] sm:text-6xl lg:text-[4.2rem]">
                  Solar power and<br/><span className="text-sun-400">home appliances.</span>
                </h1>
                <p className="mt-5 max-w-lg text-base leading-relaxed text-white/75 sm:text-lg">Plan an Ibadan solar installation or browse Leaf Solar&apos;s catalogue of electronics, appliances and solar equipment.</p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link href="/home-appliances-ibadan" className="btn bg-sun-400 text-gray-950 hover:bg-sun-500">Shop appliances <span>→</span></Link>
                  <Link href="/solar-installation-ibadan" className="btn border border-white/20 bg-white/10 text-white hover:bg-white/15">Plan solar installation</Link>
                </div>
                <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-[11px] font-bold text-white/65 sm:text-xs">
                  <span>✓ Fouani Authorized Dealer</span><span>✓ {site.rcNumber}</span><span>✓ Secure Paystack checkout</span>
                </div>
              </div>
              <div className="relative mt-auto h-[230px] sm:h-[290px] lg:absolute lg:inset-y-0 lg:right-0 lg:h-full lg:w-[52%]">
                <Image src="/images/hero-appliances.jpg" alt="Televisions, refrigerator, washing machine, cooker, air conditioner and home appliances" fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover object-center lg:[mask-image:linear-gradient(to_right,transparent_0%,black_28%)]" />
                <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#113e24] to-transparent lg:hidden" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-1 lg:grid-rows-2">
            <Link href="/products?c=Televisions" className="group relative min-h-[210px] overflow-hidden rounded-[1.5rem] bg-[#f3c928] p-5 sm:p-7 lg:min-h-0">
              <div className="relative z-10 max-w-[58%]">
                <p className="text-[10px] font-black uppercase tracking-[.16em] text-gray-950/60">Explore televisions</p>
                <h2 className="mt-2 font-display text-2xl font-black leading-none text-gray-950 sm:text-3xl">Big screens.<br/>Current listings.</h2>
                <span className="mt-4 inline-flex text-xs font-extrabold text-gray-950">Shop TVs →</span>
              </div>
              <div className="absolute -bottom-6 -right-8 h-[76%] w-[62%] transition duration-500 group-hover:scale-105">
                <Image src="/images/categories/tvs.webp" alt="Smart televisions" fill sizes="300px" className="object-contain" />
              </div>
            </Link>

            <Link href="/solar-calculator" className="group relative min-h-[210px] overflow-hidden rounded-[1.5rem] bg-white p-5 ring-1 ring-gray-200 sm:p-7 lg:min-h-0">
              <div className="relative z-10 max-w-[62%]">
                <p className="text-[10px] font-black uppercase tracking-[.16em] text-leaf-700">Free sizing tool</p>
                <h2 className="mt-2 font-display text-2xl font-black leading-none text-gray-950 sm:text-3xl">What can<br/>your solar run?</h2>
                <span className="mt-4 inline-flex text-xs font-extrabold text-leaf-700">Calculate now →</span>
              </div>
              <div className="absolute -bottom-5 -right-9 h-[75%] w-[60%] transition duration-500 group-hover:scale-105">
                <Image src="/images/categories/solar.webp" alt="Solar panels, battery and inverter" fill sizes="300px" className="object-contain" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-gray-100 bg-white">
        <div className="container-wide grid grid-cols-2 divide-x divide-y divide-gray-100 lg:grid-cols-4 lg:divide-y-0">
          {trustItems.map(item => (
            <div key={item.title} className="flex items-center gap-3 px-3 py-5 sm:px-6">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-leaf-50 text-leaf-700 [&>svg]:h-5 [&>svg]:w-5">{<TrustIcon name={item.icon} />}</span>
              <span><b className="block text-[11px] leading-tight text-gray-900 sm:text-sm">{item.title}</b><small className="mt-1 hidden text-[10px] text-gray-500 sm:block sm:text-xs">{item.text}</small></span>
            </div>
          ))}
        </div>
      </section>

      <section className="border-b border-gray-100 bg-white py-4">
        <div className="container-wide flex items-center gap-3 overflow-hidden">
          <span className="hidden shrink-0 text-[10px] font-extrabold uppercase tracking-[.16em] text-gray-400 sm:block">Popular searches</span>
          <div className="scrollbar-none flex min-w-0 flex-1 gap-2 overflow-x-auto py-1">
            {popularSearches.map(item => (
              <Link key={item.href} href={item.href} className="shrink-0 rounded-full border border-gray-200 bg-gray-50 px-3.5 py-2 text-xs font-bold text-gray-600 transition hover:border-leaf-300 hover:bg-leaf-50 hover:text-leaf-700">{item.label}</Link>
            ))}
          </div>
          <Link href="/products" className="hidden shrink-0 text-xs font-extrabold text-leaf-700 md:block">Browse all →</Link>
        </div>
      </section>

      <section className="container-wide py-12 sm:py-16">
        <div className="flex items-end justify-between gap-4">
          <div><p className="eyebrow">Everything your home needs</p><h2 className="section-title mt-2">Shop by category</h2></div>
          <Link href="/products" className="hidden text-sm font-extrabold text-leaf-700 sm:block">View all {electronicsCount} products →</Link>
        </div>
        <div className="scrollbar-none -mx-4 mt-7 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-4 sm:px-0 lg:grid-cols-8">
          {shopCategories.map(category => (
            <Link key={category.slug} href={category.slug === 'Solar' ? '/solar-products' : `/products?c=${encodeURIComponent(category.slug === 'TVs' ? 'Televisions' : category.slug)}`} className="group w-[42vw] max-w-[180px] shrink-0 snap-start sm:w-auto sm:max-w-none">
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#f5f6f2] ring-1 ring-gray-100">
                <Image src={category.image} alt={category.name} fill sizes="(max-width:640px) 42vw, 14vw" className="object-contain p-2 transition duration-500 group-hover:scale-105" />
              </div>
              <h3 className="mt-3 text-center text-xs font-extrabold leading-tight text-gray-900 sm:text-sm">{category.name}</h3>
              <p className="mt-0.5 text-center text-[10px] text-gray-600">{category.count} selected</p>
            </Link>
          ))}
        </div>
      </section>

      {weeklyOffers.length > 0 && <section className="bg-[#f5f6f2] py-12 sm:py-16">
        <div className="container-wide">
          <div className="flex items-end justify-between gap-4">
            <div><p className="eyebrow">Scheduled catalogue sales</p><h2 className="section-title mt-2">Current offers</h2></div>
            <Link href="/products?sort=sale" className="hidden text-sm font-extrabold text-leaf-700 sm:block">See all offers →</Link>
          </div>
          <div className="scrollbar-none -mx-4 mt-7 flex snap-x gap-3 overflow-x-auto px-4 pb-3 sm:mx-0 sm:grid sm:grid-cols-3 sm:px-0 lg:grid-cols-6">
            {weeklyOffers.map((product, index) => <div key={product.id} className="w-[70vw] max-w-[270px] shrink-0 snap-start sm:w-auto sm:max-w-none"><ProductCard product={product} priority={index < 2} /></div>)}
          </div>
        </div>
      </section>}

      {packages.length > 0 && <section className="container-wide py-12 sm:py-16">
        <div className="grid overflow-hidden rounded-[1.75rem] bg-leaf-900 text-white lg:grid-cols-[1.05fr_.95fr]">
          <div className="flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-14 lg:py-16">
            <p className="text-xs font-extrabold uppercase tracking-[.18em] text-leaf-200">Plan a solar project</p>
            <h2 className="mt-3 max-w-2xl font-display text-4xl font-black leading-[1.02] sm:text-5xl">{packages.length} package starting points.<br/><span className="text-sun-400">Final design confirmed.</span></h2>
            <p className="mt-5 max-w-xl leading-relaxed text-white/70">From home backup to larger commercial projects. Choose a starting point, use the calculator, and ask the Leaf Solar team to confirm the final design and written scope.</p>
            <div className="mt-7 flex flex-wrap gap-3"><Link href="/packages" className="btn bg-white text-leaf-900 hover:bg-gray-100">Compare all packages</Link><Link href="/solar-calculator" className="btn border border-white/20 text-white hover:bg-white/10">Use solar calculator</Link></div>
          </div>
          <div className="grid grid-cols-2 gap-px bg-white/10">
            {series.map(item => (
              <Link key={item.name} href={item.href} className="group flex min-h-36 flex-col justify-between bg-white/[.04] p-5 transition hover:bg-white/[.09] sm:p-7">
                <span className="text-[10px] font-extrabold uppercase tracking-[.16em] text-white/75">{item.count} packages</span>
                <div><h3 className="font-display text-xl font-black sm:text-2xl">{item.name}</h3><p className="mt-1 text-xs text-white/75">from <b className="text-white">{formatNaira(item.from)}</b></p></div>
                <span className="mt-4 text-sm font-bold text-sun-400 transition group-hover:translate-x-1">Explore →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>}

      {featuredProducts.length > 0 && <section className="border-y border-gray-100 bg-white py-12 sm:py-16">
        <div className="container-wide">
          <div className="flex items-end justify-between gap-4"><div><p className="eyebrow">Storefront selection</p><h2 className="section-title mt-2">Featured products</h2></div><Link href="/products" className="hidden text-sm font-extrabold text-leaf-700 sm:block">Browse full catalogue →</Link></div>
          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8">{featuredProducts.map(product => <ProductCard key={product.id} product={product} />)}</div>
        </div>
      </section>}

      <section className="container-wide py-12 sm:py-16">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="relative min-h-[310px] overflow-hidden rounded-[1.5rem] bg-[#e8f3e9] p-7 sm:p-10">
            <div className="relative z-10 max-w-[55%]"><p className="text-xs font-black uppercase tracking-[.15em] text-leaf-700">Kitchen refresh</p><h2 className="mt-3 font-display text-3xl font-black leading-tight sm:text-4xl">Cook smarter.<br/>Live easier.</h2><p className="mt-3 text-sm leading-relaxed text-gray-600">Air fryers, cookers, microwaves, blenders and more.</p><Link href="/products?c=Kitchen%20%26%20Cooking" className="btn btn-dark mt-6 text-sm">Shop kitchen</Link></div>
            <div className="absolute -bottom-12 -right-12 h-[92%] w-[58%]"><Image src="/images/categories/kitchen-cooking.webp" alt="Kitchen appliances" fill sizes="500px" className="object-contain" /></div>
          </div>
          <div className="relative min-h-[310px] overflow-hidden rounded-[1.5rem] bg-[#f9e8df] p-7 sm:p-10">
            <div className="relative z-10 max-w-[55%]"><p className="text-xs font-black uppercase tracking-[.15em] text-[#9a4824]">Cool your space</p><h2 className="mt-3 font-display text-3xl font-black leading-tight sm:text-4xl">Comfort for<br/>every room.</h2><p className="mt-3 text-sm leading-relaxed text-gray-600">Air conditioners, fans and air coolers.</p><Link href="/products?c=Air%20Conditioners" className="btn btn-dark mt-6 text-sm">Shop cooling</Link></div>
            <div className="absolute -bottom-10 -right-12 h-[88%] w-[58%]"><Image src="/images/categories/air-conditioners.webp" alt="Air conditioner" fill sizes="500px" className="object-contain" /></div>
          </div>
        </div>
      </section>

      <section className="border-t border-gray-100 bg-[#f5f6f2] py-12 sm:py-16">
        <div className="container-wide">
          <div className="grid gap-10 lg:grid-cols-[.92fr_1.08fr] lg:items-start">
            <div>
              <p className="eyebrow">Leaf Solar in Ibadan</p>
              <h2 className="section-title mt-2">Solar planning, equipment and home appliances in one place.</h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-gray-600">Visit or contact Leaf Solar for appliance enquiries, listed solar equipment and project-specific solar quotations. Solar-system choices are reviewed against the intended load, relevant product limits and site information rather than a package name alone.</p>
              <div className="mt-6 flex flex-wrap gap-3"><Link href="/solar-installation-ibadan" className="btn btn-primary">Solar installation in Ibadan</Link><Link href="/home-appliances-ibadan" className="btn border border-gray-300 bg-white text-gray-800 hover:border-leaf-400">Browse home appliances</Link></div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { href: '/blog/how-to-size-solar-system-nigeria', title: 'How to size a solar system', text: 'Build a realistic appliance and energy plan before choosing equipment.' },
                { href: '/blog/solar-installation-cost-ibadan', title: 'What affects an Ibadan solar quote?', text: 'Understand the load, battery, panel, inverter and site factors.' },
                { href: '/blog/lithium-vs-tubular-battery-nigeria', title: 'Lithium vs tubular batteries', text: 'Compare usable energy, compatibility, maintenance and project fit.' },
                { href: '/blog/what-can-solar-system-power', title: 'What can solar power?', text: 'Connect appliance watts, operating hours and starting demand.' },
              ].map(item => <Link key={item.href} href={item.href} className="rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-leaf-300 hover:shadow-md"><h3 className="font-display text-lg font-black text-gray-950">{item.title}</h3><p className="mt-2 text-xs leading-6 text-gray-500">{item.text}</p><span className="mt-4 inline-flex text-xs font-extrabold text-leaf-700">Read guide →</span></Link>)}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-950 py-10 text-white">
        <div className="container-wide flex flex-col items-center justify-between gap-6 text-center lg:flex-row lg:text-left">
          <div><p className="text-xs font-black uppercase tracking-[.18em] text-sun-400">One company. Power + appliances.</p><h2 className="mt-2 font-display text-2xl font-black sm:text-3xl">Not sure what to buy? We&apos;ll help you choose.</h2></div>
          <div className="flex flex-wrap justify-center gap-3"><a href={whatsappUrl('Hello Leaf Solar! I need help choosing a product or solar package.')} className="btn bg-[#25D366] text-emerald-950 hover:bg-[#20bd5a]">Chat on WhatsApp</a><a href={`tel:${site.phoneHref}`} className="btn border border-white/20 text-white hover:bg-white/10">Call {site.phone}</a></div>
        </div>
      </section>
    </>
  );
}

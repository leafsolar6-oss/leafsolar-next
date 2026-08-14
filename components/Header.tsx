'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { site, whatsappUrl } from '@/lib/data';
import { useCart } from '@/components/cart/CartProvider';

const applianceDepartments = [
  { href: '/products?c=Televisions', label: 'Televisions', detail: 'Smart TVs and big screens' },
  { href: '/products?c=Audio%20%26%20Sound', label: 'Audio & Sound', detail: 'Soundbars and party speakers' },
  { href: '/products?c=Fridges%20%26%20Freezers', label: 'Fridges & Freezers', detail: 'Fridges, freezers and wine coolers' },
  { href: '/products?c=Air%20Conditioners', label: 'Air Conditioners', detail: 'Split, floor-standing and portable ACs' },
  { href: '/products?c=Washers%20%26%20Dryers', label: 'Washers & Dryers', detail: 'Washers, dryers and washer-dryers' },
  { href: '/products?c=Kitchen%20%26%20Cooking', label: 'Kitchen & Cooking', detail: 'Cookers, air fryers and microwaves' },
  { href: '/products?c=Fans%20%26%20Coolers', label: 'Fans & Coolers', detail: 'Standing, tower and rechargeable fans' },
  { href: '/products?c=Water%20%26%20Dispensers', label: 'Water & Dispensers', detail: 'Dispensers and water heaters' },
];

const powerDepartments = [
  { href: '/solar-installation-ibadan', label: 'Solar installation in Ibadan', detail: 'Load review, site assessment and written scope' },
  { href: '/packages', label: 'Solar package starting points', detail: 'Final scope confirmed after review' },
  { href: '/solar-products#solar-panels', label: 'Solar panels', detail: 'Current panel catalogue listings' },
  { href: '/solar-products#solar-batteries', label: 'Solar batteries', detail: 'Current energy-storage listings' },
  { href: '/solar-products#solar-inverters', label: 'Solar inverters', detail: 'Equipment for a confirmed system design' },
];

const popularSearches = [
  { href: '/products?q=TV%2032', label: '32-inch TVs' },
  { href: '/products?q=inverter%20AC', label: 'Inverter ACs' },
  { href: '/products?q=air%20fryer', label: 'Air fryers' },
  { href: '/products?q=washing%20machine', label: 'Washing machines' },
  { href: '/products?q=battery', label: 'Lithium batteries' },
  { href: '/products?q=solar%20panel', label: 'Solar panels' },
];

const categoryNavigation = [
  { href: '/products?c=Televisions', label: 'TVs' },
  { href: '/products?c=Fridges%20%26%20Freezers', label: 'Fridges' },
  { href: '/products?c=Air%20Conditioners', label: 'Air Conditioners' },
  { href: '/products?c=Kitchen%20%26%20Cooking', label: 'Kitchen' },
  { href: '/products?sort=sale', label: 'Deals' },
  { href: '/solar-products', label: 'Solar Equipment' },
  { href: '/packages', label: 'Solar Packages' },
  { href: '/blog', label: 'Solar Guides' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [departmentsOpen, setDepartmentsOpen] = useState(false);
  const pathname = usePathname();
  const { count, openCart } = useCart();

  useEffect(() => {
    function dismissDepartments(event: PointerEvent) {
      const target = event.target;
      if (target instanceof Element && !target.closest('[data-departments-menu]')) setDepartmentsOpen(false);
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setDepartmentsOpen(false);
        setOpen(false);
        setSearchOpen(false);
      }
    }
    document.addEventListener('pointerdown', dismissDepartments);
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', dismissDepartments);
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  function closeMenus() {
    setOpen(false);
    setSearchOpen(false);
    setDepartmentsOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 bg-white shadow-[0_1px_0_rgba(0,0,0,.08)]">
      <div className="bg-[#123d24] text-white">
        <div className="container-wide flex min-h-9 items-center justify-center gap-4 py-1.5 text-center text-[10px] font-extrabold uppercase tracking-[.08em] sm:justify-between sm:text-xs">
          <p><span className="text-sun-400">Free delivery in Ibadan</span> <span className="hidden xs:inline">— approved quotes elsewhere</span></p>
          <div className="hidden items-center gap-5 text-white/75 md:flex">
            <span>Fouani Authorized Dealer</span>
            <a href={whatsappUrl()} className="hover:text-white">WhatsApp {site.phone}</a>
          </div>
        </div>
      </div>

      <div className="container-wide flex h-[4.6rem] items-center gap-3 sm:gap-6">
        <button type="button" onClick={() => { setOpen(value => !value); setSearchOpen(false); setDepartmentsOpen(false); }} className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-gray-200 lg:hidden" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={open ? 'M6 6l12 12M6 18L18 6' : 'M3 6h18M3 12h18M3 18h18'} /></svg>
        </button>

        <Link href="/" onClick={closeMenus} className="flex shrink-0 items-center gap-2" aria-label="Leaf Solar home">
          <span className="relative grid h-11 w-11 place-items-center overflow-hidden rounded-[14px] bg-leaf-700 text-white">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true"><path d="M7 20c8.5-.2 13.8-5.1 15-14-8.9.4-14.7 4.8-15 14Z" fill="#fff"/><path d="M7 21c3.5-5.7 7.2-8.8 12-11.5" stroke="#facc15" strokeWidth="2" strokeLinecap="round"/></svg>
          </span>
          <span className="hidden sm:block">
            <span className="block font-display text-xl font-black leading-none tracking-tight text-gray-950">LEAF<span className="text-leaf-700">SOLAR</span></span>
            <span className="mt-1 block text-[8px] font-bold uppercase tracking-[.22em] text-gray-500">Power · Appliances</span>
          </span>
        </Link>

        <form action="/products" className="relative hidden flex-1 lg:block" role="search">
          <label htmlFor="site-search" className="sr-only">Search products</label>
          <input id="site-search" name="q" type="search" placeholder="Search TVs, fridges, air conditioners, solar packages…" className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pl-5 pr-14 text-sm outline-none transition placeholder:text-gray-400 focus:border-leaf-600 focus:bg-white focus:ring-2 focus:ring-leaf-600/10" />
          <button type="submit" className="absolute right-1.5 top-1.5 grid h-9 w-10 place-items-center rounded-lg bg-leaf-700 text-white hover:bg-leaf-800" aria-label="Search">
            <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4" /></svg>
          </button>
        </form>

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
          <button onClick={() => { setSearchOpen(value => !value); setOpen(false); }} className="grid h-10 w-10 place-items-center rounded-lg hover:bg-gray-50 lg:hidden" aria-label="Search products" aria-expanded={searchOpen}>
            <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4" /></svg>
          </button>
          <a href={`tel:${site.phoneHref}`} className="hidden h-11 items-center gap-2 rounded-xl px-3 text-sm font-bold text-gray-700 hover:bg-gray-50 xl:flex">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-leaf-50 text-leaf-700">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.7 19.7 0 0 1-8.6-3.1 19.3 19.3 0 0 1-6-6A19.7 19.7 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2Z" /></svg>
            </span>
            <span><small className="block text-[9px] font-semibold uppercase tracking-wider text-gray-400">Need help?</small>{site.phone}</span>
          </a>
          <button onClick={openCart} className="relative flex h-11 items-center gap-2 rounded-xl px-2.5 font-bold text-gray-800 hover:bg-gray-50 sm:px-3" aria-label={`Open cart with ${count} items`}>
            <span className="relative">
              <svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 3h2l2.2 10.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L20 7H6"/><circle cx="10" cy="20" r="1"/><circle cx="17" cy="20" r="1"/></svg>
              {count > 0 && <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-sun-400 px-1 text-[10px] font-black text-gray-950">{count}</span>}
            </span>
            <span className="hidden text-sm sm:block">Cart</span>
          </button>
        </div>
      </div>

      {searchOpen && (
        <form action="/products" className="container-wide border-t border-gray-100 py-3 lg:hidden" role="search">
          <div className="relative">
            <input name="q" type="search" autoFocus placeholder="Search all products…" className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 pr-12 text-sm outline-none focus:border-leaf-600" />
            <button type="submit" className="absolute right-1.5 top-1.5 grid h-9 w-10 place-items-center rounded-lg bg-leaf-700 text-white" aria-label="Search">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4" /></svg>
            </button>
          </div>
          <div className="scrollbar-none mt-3 flex gap-2 overflow-x-auto pb-1">
            {popularSearches.map(item => <Link key={item.label} href={item.href} onClick={closeMenus} className="shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-600">{item.label}</Link>)}
          </div>
        </form>
      )}

      <div className="hidden border-t border-gray-100 lg:block">
        <nav className="container-wide flex h-11 items-center gap-7 overflow-x-auto text-[13px] font-bold text-gray-700" aria-label="Product categories">
          <button data-departments-menu type="button" onClick={() => setDepartmentsOpen(value => !value)} className="flex h-full shrink-0 items-center gap-2 text-leaf-700" aria-expanded={departmentsOpen} aria-controls="departments-mega-menu">
            <span className="grid grid-cols-2 gap-0.5"><i className="h-1.5 w-1.5 rounded-[1px] bg-current"/><i className="h-1.5 w-1.5 rounded-[1px] bg-current"/><i className="h-1.5 w-1.5 rounded-[1px] bg-current"/><i className="h-1.5 w-1.5 rounded-[1px] bg-current"/></span>
            Shop departments
            <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" className={`transition ${departmentsOpen ? 'rotate-180' : ''}`}><path d="m5 7 5 5 5-5" /></svg>
          </button>
          {categoryNavigation.map(item => <Link key={item.href} href={item.href} onClick={() => setDepartmentsOpen(false)} className={`whitespace-nowrap transition hover:text-leaf-700 ${item.label === 'Deals' ? 'text-red-600' : ''}`}>{item.label}</Link>)}
          <Link href="/solar-calculator" onClick={() => setDepartmentsOpen(false)} className="ml-auto whitespace-nowrap text-amber-700">Solar calculator</Link>
        </nav>
      </div>

      {departmentsOpen && (
        <div id="departments-mega-menu" data-departments-menu className="absolute inset-x-0 top-full hidden max-h-[calc(100vh-9rem)] overflow-y-auto border-t border-gray-100 bg-white shadow-[0_24px_50px_rgba(15,23,18,.18)] lg:block">
          <div className="container-wide grid gap-8 py-7 lg:grid-cols-[1.45fr_1fr_.78fr]">
            <section>
              <div className="flex items-center justify-between"><div><p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-leaf-700">Home technology</p><h2 className="mt-1 font-display text-xl font-black">Appliances & electronics</h2></div><Link href="/home-appliances-ibadan" onClick={closeMenus} className="text-xs font-extrabold text-leaf-700">View all →</Link></div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {applianceDepartments.map(item => (
                  <Link key={item.href} href={item.href} onClick={closeMenus} className="group rounded-xl border border-transparent p-3 transition hover:border-leaf-100 hover:bg-leaf-50/70">
                    <b className="block text-sm text-gray-900 group-hover:text-leaf-700">{item.label}</b><span className="mt-1 block text-[11px] leading-relaxed text-gray-500">{item.detail}</span>
                  </Link>
                ))}
              </div>
            </section>

            <section className="border-l border-gray-100 pl-8">
              <p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-leaf-700">Reliable power</p><h2 className="mt-1 font-display text-xl font-black">Solar & backup</h2>
              <div className="mt-4 space-y-1">
                {powerDepartments.map(item => (
                  <Link key={item.href} href={item.href} onClick={closeMenus} className="group block rounded-xl px-3 py-2.5 transition hover:bg-gray-50">
                    <b className="block text-sm text-gray-900 group-hover:text-leaf-700">{item.label}</b><span className="mt-0.5 block text-[11px] text-gray-500">{item.detail}</span>
                  </Link>
                ))}
              </div>
            </section>

            <aside className="flex flex-col gap-5">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-gray-400">Popular searches</p>
                <div className="mt-3 flex flex-wrap gap-2">{popularSearches.map(item => <Link key={item.label} href={item.href} onClick={closeMenus} className="rounded-full border border-gray-200 px-3 py-2 text-xs font-bold text-gray-600 transition hover:border-leaf-300 hover:text-leaf-700">{item.label}</Link>)}</div>
              </div>
              <Link href="/solar-calculator" onClick={closeMenus} className="mt-auto rounded-2xl bg-leaf-900 p-5 text-white">
                <span className="text-[10px] font-extrabold uppercase tracking-[.15em] text-sun-400">Free sizing tool</span><b className="mt-2 block font-display text-xl">What can your solar run?</b><span className="mt-3 block text-xs font-bold text-white/70">Calculate your needs →</span>
              </Link>
            </aside>
          </div>
        </div>
      )}

      {open && (
        <div className="absolute inset-x-0 top-full max-h-[calc(100vh-7rem)] overflow-y-auto border-t border-gray-100 bg-white shadow-xl lg:hidden">
          <nav className="container-wide py-5" aria-label="Mobile navigation">
            <div className="flex items-center justify-between"><p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-gray-400">Appliances & electronics</p><Link href="/products" onClick={closeMenus} className="text-xs font-bold text-leaf-700">Shop all</Link></div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {applianceDepartments.map(item => <Link key={item.href} href={item.href} onClick={closeMenus} className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-3 text-sm font-bold text-gray-800">{item.label}</Link>)}
            </div>
            <p className="mb-3 mt-6 text-[10px] font-extrabold uppercase tracking-[.18em] text-gray-400">Solar & backup power</p>
            <div className="grid grid-cols-2 gap-2">
              {powerDepartments.map(item => <Link key={item.href} href={item.href} onClick={closeMenus} className="rounded-xl border border-leaf-100 bg-leaf-50/60 px-3 py-3 text-sm font-bold text-leaf-900">{item.label}</Link>)}
            </div>
            <div className="mt-5 border-t border-gray-100 pt-4">
              <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-gray-400">Popular searches</p>
              <div className="scrollbar-none mt-3 flex gap-2 overflow-x-auto pb-1">{popularSearches.map(item => <Link key={item.label} href={item.href} onClick={closeMenus} className="shrink-0 rounded-full border border-gray-200 px-3 py-2 text-xs font-bold text-gray-600">{item.label}</Link>)}</div>
            </div>
            <div className="mt-5 grid gap-1 border-t border-gray-100 pt-4 text-sm font-bold">
              {[['/', 'Home'], ['/products', 'Shop all products'], ['/solar-installation-ibadan', 'Solar installation in Ibadan'], ['/solar-products', 'Solar equipment'], ['/blog', 'Solar guides'], ['/solar-calculator', 'Solar calculator'], ['/about', 'About Leaf Solar'], ['/contact', 'Contact & support']].map(([href, label]) => (
                <Link key={href} href={href} onClick={closeMenus} className={`rounded-lg px-2 py-2.5 ${pathname === href ? 'text-leaf-700' : 'text-gray-700'}`}>{label}</Link>
              ))}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { site, whatsappUrl } from '@/lib/data';

const navigation = [
  { href: '/', label: 'Home' },
  { href: '/packages', label: 'Solar Packages' },
  { href: '/products', label: 'Products' },
  { href: '/about', label: 'About' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur">
      <div className="bg-gray-950 text-white">
        <div className="container-x flex min-h-8 items-center justify-between gap-4 py-1.5 text-[11px] font-semibold sm:text-xs">
          <p>Free delivery in Ibadan until Dec 2026</p>
          <a href={whatsappUrl()} className="hidden text-white/75 hover:text-white sm:block">WhatsApp: {site.phone}</a>
        </div>
      </div>

      <div className="container-x flex h-[4.5rem] items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Leaf Solar home">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-leaf-700 text-white shadow-sm shadow-leaf-700/20">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3.5"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M4.9 4.9 7 7m10 10 2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/></svg>
          </span>
          <span className="font-display text-xl font-extrabold text-gray-950">Leaf<span className="text-leaf-600">Solar</span></span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-semibold text-gray-600 lg:flex" aria-label="Main navigation">
          {navigation.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`relative py-2 transition hover:text-leaf-700 ${isActive(item.href) ? 'text-leaf-700' : ''}`}
              aria-current={isActive(item.href) ? 'page' : undefined}
            >
              {item.label}
              {isActive(item.href) && <span className="absolute inset-x-0 -bottom-1 mx-auto h-0.5 w-5 rounded-full bg-leaf-600" />}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a href={`tel:${site.phoneHref}`} className="text-sm font-bold text-gray-800 hover:text-leaf-700">{site.phone}</a>
          <Link href="/contact" className="btn btn-primary px-4 py-2.5 text-sm">Get a quote</Link>
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-gray-900 lg:hidden"
          onClick={() => setOpen(value => !value)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={open ? 'M6 6l12 12M6 18L18 6' : 'M3 6h18M3 12h18M3 18h18'}/></svg>
        </button>
      </div>

      {open && (
        <div id="mobile-menu" className="border-t border-gray-100 bg-white lg:hidden">
          <nav className="container-x flex flex-col py-4" aria-label="Mobile navigation">
            {navigation.map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`border-b border-gray-50 py-3 font-semibold ${isActive(item.href) ? 'text-leaf-700' : 'text-gray-800'}`}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <a href={`tel:${site.phoneHref}`} className="btn btn-outline px-3 text-sm">Call us</a>
              <Link href="/contact" onClick={() => setOpen(false)} className="btn btn-primary px-3 text-sm">Get a quote</Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

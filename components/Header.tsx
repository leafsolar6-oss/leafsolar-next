'use client';
import Link from 'next/link';
import { useState } from 'react';

const nav = [
  { href: '/', label: 'Home' },
  { href: '/packages', label: 'Solar Packages' },
  { href: '/products', label: 'Products' },
  { href: '/about', label: 'About' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur border-b border-gray-100">
      <div className="container-x flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-leaf-600 text-white">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/><circle cx="12" cy="12" r="4"/></svg>
          </span>
          <span className="font-display text-lg font-extrabold">Leaf<span className="text-leaf-600">Solar</span></span>
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-gray-700">
          {nav.map(n => <Link key={n.href} href={n.href} className="hover:text-leaf-700">{n.label}</Link>)}
        </nav>
        <div className="hidden md:flex items-center gap-3">
          <a href="tel:+2348000000000" className="text-sm font-semibold">📞 0800 LEAF SOLAR</a>
          <Link href="/packages" className="btn btn-primary text-sm py-2.5">Get a quote</Link>
        </div>
        <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={open ? 'M6 6l12 12M6 18L18 6' : 'M3 6h18M3 12h18M3 18h18'}/></svg>
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="container-x py-3 flex flex-col gap-1">
            {nav.map(n => <Link key={n.href} href={n.href} onClick={()=>setOpen(false)} className="py-2.5 text-gray-800 font-medium">{n.label}</Link>)}
            <Link href="/packages" onClick={()=>setOpen(false)} className="btn btn-primary mt-2">Get a quote</Link>
          </div>
        </div>
      )}
    </header>
  );
}

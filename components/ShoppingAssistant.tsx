'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { whatsappUrl } from '@/lib/data';
import { useCart } from '@/components/cart/CartProvider';

export default function ShoppingAssistant() {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-20 right-4 z-40 hidden sm:block lg:bottom-6 lg:right-6">
      {open && (
        <div className="mb-3 w-[310px] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl">
          <div className="bg-leaf-800 px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-white/15 font-display font-black">L</span>
              <div><p className="font-bold">LEAF Shopping Assistant</p><p className="mt-0.5 flex items-center gap-1.5 text-xs text-white/70"><i className="h-2 w-2 rounded-full bg-emerald-300"/> WhatsApp support</p></div>
            </div>
          </div>
          <div className="p-5">
            <p className="text-sm leading-relaxed text-gray-600">Need help choosing an appliance or sizing a solar system? Talk directly to our team.</p>
            <a href={whatsappUrl('Hello Leaf Solar! I need help choosing a product.')} className="btn mt-4 w-full rounded-xl bg-[#25D366] text-sm text-white hover:bg-[#20bd5a]">Continue on WhatsApp</a>
            <Link href="/contact" className="mt-2 block text-center text-xs font-bold text-gray-500 hover:text-leaf-700">Or send an enquiry</Link>
          </div>
        </div>
      )}
      <button onClick={() => setOpen(value => !value)} className="ml-auto flex h-14 items-center gap-3 rounded-full bg-leaf-800 px-4 text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-leaf-700" aria-label="Open shopping assistant">
        <span className="relative grid h-9 w-9 place-items-center rounded-full bg-white/15">
          <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.5 9.6 9.6 0 0 1-4-.9L3 21l1.7-4.5A8.5 8.5 0 1 1 21 11.5Z"/><path d="M8 12h.01M12 12h.01M16 12h.01"/></svg>
          <i className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full border-2 border-leaf-800 bg-emerald-300" />
        </span>
        <span className="hidden pr-1 text-left text-xs font-bold lg:block">Need help?<small className="block font-medium text-white/65">Chat with us</small></span>
      </button>
    </div>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const { count, openCart } = useCart();
  const links = [
    { href: '/', label: 'Home', icon: <path d="m3 11 9-8 9 8v10h-6v-6H9v6H3Z"/> },
    { href: '/products', label: 'Shop', icon: <><path d="M4 8h16l-1 13H5L4 8Z"/><path d="M8 8a4 4 0 0 1 8 0"/></> },
    { href: '/solar-calculator', label: 'Solar', icon: <><circle cx="12" cy="12" r="3.5"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></> },
  ];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 grid h-[4.25rem] grid-cols-4 border-t border-gray-200 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-6px_20px_rgba(0,0,0,.06)] backdrop-blur sm:hidden" aria-label="Quick navigation">
      {links.map(item => (
        <Link key={item.href} href={item.href} className={`flex flex-col items-center justify-center gap-1 text-[10px] font-bold ${pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href)) ? 'text-leaf-700' : 'text-gray-500'}`}>
          <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="1.8">{item.icon}</svg>
          {item.label}
        </Link>
      ))}
      <button onClick={openCart} className="relative flex flex-col items-center justify-center gap-1 text-[10px] font-bold text-gray-500">
        <span className="relative"><svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 3h2l2.2 10.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L20 7H6"/><circle cx="10" cy="20" r="1"/><circle cx="17" cy="20" r="1"/></svg>{count > 0 && <i className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-sun-400 px-1 text-[9px] font-black text-gray-950">{count}</i>}</span>
        Cart
      </button>
    </nav>
  );
}

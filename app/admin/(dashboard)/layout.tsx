import type { Metadata } from 'next';
import Link from 'next/link';
import { requireAdmin } from '@/lib/admin-auth';
import { logoutAction } from '@/app/admin/auth-actions';

export const metadata: Metadata = { title: { default: 'Inventory dashboard', template: '%s · Leaf Solar Admin' }, robots: { index: false, follow: false } };

const navigation = [
  { href: '/admin', label: 'Overview', icon: '⌂' },
  { href: '/admin/products', label: 'Products', icon: '▦' },
  { href: '/admin/orders', label: 'Orders', icon: '✓' },
  { href: '/admin/delivery-quotes', label: 'Delivery quotes', icon: '↗' },
  { href: '/admin/products/new', label: 'Add product', icon: '+' },
  { href: '/admin/offers', label: 'Offers', icon: '%' },
  { href: '/admin/inventory', label: 'Stock activity', icon: '↕' },
];

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  return (
    <div className="min-h-screen bg-[#f3f5f2] text-gray-950 lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="hidden min-h-screen flex-col bg-leaf-950 px-5 py-6 text-white lg:sticky lg:top-0 lg:flex lg:h-screen">
        <Link href="/admin" className="flex items-center gap-3 px-2">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-leaf-800">
            <svg width="25" height="25" viewBox="0 0 28 28" fill="none" aria-hidden="true"><path d="M7 20c8.5-.2 13.8-5.1 15-14-8.9.4-14.7 4.8-15 14Z" fill="currentColor"/><path d="M7 21c3.5-5.7 7.2-8.8 12-11.5" stroke="#eab308" strokeWidth="2" strokeLinecap="round"/></svg>
          </span>
          <span><b className="block font-display">LEAFSOLAR</b><small className="text-[9px] font-bold uppercase tracking-[.18em] text-white/45">Store manager</small></span>
        </Link>
        <nav className="mt-9 space-y-1" aria-label="Admin navigation">
          {navigation.map(item => <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-white/70 transition hover:bg-white/10 hover:text-white"><span className="grid h-7 w-7 place-items-center rounded-lg bg-white/10 font-display text-base">{item.icon}</span>{item.label}</Link>)}
        </nav>
        <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="truncate text-xs font-extrabold">{admin.name}</p>
          <p className="mt-1 truncate text-[10px] text-white/45">{admin.email}</p>
          <form action={logoutAction}><button className="mt-4 w-full rounded-lg border border-white/15 px-3 py-2 text-xs font-bold text-white/70 hover:bg-white/10">Sign out</button></form>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <Link href="/admin" className="font-display text-lg font-black text-leaf-900">LEAF<span className="text-leaf-600">SOLAR</span> <small className="text-[9px] uppercase tracking-wider text-gray-400">Admin</small></Link>
            <form action={logoutAction}><button className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-bold text-gray-600">Sign out</button></form>
          </div>
          <nav className="scrollbar-none mt-3 flex gap-2 overflow-x-auto" aria-label="Admin navigation">
            {navigation.map(item => <Link key={item.href} href={item.href} className="shrink-0 rounded-lg bg-gray-100 px-3 py-2 text-xs font-extrabold text-gray-700">{item.label}</Link>)}
          </nav>
        </header>
        <main className="mx-auto w-full max-w-[1500px] p-4 sm:p-6 lg:p-9">{children}</main>
      </div>
    </div>
  );
}

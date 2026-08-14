import Image from 'next/image';
import Link from 'next/link';
import { formatNaira } from '@/lib/data';
import { getAdminOffers, getAdminProducts, getDashboardStats, getInventoryMovements } from '@/lib/admin-data';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const [stats, products, offers, movements] = await Promise.all([
    getDashboardStats(), getAdminProducts(), getAdminOffers(), getInventoryMovements(5),
  ]);
  const currentOffers = offers.filter(offer => offer.status === 'Current');
  const attention = products.filter(product => product.isActive && (
    product.trackInventory ? (product.stockQuantity || 0) <= (product.lowStockThreshold || 0) : !product.manualInStock
  )).slice(0, 5);

  const cards = [
    { label: 'Paid orders', value: stats.paid_orders.toLocaleString('en-NG'), note: `${formatNaira(stats.paid_revenue)} verified revenue`, tone: 'bg-leaf-900 text-white', href: '/admin/orders' },
    { label: 'Delivery quotes', value: stats.pending_quotes.toLocaleString('en-NG'), note: 'Outside-Ibadan requests awaiting review', tone: 'bg-amber-50 text-amber-950', href: '/admin/delivery-quotes?status=requested' },
    { label: 'Active products', value: stats.active_products.toLocaleString('en-NG'), note: `${stats.tracked_products} use exact stock`, tone: 'bg-white text-gray-950', href: '/admin/products' },
    { label: 'Low stock', value: stats.low_stock.toLocaleString('en-NG'), note: 'Tracked products at warning level', tone: 'bg-amber-50 text-amber-950', href: '/admin/products?filter=attention' },
    { label: 'Out of stock', value: stats.out_of_stock.toLocaleString('en-NG'), note: 'Needs restocking or review', tone: 'bg-red-50 text-red-950', href: '/admin/products?filter=attention' },
    { label: 'Live offers', value: stats.active_offers.toLocaleString('en-NG'), note: 'Discounts active right now', tone: 'bg-sky-50 text-sky-950', href: '/admin/offers' },
  ];

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-[10px] font-black uppercase tracking-[.16em] text-leaf-700">Store operations</p><h1 className="mt-1 font-display text-3xl font-black sm:text-4xl">Commerce overview</h1><p className="mt-2 text-sm text-gray-500">Verified orders, delivery quotes, inventory, pricing and promotions.</p></div>
        <div className="flex gap-2"><Link href="/admin/offers" className="btn rounded-xl border border-gray-200 bg-white text-gray-700">New offer</Link><Link href="/admin/products/new" className="btn btn-primary rounded-xl">+ Add product</Link></div>
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(card => <Link href={card.href} key={card.label} className={`rounded-2xl border border-black/5 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${card.tone}`}><p className="text-[10px] font-black uppercase tracking-[.13em] opacity-60">{card.label}</p><b className="mt-3 block font-display text-4xl font-black">{card.value}</b><p className="mt-2 text-xs opacity-60">{card.note}</p></Link>)}
      </div>

      {stats.tracked_products > 0 && <div className="mt-3 rounded-2xl border border-gray-200 bg-white px-5 py-4 text-sm"><span className="font-semibold text-gray-500">Retail value of quantity-tracked stock</span><b className="ml-3 font-display text-lg text-leaf-800">{formatNaira(stats.stock_value)}</b></div>}

      <div className="mt-7 grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4"><div><h2 className="font-display text-lg font-black">Needs attention</h2><p className="mt-1 text-xs text-gray-400">Low or unavailable stock</p></div><Link href="/admin/products?filter=attention" className="text-xs font-extrabold text-leaf-700">View products →</Link></div>
          {attention.length ? <div className="divide-y divide-gray-100">{attention.map(product => <Link key={product.id} href={`/admin/products/${product.id}`} className="grid grid-cols-[52px_1fr_auto] items-center gap-3 px-5 py-3 hover:bg-gray-50"><span className="relative aspect-square overflow-hidden rounded-lg bg-gray-50"><Image src={product.imageUrl} alt="" fill sizes="52px" className="object-contain p-1.5" /></span><span className="min-w-0"><b className="block truncate text-sm">{product.name}</b><small className="text-gray-400">{product.sku || product.categoryLabel}</small></span><span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${product.trackInventory && (product.stockQuantity || 0) > 0 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-700'}`}>{product.trackInventory ? `${product.stockQuantity || 0} left` : 'Unavailable'}</span></Link>)}</div> : <p className="px-5 py-10 text-center text-sm text-gray-400">No products currently need stock attention.</p>}
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between"><div><h2 className="font-display text-lg font-black">Offers running</h2><p className="mt-1 text-xs text-gray-400">Promotions customers see now</p></div><Link href="/admin/offers" className="text-xs font-extrabold text-leaf-700">Manage →</Link></div>
          <div className="mt-4 space-y-3">{currentOffers.slice(0, 5).map(offer => <div key={offer.id} className="rounded-xl bg-gray-50 p-3"><div className="flex items-start justify-between gap-3"><b className="line-clamp-1 text-sm">{offer.productName}</b><span className="shrink-0 rounded-full bg-emerald-100 px-2 py-1 text-[9px] font-black text-emerald-700">LIVE</span></div><p className="mt-1 text-xs text-gray-500"><span className="font-bold text-leaf-700">{formatNaira(offer.salePrice)}</span> · {offer.title}</p></div>)}{!currentOffers.length && <p className="py-8 text-center text-sm text-gray-400">No offer is active right now.</p>}</div>
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between"><div><h2 className="font-display text-lg font-black">Recent stock activity</h2><p className="mt-1 text-xs text-gray-400">Manual changes and paid-order deductions</p></div><Link href="/admin/inventory" className="text-xs font-extrabold text-leaf-700">View history →</Link></div>
        <div className="mt-4 divide-y divide-gray-100">{movements.map(movement => <div key={movement.id} className="grid gap-1 py-3 text-sm sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-5"><div><b>{movement.productName}</b><span className="ml-2 text-xs text-gray-400">{movement.reason}</span></div><b className={movement.changeQuantity > 0 ? 'text-emerald-700' : 'text-red-600'}>{movement.changeQuantity > 0 ? '+' : ''}{movement.changeQuantity}</b><time className="text-xs text-gray-400">{new Date(movement.createdAt).toLocaleString('en-NG', { timeZone: 'Africa/Lagos', dateStyle: 'medium', timeStyle: 'short' })}</time></div>)}{!movements.length && <p className="py-8 text-center text-sm text-gray-400">Stock changes will appear here.</p>}</div>
      </section>
    </div>
  );
}

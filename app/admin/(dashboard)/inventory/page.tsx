import Link from 'next/link';
import { getAdminProducts, getInventoryMovements } from '@/lib/admin-data';

export const dynamic = 'force-dynamic';

export default async function InventoryActivityPage() {
  const [products, movements] = await Promise.all([getAdminProducts(), getInventoryMovements(200)]);
  const tracked = products.filter(product => product.trackInventory);
  const totalUnits = tracked.reduce((sum, product) => sum + (product.stockQuantity || 0), 0);

  return (
    <div>
      <div><p className="text-[10px] font-black uppercase tracking-[.16em] text-leaf-700">Inventory</p><h1 className="mt-1 font-display text-3xl font-black sm:text-4xl">Stock activity</h1><p className="mt-2 text-sm text-gray-500">A record of manual stock changes and automatic deductions from verified paid orders.</p></div>
      <div className="mt-6 grid gap-3 sm:grid-cols-3"><section className="rounded-2xl bg-leaf-900 p-5 text-white"><small className="font-black uppercase tracking-wider text-white/50">Tracked products</small><b className="mt-2 block font-display text-3xl">{tracked.length}</b></section><section className="rounded-2xl border border-gray-200 bg-white p-5"><small className="font-black uppercase tracking-wider text-gray-400">Units on hand</small><b className="mt-2 block font-display text-3xl">{totalUnits.toLocaleString('en-NG')}</b></section><section className="rounded-2xl border border-gray-200 bg-white p-5"><small className="font-black uppercase tracking-wider text-gray-400">Recorded movements</small><b className="mt-2 block font-display text-3xl">{movements.length}</b></section></div>

      <section className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="hidden grid-cols-[170px_minmax(260px,1fr)_100px_110px_minmax(180px,1fr)] gap-4 border-b border-gray-100 bg-gray-50 px-5 py-3 text-[10px] font-black uppercase tracking-[.1em] text-gray-400 lg:grid"><span>Date</span><span>Product</span><span>Change</span><span>Balance</span><span>Reason / reference</span></div>
        <div className="divide-y divide-gray-100">{movements.map(item => <div key={item.id} className="grid gap-2 px-4 py-4 text-sm lg:grid-cols-[170px_minmax(260px,1fr)_100px_110px_minmax(180px,1fr)] lg:items-center lg:gap-4 lg:px-5"><time className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleString('en-NG', { timeZone: 'Africa/Lagos', dateStyle: 'medium', timeStyle: 'short' })}</time><div><Link href={`/admin/products/${item.productId}`} className="font-extrabold hover:text-leaf-700">{item.productName}</Link><small className="ml-2 text-gray-400">{item.sku}</small></div><b className={item.changeQuantity > 0 ? 'text-emerald-700' : 'text-red-600'}>{item.changeQuantity > 0 ? '+' : ''}{item.changeQuantity}</b><b>{item.quantityAfter ?? '—'}</b><div><span className="text-xs text-gray-600">{item.reason}</span>{item.reference && <small className="block text-[10px] text-gray-400">Ref: {item.reference}</small>}</div></div>)}{!movements.length && <div className="px-5 py-16 text-center"><h2 className="font-display text-xl font-black">No stock activity yet</h2><p className="mt-2 text-sm text-gray-400">Adjust a tracked product to create the first entry.</p></div>}</div>
      </section>
    </div>
  );
}

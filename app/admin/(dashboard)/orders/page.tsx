import Link from 'next/link';
import { getAdminOrders, orderStatuses, type OrderStatus } from '@/lib/admin-data';
import { formatNaira } from '@/lib/data';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Orders' };

const statusTone: Record<OrderStatus, string> = {
  paid: 'bg-sky-100 text-sky-800', processing: 'bg-amber-100 text-amber-800', ready: 'bg-violet-100 text-violet-800',
  dispatched: 'bg-indigo-100 text-indigo-800', delivered: 'bg-emerald-100 text-emerald-800',
};

function date(value: string) {
  return new Date(value).toLocaleString('en-NG', { timeZone: 'Africa/Lagos', dateStyle: 'medium', timeStyle: 'short' });
}

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const params = await searchParams;
  const orders = await getAdminOrders({ q: params.q, status: params.status });
  const queryString = new URLSearchParams();
  if (params.q) queryString.set('q', params.q);
  if (params.status) queryString.set('status', params.status);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-[10px] font-black uppercase tracking-[.16em] text-leaf-700">Paystack verified</p><h1 className="mt-1 font-display text-3xl font-black sm:text-4xl">Orders</h1><p className="mt-2 text-sm text-gray-500">Customer, payment, delivery and fulfilment records created only from verified successful payments.</p></div>
        <Link href={`/admin/orders/export${queryString.size ? `?${queryString}` : ''}`} className="btn rounded-xl border border-gray-200 bg-white text-gray-700">Export CSV</Link>
      </div>

      <form className="mt-6 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm lg:flex-row">
        <input name="q" defaultValue={params.q} placeholder="Search order, email, customer or phone" className="h-12 min-w-0 flex-1 rounded-xl border border-gray-200 px-4 text-sm outline-none focus:border-leaf-500 focus:ring-4 focus:ring-leaf-100" />
        <select name="status" defaultValue={params.status || ''} className="h-12 rounded-xl border border-gray-200 bg-white px-4 text-sm font-bold outline-none"><option value="">All statuses</option>{orderStatuses.map(status => <option key={status} value={status}>{status[0].toUpperCase() + status.slice(1)}</option>)}</select>
        <button className="h-12 rounded-xl bg-gray-900 px-6 text-sm font-extrabold text-white">Apply</button>
      </form>

      <section className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="hidden grid-cols-[minmax(210px,1fr)_minmax(220px,1.2fr)_140px_130px_120px] gap-4 border-b border-gray-100 bg-gray-50 px-5 py-3 text-[10px] font-black uppercase tracking-[.1em] text-gray-400 lg:grid"><span>Order</span><span>Customer / destination</span><span>Paid</span><span>Amount</span><span>Status</span></div>
        <div className="divide-y divide-gray-100">{orders.map(order => <Link key={order.reference} href={`/admin/orders/${encodeURIComponent(order.reference)}`} className="grid gap-3 px-4 py-4 transition hover:bg-gray-50 lg:grid-cols-[minmax(210px,1fr)_minmax(220px,1.2fr)_140px_130px_120px] lg:items-center lg:gap-4 lg:px-5">
          <div><b className="block break-all text-sm text-leaf-800">{order.reference}</b><small className="mt-1 block text-gray-400">{order.items.reduce((sum, item) => sum + item.quantity, 0) || 'Legacy'} item(s)</small></div>
          <div className="min-w-0"><b className="block truncate text-sm">{[order.firstName, order.lastName].filter(Boolean).join(' ') || order.customerEmail}</b><small className="mt-1 block truncate text-gray-400">{order.city && order.state ? `${order.city}, ${order.state}` : order.customerEmail}</small></div>
          <time className="text-xs text-gray-500">{date(order.paidAt)}</time>
          <b className="text-sm">{formatNaira(order.amount)}</b>
          <span className={`w-fit rounded-full px-2.5 py-1 text-[9px] font-black uppercase ${statusTone[order.status] || statusTone.paid}`}>{order.status}</span>
        </Link>)}{!orders.length && <div className="px-5 py-16 text-center"><h2 className="font-display text-xl font-black">No matching paid orders</h2><p className="mt-2 text-sm text-gray-400">Verified Paystack orders will appear here.</p></div>}</div>
      </section>
      <p className="mt-3 text-xs text-gray-400">Showing {orders.length} order{orders.length === 1 ? '' : 's'}.</p>
    </div>
  );
}

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { updateOrderFulfilmentAction } from '@/app/admin/(dashboard)/actions';
import { getAdminOrder, orderStatuses } from '@/lib/admin-data';
import { formatNaira } from '@/lib/data';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Order details' };

function date(value: string) {
  return new Date(value).toLocaleString('en-NG', { timeZone: 'Africa/Lagos', dateStyle: 'full', timeStyle: 'short' });
}

export default async function AdminOrderDetailsPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  const order = await getAdminOrder(decodeURIComponent(reference));
  if (!order) notFound();
  const customerName = [order.firstName, order.lastName].filter(Boolean).join(' ') || 'Customer';
  const phone = order.phone.replace(/\D/g, '').replace(/^0/, '234');
  const whatsappText = encodeURIComponent(`Hello ${customerName}, this is Leaf Solar regarding your paid order ${order.reference}.`);
  const deliveryLabel = order.deliveryKind === 'approved-quote'
    ? formatNaira(order.deliveryAmount)
    : order.deliveryKind === 'ibadan-free'
      ? 'Free — Ibadan'
      : 'Not recorded (legacy order)';
  const deliveryBasis = order.quoteCode || (order.deliveryKind === 'ibadan-free' ? 'Ibadan free delivery' : 'Not recorded (legacy order)');

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><Link href="/admin/orders" className="text-xs font-extrabold text-leaf-700">← All orders</Link><p className="mt-4 text-[10px] font-black uppercase tracking-[.16em] text-leaf-700">Paid order</p><h1 className="mt-1 break-all font-display text-2xl font-black sm:text-3xl">{order.reference}</h1><p className="mt-2 text-sm text-gray-500">Paystack payment recorded {date(order.paidAt)}</p></div><span className="w-fit rounded-full bg-emerald-100 px-4 py-2 text-xs font-black uppercase text-emerald-800">Payment verified</span></div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,.75fr)]">
        <div className="space-y-6">
          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4"><h2 className="font-display text-lg font-black">Order items</h2></div>
            {order.items.length ? <div className="divide-y divide-gray-100">{order.items.map((item, index) => <div key={`${item.id}-${index}`} className="grid grid-cols-[1fr_auto] gap-4 px-5 py-4 text-sm"><div><b>{item.quantity} × {item.name}</b><small className="mt-1 block text-gray-400">{item.sku || `Product ${item.id}`} · {formatNaira(item.unitPrice)} each</small></div><b>{formatNaira(item.lineTotal)}</b></div>)}</div> : <p className="px-5 py-8 text-sm text-gray-500">Item-level details are unavailable for this legacy payment record.</p>}
            <dl className="space-y-3 border-t border-gray-100 bg-gray-50 px-5 py-5 text-sm"><div className="flex justify-between"><dt className="text-gray-500">Products</dt><dd className="font-bold">{formatNaira(order.subtotal)}</dd></div><div className="flex justify-between gap-4"><dt className="text-gray-500">Delivery</dt><dd className="text-right font-bold">{deliveryLabel}</dd></div><div className="flex justify-between border-t border-gray-200 pt-3 text-base"><dt className="font-black">Total paid</dt><dd className="font-display font-black text-leaf-800">{formatNaira(order.amount)}</dd></div></dl>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><h2 className="font-display text-lg font-black">Delivery details</h2><dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2"><div><dt className="text-[10px] font-black uppercase tracking-wider text-gray-400">Recipient</dt><dd className="mt-1 font-bold">{customerName}</dd></div><div><dt className="text-[10px] font-black uppercase tracking-wider text-gray-400">Phone</dt><dd className="mt-1 font-bold">{order.phone || 'Not captured'}</dd></div><div className="sm:col-span-2"><dt className="text-[10px] font-black uppercase tracking-wider text-gray-400">Address</dt><dd className="mt-1 font-bold leading-6">{[order.address, order.city, order.state].filter(Boolean).join(', ') || 'Not captured on this legacy order'}</dd></div>{order.notes && <div className="sm:col-span-2"><dt className="text-[10px] font-black uppercase tracking-wider text-gray-400">Customer notes</dt><dd className="mt-1 leading-6 text-gray-600">{order.notes}</dd></div>}</dl><div className="mt-5 flex flex-wrap gap-2"><a href={`mailto:${order.customerEmail}`} className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-extrabold">Email customer</a>{phone && <a href={`https://wa.me/${phone}?text=${whatsappText}`} target="_blank" rel="noreferrer" className="rounded-lg bg-[#25D366] px-3 py-2 text-xs font-extrabold text-white">WhatsApp customer</a>}</div></section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><p className="text-[10px] font-black uppercase tracking-[.14em] text-leaf-700">Fulfilment</p><h2 className="mt-1 font-display text-xl font-black">Update delivery status</h2><form action={updateOrderFulfilmentAction} className="mt-5 space-y-4"><input type="hidden" name="reference" value={order.reference} /><label className="block text-xs font-black text-gray-600">Status<select name="status" defaultValue={order.status} className="mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-bold">{orderStatuses.map(status => <option key={status} value={status}>{status[0].toUpperCase() + status.slice(1)}</option>)}</select></label><label className="block text-xs font-black text-gray-600">Tracking / dispatch reference<input name="trackingReference" defaultValue={order.trackingReference} maxLength={160} className="mt-2 h-12 w-full rounded-xl border border-gray-200 px-3 text-sm" placeholder="Optional courier or dispatch reference" /></label><label className="block text-xs font-black text-gray-600">Internal fulfilment notes<textarea name="fulfilmentNotes" defaultValue={order.fulfilmentNotes} maxLength={1000} rows={5} className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-3 text-sm" placeholder="Internal notes; not shown to customers" /></label><button className="btn btn-primary w-full rounded-xl">Save fulfilment update</button></form></section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><h2 className="font-display text-lg font-black">Payment record</h2><dl className="mt-4 space-y-3 text-sm"><div className="flex justify-between gap-4"><dt className="text-gray-500">Channel</dt><dd className="font-bold">{order.paymentChannel}</dd></div><div className="flex justify-between gap-4"><dt className="text-gray-500">Email</dt><dd className="break-all text-right font-bold">{order.customerEmail}</dd></div><div className="flex justify-between gap-4"><dt className="text-gray-500">Delivery basis</dt><dd className="text-right font-bold">{deliveryBasis}</dd></div><div className="flex justify-between gap-4"><dt className="text-gray-500">Last updated</dt><dd className="text-right text-xs font-bold">{date(order.updatedAt)}</dd></div></dl></section>
        </div>
      </div>
    </div>
  );
}

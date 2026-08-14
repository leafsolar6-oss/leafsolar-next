import { updateDeliveryQuoteAction } from '@/app/admin/(dashboard)/actions';
import { getAdminDeliveryQuotes, getAdminProducts } from '@/lib/admin-data';
import { formatNaira } from '@/lib/data';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Delivery quotes' };

const statuses = ['requested', 'approved', 'payment_ready', 'paid', 'cancelled'] as const;
const statusTone: Record<string, string> = { requested: 'bg-amber-100 text-amber-800', approved: 'bg-sky-100 text-sky-800', payment_ready: 'bg-violet-100 text-violet-800', paid: 'bg-emerald-100 text-emerald-800', cancelled: 'bg-gray-200 text-gray-600' };

function date(value: string) {
  return new Date(value).toLocaleString('en-NG', { timeZone: 'Africa/Lagos', dateStyle: 'medium', timeStyle: 'short' });
}

export default async function AdminDeliveryQuotesPage({ searchParams }: { searchParams: Promise<{ status?: string; code?: string }> }) {
  const params = await searchParams;
  const [quotes, products] = await Promise.all([getAdminDeliveryQuotes({ status: params.status, code: params.code }), getAdminProducts()]);
  const names = new Map(products.map(product => [product.id, product.name]));
  const site = (process.env.NEXT_PUBLIC_SITE_URL || 'https://leafsolar.ng').replace(/\/$/, '');

  return (
    <div>
      <div><p className="text-[10px] font-black uppercase tracking-[.16em] text-leaf-700">Outside Ibadan</p><h1 className="mt-1 font-display text-3xl font-black sm:text-4xl">Delivery quotes</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500">Review each destination, enter a delivery amount you have confirmed, and approve it before the customer can proceed to Paystack.</p></div>

      <form className="mt-6 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row"><input name="code" defaultValue={params.code} placeholder="Exact quote code" className="h-12 min-w-0 flex-1 rounded-xl border border-gray-200 px-4 text-sm outline-none focus:border-leaf-500" /><select name="status" defaultValue={params.status || ''} className="h-12 rounded-xl border border-gray-200 bg-white px-4 text-sm font-bold"><option value="">All statuses</option>{statuses.map(status => <option key={status} value={status}>{status[0].toUpperCase() + status.slice(1)}</option>)}</select><button className="h-12 rounded-xl bg-gray-900 px-6 text-sm font-extrabold text-white">Apply</button></form>

      <div className="mt-5 space-y-5">{quotes.map(quote => {
        const phone = quote.phone.replace(/\D/g, '').replace(/^0/, '234');
        const checkoutUrl = `${site}/checkout?quote=${encodeURIComponent(quote.token)}`;
        const approvedText = encodeURIComponent(`Hello ${quote.firstName}, Leaf Solar delivery quote ${quote.code} has been approved. Products: ${formatNaira(quote.subtotal)}. Delivery: ${quote.deliveryAmount === null ? 'pending' : formatNaira(quote.deliveryAmount)}. Continue securely to Paystack here: ${checkoutUrl}`);
        return <section key={quote.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-display text-lg font-black">{quote.code}</h2><span className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase ${statusTone[quote.status] || statusTone.cancelled}`}>{quote.status}</span></div><p className="mt-1 text-xs text-gray-400">Requested {date(quote.createdAt)} · Updated {date(quote.updatedAt)}</p></div>{quote.status === 'approved' && phone && <a href={`https://wa.me/${phone}?text=${approvedText}`} target="_blank" rel="noreferrer" className="w-fit rounded-lg bg-[#25D366] px-3 py-2 text-xs font-extrabold text-white">Send approval on WhatsApp</a>}</div>
          <div className="grid gap-6 p-5 xl:grid-cols-[1fr_1fr_340px]">
            <div><h3 className="text-[10px] font-black uppercase tracking-wider text-gray-400">Customer and destination</h3><p className="mt-3 text-sm font-extrabold">{quote.firstName} {quote.lastName}</p><p className="mt-1 text-sm text-gray-600">{quote.phone} · {quote.email}</p><p className="mt-3 text-sm font-bold leading-6">{quote.address}, {quote.city}, {quote.state}</p>{quote.customerNotes && <p className="mt-3 rounded-xl bg-gray-50 p-3 text-xs leading-5 text-gray-600"><b>Customer note:</b> {quote.customerNotes}</p>}</div>
            <div><h3 className="text-[10px] font-black uppercase tracking-wider text-gray-400">Cart snapshot</h3><div className="mt-3 space-y-2">{quote.items.map((item, index) => <div key={`${item.id}-${index}`} className="flex justify-between gap-3 text-sm"><span>{item.quantity} × {names.get(item.id) || `Product ${item.id}`}</span><small className="shrink-0 text-gray-400">ID {item.id}</small></div>)}</div><div className="mt-4 flex justify-between border-t border-gray-100 pt-3 text-sm"><b>Products subtotal</b><b className="text-leaf-800">{formatNaira(quote.subtotal)}</b></div>{quote.deliveryAmount !== null && <div className="mt-2 flex justify-between text-sm"><b>Approved delivery</b><b>{formatNaira(quote.deliveryAmount)}</b></div>}{quote.paymentReference && <p className="mt-3 break-all text-xs text-gray-400">Payment: {quote.paymentReference}</p>}</div>
            <div>{['payment_ready', 'paid', 'cancelled'].includes(quote.status) ? <div className="rounded-xl bg-gray-50 p-4"><b className="text-sm">Quote {quote.status.replace('_', ' ')}</b><p className="mt-2 text-xs leading-5 text-gray-500">{quote.status === 'paid' ? 'Payment has been linked to this quote. Manage the paid order in Orders.' : quote.status === 'payment_ready' ? 'A Paystack session has been created for this quote and is awaiting successful payment verification.' : 'This quote is closed and cannot be used for payment.'}</p>{quote.adminNotes && <p className="mt-3 text-xs text-gray-600"><b>Internal note:</b> {quote.adminNotes}</p>}</div> : <form action={updateDeliveryQuoteAction} className="space-y-3 rounded-xl bg-gray-50 p-4"><input type="hidden" name="quoteId" value={quote.id} /><label className="block text-xs font-black text-gray-600">Confirmed delivery amount (₦)<input name="deliveryAmount" type="number" min="0" step="1" defaultValue={quote.deliveryAmount ?? ''} className="mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-bold" placeholder="Enter owner-confirmed amount" /></label><label className="block text-xs font-black text-gray-600">Internal quote notes<textarea name="adminNotes" defaultValue={quote.adminNotes} maxLength={1000} rows={4} className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm" placeholder="Courier, route or approval context" /></label><div className="grid grid-cols-2 gap-2"><button name="intent" value="approve" className="rounded-xl bg-leaf-800 px-3 py-3 text-xs font-black text-white">Approve quote</button><button name="intent" value="cancel" formNoValidate className="rounded-xl border border-red-200 bg-white px-3 py-3 text-xs font-black text-red-700">Cancel quote</button></div></form>}</div>
          </div>
        </section>;
      })}{!quotes.length && <section className="rounded-2xl border border-gray-200 bg-white px-5 py-16 text-center"><h2 className="font-display text-xl font-black">No matching delivery quotes</h2><p className="mt-2 text-sm text-gray-400">New outside-Ibadan requests will appear here.</p></section>}</div>
    </div>
  );
}
